import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet], // Import RouterOutlet for routing
  template: `<router-outlet></router-outlet>` // Use router-outlet for routing
})
export class AppComponent {}