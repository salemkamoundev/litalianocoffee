import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <footer>
      <div class="container">
        <!-- Colonne Marque & Slogan -->
        <div class="col brand-col">
            <h3>L'ITALIANO COFFEE</h3>
            <p class="slogan">Le goût authentique, de la fève à votre tasse.</p>
            <div class="socials">
                <span class="badge">Facebook (Bientôt)</span>
                <span class="badge">Instagram (Bientôt)</span>
            </div>
        </div>

        <!-- Colonne Contact -->
        <div class="col contact-col">
            <h4>Nous Contacter</h4>
            <ul>
                <li><span class="icon">📍</span> Teboulba, Monastir</li>
                <li><span class="icon">📞</span> 26 488 448 / 26 488 445</li>
                <li><span class="icon">✉️</span> contact@litalianocaffe.tn</li>
            </ul>
        </div>

        <!-- Colonne Liens -->
        <div class="col links-col">
            <h4>Navigation</h4>
            <ul>
                <li><a routerLink="/">Accueil</a></li>
                <li><a routerLink="/products">Nos Cafés</a></li>
                <li><a routerLink="/contact">Contact</a></li>
            </ul>
        </div>
      </div>
      
      <div class="bottom-bar">
        <p>&copy; 2025 L'Italiano Coffee. Tous droits réservés.</p>
      </div>
    </footer>
  `,
  styles: [`
    footer { 
        background-color: #1a1a1a; 
        color: #ccc; 
        padding-top: 60px; 
        font-size: 0.95rem;
        border-top: 5px solid var(--primary-color);
    }
    .container { 
        max-width: 1200px; 
        margin: 0 auto; 
        padding: 0 20px 40px; 
        display: grid; 
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
        gap: 40px; 
    }
    
    h3 { color: var(--accent-color); font-family: 'Playfair Display', serif; font-size: 1.5rem; margin-bottom: 15px; letter-spacing: 1px; }
    h4 { color: #fff; margin-bottom: 20px; text-transform: uppercase; font-size: 1rem; letter-spacing: 1px; border-bottom: 1px solid #333; padding-bottom: 10px; display: inline-block; }
    
    .slogan { font-style: italic; margin-bottom: 20px; line-height: 1.6; }
    
    ul { list-style: none; padding: 0; }
    li { margin-bottom: 12px; display: flex; align-items: center; gap: 10px; }
    
    a { color: #aaa; text-decoration: none; transition: color 0.3s; }
    a:hover { color: var(--accent-color); }
    
    .icon { font-size: 1.1rem; }
    
    .socials { display: flex; gap: 10px; margin-top: 20px; }
    .badge { background: #333; color: #fff; padding: 5px 10px; border-radius: 4px; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; }
    
    .bottom-bar { 
        background: #111; 
        text-align: center; 
        padding: 20px; 
        color: #666; 
        font-size: 0.85rem; 
        border-top: 1px solid #222;
    }
  `]
})
export class FooterComponent {}
