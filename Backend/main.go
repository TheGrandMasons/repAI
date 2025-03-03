package main

import (
	"context"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"os"
	"strings"

	vision "cloud.google.com/go/vision/apiv1"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"google.golang.org/api/option"
	visionpb "google.golang.org/genproto/googleapis/cloud/vision/v1"
)

type Response struct {
	Recyclables []string `json:"recyclables"`
	Cashback    float64  `json:"cashback"`
}

var cashbackRates = map[string]float64{
	"plastic":   1,
	"metal":     2,
	"glass":     1,
	"paper":     0.45,
	"cardboard": 0.5,
}

// Fallback mapping for common item names
var fallbackItems = map[string]string{
	"bottle":    "plastic",
	"can":       "metal",
	"jar":       "glass",
	"envelope":  "paper",
	"box":       "paper",
	"carton":    "paper",
	"cardboard": "paper",
	"paper":     "paper",
	"product":   "paper", // For "Paper Product"
	"packaging": "paper", // For "Cardboard Packaging"
}

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}

	// Initialize Gin router
	r := gin.Default()
	r.POST("/detect", detectRecyclables)
	r.Run(":8080")
}

func detectRecyclables(c *gin.Context) {
	// Validate and read the uploaded image
	file, err := c.FormFile("image")
	if err != nil {
		log.Printf("Form file error: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid image format", "details": err.Error()})
		return
	}

	// Open the uploaded file
	image, err := file.Open()
	if err != nil {
		log.Printf("File open error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Cannot open image", "details": err.Error()})
		return
	}
	defer image.Close()

	// Call Vision API to detect text and labels
	receiptText, labels, err := callVisionAPI(image)
	if err != nil {
		log.Printf("Vision API error: %v", err)
		// Continue with just the labels if text detection failed
		if len(labels) > 0 {
			log.Printf("Proceeding with labels only (no text detected)")
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to analyze image", "details": err.Error()})
			return
		}
	}

	// Log raw response from Vision API
	log.Printf("Raw receipt text: %s", receiptText)
	log.Printf("Raw labels: %v", labels)

	// Parse recyclable items from receipt text and labels
	recyclables := parseReceiptText(receiptText, labels)
	
	// If no recyclables were found, try harder with the labels
	if len(recyclables) == 0 {
		log.Printf("No recyclables found, attempting deeper label analysis")
		recyclables = deeperLabelAnalysis(labels)
	}

	// Calculate cashback
	cashback := calculateCashback(recyclables)

	// Return response
	c.JSON(http.StatusOK, Response{
		Recyclables: uniqueStrings(recyclables),  // Remove duplicates
		Cashback:    cashback,
	})
}

// Add a function to remove duplicate strings
func uniqueStrings(strSlice []string) []string {
	keys := make(map[string]bool)
	list := []string{}
	for _, entry := range strSlice {
		if _, value := keys[entry]; !value {
			keys[entry] = true
			list = append(list, entry)
		}
	}
	return list
}

// Add a function for deeper label analysis when standard detection fails
func deeperLabelAnalysis(labels []string) []string {
	var recyclables []string
	
	// Common materials in containers and packaging
	containerKeywords := map[string]string{
		"container": "plastic",
		"bottle":    "plastic",
		"can":       "metal",
		"tin":       "metal",
		"aluminum":  "metal",
		"glass":     "glass",
		"jar":       "glass",
		"box":       "cardboard",
		"carton":    "cardboard",
		"packaging": "paper",
		"wrapper":   "paper",
	}
	
	// Check for composite terms in labels
	for _, label := range labels {
		labelLower := strings.ToLower(label)
		
		// Check for direct material mentions
		if strings.Contains(labelLower, "plastic") {
			recyclables = append(recyclables, "plastic")
		} else if strings.Contains(labelLower, "metal") || strings.Contains(labelLower, "aluminum") {
			recyclables = append(recyclables, "metal")
		} else if strings.Contains(labelLower, "glass") {
			recyclables = append(recyclables, "glass")
		} else if strings.Contains(labelLower, "paper") {
			recyclables = append(recyclables, "paper")
		} else if strings.Contains(labelLower, "cardboard") || strings.Contains(labelLower, "carton") {
			recyclables = append(recyclables, "cardboard")
		}
		
		// Check for container types
		for keyword, material := range containerKeywords {
			if strings.Contains(labelLower, keyword) {
				recyclables = append(recyclables, material)
				log.Printf("Detected '%s' in label '%s', categorized as '%s'", keyword, label, material)
			}
		}
	}
	
	// If we still found nothing, make some educated guesses based on common items
	if len(recyclables) == 0 && len(labels) > 0 {
		log.Printf("Making educated guesses based on labels")
		
		// Check for common beverage containers
		for _, label := range labels {
			labelLower := strings.ToLower(label)
			if strings.Contains(labelLower, "drink") || strings.Contains(labelLower, "beverage") || 
			   strings.Contains(labelLower, "soda") || strings.Contains(labelLower, "water") {
				recyclables = append(recyclables, "plastic")
				log.Printf("Guessed beverage container as plastic based on '%s'", label)
				break
			}
		}
		
		// Check for food packaging
		for _, label := range labels {
			labelLower := strings.ToLower(label)
			if strings.Contains(labelLower, "food") || strings.Contains(labelLower, "package") || 
			   strings.Contains(labelLower, "product") {
				recyclables = append(recyclables, "cardboard")
				log.Printf("Guessed food packaging as cardboard based on '%s'", label)
				break
			}
		}
	}
	
	return recyclables
}

func callVisionAPI(image multipart.File) (string, []string, error) {
	// Initialize Vision API client
	ctx := context.Background()
	client, err := vision.NewImageAnnotatorClient(ctx, option.WithCredentialsFile(os.Getenv("GOOGLE_APPLICATION_CREDENTIALS")))
	if err != nil {
		return "", nil, fmt.Errorf("failed to create Vision client: %v", err)
	}
	defer client.Close()

	// Read image bytes
	imgBytes, err := io.ReadAll(image)
	if err != nil {
		return "", nil, fmt.Errorf("failed to read image: %v", err)
	}

	// Create Vision API image object
	img := &visionpb.Image{Content: imgBytes}

	// Detect document text
	textAnnotation, err := client.DetectDocumentText(ctx, img, &visionpb.ImageContext{})
	if err != nil {
		return "", nil, fmt.Errorf("failed to detect text: %v", err)
	}

	// Detect labels
	labels, err := client.DetectLabels(ctx, img, &visionpb.ImageContext{}, 10)
	if err != nil {
		return "", nil, fmt.Errorf("failed to detect labels: %v", err)
	}

	// Extract label descriptions
	var labelDescriptions []string
	for _, label := range labels {
		labelDescriptions = append(labelDescriptions, label.Description)
	}

	// Return full receipt text and labels
	if textAnnotation == nil {
		return "", labelDescriptions, fmt.Errorf("no text detected in the image")
	}
	return textAnnotation.Text, labelDescriptions, nil
}

func parseReceiptText(text string, labels []string) []string {
	// Keywords to identify recyclable items
	keywords := []string{"plastic", "metal", "glass", "paper", "cardboard"}

	// Convert text and labels to lowercase for case-insensitive matching
	textLower := strings.ToLower(text)
	labelsLower := make([]string, len(labels))
	for i, label := range labels {
		labelsLower[i] = strings.ToLower(label)
	}

	// Extract recyclable items from text
	var recyclables []string
	for _, keyword := range keywords {
		if strings.Contains(textLower, keyword) {
			recyclables = append(recyclables, keyword)
		}
	}

	// Extract recyclable items from labels using fallback mapping
	for _, label := range labelsLower {
		// Split multi-word labels into individual words
		words := strings.Fields(label)
		for _, word := range words {
			if fallback, ok := fallbackItems[word]; ok {
				recyclables = append(recyclables, fallback)
				log.Printf("Mapped label '%s' to recyclable: %s", word, fallback)
			}
		}
	}

	return recyclables
}

func calculateCashback(items []string) float64 {
	total := 0.0
	for _, item := range items {
		if rate, ok := cashbackRates[item]; ok {
			total += rate
		}
	}
	return total
}
