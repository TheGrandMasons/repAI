import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { getDoc, doc } from "firebase/firestore";
import { db } from "../../../firebase/firebase"; // Import directly from firebase config
import { User } from 'firebase/auth';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  loading = true;
  userId = '';
  username: string = '';
  balance: number = 0;
  title = 'Home';
  menuOpen = false;
  private authSub!: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    // Handle auth state changes
    this.authSub = this.authService.user$.subscribe(async (user) => {
      this.loading = false;
      
      if (user) {
        this.userId = user.uid;
        await this.fetchUserData(user.uid);
        
        // Store user in localStorage if not already there
        if (!localStorage.getItem('user')) {
          localStorage.setItem('user', JSON.stringify(user));
        }
      } else {
        this.router.navigate(['/login']);
      }
    });

    // Handle responsive behavior
    this.adjustForScreenSize();
    window.addEventListener('resize', this.adjustForScreenSize.bind(this));
  }

  ngOnDestroy() {
    // Clean up subscriptions and event listeners
    this.authSub.unsubscribe();
    window.removeEventListener('resize', this.adjustForScreenSize.bind(this));
  }

  async fetchUserData(userId: string) {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        this.username = userData['name'] || 'User';
        this.balance = userData['balance'] || 0;
      } else {
        console.warn('No user document found in Firestore');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }

  navigateToScanner() {
    this.router.navigate(['/scanner']);
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  adjustForScreenSize() {
    if (window.innerWidth < 768 && this.menuOpen) {
      this.menuOpen = false;
    }
  }
}