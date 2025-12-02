import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Nécessaire pour les inputs de filtre

// Imports Firebase
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, query, CollectionReference } from 'firebase/firestore';
import { environment } from '../../../environments/environment';


export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  shortDescription: string;
  category: string;
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="page-container">
      <h1>Notre Catalogue</h1>

      <div class="catalog-layout">
        
        <!-- SIDEBAR: UNIQUEMENT CATÉGORIES -->
        <aside class="filters-sidebar">
          <div class="filter-group">
            <h3>Catégories</h3>
            <ul class="category-list">
              <li 
                [class.active]="selectedCategory() === null" 
                (click)="setCategory(null)">
                Tous les produits
              </li>
              @for (cat of categories(); track cat) {
                <li 
                  [class.active]="selectedCategory() === cat" 
                  (click)="setCategory(cat)">
                  {{ cat }}
                </li>
              }
            </ul>
          </div>
        </aside>

        <!-- CONTENU PRINCIPAL -->
        <main class="products-main">
          
          <!-- BARRE DE FILTRES EN HAUT -->
          <div class="top-filters-bar">
            <!-- Recherche -->
            <div class="search-box">
              <input 
                type="text" 
                [(ngModel)]="searchTerm" 
                placeholder="Rechercher un café, une machine..."
                class="filter-input"
              >
            </div>

            <!-- Filtre Prix -->
            <div class="price-box">
              <label>Prix max: {{ maxPrice() }} DT</label>
              <input 
                type="range" 
                min="0" 
                max="1000" 
                step="10"
                [value]="maxPrice()"
                (input)="updateMaxPrice($event)"
                class="range-input"
              >
            </div>
          </div>

          <!-- GRILLE PRODUITS -->
          @if (loading()) {
            <p class="loading-message">Chargement des produits...</p>
          } @else if (error()) {
            <p class="error-message">Erreur : {{ error() }}</p>
          } @else if (filteredProducts().length === 0) {
            <div class="no-results">
              <p>Aucun produit ne correspond à votre recherche.</p>
              <button (click)="resetFilters()" class="btn-reset">Réinitialiser les filtres</button>
            </div>
          } @else {
            <div class="product-grid">
              @for (product of filteredProducts(); track product.id) {
                <div class="product-card">
                  <div class="image-wrapper">
                    <img [src]="product.imageUrl || 'https://placehold.co/400x300/6f4e37/ffffff?text=Image+Café'" [alt]="product.name" class="product-image">
                    <span class="category-tag">{{ product.category }}</span>
                  </div>
                  <div class="card-content">
                    <h3 class="product-name">{{ product.name }}</h3>
                    <p class="product-price">{{ product.price | currency:'DT':'symbol':'1.2-2':'fr' }}</p>
                    <a [routerLink]="['/product', product.id]" class="btn-detail">Voir Détail</a>
                  </div>
                </div>
              }
            </div>
          }
        </main>
      </div>
    </div>
  `,
  styles: [`
    /* Layout global */
    .catalog-layout {
      display: flex;
      flex-wrap: wrap;
      gap: 40px;
    }

    /* Sidebar Styles */
    .filters-sidebar {
      flex: 1;
      min-width: 250px;
      max-width: 280px;
      background: #fff;
      padding: 20px;
      border-radius: 10px;
      border: 1px solid #eee;
      height: fit-content;
    }

    .filter-group h3 { 
      font-size: 1.2rem; 
      color: var(--secondary-color); 
      margin-bottom: 15px; 
      border-bottom: 2px solid #eee; 
      padding-bottom: 5px; 
    }

    .category-list { list-style: none; padding: 0; margin: 0; }
    .category-list li {
      padding: 10px;
      cursor: pointer;
      border-radius: 5px;
      color: #555;
      transition: all 0.2s;
      margin-bottom: 5px;
      display: flex;
      align-items: center;
    }
    .category-list li:hover { background-color: #f9f9f9; color: var(--primary-color); padding-left: 15px; }
    .category-list li.active { background-color: var(--primary-color); color: white; font-weight: bold; padding-left: 15px; }

    /* Main Content Styles */
    .products-main { flex: 3; min-width: 300px; }

    /* Top Filters Bar */
    .top-filters-bar {
      display: flex;
      gap: 20px;
      background: #fdfdfd;
      padding: 20px;
      border-radius: 10px;
      border: 1px solid #eee;
      margin-bottom: 30px;
      align-items: center;
      box-shadow: 0 2px 5px rgba(0,0,0,0.03);
    }
    
    .search-box { flex: 2; }
    .price-box { flex: 1; display: flex; flex-direction: column; gap: 5px; }
    
    .filter-input {
      width: 100%;
      padding: 12px 15px;
      border: 1px solid #ddd;
      border-radius: 25px;
      font-family: inherit;
      outline: none;
      transition: border-color 0.3s;
    }
    .filter-input:focus { border-color: var(--accent-color); }

    .range-input { width: 100%; cursor: pointer; accent-color: var(--primary-color); }
    .price-box label { font-size: 0.9rem; font-weight: bold; color: var(--secondary-color); }

    /* Grid & Cards */
    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 25px;
    }

    .product-card {
      background: white;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 5px 15px rgba(0,0,0,0.05);
      transition: transform 0.3s;
      display: flex;
      flex-direction: column;
      border: 1px solid #f0f0f0;
    }
    .product-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.1); }

    .image-wrapper { position: relative; height: 220px; overflow: hidden; }
    .product-image { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
    .product-card:hover .product-image { transform: scale(1.05); }
    
    .category-tag {
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(255,255,255,0.9);
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: bold;
      color: var(--primary-color);
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }

    .card-content { padding: 20px; text-align: center; flex-grow: 1; display: flex; flex-direction: column; justify-content: space-between; }
    .product-name { font-size: 1.1rem; margin: 0 0 10px 0; color: #333; }
    .product-price { font-size: 1.4rem; font-weight: bold; color: var(--secondary-color); margin-bottom: 15px; }
    
    .btn-detail {
      display: inline-block;
      padding: 10px 25px;
      background: var(--accent-color);
      color: #000;
      text-decoration: none;
      border-radius: 25px;
      font-weight: bold;
      transition: background 0.3s;
    }
    .btn-detail:hover { background: #b58055; color: white; }

    .no-results { text-align: center; margin-top: 50px; color: #777; }
    .btn-reset { margin-top: 15px; padding: 10px 20px; border: 1px solid #ccc; background: transparent; cursor: pointer; border-radius: 5px; }

    @media (max-width: 768px) {
      .catalog-layout { flex-direction: column; }
      .filters-sidebar { max-width: 100%; }
      .top-filters-bar { flex-direction: column; align-items: stretch; }
    }
  `]
})
export class ProductsComponent implements OnInit {
  // --- SIGNALS D'ÉTAT ---
  products = signal<Product[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  // --- FILTRES ---
  searchTerm = signal('');
  selectedCategory = signal<string | null>(null);
  maxPrice = signal(1000); // Prix max par défaut

  // --- COMPUTED VALUES (Réactives) ---
  
  // 1. Liste dynamique des catégories disponibles
  categories = computed(() => {
    const allCats = this.products().map(p => p.category).filter(c => !!c);
    // On enlève les doublons et les chaînes vides
    return [...new Set(allCats)].sort();
  });

  // 2. Liste filtrée des produits
  filteredProducts = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const category = this.selectedCategory();
    const maxP = this.maxPrice();

    return this.products().filter(product => {
      // Filtre Recherche Texte (Nom)
      const matchesSearch = product.name.toLowerCase().includes(term);
      
      // Filtre Catégorie
      const matchesCategory = category ? product.category === category : true;
      
      // Filtre Prix
      const matchesPrice = product.price <= maxP;

      return matchesSearch && matchesCategory && matchesPrice;
    });
  });

  ngOnInit() {
    this.fetchProducts();
  }

  fetchProducts() {
    this.loading.set(true);
    const app = initializeApp(environment.firebaseConfig);
    const db = getFirestore(app);
    const productsRef = collection(db, 'products') as CollectionReference<Product>;
    const q = query(productsRef);

    onSnapshot(q, (snapshot) => {
      const list: Product[] = [];
      snapshot.forEach(doc => {
        const d = doc.data();
        list.push({
          id: doc.id,
          name: d.name,
          price: Number(d.price) || 0,
          imageUrl: d.imageUrl,
          shortDescription: d.shortDescription || '',
          category: d.category || 'Autres' // Catégorie par défaut
        });
      });
      this.products.set(list);
      this.loading.set(false);
    }, (err) => {
      console.error(err);
      this.error.set("Erreur de chargement.");
      this.loading.set(false);
    });
  }

  // Helpers pour le template
  setCategory(cat: string | null) {
    this.selectedCategory.set(cat);
  }

  updateMaxPrice(event: any) {
    this.maxPrice.set(Number(event.target.value));
  }

  resetFilters() {
    this.searchTerm.set('');
    this.selectedCategory.set(null);
    this.maxPrice.set(1000);
  }
}
