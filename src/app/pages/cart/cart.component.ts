import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <h1>Votre Panier</h1>
      <p>Ici, nous listerons les articles ajoutés. (Logique à implémenter avec un Service/Signal)</p>
      
      <div class="cart-summary">
        <h2>Résumé de la commande</h2>
        <p>Sous-total: <span>99.99 DT</span></p>
        <p>Frais de livraison: <span>Gratuit</span></p>
        <p class="total">Total: <span>99.99 DT</span></p>
        <button class="checkout-button">Procéder à la commande (Hors Paiement)</button>
      </div>
    </div>
  `,
  styles: [`
    .cart-summary {
        background: var(--light-bg);
        padding: 30px;
        border-radius: 8px;
        margin-top: 40px;
        max-width: 400px;
    }
    .cart-summary h2 {
        color: var(--secondary-color);
    }
    .cart-summary p {
        display: flex;
        justify-content: space-between;
        padding: 5px 0;
        border-bottom: 1px dashed #ccc;
    }
    .total {
        font-size: 1.2rem;
        font-weight: bold;
        border-bottom: none !important;
        margin-top: 20px;
    }
    .checkout-button {
        width: 100%;
        background-color: var(--accent-color);
        color: black;
        padding: 15px;
        border: none;
        border-radius: 5px;
        font-weight: bold;
        margin-top: 20px;
    }
  `]
})
export class CartComponent {}
