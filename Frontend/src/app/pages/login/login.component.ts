// src/app/pages/login/login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loading = false;
  loginError: string | null = null;

  constructor(
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
}