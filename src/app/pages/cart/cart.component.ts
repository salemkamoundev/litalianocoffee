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
        <span class="count-badge">{{ cart.itemCount() }} articles</span>
      </div>

      @if (cart.cartItems().length === 0) {
        <div class="empty-state">
            <div class="icon-bag">🛍️</div>
            <h2>Votre panier est vide</h2>
            <p>Il semblerait que vous n'ayez pas encore succombé à nos arômes.</p>
            <a routerLink="/products" class="btn-primary" style="text-decoration:none;display:inline-block;margin-top:20px">Découvrir nos Cafés</a>
        </div>
      } @else {
        <div class="cart-layout">
          <div class="cart-items">
            @for (item of cart.cartItems(); track item.id) {
              <div class="cart-item">
                <div class="item-image">
                    <img [src]="item.imageUrl" [alt]="item.name">
                </div>
                <div class="item-info">
                    <h3>{{ item.name }}</h3>
                    <p class="unit-price">{{ item.price | currency:'DT':'symbol':'1.2-2':'fr' }}</p>
                </div>
                <div class="item-actions">
                    <div class="qty-selector">
                        <button (click)="updateQuantity(item.id, item.quantity - 1)">-</button>
                        <input type="number" [ngModel]="item.quantity" (change)="onQtyChange(item.id, $event)" min="1">
                        <button (click)="updateQuantity(item.id, item.quantity + 1)">+</button>
                    </div>
                    <div class="item-total">
                        {{ (item.price * item.quantity) | currency:'DT':'symbol':'1.2-2':'fr' }}
                    </div>
                    <button class="btn-remove" (click)="cart.removeItem(item.id)" title="Retirer">✕</button>
                </div>
              </div>
            }
          </div>
          <div class="cart-summary">
            <h2>Récapitulatif</h2>
            <div class="summary-row"><span>Sous-total</span><span>{{ cart.subTotal() | currency:'DT':'symbol':'1.2-2':'fr' }}</span></div>
            <div class="summary-row"><span>Livraison</span><span class="free">Offerte</span></div>
            <div class="divider"></div>
            <div class="summary-row total"><span>Total</span><span>{{ cart.subTotal() | currency:'DT':'symbol':'1.2-2':'fr' }}</span></div>
            <a routerLink="/checkout" class="btn-checkout">Passer la commande</a>
            <p class="secure-text">🔒 Paiement à la livraison sécurisé</p>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container { max-width: 1200px; margin: 0 auto; padding: 120px 20px 60px; min-height: 80vh; }
    .cart-header { display: flex; align-items: center; gap: 15px; margin-bottom: 40px; border-bottom: 1px solid #eee; padding-bottom: 20px; }
    h1 { font-size: 2.5rem; margin: 0; color: var(--primary-color); }
    .count-badge { background: #eee; color: #555; padding: 5px 12px; border-radius: 20px; font-size: 0.9rem; font-weight: bold; }
    .empty-state { text-align: center; padding: 80px 20px; background: white; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
    .icon-bag { font-size: 4rem; margin-bottom: 20px; display: block; }
    .empty-state h2 { color: var(--secondary-color); margin-bottom: 10px; }
    .empty-state p { color: #888; margin-bottom: 30px; }
    .cart-layout { display: grid; grid-template-columns: 1fr 350px; gap: 40px; align-items: start; }
    .cart-items { background: white; border-radius: 15px; box-shadow: 0 5px 20px rgba(0,0,0,0.03); overflow: hidden; }
    .cart-item { display: flex; align-items: center; padding: 20px; border-bottom: 1px solid #f5f5f5; transition: background 0.2s; }
    .cart-item:hover { background: #fafafa; }
    .item-image img { width: 80px; height: 80px; object-fit: cover; border-radius: 8px; margin-right: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
    .item-info { flex: 1; }
    .item-info h3 { margin: 0 0 5px; font-size: 1.1rem; color: var(--secondary-color); }
    .unit-price { color: #888; font-size: 0.9rem; margin: 0; }
    .item-actions { display: flex; align-items: center; gap: 20px; }
    .qty-selector { display: flex; align-items: center; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
    .qty-selector button { background: #f9f9f9; border: none; width: 30px; height: 30px; cursor: pointer; font-weight: bold; color: #555; }
    .qty-selector input { width: 40px; text-align: center; border: none; font-weight: bold; color: var(--primary-color); -moz-appearance: textfield; }
    .item-total { font-weight: bold; color: var(--primary-color); font-size: 1.1rem; min-width: 80px; text-align: right; }
    .btn-remove { background: none; border: none; color: #ccc; cursor: pointer; font-size: 1.2rem; transition: color 0.3s; padding: 5px; }
    .btn-remove:hover { color: var(--error-color); }
    .cart-summary { background: white; padding: 30px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); position: sticky; top: 100px; border: 1px solid #f0f0f0; }
    .cart-summary h2 { font-size: 1.5rem; margin-top: 0; margin-bottom: 25px; color: var(--secondary-color); }
    .summary-row { display: flex; justify-content: space-between; margin-bottom: 15px; color: #666; }
    .free { color: var(--success-color); font-weight: bold; }
    .divider { height: 1px; background: #eee; margin: 20px 0; }
    .total { font-size: 1.4rem; font-weight: 800; color: var(--primary-color); margin-bottom: 25px; }
    .btn-checkout { display: block; width: 100%; background: var(--accent-color); color: white; text-align: center; padding: 15px; border-radius: 50px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; transition: all 0.3s; box-shadow: 0 5px 15px rgba(212, 163, 115, 0.4); text-decoration: none; box-sizing: border-box; }
    .btn-checkout:hover { background: var(--primary-color); transform: translateY(-2px); }
    .secure-text { text-align: center; font-size: 0.8rem; color: #999; margin-top: 15px; }
    @media (max-width: 900px) { .cart-layout { grid-template-columns: 1fr; } .cart-item { flex-wrap: wrap; gap: 15px; } .item-actions { width: 100%; justify-content: space-between; margin-top: 10px; } }
  `]
})
export class CartComponent {
  cart = inject(CartService);
  updateQuantity(id: string, qty: number) { this.cart.updateQuantity(id, qty); }
  onQtyChange(id: string, event: any) { const val = parseInt(event.target.value, 10); this.updateQuantity(id, val); }
}
