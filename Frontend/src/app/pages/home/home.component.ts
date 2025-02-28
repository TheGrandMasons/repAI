import { Component, Input, OnInit } from "@angular/core";
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { setDoc , addDoc , doc ,getFirestore ,collection } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { environment } from "../../../environments/environment";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  loading = true;
  userId = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  app = initializeApp(environment.firebase);
  db = getFirestore(this.app);
  ngOnInit() {
    // Subscribe to the authenticated user
    this.authService.user$.subscribe(user => {
      this.loading = false;
      if (user) {
        this.userId = user.uid;
      }
    });
       // Handle responsive behavior on init if needed
       this.adjustForScreenSize();

       // Listen for window resize events
       window.addEventListener('resize', () => {
         this.adjustForScreenSize();
       });
  }
  navigateToScanner() {
    this.router.navigate(['/scanner']);
  }

  username: string = 'sherif';
  balance = 10.01;
  title = 'Home';
  menuOpen = false;

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  adjustForScreenSize() {
    // Add any dynamic adjustments based on screen size
    if (window.innerWidth < 768 && this.menuOpen) {
      // Auto-close menu when resizing to larger screens
      this.menuOpen = false;
    }
  }
  addDocToFirestore() {
    try {
      const usersCollection = collection(this.db, "users");
      addDoc(usersCollection, { user: "sherif" });
    } catch(e) {
      console.error("error: ", e);
    }
  }
}
