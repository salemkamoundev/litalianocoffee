import { Component, HostListener } from '@angular/core'; // Ajout de HostListener
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

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
            <li><a routerLink="/cart">Panier</a></li>
            <li><a routerLink="/contact" class="btn-contact">Contact</a></li>
          </ul>
        </nav>
      </div>
    </header>
  `,
  styles: [`
    header {
      position: fixed;
      top: 0;
      width: 100%;
      z-index: 1000;
      padding: 20px 0;
      transition: background 0.3s, padding 0.3s;
      /* CORRECTION: Rendre l'en-tête opaque par défaut (Noir) */
      background: rgba(0, 0, 0, 0.9);
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    }
    /* La classe .scrolled n'est plus nécessaire si l'en-tête est opaque par défaut, 
       mais la gardons pour les transitions futures ou des styles différents */
    header.scrolled {
      padding: 10px 0;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 20px;
    }
    .logo {
      font-family: 'Playfair Display', serif;
      font-size: 1.5rem;
      font-weight: 700;
      color: white;
      letter-spacing: 2px;
    }
    .suffix {
      color: #d4a373;
    }
    nav ul {
      list-style: none;
      display: flex;
      gap: 30px;
      margin: 0;
      padding: 0;
    }
    nav a {
      text-decoration: none;
      color: white;
      font-weight: 400;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      transition: color 0.3s;
    }
    nav a:hover {
      color: #d4a373;
    }
    .btn-contact {
      border: 1px solid #d4a373;
      padding: 8px 20px;
      border-radius: 20px;
    }
    .btn-contact:hover {
      background: #d4a373;
      color: #000;
    }
  `]
})
export class HeaderComponent {
  isScrolled = false;

  // Utilisation de @HostListener pour une gestion de scroll plus stable dans Angular
  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 50;
  }

  // Suppression de l'écouteur dans le constructeur pour éviter les conflits de chargement initial
  constructor() {
    // La logique de scroll est maintenant gérée par @HostListener
  }
}
