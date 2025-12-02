import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, DocumentData } from "firebase/firestore";
import { environment } from '../../../environments/environment';
import { CartService } from '../../services/cart.service';

interface Product extends DocumentData { 
  id: string; name: string; price: number; category: string; 
  displayCategory?: string; // Catégorie nettoyée
  imageUrl: string; stock: number; 
}

const app = initializeApp(environment.firebaseConfig);
const db = getFirestore(app);

@Component({
  selector: 'app-products', standalone: true, imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="page-container">
      <h1>Nos Cafés & Machines</h1>
      <div class="main-layout">
        
        <!-- Sidebar Moderne -->
        <aside class="sidebar">
            <div class="search-box">
                <input type="text" [ngModel]="searchTerm()" (ngModelChange)="searchTerm.set($event)" placeholder="Rechercher..." class="input-modern">
            </div>
            
            <div class="filter-section">
                <h3>Catégories</h3>
                <div class="cat-list">
                    <button (click)="selectCategory('')" [class.active]="!selectedCategory()">Tout voir</button>
                    @for (cat of categories(); track cat) {
                        <button (click)="selectCategory(cat)" [class.active]="selectedCategory() === cat">{{ cat }}</button>
                    }
                </div>
            </div>
        </aside>

        <!-- Grille Produits -->
        <main class="grid">
            @for (p of filteredProducts(); track p.id) {
                <div class="card">
                    <div class="card-img-wrap" [routerLink]="['/product', p.id]">
                        <img [src]="p.imageUrl" class="card-img">
                        <span class="badge">{{ p.displayCategory }}</span>
                    </div>
                    <div class="card-body">
                        <h3>{{ p.name }}</h3>
                        <div class="price-row">
                            <span class="price">{{ p.price | number:'1.2-2' }} DT</span>
                            <button (click)="addToCart(p)" class="btn-add" title="Ajouter au panier">+</button>
                        </div>
                    </div>
                </div>
            }
        </main>
      </div>
    </div>
  `,
  styles: [`
    .main-layout { display: flex; gap: 40px; }
    .sidebar { width: 280px; flex-shrink: 0; padding-right: 20px; border-right: 1px solid #eee; }
    .search-box { margin-bottom: 30px; }
    .filter-section h3 { font-size: 1.2rem; color: var(--primary-color); margin-bottom: 15px; }
    .cat-list button {
        display: block; width: 100%; text-align: left; padding: 12px 15px; 
        background: white; border: 1px solid #eee; margin-bottom: 8px; border-radius: 8px;
        cursor: pointer; transition: 0.2s; font-weight: 500; color: #555;
    }
    .cat-list button:hover, .cat-list button.active {
        background: var(--primary-color); color: white; border-color: var(--primary-color); transform: translateX(5px);
    }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 30px; flex-grow: 1; }
    .card { background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(43,29,22,0.08); transition: all 0.3s ease; border: 1px solid #f0f0f0; }
    .card:hover { transform: translateY(-8px); box-shadow: 0 15px 40px rgba(43,29,22,0.15); }
    .card-img-wrap { position: relative; height: 220px; overflow: hidden; cursor: pointer; }
    .card-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
    .card:hover .card-img { transform: scale(1.1); }
    .badge {
        position: absolute; top: 15px; left: 15px;
        background: rgba(255,255,255,0.9); color: var(--primary-color);
        padding: 5px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: bold;
        text-transform: uppercase; letter-spacing: 1px;
    }
    .card-body { padding: 20px; }
    .card-body h3 { font-size: 1.1rem; margin: 0 0 15px 0; color: var(--text-color); font-weight: 700; height: 40px; overflow: hidden; }
    .price-row { display: flex; justify-content: space-between; align-items: center; }
    .price { font-size: 1.3rem; font-weight: 800; color: var(--primary-color); }
    .btn-add {
        width: 40px; height: 40px; border-radius: 50%; border: none;
        background: var(--accent-color); color: white; font-size: 1.5rem;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; transition: 0.2s;
    }
    .btn-add:hover { background: var(--primary-color); transform: scale(1.1); }
    @media (max-width: 900px) { .main-layout { flex-direction: column; } .sidebar { width: 100%; border-right: none; } }
  `]
})
export class ProductsComponent implements OnInit {
  products = signal<Product[]>([]);
  searchTerm = signal('');
  selectedCategory = signal<string | null>(null);
  cartService = inject(CartService);

  // CORRECTION 1: Typage strict du filter pour retourner string[]
  categories = computed(() => {
    const all = this.products()
        .map(p => p.displayCategory)
        .filter((c): c is string => !!c && c !== 'Autres');
    return Array.from(new Set(all)).sort();
  });

  filteredProducts = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const cat = this.selectedCategory();
    return this.products().filter(p => {
      const nameMatch = p.name.toLowerCase().includes(term);
      const catMatch = !cat || p.displayCategory === cat;
      return nameMatch && catMatch;
    });
  });

  ngOnInit() {
    onSnapshot(collection(db, "products"), (snap) => {
        const loaded = snap.docs.map(d => {
            const data = d.data() as Product;
            const cleanCat = this.cleanCategory(data.category);
            return { ...data, id: d.id, displayCategory: cleanCat };
        });
        this.products.set(loaded);
    });
  }

  private cleanCategory(raw: string): string {
    if (!raw) return 'Autres';
    const paths = raw.split(',');
    let bestPath = paths.find(p => !p.includes('Non classé') && p.includes('>')) || paths[0];
    if (bestPath.trim() === 'Non classé') return 'Autres';
    const parts = bestPath.split('>');
    let leaf = parts[parts.length - 1].trim();
    if (leaf === 'Non classé' && parts.length > 1) {
        leaf = parts[parts.length - 2].trim();
    }
    return leaf;
  }

  // CORRECTION 2: Signature permissive pour accepter undefined/null/string
  selectCategory(cat: string | null | undefined) { 
      this.selectedCategory.set(cat || null); 
  }
  
  addToCart(p: Product) { this.cartService.addItem(p); }
}
