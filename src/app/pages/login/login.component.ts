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
                    <input type="email" [(ngModel)]="email" name="email" class="input-modern" placeholder="exemple@email.com" required>
                </div>
                <div class="form-group">
                    <label>Mot de passe</label>
                    <input type="password" [(ngModel)]="password" name="pass" class="input-modern" placeholder="••••••••" required>
                </div>
                
                <p *ngIf="error()" class="error-msg">{{ error() }}</p>
                
                <button type="submit" class="btn-primary w-100" [disabled]="loading()">
                    {{ loading() ? 'Connexion...' : 'Se connecter' }}
                </button>
            </form>

            <div class="divider"><span>OU</span></div>

            <!-- Bouton Google Seul -->
            <button (click)="google()" class="btn-google w-100">
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="G" class="google-icon">
                Continuer avec Google
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
    .auth-overlay { position: absolute; inset: 0; background: rgba(43,29,22,0.7); backdrop-filter: blur(8px); }
    
    .auth-card {
        position: relative; z-index: 2; background: white; padding: 50px 40px;
        border-radius: 20px; width: 100%; max-width: 450px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.4);
        border-top: 5px solid var(--primary-color);
    }

    .auth-header { text-align: center; margin-bottom: 35px; }
    .auth-header h2 { font-size: 2.2rem; margin: 0; color: var(--primary-dark); font-family: 'Playfair Display', serif; }
    .auth-header p { color: #888; margin-top: 5px; font-size: 1rem; }
    
    .form-group { margin-bottom: 25px; }
    .form-group label { display: block; font-weight: 600; margin-bottom: 8px; font-size: 0.9rem; color: var(--secondary-color); letter-spacing: 0.5px; }
    
    .input-modern {
        width: 100%; padding: 14px 15px; border: 1px solid #e0e0e0; border-radius: 8px;
        font-size: 1rem; background: #fafafa; transition: 0.3s;
        box-sizing: border-box; /* Important pour éviter le débordement */
    }
    .input-modern:focus { border-color: var(--accent-color); background: #fff; box-shadow: 0 0 0 4px rgba(212,163,115,0.15); outline: none; }
    
    .w-100 { width: 100%; }
    .btn-primary {
        padding: 15px; font-size: 1rem; letter-spacing: 1px; text-transform: uppercase;
        border-radius: 50px; width: 100%; cursor: pointer; transition: 0.3s;
        background: var(--primary-color); color: white; border: none; font-weight: bold;
        box-shadow: 0 5px 15px rgba(111,78,55,0.3);
    }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(111,78,55,0.4); background: var(--secondary-color); }
    .btn-primary:disabled { background: #ccc; cursor: not-allowed; transform: none; box-shadow: none; }

    .error-msg { color: #e74c3c; background: #fdecea; padding: 12px; border-radius: 8px; text-align: center; font-size: 0.9rem; margin-bottom: 20px; border: 1px solid #fadbd8; }
    
    .divider { margin: 30px 0; text-align: center; border-bottom: 1px solid #eee; line-height: 0.1em; }
    .divider span { background: #fff; padding: 0 15px; color: #aaa; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; }
    
    .btn-google { 
        background: white; border: 1px solid #ddd; padding: 12px; border-radius: 50px; 
        font-weight: 600; color: #555; display: flex; align-items: center; justify-content: center; 
        gap: 12px; cursor: pointer; transition: 0.3s; width: 100%; font-size: 0.95rem;
    }
    .btn-google:hover { background: #f9f9f9; border-color: #ccc; transform: translateY(-1px); }
    .google-icon { width: 20px; height: 20px; }
    
    .auth-footer { text-align: center; margin-top: 35px; font-size: 0.95rem; color: #666; border-top: 1px solid #f5f5f5; padding-top: 20px; }
    .auth-footer a { color: var(--accent-color); font-weight: 700; text-decoration: none; transition: color 0.2s; }
    .auth-footer a:hover { color: var(--primary-color); text-decoration: underline; }
    
    .fade-in-up { animation: fadeIn 0.8s cubic-bezier(0.22, 1, 0.36, 1); }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
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
