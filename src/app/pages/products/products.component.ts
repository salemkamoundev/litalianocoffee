import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, DocumentData } from "firebase/firestore";
import { environment } from '../../../environments/environment';
import { CartService } from '../../services/cart.service';

interface Product extends DocumentData { id: string; name: string; price: number; category: string; imageUrl: string; stock: number; }
const app = initializeApp(environment.firebaseConfig);
const db = getFirestore(app);

@Component({
  selector: 'app-products', standalone: true, imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="page-container">
      <h1>Catalogue</h1>
      <div class="main-layout">
        <aside class="sidebar">
            <div class="filters">
                <input type="text" [ngModel]="searchTerm()" (ngModelChange)="searchTerm.set($event)" placeholder="Rechercher..." class="search-input">
                <div class="categories">
                    <button (click)="selectCategory('')" [class.active]="!selectedCategory()">Tous</button>
                    @for (cat of categories(); track cat) {
                        <button (click)="selectCategory(cat)" [class.active]="selectedCategory() === cat">{{ cat }}</button>
                    }
                </div>
            </div>
        </aside>
        <main class="grid">
            @for (p of filteredProducts(); track p.id) {
                <div class="card">
                    <div class="img" [style.background-image]="'url(' + p.imageUrl + ')'" [routerLink]="['/product', p.id]"></div>
                    <div class="info">
                        <h3>{{ p.name }}</h3>
                        <p class="price">{{ p.price | number:'1.2-2' }} DT</p>
                        <button (click)="addToCart(p)" class="btn-add">Ajouter</button>
                    </div>
                </div>
            }
        </main>
      </div>
    </div>
  `,
  styles: [`
    .main-layout { display: flex; gap: 30px; }
    .sidebar { width: 250px; flex-shrink: 0; }
    .search-input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; margin-bottom: 20px; }
    .categories button { display: block; width: 100%; text-align: left; padding: 10px; background: none; border: none; cursor: pointer; border-bottom: 1px solid #eee; }
    .categories button.active { font-weight: bold; color: var(--primary-color); }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; flex-grow: 1; }
    .card { background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 5px 15px rgba(0,0,0,0.05); }
    .img { height: 200px; background-size: cover; cursor: pointer; }
    .info { padding: 15px; text-align: center; }
    .price { font-size: 1.2rem; font-weight: bold; color: var(--secondary-color); }
    .btn-add { background: var(--accent-color); color: black; padding: 10px; border: none; border-radius: 5px; width: 100%; margin-top: 10px; font-weight: bold; }
    @media (max-width: 800px) { .main-layout { flex-direction: column; } .sidebar { width: 100%; } }
  `]
})
export class ProductsComponent implements OnInit {
  products = signal<Product[]>([]);
  searchTerm = signal('');
  selectedCategory = signal<string | null>(null);
  cartService = inject(CartService);

  categories = computed(() => Array.from(new Set(this.products().map(p => p.category))).sort());
  filteredProducts = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const cat = this.selectedCategory();
    return this.products().filter(p => p.name.toLowerCase().includes(term) && (!cat || p.category === cat));
  });

  ngOnInit() {
    onSnapshot(collection(db, "products"), (snap) => {
        this.products.set(snap.docs.map(d => ({ ...d.data(), id: d.id } as Product)));
    });
  }
  selectCategory(cat: string) { this.selectedCategory.set(cat || null); }
  addToCart(p: Product) { this.cartService.addItem(p); }
}
