import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-checkout', standalone: true, imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container form-wrapper">
      <div class="auth-card" style="max-width:600px;">
        <h1>Validation</h1>
        <div *ngIf="cart.cartItems().length > 0">
            <p style="text-align:center; margin-bottom:20px;">Total: <strong>{{ cart.subTotal() | number:'1.2-2' }} DT</strong></p>
            <form (ngSubmit)="submit()">
                <div class="form-group"><label>Nom complet</label><input type="text" [(ngModel)]="data.name" name="name" required></div>
                <div class="form-group"><label>Téléphone</label><input type="tel" [(ngModel)]="data.phone" name="phone" required></div>
                <div class="form-group"><label>Adresse</label><textarea [(ngModel)]="data.address" name="addr" required style="width:100%; padding:10px; border:1px solid #ddd;"></textarea></div>
                <button type="submit" class="btn-submit">Confirmer la commande</button>
            </form>
        </div>
        <div *ngIf="cart.cartItems().length === 0" style="text-align:center">Panier vide.</div>
      </div>
    </div>
  `
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
