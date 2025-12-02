import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container form-wrapper">
      <div class="auth-card">
        <h1>Créer un Compte</h1>
        
        <form (ngSubmit)="signup()">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" [(ngModel)]="email" name="email" required>
          </div>
          <div class="form-group">
            <label for="password">Mot de passe</label>
            <input type="password" id="password" [(ngModel)]="password" name="password" required minlength="6">
            <small>Minimum 6 caractères.</small>
          </div>
          
          @if (error()) {
            <p class="error">{{ error() }}</p>
          }
          
          <button type="submit" [disabled]="loading() || password.length < 6">
            @if (loading()) {
              Inscription en cours...
            } @else {
              S'inscrire
            }
          </button>
        </form>

        <p class="footer-link">
            Déjà un compte ? <a routerLink="/login">Se connecter</a>
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
    .form-group small {
        color: #999;
        font-size: 0.8rem;
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
export class SignupComponent {
  email = '';
  password = '';
  loading = signal(false);
  error = signal('');
  
  private authService = inject(AuthService);
  private router = inject(Router);

  async signup() {
    this.loading.set(true);
    this.error.set('');
    try {
      await this.authService.signUp(this.email, this.password);
      this.router.navigate(['/']); // Redirection après succès
    } catch (e: any) {
      this.handleError(e);
    } finally {
      this.loading.set(false);
    }
  }

  private handleError(e: any) {
      let msg = "Erreur d'inscription.";
      if (e.code === 'auth/email-already-in-use') {
          msg = "Cet email est déjà utilisé.";
      } else if (e.code === 'auth/invalid-email') {
          msg = "Format d'email invalide.";
      }
      this.error.set(msg);
  }
}
