import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header [class.scrolled]="isScrolled">
      <div class="container">
        <div class="logo">
            <span class="brand">L'ITALIANO</span><span class="suffix">COFFEE</span>
        </div>
        <nav>
          <ul>
            <li><a routerLink="/" fragment="home">Accueil</a></li>
            <li><a routerLink="/products">Produits</a></li>
            <li>
                <a routerLink="/cart" class="cart-link">
                    Panier @if (cart.itemCount() > 0) { <span class="cart-badge">{{ cart.itemCount() }}</span> }
                </a>
            </li>
            @if (auth.isAdmin()) { <li><a routerLink="/admin" class="btn-admin">ADMIN</a></li> }
            @if (auth.isAuthenticated()) {
                <li><button (click)="logout()" class="btn-logout">Déconnexion</button></li>
            } @else {
                <li><a routerLink="/login" class="btn-contact">Connexion</a></li>
            }
          </ul>
        </nav>
      </div>
    </header>
  `,
  styles: [`
    header { position: fixed; top: 0; width: 100%; z-index: 1000; padding: 20px 0; transition: 0.3s; background: linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%); }
    header.scrolled { padding: 10px 0; background: rgba(10, 10, 10, 0.95); backdrop-filter: blur(10px); box-shadow: 0 4px 20px rgba(0,0,0,0.4); }
    .container { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 0 20px; }
    .logo { font-family: 'Playfair Display', serif; font-size: 1.8rem; font-weight: 700; color: white; letter-spacing: 2px; }
    .suffix { color: #d4a373; font-style: italic; }
    nav ul { list-style: none; display: flex; gap: 25px; margin: 0; padding: 0; align-items: center; }
    nav a, button { text-decoration: none; color: #eee; font-size: 0.85rem; text-transform: uppercase; font-weight: 500; letter-spacing: 1px; background: none; border: none; cursor: pointer; transition: color 0.3s; }
    nav a:hover, button:hover { color: #d4a373; }
    .btn-contact { border: 1px solid #d4a373; padding: 8px 20px; border-radius: 30px; transition: all 0.3s; }
    .btn-contact:hover { background: #d4a373; color: #000; }
    .btn-logout { color: #e74c3c; }
    .btn-admin { color: #f1c40f; font-weight: bold; border-bottom: 2px solid #f1c40f; }
    .cart-link { position: relative; padding-right: 20px; }
    .cart-badge { position: absolute; top: -8px; right: 0; background: #e74c3c; color: white; border-radius: 50%; padding: 2px 6px; font-size: 0.7rem; }
  `]
})
export class HeaderComponent {
  isScrolled = false;
  auth = inject(AuthService);
  cart = inject(CartService);
  private router = inject(Router);

  @HostListener('window:scroll', []) onWindowScroll() { this.isScrolled = window.scrollY > 50; }
  logout() { this.auth.signOut(); }
}
