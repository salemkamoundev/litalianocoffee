import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-footer', standalone: true, imports: [CommonModule],
  template: `
    <footer>
      <div class="container">
        <div class="col">
            <h3>L'Italiano Coffee</h3>
            <p>Le goût de l'excellence italienne.</p>
        </div>
        <div class="col">
            <h4>Contact</h4>
            <p>Email: contact@litalianocaffe.tn</p>
        </div>
      </div>
      <div class="bottom"><p>&copy; 2025 L'Italiano Coffee. Tous droits réservés.</p></div>
    </footer>
  `,
  styles: [`
    footer { background: #111; color: #ccc; padding-top: 60px; font-size: 0.9rem; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 20px 40px; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 40px; }
    h3 { color: #d4a373; font-size: 1.5rem; margin-bottom: 10px; }
    h4 { color: #fff; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px; }
    .bottom { background: #000; text-align: center; padding: 20px; color: #555; }
  `]
})
export class FooterComponent {}
