import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <h1>Votre Panier</h1>
      <div class="cart-summary">
        <h2>Résumé</h2>
        <p>Total: <span>0.00 DT</span></p>
        <button class="checkout-button">Commander</button>
      </div>
    </div>
  `,
  styles: [`
    .cart-summary { background: var(--light-bg); padding: 30px; max-width: 400px; margin-top: 20px; }
    .checkout-button { width: 100%; background: var(--accent-color); padding: 15px; border: none; font-weight: bold; margin-top: 20px; }
  `]
})
export class CartComponent {}
