import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, DocumentData } from "firebase/firestore";
import { environment } from '../../../environments/environment';
import { CartService } from '../../services/cart.service';
interface Product extends DocumentData { id: string; name: string; price: number; category: string; imageUrl: string; stock: number; displayCategory?: string; }
const app = initializeApp(environment.firebaseConfig);
const db = getFirestore(app);
@Component({
  selector: 'app-products', standalone: true, imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="page-container">
      <h1>Nos Produits</h1>
      <div class="main-layout">
        <aside class="sidebar">
            <input [(ngModel)]="searchTerm" placeholder="Rechercher..." class="input-modern" style="margin-bottom:20px">
            <div class="categories">
                <button (click)="selectCategory('')" [class.active]="!selectedCategory()">Tout voir</button>
                <button *ngFor="let c of categories()" (click)="selectCategory(c)" [class.active]="selectedCategory()===c">{{c}}</button>
            </div>
        </aside>
        <main class="grid">
            <div *ngFor="let p of filteredProducts()" class="card">
                <div class="card-img" [style.background-image]="'url('+p.imageUrl+')'" [routerLink]="['/product', p.id]"><span class="badge">{{p.displayCategory}}</span></div>
                <div class="card-body">
                    <h3>{{p.name}}</h3>
                    <div style="display:flex;justify-content:space-between;align-items:center">
                        <span style="font-weight:bold;font-size:1.2rem">{{p.price}} DT</span>
                        <button (click)="addToCart(p)" class="btn-primary" style="padding:5px 15px">+</button>
                    </div>
                </div>
            </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .main-layout { display: flex; gap: 30px; } .sidebar { width: 250px; flex-shrink: 0; }
    .categories button { display: block; width: 100%; text-align: left; padding: 10px; background: white; border: 1px solid #eee; margin-bottom: 5px; border-radius: 5px; cursor: pointer; }
    .categories button.active { background: var(--primary-color); color: white; border-color: var(--primary-color); }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; flex-grow: 1; }
    .card { background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 5px 15px rgba(0,0,0,0.05); }
    .card-img { height: 200px; background-size: cover; position: relative; cursor: pointer; }
    .badge { position: absolute; top: 10px; left: 10px; background: rgba(255,255,255,0.9); color: var(--primary-color); padding: 5px 10px; border-radius: 15px; font-size: 0.8rem; font-weight: bold; }
    .card-body { padding: 15px; } .card-body h3 { margin: 0 0 10px 0; font-size: 1.1rem; }
    @media(max-width:800px){ .main-layout{flex-direction:column} .sidebar{width:100%} }
  `]
})
export class ProductsComponent implements OnInit {
  products = signal<Product[]>([]); searchTerm = signal(''); selectedCategory = signal<string|null>(null); cartService = inject(CartService);
  categories = computed(() => [...new Set(this.products().map(p => p.displayCategory).filter((c): c is string => !!c))].sort());
  filteredProducts = computed(() => {
    const t = this.searchTerm().toLowerCase(); const c = this.selectedCategory();
    return this.products().filter(p => p.name.toLowerCase().includes(t) && (!c || p.displayCategory === c));
  });
  ngOnInit() { onSnapshot(collection(db,"products"), s => this.products.set(s.docs.map(d => { const dt=d.data() as Product; return {...dt, id:d.id, displayCategory: this.clean(dt.category)}; }))); }
  clean(raw:string){ if(!raw)return 'Autres'; const p=raw.split(','); let b=p.find(x=>!x.includes('Non classé')&&x.includes('>'))||p[0]; if(b.trim()==='Non classé')return 'Autres'; const pts=b.split('>'); let l=pts[pts.length-1].trim(); if(l==='Non classé'&&pts.length>1)l=pts[pts.length-2].trim(); return l; }
  selectCategory(c:string|null|undefined){ this.selectedCategory.set(c||null); }
  addToCart(p:Product){ this.cartService.addItem(p); }
}
