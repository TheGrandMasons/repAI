import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CashbackService } from '../../services/cashback.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true, // Mark as standalone
  imports: [CommonModule], // Add CommonModule
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  cashbackBalance: number = 0; // User's current cashback balance
  expectedCashback: number = 0; // Estimated cashback from scanned items
  loading: boolean = true; // Loading state
  userId: string = ''; // Current user ID

  constructor(
    private authService: AuthService,
    private cashbackService: CashbackService,
    private router: Router
  ) {}

  ngOnInit() {
    // Subscribe to the authenticated user
    this.authService.user$.subscribe(user => {
      if (user) {
        this.userId = user.uid; // Store the user ID
        this.loadUserData(user.uid); // Load user data
      }
    });
  }

  /**
   * Load user data from Firestore
   * @param userId - The ID of the current user
   */
  loadUserData(userId: string) {
    // Get current cashback balance
    this.cashbackService.getCurrentBalance(userId).subscribe((balance: number) => {
      this.cashbackBalance = balance;
      this.loading = false; // Stop loading
    });

    // Get expected cashback (from pending scanned items)
    this.cashbackService.getExpectedCashback(userId).subscribe((expected: number) => {
      this.expectedCashback = expected;
    });
  }

  /**
   * Navigate to the scanner page
   */
  navigateToScanner() {
    this.router.navigate(['/scanner']);
  }

  /**
   * Navigate to the categories page
   */
  navigateToCategories() {
    this.router.navigate(['/categories']);
  }
}