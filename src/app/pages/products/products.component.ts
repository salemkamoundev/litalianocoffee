import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container">
      <h1>Notre Sélection de Cafés et Machines</h1>
      <p>Ici, vous trouverez tout notre catalogue (Café en grains, Capsules, Machines). Les produits seront chargés depuis Firestore/Supabase.</p>
      
      <div class="product-list-placeholder">
        <!-- Remplacer par la logique d'affichage des produits -->
        <div class="placeholder-item">
            <h3>Produit 1 (Grains)</h3>
            <p>Prix: 19.99 DT</p>
            <a [routerLink]="['/product', 1]">Voir le détail</a>
        </div>
        <div class="placeholder-item">
            <h3>Produit 2 (Capsules)</h3>
            <p>Prix: 4.50 DT</p>
            <a [routerLink]="['/product', 2]">Voir le détail</a>
        </div>
        <div class="placeholder-item">
            <h3>Produit 3 (Machine)</h3>
            <p>Prix: 499.00 DT</p>
            <a [routerLink]="['/product', 3]">Voir le détail</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-list-placeholder {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 30px;
        margin-top: 40px;
    }
    .placeholder-item {
        border: 1px solid #ccc;
        padding: 20px;
        border-radius: 8px;
        text-align: center;
    }
    .placeholder-item a {
        color: var(--accent-color);
        font-weight: bold;
    }
  `]
})
export class ProductsComponent {}
