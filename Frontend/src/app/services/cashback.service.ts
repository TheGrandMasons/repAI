import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { provideHttpClient, HttpClientModule } from '@angular/common/http';
import { inject } from '@angular/core';

// Define the User interface
interface User {
  balance: number;
}

// Define the PendingItem interface
interface PendingItem {
  recyclableType: string;
  estimatedValue: number;
  scannedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CashbackService {
  private geminiApiUrl = 'http://placeholder-backend-url/api/process-image'; // Placeholder Backend URL
  private http = inject(HttpClient); // Angular inject method

  constructor(
    private firestore: AngularFirestore
  ) {}

  /**
   * Get the user's current cashback balance
   * @param userId - The ID of the current user
   * @returns Observable of the balance
   */
  getCurrentBalance(userId: string): Observable<number> {
    return this.firestore.doc<User>(`users/${userId}`).valueChanges().pipe(
      map(user => user?.balance || 0)
    );
  }

  /**
   * Get the expected cashback from pending scanned items
   * @param userId - The ID of the current user
   * @returns Observable of the expected cashback
   */
  getExpectedCashback(userId: string): Observable<number> {
    return this.firestore.collection<PendingItem>(`users/${userId}/pendingItems`).valueChanges().pipe(
      map(items => items.reduce((sum, item) => sum + (item.estimatedValue || 0), 0))
    );
  }

  /**
   * Process an image using the Google Gemini API (Placeholder API Call)
   * @param imageData - Base64 encoded image data
   * @returns Observable of the recyclable type
   */
  processImage(imageData: string): Observable<string> {
    return this.http.post<{ recyclableType: string }>(this.geminiApiUrl, { image: imageData }).pipe(
      map(response => response.recyclableType || 'Placeholder Recyclable Type')
    );
  }

  /**
   * Add a pending item to Firestore
   * @param userId - The ID of the current user
   * @param item - The scanned item data
   * @returns Promise<void>
   */
  addPendingItem(userId: string, item: PendingItem): Promise<void> {
    const itemId = this.firestore.createId();
    return this.firestore.doc(`users/${userId}/pendingItems/${itemId}`).set(item);
  }

  /**
   * Confirm a pending item and update the user's balance
   * @param userId - The ID of the current user
   * @param itemId - The ID of the pending item
   * @returns Promise<void>
   */
  confirmPendingItem(userId: string, itemId: string): Promise<void> {
    return this.firestore.firestore.runTransaction(async (transaction) => {
      const itemRef = this.firestore.doc<PendingItem>(`users/${userId}/pendingItems/${itemId}`).ref;
      const itemDoc = await transaction.get(itemRef);
      if (!itemDoc.exists) {
        throw new Error('Item not found');
      }
      const userRef = this.firestore.doc<User>(`users/${userId}`).ref;
      const userDoc = await transaction.get(userRef);
      const currentBalance = userDoc.data()?.balance || 0;
      const itemData = itemDoc.data() as PendingItem;
      transaction.update(userRef, {
        balance: currentBalance + itemData.estimatedValue
      });
      transaction.delete(itemRef);
    });
  }
}
