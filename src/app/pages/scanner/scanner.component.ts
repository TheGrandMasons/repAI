import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { app } from '../../../firebase/firebase';

interface UserData {
  cashback?: number;
}

interface RecyclableResponse {
  recyclables: string[];
  cashback: number;
  error?: string;
}

@Component({
  selector: 'app-scanner',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './scanner.component.html',
  styleUrls: ['./scanner.component.css'],
})
export class ScannerComponent {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;
  capturedImage: string | null = null;
  cashbackEstimate: number | null = null;
  recyclableItems: string[] = [];
  showPopup: boolean = false;
  isLoading: boolean = false;
  errorMessage: string | null = null;
  
  constructor(private http: HttpClient) {}
  
  ngAfterViewInit() {
    this.startCamera();
  }
  
  async startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use rear camera by default
      });
      this.videoElement.nativeElement.srcObject = stream;
    } catch (error) {
      console.error('Error accessing camera:', error);
      this.errorMessage = 'Could not access camera. Please check permissions.';
    }
  }
  
  capturePhoto() {
    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d');
    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      this.capturedImage = canvas.toDataURL('image/png');
      this.errorMessage = null; // Clear any previous errors
    }
  }
  
  async submitPhoto() {
    if (!this.capturedImage) {
      this.errorMessage = 'No image captured. Please take a photo first.';
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = null;
     
    try {
      // Convert base64 to blob
      const base64Data = this.capturedImage.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteArrays = [];
      
      for (let i = 0; i < byteCharacters.length; i += 512) {
        const slice = byteCharacters.slice(i, i + 512);
        const byteNumbers = new Array(slice.length);
        for (let j = 0; j < slice.length; j++) {
          byteNumbers[j] = slice.charCodeAt(j);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
      
      const blob = new Blob(byteArrays, { type: 'image/png' });
      
      // Create FormData and append the image as a file
      const formData = new FormData();
      formData.append('image', blob, 'image.png');
      
      // Send using FormData
      const response = await this.http.post<RecyclableResponse>(
        'http://localhost:8080/detect',
        formData
      ).toPromise();
       
      if (!response) {
        throw new Error('No response from the server');
      }
      
      if (response.error) {
        throw new Error(response.error);
      }
       
      // Store results
      this.cashbackEstimate = response.cashback;
      this.recyclableItems = response.recyclables || [];
      
      // Show popup only if we found recyclables
      if (this.recyclableItems.length > 0) {
        this.showPopup = true;
        
        // Update user's cashback in Firestore
        await this.updateUserCashback();
      } else {
        this.errorMessage = 'No recyclable items detected. Please try again with a clearer image.';
      }
    } catch (error) {
      console.error('Error submitting photo:', error);
      this.errorMessage = `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`;
    } finally {
      this.isLoading = false;
    }
  }
  
  async updateUserCashback() {
    // Get the current user
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (user && this.cashbackEstimate !== null) {
      try {
        // Initialize Firestore
        const db = getFirestore(app);
        const userDoc = doc(db, 'users', user.uid);
        
        // Fetch current user data
        const userSnapshot = await getDoc(userDoc);
        
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data() as UserData;
          const currentCashback = userData.cashback || 0;
          
          // Add cashback amount
          const cashbackAmount = this.cashbackEstimate;
          
          // Update the cashback amount
          await updateDoc(userDoc, {
            cashback: currentCashback + cashbackAmount,
          });
        } else {
          // Create a new user document if it doesn't exist
          await setDoc(userDoc, {
            cashback: this.cashbackEstimate,
          });
        }
      } catch (error) {
        console.error('Error updating user cashback:', error);
        // Don't show this error to the user, just log it
      }
    }
  }
  
  closePopup() {
    this.showPopup = false;
    // Reset state for a new scan
    this.capturedImage = null;
    this.recyclableItems = [];
    this.cashbackEstimate = null;
  }
  
  // Add a method to retry camera access
  retryCamera() {
    this.errorMessage = null;
    this.startCamera();
  }
}