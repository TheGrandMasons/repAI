import { Injectable, NgZone } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { User } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$: Observable<User | null>;

  constructor(
    public afAuth: AngularFireAuth,
    private router: Router,
    private ngZone: NgZone
  ) {
    // Initialize user$ with the auth state observable
    this.user$ = this.afAuth.authState;
  }

  googleSignIn(): Promise<User | null> {
    return this.afAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
      .then((credential) => {
        return credential.user;
      })
      .catch((error) => {
        console.error('Google Sign-In Error:', error);
        return null;
      });
  }

  signOut(): Promise<void> {
    return this.afAuth.signOut();
  }

  getCurrentUser(): Promise<User | null> {
    return this.afAuth.currentUser;
  }

  getCurrentUserObservable(): Observable<User | null> {
    return this.user$;
  }

  isLoggedIn(): Observable<boolean> {
    return this.user$.pipe(map(user => !!user));
  }
}