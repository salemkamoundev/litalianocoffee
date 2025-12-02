import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer>
      <div class="container">
        <div class="col">
          <h3>L'Italiano Coffee</h3>
          <p class="slogan">Le goût authentique, de la fève à votre tasse.</p>
        </div>
        <div class="col">
          <h4>Contactez-nous</h4>
          <p>Email: <a href="mailto:contact@litalianocaffe.tn">contact@litalianocaffe.tn</a></p>
          <p>Site: litalianocoffee.com</p>
        </div>
        <div class="col">
          <h4>Suivez-nous</h4>
          <div class="socials">
            <span class="badge">Facebook (Bientôt)</span>
            <span class="badge">Instagram (Bientôt)</span>
          </div>
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
      color: #fff;
      padding-top: 60px;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 40px;
      padding: 0 20px 60px;
    }
    h3 { color: #d4a373; font-size: 1.8rem; }
    h4 { color: #fff; border-bottom: 2px solid #d4a373; display: inline-block; padding-bottom: 5px; margin-bottom: 20px; }
    a { color: #ccc; text-decoration: none; transition: color 0.3s; }
    a:hover { color: #d4a373; }
    .slogan { font-style: italic; color: #aaa; }
    .badge {
      background: #333;
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 0.8rem;
      margin-right: 10px;
      color: #888;
    }
    .bottom-bar {
      background: #000;
      text-align: center;
      padding: 20px;
      font-size: 0.8rem;
      color: #666;
    }
  `]
})
export class FooterComponent {}
