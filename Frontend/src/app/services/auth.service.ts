// src/app/services/auth.service.ts
import { Injectable, NgZone } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import firebase from 'firebase/compat/app';
import * as firestore from 'firebase/firestore';
import { app } from '../../environments/environment';
import 'firebase/compat/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user$: Observable<firebase.User | null>;

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    private ngZone: NgZone
  ) {
    this.user$ = this.afAuth.authState;
  }

  async googleSignIn(): Promise<firebase.User | null> {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      const credential = await this.afAuth.signInWithPopup(provider);
      const user = credential.user;

      if (user) {
        const db = firestore.getFirestore(app);
        const userId = user.uid; 
        const docRef = firestore.doc(db, "users", userId);

        await firestore.setDoc(docRef, {
          name: user.displayName,
          email: user.email,
          balance: 0
        });

        const idToken = await user.getIdToken();
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', idToken);
        console.log('JWT Token:', idToken);
      }

      return user;
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      return null;
    }
  }

  getCurrentUserObservable(): Observable<firebase.User | null> {
    return this.user$;
  }

  isLoggedIn(): Observable<boolean> {
    return this.user$.pipe(map((user) => !!user));
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserFromLocalStorage(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}
