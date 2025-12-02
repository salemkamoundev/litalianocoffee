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
      
      <!-- COUCHES PARALLAX (Images d'arrière-plan) -->
      <div class="parallax-container">
          <!-- Couche la plus éloignée (bouge lentement) : Texture de fond -->
          <div class="parallax-layer layer-back" 
               [style.transform]="'translateY(' + scrollY() * 0.2 + 'px)'"></div>
          
          <!-- Couche intermédiaire : Grains de café flous -->
          <div class="parallax-layer layer-mid" 
               [style.transform]="'translateY(' + scrollY() * 0.4 + 'px)'"></div>
          
          <!-- Couche avant (bouge plus vite) : Grains nets et feuilles -->
          <div class="parallax-layer layer-front" 
               [style.transform]="'translateY(' + scrollY() * 0.6 + 'px)'"></div>
      </div>

      <!-- CONTENU PRINCIPAL (Logo + Nav) -->
      <!-- Le contenu principal bouge légèrement vers le haut pour se détacher -->
      <div class="container header-content" [style.transform]="'translateY(' + scrollY() * -0.1 + 'px)'">
        <div class="logo" routerLink="/">
            <span class="icon">☕</span>
            <div class="text">
                <span class="brand">L'ITALIANO</span>
                <span class="suffix">COFFEE</span>
            </div>
        </div>
        
        <nav>
          <ul class="nav-links">
            <li><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Accueil</a></li>
            <li><a routerLink="/products" routerLinkActive="active">Nos Cafés</a></li>
            <li><a routerLink="/contact" routerLinkActive="active">Contact</a></li>
          </ul>
        </nav>

        <div class="actions">
            <!-- Panier -->
            <a routerLink="/cart" class="cart-btn" [class.has-items]="cart.itemCount() > 0">
                <span class="cart-icon">🛒</span>
                <span class="cart-count" *ngIf="cart.itemCount() > 0">{{ cart.itemCount() }}</span>
            </a>

            <!-- User Menu -->
            <div class="auth-buttons">
                @if (auth.isAdmin()) {
                    <a routerLink="/admin" class="admin-link">Dashboard</a>
                }
                @if (auth.isAuthenticated()) {
                    <button (click)="logout()" class="logout-btn">Sortir</button>
                } @else {
                    <a routerLink="/login" class="login-link">Login</a>
                }
            </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    header {
        position: fixed; top: 0; left: 0; width: 100%; z-index: 1000;
        /* Hauteur initiale plus grande pour voir l'effet parallax */
        height: 180px; 
        transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
        overflow: hidden; /* Important pour cacher les éléments qui sortent */
        border-bottom: 1px solid rgba(255,255,255,0.1);
    }

    /* --- Styles Parallax --- */
    .parallax-container {
        position: absolute; inset: 0; z-index: 1;
        pointer-events: none; /* Pour que les clics passent au travers */
    }

    .parallax-layer {
        position: absolute; inset: -10% 0 -10% 0; /* Un peu plus grand que le header pour éviter les coupures */
        background-size: cover;
        background-position: center top;
        will-change: transform; /* Optimisation des performances */
        transition: opacity 0.4s;
    }

    /* NOTE: Remplacez ces URLs par vos propres images PNG transparentes pour un meilleur résultat */
    /* Couche de fond : Texture subtile */
    .layer-back {
        background-image: url('https://www.transparenttextures.com/patterns/mocha-grunge.png');
        opacity: 0.3; background-repeat: repeat;
    }
    /* Couche intermédiaire : Grains de café un peu flous */
    .layer-mid {
        background-image: url('https://png.pngtree.com/png-clipart/20230427/original/pngtree-coffee-beans-falling-png-image_9112671.png');
        background-size: 120%; opacity: 0.5; filter: blur(2px);
    }
    /* Couche avant : Grains nets sur les bords */
    .layer-front {
        background-image: url('https://png.pngtree.com/png-clipart/20220131/original/pngtree-coffee-beans-png-image_7255859.png');
        background-size: 100%; background-position: center 120%; opacity: 0.8;
    }

    /* --- Styles du Contenu --- */
    .header-content {
        position: relative; z-index: 10; /* Au-dessus du parallax */
        height: 100%;
        display: flex; justify-content: space-between; align-items: flex-start;
        padding: 30px;
        will-change: transform;
    }

    /* --- État "Scrolled" (Compact) --- */
    header.scrolled {
        height: 70px; /* Devient compact */
        background: rgba(43, 29, 22, 0.98); /* Fond Espresso opaque */
        backdrop-filter: blur(15px);
        box-shadow: 0 4px 20px rgba(0,0,0,0.4);
        border-bottom: 1px solid var(--primary-color);
    }
    
    /* Quand on scrolle, on cache progressivement les couches parallax pour nettoyer le header */
    header.scrolled .parallax-layer { opacity: 0; }
    header.scrolled .header-content { align-items: center; padding: 0 30px; }


    /* (Le reste des styles du logo et de la nav reste identique au design précédent) */
    .logo { display: flex; align-items: center; gap: 10px; cursor: pointer; color: white; }
    .logo .icon { font-size: 2rem; transition: 0.3s; }
    header.scrolled .logo .icon { font-size: 1.5rem; }
    .logo .text { display: flex; flex-direction: column; line-height: 1; }
    .brand { font-family: 'Playfair Display', serif; font-weight: 700; font-size: 1.2rem; letter-spacing: 2px; }
    .suffix { font-size: 0.7rem; color: var(--accent-gold); letter-spacing: 3px; margin-top: 3px; }

    .nav-links { display: flex; gap: 40px; }
    .nav-links a { color: rgba(255,255,255,0.8); font-weight: 500; font-size: 0.95rem; text-transform: uppercase; letter-spacing: 1px; position: relative; }
    .nav-links a:hover, .nav-links a.active { color: var(--accent-gold); }
    .nav-links a::after { content: ''; position: absolute; bottom: -5px; left: 0; width: 0; height: 2px; background: var(--accent-gold); transition: width 0.3s; }
    .nav-links a:hover::after, .nav-links a.active::after { width: 100%; }

    .actions { display: flex; align-items: center; gap: 20px; }
    .cart-btn { position: relative; color: white; font-size: 1.2rem; padding: 5px; transition: transform 0.2s; }
    .cart-btn:hover { transform: scale(1.1); color: var(--accent-gold); }
    .cart-count { position: absolute; top: -5px; right: -8px; background: var(--accent-gold); color: var(--primary-dark); font-size: 0.7rem; font-weight: bold; padding: 2px 6px; border-radius: 50%; }

    .auth-buttons { display: flex; align-items: center; gap: 15px; }
    .login-link { color: white; font-weight: bold; border: 1px solid rgba(255,255,255,0.3); padding: 8px 20px; border-radius: 30px; }
    .login-link:hover { background: var(--accent-gold); border-color: var(--accent-gold); color: var(--primary-dark); }
    .admin-link { color: #f1c40f; font-weight: bold; text-transform: uppercase; font-size: 0.8rem; }
    .logout-btn { background: none; border: none; color: rgba(255,255,255,0.6); cursor: pointer; font-size: 0.9rem; }
    .logout-btn:hover { color: #e74c3c; }

    @media (max-width: 768px) { .nav-links { display: none; } header { height: 120px; } }
  `]
})
export class HeaderComponent {
  // Signal pour stocker la position exacte du scroll
  scrollY = signal(0);
  // Signal calculé pour l'état "scrolled" (plus simple que de le gérer manuellement)
  isScrolled = computed(() => this.scrollY() > 50);

  auth = inject(AuthService);
  cart = inject(CartService);
  
  // Écouteur sur toute la fenêtre pour mettre à jour le signal scrollY
  @HostListener('window:scroll', []) onScroll() {
    // On utilise requestAnimationFrame pour la performance si besoin, 
    // mais ici l'assignation directe au signal est généralement assez rapide.
    this.scrollY.set(window.scrollY);
  }
  
  logout() { this.auth.signOut(); }
}
