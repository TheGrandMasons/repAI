import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { AuthService } from './services/auth.service';
import { environment } from '../environments/environment'; // <-------  🔥  CRUCIAL IMPORT!  🔥


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(environment.firebase)), // <---  Correct Initialization with environment.firebase
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    AuthService
  ]
};