import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login', standalone: true, imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-bg"><div class="auth-overlay"></div><div class="auth-card">
        <div style="text-align:center"><h2>Connexion</h2><p>Bon retour parmi nous</p></div>
        <form (ngSubmit)="login()">
            <div class="form-group"><label>Email</label><input type="email" [(ngModel)]="email" name="email" class="input-modern"></div>
            <div class="form-group"><label>Mot de passe</label><input type="password" [(ngModel)]="password" name="pass" class="input-modern"></div>
            <p *ngIf="error()" class="error-msg">{{ error() }}</p>
            <button type="submit" class="btn-submit">Se connecter</button>
        </form>
        <div style="margin:20px 0;text-align:center;border-bottom:1px solid #eee;line-height:0.1em"><span>OU</span></div>
        <button (click)="google()" class="google-btn"><img src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Logo_2013_Google.png" width="20"> Google</button>
        <button (click)="facebook()" class="google-btn" style="margin-top:10px;background:#1877F2;color:white;border:none">Facebook</button>
        <p style="text-align:center;margin-top:20px">Pas de compte ? <a routerLink="/signup">S'inscrire</a></p>
    </div></div>
  `
})
export class LoginComponent {
  email = ''; password = ''; error = signal(''); loading = signal(false); auth = inject(AuthService); router = inject(Router);
  async login() { try { await this.auth.signIn(this.email, this.password); this.router.navigate(['/']); } catch(e:any) { this.error.set("Erreur login"); } }
  async google() { try { await this.auth.signInWithGoogle(); this.router.navigate(['/']); } catch(e:any) { this.error.set("Erreur Google"); } }
  async facebook() { try { await this.auth.signInWithFacebook(); this.router.navigate(['/']); } catch(e:any) { this.error.set("Erreur Facebook"); } }
}
