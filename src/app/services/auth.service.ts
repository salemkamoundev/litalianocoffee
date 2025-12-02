import { Injectable, signal } from '@angular/core';
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, User } from "firebase/auth";
import { environment } from '../../environments/environment';

const app = initializeApp(environment.firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

@Injectable({ providedIn: 'root' })
export class AuthService {
  private ADMIN_EMAIL = 'litaliano@gmail.com';
  currentUser = signal<User | null>(null);
  isAuthenticated = signal(false);
  isAdmin = signal(false);

  constructor() {
    onAuthStateChanged(auth, (user) => {
      this.currentUser.set(user);
      this.isAuthenticated.set(!!user);
      this.isAdmin.set(user?.email === this.ADMIN_EMAIL);
    });
  }

  async signIn(email: string, pass: string) { return signInWithEmailAndPassword(auth, email, pass); }
  async signInWithGoogle() { return signInWithPopup(auth, googleProvider); }
  async signUp(email: string, pass: string) { return createUserWithEmailAndPassword(auth, email, pass); }
  async signOut() { return signOut(auth); }
}
