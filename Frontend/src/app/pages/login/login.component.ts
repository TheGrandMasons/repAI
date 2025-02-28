// src/app/pages/login/login.component.ts
import { Component ,HostListener, ElementRef  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./landing-page.css']
})
export class LoginComponent {
  loading = false;
  loginError: string | null = null;

  constructor(
    private elementRef: ElementRef,
    private authService: AuthService, // Inject AuthService - this is CORRECT
    private router: Router
  ) {}

  navigateToRegister() {
    this.router.navigate(['/register']);
  }

  signInWithGoogle() {
    this.loading = true;
    this.loginError = null;

    this.authService.googleSignIn()
      .then(user => {
        if (user) {
          this.router.navigate(['/home']);
        } else {
          this.loading = false;
          this.loginError = 'Sign-in with Google failed. Please try again.';
        }
      })
      .catch(error => {
        console.error("Login Error:", error);
        this.loading = false;
        this.loginError = 'An error occurred. Please check your connection and try again.';
      });
  }




    // Navigation links (not used in the current implementation but kept for reference)
    navLinks = [
      { label: 'About', path: '/about' },
      { label: 'Community', path: '/community' }
    ];

    // Dropdown state
    isDropdownOpen = false;
    isDarkMode = false;
    isMenuOpen = false;

    // Toggle dropdown menu
    toggleDropdown(): void {
      this.isDropdownOpen = !this.isDropdownOpen;
    }

    // Close dropdown when clicking outside
    @HostListener('document:click', ['$event'])
    clickOutside(event: Event): void {
      if (!this.elementRef.nativeElement.contains(event.target)) {
        this.isDropdownOpen = false;
      }
    }

    // Toggle dark mode
    toggleDarkMode(): void {
      this.isDarkMode = !this.isDarkMode;

      // Get the landing container element
      const container = document.querySelector('.landing-container');

      if (container) {
        if (this.isDarkMode) {
          container.classList.add('dark-mode');
        } else {
          container.classList.remove('dark-mode');
        }
      }

      // Close dropdown after action
      this.isDropdownOpen = false;
    }

    // Toggle mobile menu
    toggleMobileMenu(): void {
      this.isMenuOpen = !this.isMenuOpen;
    }

    // Check screen size and adjust layout
    @HostListener('window:resize', ['$event'])
    onResize(): void {
      if (window.innerWidth > 768 && this.isMenuOpen) {
        this.isMenuOpen = false;
      }
    }

    // Close mobile menu when clicking on a link
    closeMenu(): void {
      this.isMenuOpen = false;
    }

    // Example method for handling login/signup actions
    onLoginClick(): void {
      // Implement login logic
      console.log('Login clicked');
    }

    onSignupClick(): void {
      // Implement signup logic
      console.log('Signup clicked');
    }
    // Add this method to RepaiLandingPageComponent
    closeDropdown(): void {
      this.isDropdownOpen = false;
    }
}