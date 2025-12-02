import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <h1>Détail du Produit (ID: {{ productId }})</h1>
      <div class="detail-content">
        <p>Ceci est la page de détail pour l'ID {{ productId }}.</p>
        <button class="add-to-cart">Ajouter au Panier</button>
      </div>
    </div>
  `,
  styles: [`
    .detail-content { padding: 30px; border: 1px solid #ddd; background: #fff; }
    .add-to-cart { background: var(--primary-color); color: white; padding: 12px 30px; border: none; margin-top: 20px; }
  `]
})
export class ProductDetailComponent {
  productId: string | null = null;
  constructor(private route: ActivatedRoute) {
    this.route.paramMap.subscribe(params => this.productId = params.get('id'));
  }
}
