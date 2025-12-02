import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, DocumentData } from "firebase/firestore";
import { environment } from '../../../environments/environment';
import { CartService } from '../../services/cart.service';

interface Product extends DocumentData { 
    id: string; name: string; price: number; category: string; displayCategory?: string;
    imageUrl: string; description: string; shortDescription?: string; stock: number; 
}
const app = initializeApp(environment.firebaseConfig);
const db = getFirestore(app);

@Component({
  selector: 'app-product-detail', standalone: true, imports: [CommonModule],
  template: `
    <div class="page-container" *ngIf="product() as p">
      <div class="detail-layout">
        <div class="img-col">
            <img [src]="p.imageUrl" class="img">
        </div>
        <div class="info-col">
          <span class="cat-badge">{{ p.displayCategory }}</span>
          <h1>{{ p.name }}</h1>
          <p class="price">{{ p.price | number:'1.2-2' }} DT</p>
          
          <div class="desc-box">
            <p [innerHTML]="p.description || p.shortDescription"></p>
          </div>
          
          <div class="stock-info">
             <span [class.in-stock]="p.stock > 0" [class.out-stock]="p.stock === 0">
                {{ p.stock > 0 ? 'En stock' : 'Rupture de stock' }}
             </span>
          </div>

          <button (click)="add(p)" class="btn-primary btn-lg" [disabled]="p.stock === 0">
            {{ p.stock > 0 ? 'Ajouter au Panier' : 'Indisponible' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .detail-layout { display: flex; gap: 60px; padding-top: 40px; }
    .img-col { flex: 1; }
    .img { width: 100%; border-radius: 20px; box-shadow: 0 20px 50px rgba(0,0,0,0.1); }
    .info-col { flex: 1.2; padding-top: 20px; }
    .cat-badge { color: var(--accent-color); font-weight: bold; text-transform: uppercase; letter-spacing: 1px; font-size: 0.9rem; }
    h1 { font-size: 3rem; margin: 10px 0 20px; line-height: 1.1; }
    .price { font-size: 2.5rem; color: var(--primary-color); font-weight: 800; margin-bottom: 30px; }
    .desc-box { background: #fff; padding: 30px; border-radius: 15px; margin-bottom: 30px; border: 1px solid #eee; line-height: 1.6; color: #555; }
    .stock-info { margin-bottom: 20px; font-weight: bold; }
    .in-stock { color: var(--success-color); }
    .out-stock { color: var(--error-color); }
    .btn-lg { font-size: 1.2rem; padding: 18px 40px; width: 100%; max-width: 300px; }
    .btn-lg:disabled { background: #ccc; cursor: not-allowed; box-shadow: none; transform: none; }
    @media (max-width: 900px) { .detail-layout { flex-direction: column; } }
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
        if(snap.exists()) {
            const data = snap.data() as Product;
            const cleanCat = this.cleanCategory(data.category);
            this.product.set({ ...data, id: snap.id, displayCategory: cleanCat });
        }
      }
    });
  }

  private cleanCategory(raw: string): string {
    if (!raw) return 'Autres';
    const paths = raw.split(',');
    let bestPath = paths.find(p => !p.includes('Non classé') && p.includes('>')) || paths[0];
    if (bestPath.trim() === 'Non classé') return 'Autres';
    const parts = bestPath.split('>');
    let leaf = parts[parts.length - 1].trim();
    if (leaf === 'Non classé' && parts.length > 1) leaf = parts[parts.length - 2].trim();
    return leaf;
  }

  add(p: Product) { this.cart.addItem(p); }
}
