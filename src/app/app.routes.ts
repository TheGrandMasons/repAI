import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { authGuard } from './guards/auth.guard';
import { ScannerComponent } from './pages/scanner/scanner.component';

// Export the routes constant
export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' }, // Default route to login
  { path: 'login', component: LoginComponent }, // Login/landing page
  { path: 'home', component: HomeComponent, canActivate: [authGuard] }, // Home page (protected)
  { path: 'scanner', component: ScannerComponent, canActivate: [authGuard] }, // Home page (protected)
  { path: '**', redirectTo: '/login' } // Redirect unknown routes to login
];
