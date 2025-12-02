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
    <div class="auth-bg">
        <div class="auth-overlay"></div>
        <div class="auth-card fade-in-up">
            <div class="auth-header">
                <h2>Bon retour</h2>
                <p>Connectez-vous pour savourer votre café.</p>
            </div>
            
            <form (ngSubmit)="login()">
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" [(ngModel)]="email" name="email" class="input-modern" placeholder="exemple@email.com">
                </div>
                <div class="form-group">
                    <label>Mot de passe</label>
                    <input type="password" [(ngModel)]="password" name="pass" class="input-modern" placeholder="••••••••">
                </div>
                
                <p *ngIf="error()" class="error-msg">{{ error() }}</p>
                
                <button type="submit" class="btn-primary w-100" [disabled]="loading()">
                    {{ loading() ? 'Connexion...' : 'Se connecter' }}
                </button>
            </form>

            <div class="divider"><span>OU</span></div>

            <button (click)="google()" class="btn-google w-100">
                <span class="icon">G</span> Continuer avec Google
            </button>

            <p class="auth-footer">
                Nouveau client ? <a routerLink="/signup">Créer un compte</a>
            </p>
        </div>
    </div>
  `,
  styles: [`
    .auth-bg {
        min-height: 100vh; display: flex; align-items: center; justify-content: center;
        background: url('https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2000') center/cover;
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
    
    .divider { margin: 30px 0; text-align: center; border-bottom: 1px solid #eee; line-height: 0.1em; }
    .divider span { background: #fff; padding: 0 10px; color: #999; font-size: 0.8rem; }
    
    .btn-google { background: white; border: 1px solid #ddd; padding: 12px; border-radius: 50px; font-weight: bold; color: #555; display: flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer; transition: 0.3s; }
    .btn-google:hover { background: #f9f9f9; }
    
    .auth-footer { text-align: center; margin-top: 30px; font-size: 0.9rem; color: #666; }
    .auth-footer a { color: var(--primary-color); font-weight: bold; }
    
    .fade-in-up { animation: fadeIn 0.6s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class LoginComponent {
  email = ''; password = ''; error = signal(''); loading = signal(false);
  auth = inject(AuthService); router = inject(Router);

  async login() {
    this.loading.set(true);
    try { await this.auth.signIn(this.email, this.password); this.router.navigate(['/']); }
    catch(e:any) { this.error.set("Email ou mot de passe incorrect."); }
    finally { this.loading.set(false); }
  }
  async google() {
    try { await this.auth.signInWithGoogle(); this.router.navigate(['/']); }
    catch(e:any) { this.error.set("Erreur Google."); }
  }
}
