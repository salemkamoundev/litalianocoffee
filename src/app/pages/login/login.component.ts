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
        <div class="form-group"><label>Email</label><input type="email" [(ngModel)]="email" name="email"></div>
        <div class="form-group"><label>Mot de passe</label><input type="password" [(ngModel)]="password" name="pass"></div>
        <p *ngIf="error()" class="error">{{ error() }}</p>
        <button (click)="login()" class="btn-submit">Se connecter</button>
        <button (click)="google()" class="google-btn">Google</button>
        <p style="margin-top:20px;text-align:center"><a routerLink="/signup">Créer un compte</a></p>
      </div>
    </div>
  `,
  styles: [`.auth-card { max-width:400px; margin:0 auto; background:white; padding:40px; border-radius:10px; box-shadow:0 10px 25px rgba(0,0,0,0.1); } .form-group input { width:100%; padding:10px; margin-top:5px; border:1px solid #ddd; } .btn-submit { width:100%; padding:12px; background:var(--primary-color); color:white; border:none; margin-top:10px; } .google-btn { width:100%; padding:10px; margin-top:10px; background:#eee; border:none; } .error { color:red; text-align:center; }`]
})
export class LoginComponent {
  email = ''; password = ''; error = signal('');
  auth = inject(AuthService);
  router = inject(Router);

  async login() {
    try { await this.auth.signIn(this.email, this.password); this.router.navigate(['/']); }
    catch(e:any) { this.error.set("Erreur de connexion"); }
  }
  async google() {
    try { await this.auth.signInWithGoogle(); this.router.navigate(['/']); }
    catch(e:any) { this.error.set("Erreur Google"); }
  }
}
