import { Component, HostListener, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header [class.scrolled]="isScrolled()">
      <div class="container">
        
        <!-- 1. LOGO -->
        <a routerLink="/" class="logo">
            <span class="brand">L'ITALIANO</span>
            <span class="dot">.</span>
        </a>

        <!-- 2. NAVIGATION CENTRALE (Desktop) -->
        <nav class="desktop-nav">
          <ul>
            <li><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Accueil</a></li>
            <li><a routerLink="/products" routerLinkActive="active">Nos Cafés</a></li>
            <li><a routerLink="/contact" routerLinkActive="active">Contact</a></li>
            @if (auth.isAuthenticated()) {
                 <li><a routerLink="/my-orders" routerLinkActive="active">Mes Commandes</a></li>
            }
          </ul>
        </nav>

        <!-- 3. ACTIONS DROITE -->
        <div class="actions">
            
            <!-- Admin Badge -->
            @if (auth.isAdmin()) {
                <a routerLink="/admin" class="action-item admin-btn" title="Administration">
                    <span class="icon">⚙️</span>
                </a>
            }

            <!-- Login / User Profile -->
            @if (auth.isAuthenticated()) {
                <div class="user-dropdown">
                    <span class="user-name">Bonjour, {{ getUserName() }}</span>
                    <button (click)="logout()" class="logout-link">Se déconnecter</button>
                </div>
            } @else {
                <a routerLink="/login" class="login-link">Connexion</a>
            }

            <!-- PANIER ORANGE (Star du show) -->
            <a routerLink="/cart" class="cart-btn" [class.shake]="cart.itemCount() > 0">
                <div class="cart-icon-wrapper">
                    <!-- Icône Sac Shopping SVG -->
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <path d="M16 10a4 4 0 0 1-8 0"></path>
                    </svg>
                    
                    <!-- Badge Nombre -->
                    @if (cart.itemCount() > 0) {
                        <span class="cart-badge">{{ cart.itemCount() }}</span>
                    }
                </div>
                <span class="cart-label">Panier</span>
            </a>

            <!-- Mobile Toggle -->
            <button class="mobile-toggle" (click)="toggleMenu()">
                <span></span><span></span><span></span>
            </button>
        </div>
      </div>

      <!-- MENU MOBILE (Off-Canvas) -->
      <div class="mobile-menu" [class.open]="isMenuOpen()">
        <div class="mobile-header">
            <span class="brand">MENU</span>
            <button (click)="closeMenu()" class="close-btn">✕</button>
        </div>
        <ul class="mobile-links">
            <li><a routerLink="/" (click)="closeMenu()">Accueil</a></li>
            <li><a routerLink="/products" (click)="closeMenu()">Nos Cafés</a></li>
            <li><a routerLink="/cart" (click)="closeMenu()" class="mobile-cart-link">Mon Panier ({{ cart.itemCount() }})</a></li>
            <li><a routerLink="/contact" (click)="closeMenu()">Contact</a></li>
            @if (auth.isAuthenticated()) {
                <li><a routerLink="/my-orders" (click)="closeMenu()">Mes Commandes</a></li>
                <li><button (click)="logout(); closeMenu()" class="mobile-logout">Déconnexion</button></li>
            } @else {
                <li><a routerLink="/login" (click)="closeMenu()">Connexion</a></li>
            }
        </ul>
      </div>
      <div class="overlay" *ngIf="isMenuOpen()" (click)="closeMenu()"></div>
    </header>
  `,
  styles: [`
    /* --- HEADER CONTAINER --- */
    header {
        position: fixed; top: 0; left: 0; width: 100%; z-index: 1000;
        height: 80px; background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-bottom: 1px solid rgba(0,0,0,0.05);
        transition: all 0.3s ease;
    }
    header.scrolled { height: 70px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }

    .container {
        max-width: 1400px; margin: 0 auto; padding: 0 30px; height: 100%;
        display: flex; justify-content: space-between; align-items: center;
    }

    /* --- LOGO --- */
    .logo { text-decoration: none; color: var(--secondary-color); display: flex; align-items: baseline; }
    .brand { font-family: 'Playfair Display', serif; font-weight: 900; font-size: 1.5rem; letter-spacing: 1px; }
    .dot { color: var(--cart-orange); font-size: 2rem; line-height: 0; margin-left: 2px; }

    /* --- NAV DESKTOP --- */
    .desktop-nav ul { display: flex; gap: 40px; list-style: none; margin: 0; padding: 0; }
    .desktop-nav a {
        text-decoration: none; color: var(--secondary-color); font-weight: 600; font-size: 0.9rem;
        text-transform: uppercase; letter-spacing: 1px; position: relative; padding: 5px 0;
    }
    .desktop-nav a::after {
        content: ''; position: absolute; bottom: 0; left: 0; width: 0; height: 2px;
        background: var(--cart-orange); transition: width 0.3s;
    }
    .desktop-nav a:hover::after, .desktop-nav a.active::after { width: 100%; }

    /* --- ACTIONS DROITE --- */
    .actions { display: flex; align-items: center; gap: 25px; }

    /* Login Link */
    .login-link { color: var(--secondary-color); font-weight: 600; font-size: 0.9rem; transition: color 0.3s; }
    .login-link:hover { color: var(--cart-orange); }

    /* User Info */
    .user-dropdown { display: flex; flex-direction: column; align-items: flex-end; line-height: 1.2; }
    .user-name { font-size: 0.85rem; font-weight: bold; color: var(--secondary-color); }
    .logout-link { background: none; border: none; color: #999; font-size: 0.75rem; cursor: pointer; padding: 0; }
    .logout-link:hover { color: var(--error-color); text-decoration: underline; }

    /* --- PANIER ORANGE (STAR) --- */
    .cart-btn {
        display: flex; align-items: center; gap: 10px;
        background: var(--cart-orange); color: white;
        padding: 8px 20px; border-radius: 30px;
        text-decoration: none; transition: transform 0.2s, box-shadow 0.2s;
        box-shadow: 0 4px 10px rgba(255, 159, 67, 0.3);
    }
    .cart-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 15px rgba(255, 159, 67, 0.5); }
    
    .cart-icon-wrapper { position: relative; display: flex; align-items: center; }
    .cart-icon-wrapper svg { width: 20px; height: 20px; }
    
    .cart-badge {
        position: absolute; top: -8px; right: -8px;
        background: white; color: var(--cart-orange);
        font-size: 0.75rem; font-weight: 800;
        width: 18px; height: 18px; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    .cart-label { font-weight: 700; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px; }

    .admin-btn { font-size: 1.2rem; margin-right: 10px; transition: transform 0.2s; }
    .admin-btn:hover { transform: rotate(45deg); }

    /* --- MOBILE --- */
    .mobile-toggle { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; }
    .mobile-toggle span { width: 25px; height: 3px; background: var(--secondary-color); border-radius: 2px; }
    
    .mobile-menu {
        position: fixed; top: 0; right: -350px; width: 280px; height: 100vh;
        background: white; z-index: 2000; padding: 30px;
        box-shadow: -5px 0 20px rgba(0,0,0,0.1); transition: right 0.3s ease;
    }
    .mobile-menu.open { right: 0; }
    
    .mobile-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; border-bottom: 1px solid #eee; padding-bottom: 15px; }
    .close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #999; }
    
    .mobile-links { list-style: none; padding: 0; }
    .mobile-links li { margin-bottom: 20px; }
    .mobile-links a { font-size: 1.1rem; font-weight: 600; color: var(--secondary-color); display: block; }
    .mobile-cart-link { color: var(--cart-orange) !important; font-weight: 800; }
    .mobile-logout { background: none; border: none; color: var(--error-color); font-size: 1rem; font-weight: bold; padding: 0; }
    
    .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1500; backdrop-filter: blur(2px); }

    @media (max-width: 900px) {
        .desktop-nav, .user-name, .logout-link { display: none; }
        .mobile-toggle { display: flex; }
        .cart-label { display: none; } /* Sur mobile/tablette, on garde juste l'icone orange */
        .cart-btn { padding: 10px; border-radius: 50%; } /* Rond sur mobile */
    }
  `]
})
export class HeaderComponent {
  scrollY = signal(0);
  isMenuOpen = signal(false);
  isScrolled = computed(() => this.scrollY() > 20);
  
  auth = inject(AuthService);
  cart = inject(CartService);
  private router = inject(Router);

  @HostListener('window:scroll', []) onScroll() { this.scrollY.set(window.scrollY); }
  
  toggleMenu() { this.isMenuOpen.update(v => !v); }
  closeMenu() { this.isMenuOpen.set(false); }

  async logout() {
    await this.auth.signOut();
    this.router.navigate(['/']);
  }

  getUserName() {
    const user = this.auth.currentUser();
    if (!user) return '';
    return user.displayName || user.email?.split('@')[0];
  }
}
