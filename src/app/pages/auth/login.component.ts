import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container form-wrapper">
      <div class="auth-card">
        <h1>Connexion</h1>
        
        <form (ngSubmit)="login()">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" [(ngModel)]="email" name="email" required>
          </div>
          <div class="form-group">
            <label for="password">Mot de passe</label>
            <input type="password" id="password" [(ngModel)]="password" name="password" required>
          </div>
          
          @if (error()) {
            <p class="error">{{ error() }}</p>
          }
          
          <button type="submit" [disabled]="loading()">
            @if (loading()) {
              Connexion en cours...
            } @else {
              Se connecter
            }
          </button>
        </form>

        <div class="divider">OU</div>

        <button (click)="loginWithGoogle()" class="google-btn" [disabled]="loading()">
          <img src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Logo_2013_Google.png" alt="Google">
          Connexion avec Google
        </button>

        <p class="footer-link">
            Pas encore de compte ? <a routerLink="/signup">Créer un compte</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .form-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 80vh;
        padding-top: 150px;
    }
    .auth-card {
      background: white;
      padding: 40px;
      border-radius: 10px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
      width: 100%;
      max-width: 400px;
    }
    .auth-card h1 {
        text-align: center;
        color: var(--primary-color);
        border-bottom: none;
        margin-bottom: 30px;
    }
    .form-group { margin-bottom: 20px; }
    .form-group label {
        display: block;
        margin-bottom: 5px;
        font-weight: bold;
        color: var(--secondary-color);
    }
    .form-group input {
        width: 100%;
        padding: 12px;
        border: 1px solid #ddd;
        border-radius: 5px;
        box-sizing: border-box;
    }
    button[type="submit"] {
        width: 100%;
        padding: 12px;
        background-color: var(--accent-color);
        color: black;
        border: none;
        border-radius: 5px;
        font-weight: bold;
        margin-top: 10px;
    }
    button[type="submit"]:disabled {
        background-color: #ccc;
        cursor: not-allowed;
    }
    .google-btn {
        width: 100%;
        padding: 12px;
        background-color: #f1f1f1;
        color: #333;
        border: 1px solid #ccc;
        border-radius: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 20px;
    }
    .google-btn img {
        width: 20px;
        height: 20px;
        margin-right: 10px;
    }
    .divider {
        text-align: center;
        margin: 20px 0;
        font-size: 0.9rem;
        color: #999;
        position: relative;
    }
    .divider::before, .divider::after {
        content: '';
        position: absolute;
        top: 50%;
        width: 40%;
        height: 1px;
        background: #eee;
    }
    .divider::before { left: 0; }
    .divider::after { right: 0; }
    .error {
        color: #e74c3c;
        text-align: center;
        margin-bottom: 15px;
    }
    .footer-link {
        text-align: center;
        margin-top: 20px;
        font-size: 0.9rem;
    }
    .footer-link a {
        color: var(--primary-color);
        text-decoration: none;
        font-weight: bold;
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  loading = signal(false);
  error = signal('');
  
  private authService = inject(AuthService);
  private router = inject(Router);

  async login() {
    this.loading.set(true);
    this.error.set('');
    try {
      // CORRECTION: Utiliser signIn() au lieu de login()
      await this.authService.signIn(this.email, this.password); 
      this.router.navigate(['/']); // Redirection après succès
    } catch (e: any) {
      this.handleError(e);
    } finally {
      this.loading.set(false);
    }
  }

  async loginWithGoogle() {
    this.loading.set(true);
    this.error.set('');
    try {
        // CORRECTION: Utiliser signInWithGoogle() au lieu de loginWithGoogle()
        await this.authService.signInWithGoogle(); 
        this.router.navigate(['/']); // Redirection après succès
    } catch (e: any) {
        this.handleError(e);
    } finally {
        this.loading.set(false);
    }
  }

  private handleError(e: any) {
      let msg = "Erreur de connexion. Vérifiez email/mot de passe.";
      if (e.code === 'auth/user-not-found' || e.code === 'auth/wrong-password') {
          msg = "Email ou mot de passe invalide.";
      }
      this.error.set(msg);
  }
}
