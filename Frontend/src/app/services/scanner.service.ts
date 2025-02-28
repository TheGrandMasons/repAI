import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import * as QuaggaJS from 'quagga';

interface GeminiResponse {
  item: string;
  value: number;
  description: string;
  recyclable: boolean;
  materialType: string;
}

interface Item {
  materialType: string;
  size?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ScannerService {
  private apiUrl = 'api/scanner'; // Your Golang backend endpoint

  constructor(
    private http: HttpClient,
    private firestore: AngularFirestore,
    private storage: AngularFireStorage
  ) {}

  // Initialize barcode scanner
  initBarcodeScanner(elementId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      QuaggaJS.init({
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: document.querySelector(`#${elementId}`),
          constraints: {
            facingMode: "environment"
          },
        },
        decoder: {
          readers: ["ean_reader", "ean_8_reader", "code_128_reader", "code_39_reader", "upc_reader"]
        }
      }, (err: Error | null) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(QuaggaJS);
        QuaggaJS.start();
      });
    });
  }

  // Stop barcode scanner
  stopBarcodeScanner() {
    QuaggaJS.stop();
  }

  // Process barcode scan result
  processBarcodeResult(barcode: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/barcode`, { barcode });
  }

  // Process image using Google Gemini API
  processImageWithGemini(imageData: string): Observable<any> {
    // First upload image to Firebase storage to get a URL
    const imageId = this.firestore.createId();
    const filePath = `scan_images/${imageId}`;
    const fileRef = this.storage.ref(filePath);

    // Convert base64 image to blob
    const blob = this.dataURItoBlob(imageData);

    // Upload to Firebase and get URL
    return from(this.storage.upload(filePath, blob)).pipe(
      switchMap(() => fileRef.getDownloadURL()),
      switchMap(imageUrl => {
        // Send the URL to your Golang backend which will call Gemini API
        return this.http.post<GeminiResponse>(`${this.apiUrl}/analyze-image`, { imageUrl });
      }),
      map(response => {
        // Process the Gemini API response
        return {
          success: true,
          recognizedItem: response.item,
          estimatedValue: response.value,
          description: response.description,
          recyclable: response.recyclable,
          materialType: response.materialType
        };
      }),
      catchError(error => {
        console.error('Error processing image:', error);
        return of({
          success: false,
          error: 'Failed to analyze image'
        });
      })
    );
  }

  // Helper to convert data URI to Blob
  private dataURItoBlob(dataURI: string): Blob {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], { type: mimeString });
  }

  // Calculate estimated value based on item properties
  calculateEstimatedValue(item: Item): number {
    // Logic to calculate recycling value based on material, size, etc.
    let baseValue = 0;

    switch (item.materialType.toLowerCase()) {
      case 'aluminum':
        baseValue = 0.05;
        break;
      case 'plastic':
        baseValue = 0.03;
        break;
      case 'glass':
        baseValue = 0.04;
        break;
      case 'paper':
        baseValue = 0.02;
        break;
      default:
        baseValue = 0.01;
    }

    // Adjust for size/weight
    if (item.size === 'large') {
      baseValue *= 1.5;
    } else if (item.size === 'small') {
      baseValue *= 0.7;
    }

    // Convert to EGP (example exchange rate)
    return baseValue * 30; // Convert to EGP
  }
}