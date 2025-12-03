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
    <header>
      <div class="container header-content">
        <div class="logo" routerLink="/">
            <span class="icon">☕</span><div class="text"><span class="brand">L'ITALIANO</span><span class="suffix">COFFEE</span></div>
        </div>
        
        <button class="mobile-toggle" (click)="toggleMenu()" [class.open]="isMenuOpen()"><span></span><span></span><span></span></button>

        <nav [class.mobile-open]="isMenuOpen()">
          <ul>
            <li><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" (click)="closeMenu()">Accueil</a></li>
            <li><a routerLink="/products" routerLinkActive="active" (click)="closeMenu()">Nos Cafés</a></li>
            <li><a routerLink="/contact" routerLinkActive="active" (click)="closeMenu()">Contact</a></li>
            
            <!-- Lien Panier Standard (Visible Desktop & Mobile) -->
            <li>
                <a routerLink="/cart" routerLinkActive="active" (click)="closeMenu()" class="nav-cart-link">
                    Panier <span *ngIf="cart.itemCount() > 0">({{ cart.itemCount() }})</span>
                </a>
            </li>

            <!-- Section Utilisateur (Mobile uniquement ici pour le layout) -->
            @if (auth.currentUser(); as user) {
                <li class="mobile-only mobile-user-info">
                    <span class="user-greeting">Salut, {{ user.displayName || user.email }}!</span>
                    <button (click)="logout(); closeMenu()" class="mobile-logout-btn" title="Se déconnecter">✕</button>
                </li>
                <li class="mobile-only"><a routerLink="/my-orders" routerLinkActive="active" (click)="closeMenu()">Mes Commandes</a></li>
            }
            
            <!-- Liens Auth Mobile -->
            @if (!auth.isAuthenticated()) {
                <li class="mobile-only"><a routerLink="/login" (click)="closeMenu()">Connexion</a></li>
            }
          </ul>
        </nav>
        
        <div class="actions desktop-only">
            <!-- Icone Panier (Redondance pratique sur Desktop) -->
            <a routerLink="/cart" class="cart-btn" [class.has-items]="cart.itemCount() > 0" title="Voir le panier">
                <span class="cart-icon">🛒</span>
            </a>

            <div class="auth-buttons">
                @if (auth.currentUser(); as user) {
                    <span class="user-name">Hi, {{ user.displayName || (user.email ? user.email.split('@')[0] : 'Client') }}</span>
                    @if (auth.isAdmin()) { <a routerLink="/admin" class="admin-link">Admin</a> }
                    <button (click)="logout()" class="logout-btn" title="Déconnexion">Déconnexion</button>
                } @else { 
                    <a routerLink="/login" class="login-link">Connexion</a> 
                }
            </div>
        </div>
      </div>
      <div class="menu-overlay" *ngIf="isMenuOpen()" (click)="closeMenu()"></div>
    </header>
  `,
  styles: [`
    header { position: fixed; top: 0; left: 0; width: 100%; z-index: 1000; height: 70px; background: #111; box-shadow: 0 4px 10px rgba(0,0,0,0.3); }
    
    .header-content { height: 100%; display: flex; justify-content: space-between; align-items: center; padding: 0 20px; }
    .logo { display: flex; align-items: center; gap: 10px; cursor: pointer; color: white; }
    .logo .icon { font-size: 1.8rem; } .brand { font-family: 'Playfair Display', serif; font-weight: 700; font-size: 1.2rem; } .suffix { font-size: 0.7rem; color: var(--accent-color); display: block; letter-spacing: 2px; }
    
    nav ul { list-style: none; display: flex; gap: 25px; margin: 0; padding: 0; align-items: center; }
    nav a { color: rgba(255,255,255,0.9); text-decoration: none; text-transform: uppercase; font-size: 0.9rem; font-weight: 500; transition: color 0.3s; cursor: pointer; }
    nav a:hover, nav a.active { color: var(--accent-color); }
    
    .nav-cart-link { font-weight: bold; }

    .actions { display: flex; align-items: center; gap: 20px; }
    .login-link { color: white; border: 1px solid rgba(255,255,255,0.5); padding: 6px 15px; border-radius: 30px; font-size: 0.8rem; }
    .logout-btn { background: none; border: none; color: #ccc; cursor: pointer; font-size: 0.9rem; padding: 6px 15px; border: 1px solid rgba(255,255,255,0.3); border-radius: 30px; transition: 0.3s; text-transform: uppercase; } 
    .logout-btn:hover { background: #e74c3c; border-color: #e74c3c; color: white; }
    
    .admin-link { color: #f1c40f; font-weight: bold; font-size: 0.8rem; text-transform: uppercase; margin-right: 10px; }
    .cart-btn { color: white; font-size: 1.2rem; position: relative; } 
    
    .user-name { color: var(--accent-color); font-weight: bold; font-size: 0.9rem; margin-right: 15px; }

    /* --- MOBILE --- */
    .mobile-toggle { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; z-index: 2000; padding: 10px; }
    .mobile-toggle span { display: block; width: 25px; height: 3px; background: white; transition: 0.3s; }
    .mobile-only { display: none; } .menu-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1500; }
    
    .mobile-user-info {
        display: flex !important; 
        justify-content: space-between;
        align-items: center;
        padding: 10px 0 !important;
        border-bottom: 1px solid rgba(255,255,255,0.1);
        margin-bottom: 10px !important;
    }
    .user-greeting { font-weight: bold; font-size: 1.1rem; color: var(--accent-color); }
    .mobile-logout-btn { 
        background: none; border: none; color: #ccc; cursor: pointer; 
        font-size: 0.9rem; padding: 5px 10px; border: 1px solid #ccc; 
        border-radius: 20px; transition: 0.3s;
    }

    @media (max-width: 850px) {
        .desktop-only { display: none; } 
        .mobile-toggle { display: flex; } 
        .menu-overlay { display: block; }
        
        /* Nav Off Canvas */
        nav { position: fixed; top: 0; right: -100%; width: 280px; height: 100vh; background: #111; padding: 100px 30px; transition: right 0.3s; z-index: 1600; box-shadow: -5px 0 30px rgba(0,0,0,0.5); }
        nav.mobile-open { right: 0; } 
        
        nav ul { flex-direction: column; gap: 15px; align-items: flex-start; } 
        nav a { font-size: 1.1rem; display: block; padding: 10px 0; width: 100%; border-bottom: 1px solid rgba(255,255,255,0.05); }
        
        .mobile-only { display: block; width: 100%; }
        .nav-cart-link { display: none; } /* On cache le lien "Panier" du menu principal sur mobile pour utiliser celui de .mobile-only s'il existe, ou on le laisse. Ici je le cache car j'ai ajouté un li.mobile-only spécifique pour le panier juste en dessous dans le template */
    }
  `]
})
export class HeaderComponent {
  scrollY = signal(0); isMenuOpen = signal(false); isScrolled = computed(() => this.scrollY() > 50);
  auth = inject(AuthService); cart = inject(CartService); private router = inject(Router);
  @HostListener('window:scroll', []) onScroll() { this.scrollY.set(window.scrollY); }
  toggleMenu() { this.isMenuOpen.update(v => !v); } closeMenu() { this.isMenuOpen.set(false); }
  async logout() { await this.auth.signOut(); this.router.navigate(['/']); }
}
