import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart', standalone: true, imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container">
      <h1>Panier</h1>
      <div *ngIf="cart.cartItems().length === 0" style="text-align:center; padding:50px;">
        <p>Votre panier est vide.</p>
        <a routerLink="/products" style="color:var(--primary-color); font-weight:bold;">Aller à la boutique</a>
      </div>
      <div *ngIf="cart.cartItems().length > 0">
        <div *ngFor="let item of cart.cartItems()" style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #eee; padding:15px 0;">
            <div style="display:flex; align-items:center;">
                <img [src]="item.imageUrl" style="width:60px; height:60px; border-radius:5px; margin-right:15px; object-fit:cover;">
                <div><h3>{{item.name}}</h3><p>{{item.price | number:'1.2-2'}} DT</p></div>
            </div>
            <div style="display:flex; align-items:center; gap:10px;">
                <input type="number" [ngModel]="item.quantity" (ngModelChange)="cart.updateQuantity(item.id, $event)" min="1" style="width:50px; text-align:center;">
                <button (click)="cart.removeItem(item.id)" style="color:red; background:none; border:none;">X</button>
            </div>
        </div>
        <div style="margin-top:30px; text-align:right;">
            <h2>Total: {{ cart.subTotal() | number:'1.2-2' }} DT</h2>
            <a routerLink="/checkout" style="background:var(--primary-color); color:white; padding:15px 40px; border-radius:5px; text-decoration:none; display:inline-block; margin-top:10px;">Commander</a>
        </div>
      </div>
    </div>
  `
})
export class CartComponent { cart = inject(CartService); }
