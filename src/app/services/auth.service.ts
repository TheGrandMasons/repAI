import { Injectable, NgZone } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { Router } from '@angular/router';
import { map, switchMap } from 'rxjs/operators';
import { auth, db } from '../../firebase/firebase';
import { signInWithPopup, GoogleAuthProvider, User, Auth, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user$: Observable<User | null>;

  constructor(
    private router: Router,
    private ngZone: NgZone
  ) {
    // Create observable from Firebase auth state
    this.user$ = new Observable<User|null>((subscriber) => {
      return onAuthStateChanged(auth, (user) => {
        this.ngZone.run(() => {
          subscriber.next(user);
        });
      });
    });
  }

  async googleSignIn(): Promise<User | null> {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Update Firestore
      await setDoc(doc(db, "users", result.user.uid), {
        name: result.user.displayName,
        email: result.user.email,
        balance: 5
      });

      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(result.user));
      
      // Get and store token
      const token = await result.user.getIdToken();
      localStorage.setItem('token', token);

      return result.user;
    } catch (error) {
      console.error("Sign-in error:", error);
      return null;
    }
  }

  async signOut(): Promise<void> {
    await signOut(auth);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  getCurrentUserObservable(): Observable<User | null> {
    return this.user$;
  }

  isLoggedIn(): Observable<boolean> {
    return this.user$.pipe(map(user => !!user));
  }

  getToken(): Observable<string|null> {
    return this.user$.pipe(
      switchMap(user => {
        if (!user) return of(null);
        return from(user.getIdToken());
      })
    );
  }

  getUserFromLocalStorage(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}