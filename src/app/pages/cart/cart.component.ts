import { Component, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CurrencyPipe],
  template: `
    <div class="page-container">
      <div class="cart-header">
        <h1>Votre Panier</h1>
        <span class="count-pill">{{ cart.itemCount() }} articles</span>
      </div>

      @if (cart.cartItems().length === 0) {
        <div class="empty-state">
            <div class="icon-bag">🛍️</div>
            <h2>Votre panier est vide</h2>
            <p>Il semblerait que vous n'ayez pas encore succombé à nos arômes.</p>
            <a routerLink="/products" class="btn-orange">Découvrir nos Cafés</a>
        </div>
      } @else {
        <div class="cart-layout">
          <!-- Liste -->
          <div class="cart-items">
            @for (item of cart.cartItems(); track item.id) {
              <div class="cart-item">
                <img [src]="item.imageUrl" [alt]="item.name" class="item-img">
                <div class="item-info">
                    <h3>{{ item.name }}</h3>
                    <p class="unit-price">{{ item.price | currency:'DT':'symbol':'1.2-2':'fr' }}</p>
                </div>
                <div class="item-controls">
                    <div class="qty-box">
                        <button (click)="updateQuantity(item.id, item.quantity - 1)">-</button>
                        <span>{{ item.quantity }}</span>
                        <button (click)="updateQuantity(item.id, item.quantity + 1)">+</button>
                    </div>
                    <button class="btn-remove" (click)="cart.removeItem(item.id)">✕</button>
                </div>
                <div class="item-total">
                    {{ (item.price * item.quantity) | currency:'DT':'symbol':'1.2-2':'fr' }}
                </div>
              </div>
            }
          </div>

          <!-- Résumé -->
          <div class="cart-summary">
            <h2>Total Panier</h2>
            <div class="row total-row">
                <span>Total</span>
                <span class="total-price">{{ cart.subTotal() | currency:'DT':'symbol':'1.2-2':'fr' }}</span>
            </div>
            <a routerLink="/checkout" class="btn-orange w-100">Commander</a>
            <div class="secure-badge">
                <span>🔒</span> Paiement sécurisé
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container { max-width: 1100px; margin: 0 auto; padding: 120px 20px; min-height: 80vh; }
    .cart-header { display: flex; align-items: center; gap: 15px; margin-bottom: 40px; }
    h1 { margin: 0; font-size: 2.5rem; }
    .count-pill { background: var(--cart-orange); color: white; padding: 5px 15px; border-radius: 20px; font-weight: bold; font-size: 0.9rem; }

    .empty-state { text-align: center; padding: 80px; background: white; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
    .icon-bag { font-size: 4rem; margin-bottom: 20px; display: block; filter: grayscale(100%); opacity: 0.5; }
    
    .btn-orange { 
        display: inline-block; background: var(--cart-orange); color: white; 
        padding: 15px 40px; border-radius: 50px; font-weight: 800; 
        text-transform: uppercase; letter-spacing: 1px; text-decoration: none; 
        transition: all 0.3s; box-shadow: 0 5px 15px rgba(255, 159, 67, 0.3);
        border: none; cursor: pointer; text-align: center;
    }
    .btn-orange:hover { transform: translateY(-3px); box-shadow: 0 8px 25px rgba(255, 159, 67, 0.5); }
    .w-100 { width: 100%; box-sizing: border-box; }

    .cart-layout { display: grid; grid-template-columns: 1fr 350px; gap: 40px; }
    
    .cart-items { background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 5px 15px rgba(0,0,0,0.03); }
    .cart-item { display: flex; align-items: center; padding: 20px; border-bottom: 1px solid #eee; gap: 20px; }
    .item-img { width: 80px; height: 80px; border-radius: 10px; object-fit: cover; }
    .item-info { flex: 1; }
    .item-info h3 { margin: 0 0 5px; color: var(--secondary-color); font-size: 1.1rem; }
    .unit-price { color: #999; font-size: 0.9rem; }
    
    .qty-box { display: flex; align-items: center; border: 1px solid #eee; border-radius: 20px; padding: 5px 10px; }
    .qty-box button { background: none; border: none; width: 25px; font-weight: bold; color: var(--secondary-color); }
    .qty-box span { margin: 0 10px; font-weight: bold; }
    
    .btn-remove { background: none; border: none; color: #ccc; font-size: 1.2rem; margin-left: 15px; }
    .btn-remove:hover { color: var(--error-color); }
    
    .item-total { font-weight: 800; color: var(--primary-color); font-size: 1.1rem; width: 100px; text-align: right; }

    .cart-summary { background: white; padding: 30px; border-radius: 15px; box-shadow: 0 10px 40px rgba(0,0,0,0.08); height: fit-content; border-top: 5px solid var(--cart-orange); }
    .total-row { display: flex; justify-content: space-between; align-items: center; margin: 20px 0 30px; padding-top: 20px; border-top: 1px solid #eee; }
    .total-price { font-size: 1.8rem; font-weight: 900; color: var(--secondary-color); }
    
    .secure-badge { text-align: center; margin-top: 20px; font-size: 0.85rem; color: #999; }

    @media (max-width: 900px) {
        .cart-layout { grid-template-columns: 1fr; }
        .cart-item { flex-wrap: wrap; }
        .item-controls { display: flex; align-items: center; width: 100%; justify-content: space-between; margin-top: 10px; }
        .item-total { width: 100%; text-align: left; margin-top: 10px; }
    }
  `]
})
export class CartComponent {
  cart = inject(CartService);
  updateQuantity(id: string, qty: number) { this.cart.updateQuantity(id, qty); }
  onQtyChange(id: string, event: any) { const val = parseInt(event.target.value, 10); this.updateQuantity(id, val); }
}
