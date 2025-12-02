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
    <div class="auth-bg">
        <div class="auth-overlay"></div>
        <div class="auth-card fade-in-up">
            <div class="auth-header">
                <h2>Rejoignez-nous</h2>
                <p>Créez votre compte L'Italiano.</p>
            </div>
            
            <form (ngSubmit)="register()">
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" [(ngModel)]="email" name="email" class="input-modern" placeholder="exemple@email.com">
                </div>
                <div class="form-group">
                    <label>Mot de passe</label>
                    <input type="password" [(ngModel)]="password" name="pass" class="input-modern" placeholder="Min 6 caractères">
                </div>
                
                <p *ngIf="error()" class="error-msg">{{ error() }}</p>
                
                <button type="submit" class="btn-primary w-100" [disabled]="loading()">
                    {{ loading() ? 'Création...' : 'S\'inscrire' }}
                </button>
            </form>

            <p class="auth-footer">
                Déjà membre ? <a routerLink="/login">Se connecter</a>
            </p>
        </div>
    </div>
  `,
  styles: [`
    .auth-bg {
        min-height: 100vh; display: flex; align-items: center; justify-content: center;
        background: url('https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=2000') center/cover;
        position: relative; padding: 20px;
    }
    .auth-overlay { position: absolute; inset: 0; background: rgba(43,29,22,0.6); backdrop-filter: blur(5px); }
    .auth-card {
        position: relative; z-index: 2; background: white; padding: 50px 40px;
        border-radius: 20px; width: 100%; max-width: 450px;
        box-shadow: 0 20px 50px rgba(0,0,0,0.3);
    }
    .auth-header { text-align: center; margin-bottom: 30px; }
    .auth-header h2 { font-size: 2.5rem; margin: 0; color: var(--primary-dark); }
    .auth-header p { color: var(--text-light); }
    .form-group { margin-bottom: 20px; }
    .form-group label { display: block; font-weight: bold; margin-bottom: 8px; font-size: 0.9rem; color: var(--primary-dark); }
    .w-100 { width: 100%; }
    .error-msg { color: var(--error); background: #fadbd8; padding: 10px; border-radius: 8px; text-align: center; font-size: 0.9rem; }
    .auth-footer { text-align: center; margin-top: 30px; font-size: 0.9rem; color: #666; }
    .auth-footer a { color: var(--primary-color); font-weight: bold; }
    .fade-in-up { animation: fadeIn 0.6s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class SignupComponent {
  email = ''; password = ''; error = signal(''); loading = signal(false);
  auth = inject(AuthService); router = inject(Router);

  async register() {
    this.loading.set(true);
    try { await this.auth.signUp(this.email, this.password); this.router.navigate(['/']); }
    catch(e:any) { this.error.set("Erreur d'inscription."); }
    finally { this.loading.set(false); }
  }
}
