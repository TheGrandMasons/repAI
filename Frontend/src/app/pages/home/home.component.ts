// import { Component, Input, OnInit } from "@angular/core";
// import { CommonModule } from '@angular/common';
// import { Router } from '@angular/router';
// import { AuthService } from '../../services/auth.service';
// import { setDoc , getDoc , doc ,getFirestore ,collection } from "firebase/firestore";
// import { initializeApp } from "firebase/app";
// import { environment } from "../../../environments/environment";

// @Component({
//   selector: 'app-home',
//   standalone: true,
//   imports: [CommonModule],
//   templateUrl: './home.component.html',
//   styleUrls: ['./home.component.css']
// })
// export class HomeComponent implements OnInit {
//   loading = true;
//   userId = '';

//   constructor(
//     private authService: AuthService,
//     private router: Router
//   ) {}
//   app = initializeApp(environment.firebase);
//   db = getFirestore(this.app);
//   ngOnInit() {
//     const userString =  localStorage.getItem("user");
//     if(typeof userString == 'string'){
//       try {
//         const user = JSON.parse(userString);
//         const userObj = await getDoc(db , 'users' , user['uid']);
//       } catch(e){
//         console.error("error: " ,e);
//       }
//     }
//     this.authService.user$.subscribe(user => {
//       this.loading = false;
//       if (user) {
//         this.userId = user.uid;
//       }
//     });
//        // Handle responsive behavior on init if needed
//        this.adjustForScreenSize();

//        // Listen for window resize events
//        window.addEventListener('resize', () => {
//          this.adjustForScreenSize();
//        });
//   }
//   navigateToScanner() {
//     this.router.navigate(['/scanner']);
//   }

//   username: string = 'sherif';
//   balance = 10.01;
//   title = 'Home';
//   menuOpen = false;

//   toggleMenu() {
//     this.menuOpen = !this.menuOpen;
//   }

//   adjustForScreenSize() {
//     // Add any dynamic adjustments based on screen size
//     if (window.innerWidth < 768 && this.menuOpen) {
//       // Auto-close menu when resizing to larger screens
//       this.menuOpen = false;
//     }
//   }
// }
import { Component, OnInit } from "@angular/core";
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { getDoc, doc, getFirestore } from "firebase/firestore";
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
  username: string = '';
  balance: number = 0;
  // balance2: number = 0;
  title = 'Home';
  menuOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  app = initializeApp(environment.firebase);
  db = getFirestore(this.app);

  async ngOnInit() {
    // First try to get user from localStorage
    const userString = localStorage.getItem("user");
    if(typeof userString === 'string'){
      try {
        const user = JSON.parse(userString);
        this.userId = user.uid;

        // Fetch user data from Firestore
        await this.fetchUserData(this.userId);
      } catch(e){
        console.error("Error parsing user from localStorage: ", e);
      }
    }

    // Also subscribe to auth service for live updates
    this.authService.user$.subscribe(user => {
      this.loading = false;
      if (user) {
        this.userId = user.uid;
        this.fetchUserData(this.userId);
      }
    });

    // Handle responsive behavior on init
    this.adjustForScreenSize();

    // Listen for window resize events
    window.addEventListener('resize', () => {
      this.adjustForScreenSize();
    });
  }

  // New method to fetch user data from Firestore
  async fetchUserData(userId: string) {
    try {
      const userDocRef = doc(this.db, 'users', userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();

        // Update component properties with Firestore data
        this.username = userData["name"] || 'User';
        this.balance = userData["balance"] || 0;

        console.log('User data loaded:', userData);
      } else {
        console.log('No user document found in Firestore');
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
    // Add any dynamic adjustments based on screen size
    if (window.innerWidth < 768 && this.menuOpen) {
      // Auto-close menu when resizing to larger screens
      this.menuOpen = false;
    }
  }
}
