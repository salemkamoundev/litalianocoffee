import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, DocumentData } from "firebase/firestore";
import { environment } from '../../../environments/environment';
import { CartService } from '../../services/cart.service';

interface Product extends DocumentData { id: string; name: string; price: number; category: string; imageUrl: string; description: string; }
const app = initializeApp(environment.firebaseConfig);
const db = getFirestore(app);

@Component({
  selector: 'app-product-detail', standalone: true, imports: [CommonModule],
  template: `
    <div class="page-container" *ngIf="product() as p">
      <div class="detail-layout">
        <img [src]="p.imageUrl" class="img">
        <div class="info">
          <h1>{{ p.name }}</h1>
          <p class="price">{{ p.price | number:'1.2-2' }} DT</p>
          <p class="desc">{{ p.description }}</p>
          <button (click)="add(p)" class="btn-add">Ajouter au Panier</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .detail-layout { display: flex; gap: 40px; margin-top: 20px; }
    .img { width: 100%; max-width: 500px; border-radius: 10px; }
    .info { flex: 1; }
    .price { font-size: 2rem; color: var(--secondary-color); font-weight: bold; }
    .btn-add { background: var(--primary-color); color: white; padding: 15px 40px; border: none; border-radius: 5px; font-size: 1.2rem; margin-top: 20px; }
    @media (max-width: 768px) { .detail-layout { flex-direction: column; } }
  `]
})
export class ProductDetailComponent implements OnInit {
  product = signal<Product | null>(null);
  route = inject(ActivatedRoute);
  cart = inject(CartService);

  ngOnInit() {
    this.route.paramMap.subscribe(async p => {
      const id = p.get('id');
      if(id) {
        const snap = await getDoc(doc(db, "products", id));
        if(snap.exists()) this.product.set({ ...snap.data(), id: snap.id } as Product);
      }
    });
  }
  add(p: Product) { this.cart.addItem(p); }
}
