import { Component, HostListener, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header [class.scrolled]="isScrolled()">
      <div class="parallax-container">
          <div class="parallax-layer layer-back" [style.transform]="'translateY(' + scrollY() * 0.2 + 'px)'"></div>
          <div class="parallax-layer layer-mid" [style.transform]="'translateY(' + scrollY() * 0.4 + 'px)'"></div>
          <div class="parallax-layer layer-front" [style.transform]="'translateY(' + scrollY() * 0.6 + 'px)'"></div>
      </div>

      <div class="container header-content" [style.transform]="'translateY(' + scrollY() * -0.1 + 'px)'">
        <div class="logo" routerLink="/">
            <span class="icon">☕</span>
            <div class="text"><span class="brand">L'ITALIANO</span><span class="suffix">COFFEE</span></div>
        </div>
        <nav>
          <ul class="nav-links">
            <li><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Accueil</a></li>
            <li><a routerLink="/products" routerLinkActive="active">Nos Cafés</a></li>
            <li><a routerLink="/contact" routerLinkActive="active">Contact</a></li>
          </ul>
        </nav>
        <div class="actions">
            <a routerLink="/cart" class="cart-btn" [class.has-items]="cart.itemCount() > 0">
                <span class="cart-icon">🛒</span>
                <span class="cart-count" *ngIf="cart.itemCount() > 0">{{ cart.itemCount() }}</span>
            </a>
            <div class="auth-buttons">
                @if (auth.isAdmin()) { <a routerLink="/admin" class="admin-link">Dashboard</a> }
                @if (auth.isAuthenticated()) { <button (click)="logout()" class="logout-btn">Sortir</button> } 
                @else { <a routerLink="/login" class="login-link">Login</a> }
            </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    header { position: fixed; top: 0; left: 0; width: 100%; z-index: 1000; height: 140px; transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1); overflow: hidden; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .parallax-container { position: absolute; inset: 0; z-index: 1; pointer-events: none; }
    .parallax-layer { position: absolute; inset: -10% 0 -10% 0; background-size: cover; background-position: center top; will-change: transform; transition: opacity 0.4s; }
    .layer-back { background-image: url('https://www.transparenttextures.com/patterns/mocha-grunge.png'); opacity: 0.3; }
    .layer-mid { background-image: url('https://png.pngtree.com/png-clipart/20230427/original/pngtree-coffee-beans-falling-png-image_9112671.png'); opacity: 0.3; filter: blur(1px); }
    .layer-front { background-image: url('https://png.pngtree.com/png-clipart/20220131/original/pngtree-coffee-beans-png-image_7255859.png'); opacity: 0.5; }
    .header-content { position: relative; z-index: 10; height: 100%; display: flex; justify-content: space-between; align-items: flex-start; padding: 20px 30px; will-change: transform; }
    header.scrolled { height: 70px; background: rgba(43, 29, 22, 0.98); backdrop-filter: blur(15px); box-shadow: 0 4px 20px rgba(0,0,0,0.4); }
    header.scrolled .parallax-layer { opacity: 0; }
    header.scrolled .header-content { align-items: center; padding: 0 30px; }
    .logo { display: flex; align-items: center; gap: 10px; cursor: pointer; color: white; }
    .logo .icon { font-size: 2rem; transition: 0.3s; }
    header.scrolled .logo .icon { font-size: 1.5rem; }
    .brand { font-family: 'Playfair Display', serif; font-weight: 700; font-size: 1.2rem; letter-spacing: 2px; }
    .suffix { font-size: 0.7rem; color: var(--accent-gold); letter-spacing: 3px; display: block; }
    .nav-links { display: flex; gap: 40px; }
    .nav-links a { color: rgba(255,255,255,0.8); font-weight: 500; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; position: relative; }
    .nav-links a:hover, .nav-links a.active { color: var(--accent-gold); }
    .actions { display: flex; align-items: center; gap: 20px; }
    .cart-btn { position: relative; color: white; font-size: 1.2rem; }
    .cart-btn:hover { color: var(--accent-gold); }
    .cart-count { position: absolute; top: -8px; right: -8px; background: var(--accent-gold); color: #2b1d16; font-size: 0.7rem; font-weight: bold; padding: 2px 5px; border-radius: 50%; }
    .login-link { color: white; font-weight: bold; border: 1px solid rgba(255,255,255,0.3); padding: 6px 15px; border-radius: 30px; font-size: 0.8rem; }
    .login-link:hover { background: var(--accent-gold); color: #2b1d16; border-color: var(--accent-gold); }
    .logout-btn { background: none; border: none; color: #ccc; cursor: pointer; }
    .logout-btn:hover { color: #e74c3c; }
    .admin-link { color: #f1c40f; font-weight: bold; font-size: 0.8rem; text-transform: uppercase; }
    @media (max-width: 768px) { .nav-links { display: none; } header { height: 100px; } }
  `]
})
export class HeaderComponent {
  scrollY = signal(0);
  isScrolled = computed(() => this.scrollY() > 20);
  auth = inject(AuthService);
  cart = inject(CartService);
  
  @HostListener('window:scroll', []) onScroll() { this.scrollY.set(window.scrollY); }
  logout() { this.auth.signOut(); }
}
