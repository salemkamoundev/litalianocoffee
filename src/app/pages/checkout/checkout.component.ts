import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-checkout', standalone: true, imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="checkout-wrapper">
        
        <!-- Card de Validation -->
        <div class="checkout-card fade-in">
            <div class="card-header">
                <h1>Finaliser la Commande</h1>
                <p>Plus qu'une étape avant de déguster.</p>
            </div>
            
            <div *ngIf="cart.cartItems().length > 0; else empty">
                
                <div class="order-summary">
                    <span class="label">Total à régler</span>
                    <span class="amount">{{ cart.subTotal() | number:'1.2-2' }} DT</span>
                </div>

                <form (ngSubmit)="submit()">
                    <div class="form-group">
                        <label>Nom complet</label>
                        <input type="text" [(ngModel)]="data.name" name="name" required class="input-modern" placeholder="Votre Nom">
                    </div>
                    <div class="form-group">
                        <label>Téléphone</label>
                        <input type="tel" [(ngModel)]="data.phone" name="phone" required class="input-modern" placeholder="22 333 444">
                    </div>
                    <div class="form-group">
                        <label>Adresse de livraison</label>
                        <textarea [(ngModel)]="data.address" name="addr" required class="input-modern" rows="3" placeholder="Rue, Ville, Code Postal..."></textarea>
                    </div>

                    <button type="submit" class="btn-primary w-100 btn-confirm">
                        Confirmer la commande
                    </button>
                </form>
            </div>
            
            <ng-template #empty>
                <div class="empty-state">
                    <p>Votre panier est vide.</p>
                </div>
            </ng-template>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .checkout-wrapper { display: flex; justify-content: center; padding-top: 40px; }
    
    .checkout-card {
        background: white;
        padding: 50px;
        border-radius: 20px;
        box-shadow: 0 15px 40px rgba(0,0,0,0.08);
        width: 100%;
        max-width: 600px;
        border-top: 5px solid var(--primary-color);
    }

    .card-header { text-align: center; margin-bottom: 40px; }
    .card-header h1 { font-size: 2.5rem; margin: 0; color: var(--primary-dark); border: none; }
    .card-header p { color: #888; font-size: 1.1rem; margin-top: 10px; }

    .order-summary {
        background: #faf8f5; /* Very light cream */
        border: 1px solid #e0d6ce;
        padding: 20px 30px;
        border-radius: 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
    }
    .order-summary .label { font-size: 1.1rem; color: var(--secondary-color); font-weight: 600; }
    .order-summary .amount { font-size: 1.8rem; color: var(--primary-color); font-weight: 800; font-family: 'Playfair Display', serif; }

    .form-group { margin-bottom: 25px; }
    .form-group label { display: block; font-weight: 700; margin-bottom: 8px; color: var(--primary-dark); font-size: 0.95rem; }
    
    .w-100 { width: 100%; }
    .btn-confirm { padding: 18px; font-size: 1.1rem; letter-spacing: 2px; margin-top: 10px; }
    
    .empty-state { text-align: center; padding: 40px; color: #999; font-size: 1.2rem; }

    .fade-in { animation: fadeIn 0.8s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class CheckoutComponent {
  cart = inject(CartService); router = inject(Router);
  data = { name: '', phone: '', address: '' };
  
  async submit() {
    if(!this.data.name || !this.data.phone) return;
    await this.cart.checkout(this.data);
    alert("Commande reçue !");
    this.router.navigate(['/']);
  }
}
