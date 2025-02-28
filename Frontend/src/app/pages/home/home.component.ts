import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule], // No HttpClientModule needed here anymore
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  loading = true;
  userId = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Subscribe to the authenticated user
    this.authService.user$.subscribe(user => {
      this.loading = false;
      if (user) {
        this.userId = user.uid;
      }
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
