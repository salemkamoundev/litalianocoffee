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
      <!-- Parallax Wrapper (Background uniquement) -->
      <div class="parallax-wrapper">
        <div class="parallax-container">
            <div class="parallax-layer layer-back" [style.transform]="'translateY(' + scrollY() * 0.2 + 'px)'"></div>
            <div class="parallax-layer layer-mid" [style.transform]="'translateY(' + scrollY() * 0.4 + 'px)'"></div>
            <div class="parallax-layer layer-front" [style.transform]="'translateY(' + scrollY() * 0.6 + 'px)'"></div>
        </div>
      </div>

      <!-- Contenu du Header -->
      <div class="container header-content" [style.transform]="'translateY(' + scrollY() * -0.1 + 'px)'">
        
        <div class="logo" routerLink="/">
            <span class="icon">☕</span>
            <div class="text">
                <span class="brand">L'ITALIANO</span>
                <span class="suffix">COFFEE</span>
            </div>
        </div>
        
        <!-- Bouton Hamburger -->
        <button class="mobile-toggle" (click)="toggleMenu()" [class.open]="isMenuOpen()">
            <span></span>
            <span></span>
            <span></span>
        </button>

        <!-- Navigation -->
        <nav [class.mobile-open]="isMenuOpen()">
          <ul>
            <li><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" (click)="closeMenu()">Accueil</a></li>
            <li><a routerLink="/products" routerLinkActive="active" (click)="closeMenu()">Nos Cafés</a></li>
            <li><a routerLink="/contact" routerLinkActive="active" (click)="closeMenu()">Contact</a></li>
            
            <!-- Liens Mobile -->
            <li class="mobile-only"><a routerLink="/cart" (click)="closeMenu()">Panier ({{ cart.itemCount() }})</a></li>
            @if (auth.isAuthenticated()) {
                <li class="mobile-only"><button (click)="logout(); closeMenu()" class="nav-btn">Déconnexion</button></li>
            } @else {
                <li class="mobile-only"><a routerLink="/login" (click)="closeMenu()">Connexion</a></li>
            }
          </ul>
        </nav>
        
        <!-- Actions Desktop -->
        <div class="actions desktop-only">
            <a routerLink="/cart" class="cart-btn" [class.has-items]="cart.itemCount() > 0">
                <span class="cart-icon">🛒</span>
                <span class="cart-count" *ngIf="cart.itemCount() > 0">{{ cart.itemCount() }}</span>
            </a>
            <div class="auth-buttons">
                @if (auth.isAdmin()) { <a routerLink="/admin" class="admin-link">Admin</a> }
                @if (auth.isAuthenticated()) { <button (click)="logout()" class="logout-btn">✕</button> } 
                @else { <a routerLink="/login" class="login-link">Login</a> }
            </div>
        </div>
      </div>
      
      <!-- Overlay sombre -->
      <div class="menu-overlay" *ngIf="isMenuOpen()" (click)="closeMenu()"></div>
    </header>
  `,
  styles: [`
    /* --- HEADER PRINCIPAL --- */
    header { 
        position: fixed; top: 0; left: 0; width: 100%; z-index: 1000; 
        height: 140px; transition: 0.4s cubic-bezier(0.25, 0.8, 0.25, 1); 
        background: transparent; border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    header.scrolled { 
        height: 70px; 
        background: #2c3e50; /* Fond opaque au scroll */
        box-shadow: 0 4px 10px rgba(0,0,0,0.3); 
    }

    /* --- PARALLAX (Désactivé visuellement au scroll) --- */
    .parallax-wrapper { position: absolute; inset: 0; overflow: hidden; z-index: 0; pointer-events: none; }
    .parallax-container { position: absolute; inset: 0; }
    .parallax-layer { position: absolute; inset: -10% 0; background-size: cover; will-change: transform; transition: opacity 0.4s; }
    .layer-back { background-image: url('/assets/slider1.png'); opacity: 0.3; filter: blur(2px); }
    .layer-mid { background-image: url('/assets/cat_grains.jpg'); opacity: 0.15; }
    .layer-front { background-image: none; }
    header.scrolled .parallax-layer { opacity: 0; }

    /* --- CONTENU --- */
    .header-content { 
        position: relative; z-index: 100; height: 100%; 
        display: flex; justify-content: space-between; align-items: flex-start; 
        padding: 20px 30px; 
        will-change: transform;
    }

    header.scrolled .header-content { align-items: center; padding: 0 30px; }
    
    .container { max-width: 1400px; margin: 0 auto; }

    /* --- LOGO --- */
    .logo { display: flex; align-items: center; gap: 10px; cursor: pointer; color: white; pointer-events: auto; z-index: 1100; }
    .logo .icon { font-size: 2rem; } 
    .brand { font-family: 'Playfair Display', serif; font-weight: 700; font-size: 1.2rem; } 
    .suffix { font-size: 0.7rem; color: var(--accent-color); display: block; letter-spacing: 2px; }

    /* --- NAVIGATION DESKTOP --- */
    nav ul { list-style: none; display: flex; gap: 30px; margin: 0; padding: 0; }
    nav a { 
        color: rgba(255,255,255,0.9); text-decoration: none; text-transform: uppercase; 
        font-size: 0.9rem; font-weight: 500; transition: color 0.3s; cursor: pointer; pointer-events: auto; 
    }
    nav a:hover, nav a.active { color: var(--accent-color); }
    
    .nav-btn {
        background: none; border: none; color: inherit; font: inherit; text-transform: uppercase; cursor: pointer;
    }

    /* --- ACTIONS (Desktop) --- */
    .actions { display: flex; align-items: center; gap: 20px; pointer-events: auto; }
    .login-link { color: white; border: 1px solid rgba(255,255,255,0.5); padding: 6px 15px; border-radius: 30px; font-size: 0.8rem; }
    .logout-btn { background: none; border: none; color: #ccc; cursor: pointer; font-size: 1.2rem; } 
    .admin-link { color: #f1c40f; font-weight: bold; font-size: 0.8rem; text-transform: uppercase; }
    .cart-btn { color: white; font-size: 1.2rem; position: relative; } 
    .cart-count { position: absolute; top: -8px; right: -8px; background: #e74c3c; color: white; border-radius: 50%; padding: 2px 6px; font-size: 0.7rem; }
    
    /* --- MOBILE STYLES --- */
    .mobile-toggle { 
        display: none; flex-direction: column; gap: 5px; 
        background: none; border: none; cursor: pointer; 
        z-index: 1200; padding: 10px; pointer-events: auto; 
    }
    .mobile-toggle span { 
        display: block; width: 25px; height: 3px; background-color: white; 
        transition: 0.3s; border-radius: 2px; 
    }
    
    /* Animation Hamburger */
    .mobile-toggle.open span:nth-child(1) { transform: rotate(45deg) translate(5px, 6px); background-color: var(--accent-color); }
    .mobile-toggle.open span:nth-child(2) { opacity: 0; }
    .mobile-toggle.open span:nth-child(3) { transform: rotate(-45deg) translate(5px, -6px); background-color: var(--accent-color); }
    
    .mobile-only { display: none; } 
    .menu-overlay { 
        display: none; 
        position: fixed; inset: 0; 
        background: rgba(0,0,0,0.7); /* Plus sombre mais net */
        z-index: 1050; 
        /* backdrop-filter: blur(3px); SUPPRIMÉ POUR ÉVITER LE FLOU */
    }

    @media (max-width: 768px) {
        .desktop-only { display: none; } 
        .mobile-toggle { display: flex; } 
        
        /* -- CORRECTIF CRITIQUE -- */
        /* On force le reset des transforms sur mobile pour que position:fixed fonctionne par rapport au viewport */
        .header-content { 
            transform: none !important; 
            will-change: auto !important; 
        }
        
        header { height: 80px; overflow: visible !important; } /* Overflow visible pour laisser sortir le menu */
        header.scrolled { height: 70px; }
        .header-content { padding: 10px 20px; align-items: center; }

        /* Menu Mobile */
        nav {
            position: fixed; top: 0; right: -100%; width: 75%; height: 100vh; 
            background: #2c3e50; padding: 100px 30px; 
            transition: right 0.3s ease-in-out; 
            z-index: 1100; 
            box-shadow: -5px 0 20px rgba(0,0,0,0.5); 
            display: block !important; 
        }
        nav.mobile-open { right: 0; } 
        
        nav ul { flex-direction: column; gap: 25px; } 
        nav a, .nav-btn { font-size: 1.2rem; display: block; padding: 10px 0; color: white; text-align: left; width: 100%; }
        
        .mobile-only { display: block; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px; margin-top: 10px; }
        .menu-overlay { display: block; }
    }
  `]
})
export class HeaderComponent {
  scrollY = signal(0);
  isMenuOpen = signal(false);
  
  isScrolled = computed(() => this.scrollY() > 50);
  auth = inject(AuthService);
  cart = inject(CartService);
  private router = inject(Router);

  @HostListener('window:scroll', []) onScroll() { 
    this.scrollY.set(window.scrollY); 
  }
  
  toggleMenu() { this.isMenuOpen.update(v => !v); }
  closeMenu() { this.isMenuOpen.set(false); }

  async logout() {
    await this.auth.signOut();
    this.router.navigate(['/']);
  }
}
