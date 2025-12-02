import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { environment } from '../../../../environments/environment';

const app = initializeApp(environment.firebaseConfig);
const db = getFirestore(app);

@Component({
  selector: 'app-crud-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="header">
        <div>
            <h1>Gestion du Catalogue</h1>
            <p class="subtitle">Gérez vos produits, stocks et prix en un clin d'œil.</p>
        </div>
        <button (click)="openForm()" class="btn-add">
            <span>+</span> Ajouter un produit
        </button>
      </div>

      <!-- Barre d'outils (Recherche & Filtres Avancés) -->
      <div class="toolbar-stack">
        <!-- Ligne 1: Recherche globale -->
        <div class="toolbar-row main-row">
            <div class="search-wrapper">
                <span class="search-icon">🔍</span>
                <input 
                    type="text" 
                    placeholder="Rechercher par nom, SKU..." 
                    [ngModel]="searchTerm()"
                    (ngModelChange)="searchTerm.set($event)"
                >
            </div>
            <div class="stats">
                <span class="badge">{{ filteredProducts().length }} / {{ products().length }} Produits</span>
            </div>
        </div>

        <!-- Ligne 2: Filtres -->
        <div class="toolbar-row filters-row">
            <!-- Filtre Catégorie -->
            <div class="filter-group">
                <select [ngModel]="filterCategory()" (ngModelChange)="filterCategory.set($event)">
                    <option value="">Toutes les catégories</option>
                    @for (cat of categories(); track cat) {
                        <option [value]="cat">{{ cat }}</option>
                    }
                </select>
            </div>

            <!-- Filtre Stock -->
            <div class="filter-group">
                <select [ngModel]="filterStock()" (ngModelChange)="filterStock.set($event)">
                    <option value="">Tout état de stock</option>
                    <option value="in">En stock</option>
                    <option value="low">Stock faible (< 10)</option>
                    <option value="out">Rupture</option>
                </select>
            </div>

            <!-- Filtre Prix Min -->
            <div class="filter-group price-filter">
                <input type="number" placeholder="Min DT" [ngModel]="filterMinPrice()" (ngModelChange)="filterMinPrice.set($event)">
            </div>

            <!-- Filtre Prix Max -->
            <div class="filter-group price-filter">
                <input type="number" placeholder="Max DT" [ngModel]="filterMaxPrice()" (ngModelChange)="filterMaxPrice.set($event)">
            </div>

            <!-- Reset -->
            <button (click)="resetFilters()" class="btn-reset" title="Réinitialiser les filtres">↺</button>
        </div>
      </div>
      
      <!-- Grille de Produits -->
      <div class="product-grid">
        @for (p of filteredProducts(); track p.id) {
            <div class="product-card">
                <div class="card-image" [style.background-image]="'url(' + (p.imageUrl || 'https://placehold.co/300x200/eee/ccc?text=No+Image') + ')'">
                    <span class="stock-badge" [class.out]="p.stock === 0" [class.low]="p.stock > 0 && p.stock < 10">
                        {{ p.stock === 0 ? 'Rupture' : (p.stock < 10 ? 'Faible: ' + p.stock : 'Stock: ' + p.stock) }}
                    </span>
                </div>
                <div class="card-details">
                    <div class="card-header">
                        <h3>{{ p.name }}</h3>
                        <span class="category">{{ p.category }}</span>
                    </div>
                    <div class="card-footer">
                        <span class="price">{{ p.price }} DT</span>
                        <div class="actions">
                            <button (click)="edit(p)" class="btn-icon edit" title="Modifier">✎</button>
                            <button (click)="delete(p.id)" class="btn-icon delete" title="Supprimer">🗑</button>
                        </div>
                    </div>
                </div>
            </div>
        }
      </div>

      <!-- Modal Formulaire (Slide-over) -->
      <div class="modal-backdrop" *ngIf="showForm()" (click)="closeForm()"></div>
      <div class="slide-panel" [class.open]="showForm()">
        <div class="panel-header">
            <h2>{{ isEditing ? 'Modifier le produit' : 'Nouveau produit' }}</h2>
            <button (click)="closeForm()" class="btn-close">×</button>
        </div>
        
        <form (ngSubmit)="save()" class="panel-body">
            <div class="form-group">
                <label>Nom du produit</label>
                <input [(ngModel)]="form.name" name="name" placeholder="Ex: Café Arabica" required>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label>Prix (DT)</label>
                    <input type="number" [(ngModel)]="form.price" name="price" required>
                </div>
                <div class="form-group">
                    <label>Stock</label>
                    <input type="number" [(ngModel)]="form.stock" name="stock" required>
                </div>
            </div>

            <div class="form-group">
                <label>Catégorie</label>
                <input list="categoryList" [(ngModel)]="form.category" name="cat" placeholder="Sélectionner ou taper...">
                <datalist id="categoryList">
                    @for (cat of categories(); track cat) {
                        <option [value]="cat">
                    }
                </datalist>
            </div>

            <div class="form-group">
                <label>Image URL</label>
                <input [(ngModel)]="form.imageUrl" name="img" placeholder="https://...">
            </div>
            
            <div class="preview" *ngIf="form.imageUrl">
                <label>Aperçu</label>
                <img [src]="form.imageUrl" alt="Preview">
            </div>

            <div class="panel-footer">
                <button type="button" (click)="closeForm()" class="btn-cancel">Annuler</button>
                <button type="submit" class="btn-save">Enregistrer</button>
            </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    /* Layout */
    .page-container { max-width: 1400px; }
    .header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 20px; }
    .subtitle { color: #666; margin: 5px 0 0; }
    
    /* Toolbar Stack */
    .toolbar-stack { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); margin-bottom: 30px; display: flex; flex-direction: column; gap: 15px; }
    
    .toolbar-row { display: flex; align-items: center; justify-content: space-between; gap: 15px; flex-wrap: wrap; }
    
    .search-wrapper { flex: 1; display: flex; align-items: center; background: #f5f5f5; padding: 10px 15px; border-radius: 8px; transition: all 0.3s; min-width: 250px; }
    .search-wrapper:focus-within { background: #fff; box-shadow: 0 0 0 2px var(--accent-color); }
    .search-wrapper input { border: none; background: transparent; margin-left: 10px; width: 100%; font-size: 0.95rem; }
    
    .filters-row { padding-top: 15px; border-top: 1px solid #eee; justify-content: flex-start; }
    .filter-group select, .filter-group input { padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; background: #fff; font-size: 0.9rem; }
    .price-filter input { width: 100px; }
    
    .btn-reset { background: #f0f0f0; border: none; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; font-size: 1.2rem; display: flex; align-items: center; justify-content: center; transition: background 0.2s; }
    .btn-reset:hover { background: #e0e0e0; }

    .badge { background: var(--secondary-color); color: white; padding: 5px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: bold; }

    /* Grid */
    .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 25px; }
    
    /* Card */
    .product-card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); transition: transform 0.3s, box-shadow 0.3s; position: relative; border: 1px solid #f0f0f0; }
    .product-card:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
    
    .card-image { height: 180px; background-size: cover; background-position: center; position: relative; }
    .stock-badge { position: absolute; top: 10px; right: 10px; background: #2ecc71; color: white; padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: bold; box-shadow: 0 2px 5px rgba(0,0,0,0.2); }
    .stock-badge.low { background: #f1c40f; color: #333; }
    .stock-badge.out { background: #e74c3c; }

    .card-details { padding: 20px; }
    .card-header { margin-bottom: 15px; }
    .card-header h3 { margin: 0 0 5px; font-size: 1.1rem; color: var(--secondary-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .category { color: #999; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; }
    
    .card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: auto; }
    .price { font-size: 1.2rem; font-weight: 800; color: var(--primary-color); }
    
    .actions { display: flex; gap: 8px; opacity: 0.6; transition: opacity 0.3s; }
    .product-card:hover .actions { opacity: 1; }
    .btn-icon { width: 32px; height: 32px; border-radius: 50%; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
    .edit { background: #e0f2f1; color: #009688; }
    .edit:hover { background: #009688; color: white; }
    .delete { background: #ffebee; color: #e53935; }
    .delete:hover { background: #e53935; color: white; }

    /* Buttons */
    .btn-add { background: var(--primary-color); color: white; border: none; padding: 12px 25px; border-radius: 30px; font-weight: bold; display: flex; align-items: center; gap: 10px; box-shadow: 0 4px 10px rgba(111, 78, 55, 0.3); }
    .btn-add span { font-size: 1.2rem; line-height: 1; }
    .btn-add:hover { background: #5a3e2b; transform: translateY(-2px); }

    /* Modal / Slide Panel */
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 998; backdrop-filter: blur(2px); }
    .slide-panel { position: fixed; top: 0; right: -450px; width: 400px; height: 100vh; background: white; z-index: 999; box-shadow: -5px 0 30px rgba(0,0,0,0.1); transition: right 0.4s cubic-bezier(0.25, 0.8, 0.25, 1); display: flex; flex-direction: column; }
    .slide-panel.open { right: 0; }
    
    .panel-header { padding: 25px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
    .panel-header h2 { margin: 0; font-size: 1.5rem; color: var(--secondary-color); }
    .btn-close { background: none; border: none; font-size: 2rem; color: #999; cursor: pointer; line-height: 1; }
    
    .panel-body { padding: 30px; overflow-y: auto; flex-grow: 1; }
    .form-group { margin-bottom: 20px; }
    .form-row { display: flex; gap: 20px; }
    .form-row .form-group { flex: 1; }
    
    label { display: block; margin-bottom: 8px; font-weight: 600; color: #555; font-size: 0.9rem; }
    input, select { width: 100%; padding: 12px 15px; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem; transition: border-color 0.3s; background: #fafafa; }
    input:focus, select:focus { border-color: var(--accent-color); background: white; box-shadow: 0 0 0 3px rgba(212, 163, 115, 0.1); }
    
    .preview img { width: 100%; height: 150px; object-fit: cover; border-radius: 8px; margin-top: 5px; }

    .panel-footer { padding: 25px; border-top: 1px solid #eee; display: flex; gap: 15px; justify-content: flex-end; background: #fff; }
    .btn-cancel { background: #f5f5f5; color: #666; border: none; padding: 12px 25px; border-radius: 8px; font-weight: bold; }
    .btn-save { background: var(--primary-color); color: white; border: none; padding: 12px 30px; border-radius: 8px; font-weight: bold; }
  `]
})
export class CrudProductsComponent implements OnInit {
  products = signal<any[]>([]);

  // --- FILTERS STATE ---
  searchTerm = signal('');
  filterCategory = signal('');
  filterStock = signal(''); // 'in', 'low', 'out'
  filterMinPrice = signal<number | null>(null);
  filterMaxPrice = signal<number | null>(null);
  
  // UI State
  showForm = signal(false);
  isEditing = false;
  form = { id: '', name: '', price: 0, stock: 0, category: 'Grains', imageUrl: '' };

  // --- COMPUTED ---
  
  // Extract unique categories for filter dropdown
  categories = computed(() => [...new Set(this.products().map(p => p.category).filter(Boolean))].sort());

  // Filter Logic
  filteredProducts = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const cat = this.filterCategory();
    const stock = this.filterStock();
    const min = this.filterMinPrice();
    const max = this.filterMaxPrice();

    return this.products().filter(p => {
        // 1. Text Search
        const matchesTerm = p.name.toLowerCase().includes(term);
        
        // 2. Category
        const matchesCat = cat ? p.category === cat : true;
        
        // 3. Stock
        let matchesStock = true;
        if (stock === 'out') matchesStock = p.stock === 0;
        else if (stock === 'low') matchesStock = p.stock > 0 && p.stock < 10;
        else if (stock === 'in') matchesStock = p.stock >= 10;

        // 4. Price
        const matchesMin = min !== null ? p.price >= min : true;
        const matchesMax = max !== null ? p.price <= max : true;

        return matchesTerm && matchesCat && matchesStock && matchesMin && matchesMax;
    });
  });

  ngOnInit() {
    onSnapshot(collection(db, "products"), (snap) => {
        this.products.set(snap.docs.map(d => ({ ...d.data(), id: d.id })));
    });
  }

  // --- ACTIONS ---

  openForm() {
    this.resetForm();
    this.isEditing = false;
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
  }

  resetForm() {
    this.form = { id: '', name: '', price: 0, stock: 0, category: 'Grains', imageUrl: '' };
  }

  resetFilters() {
      this.searchTerm.set('');
      this.filterCategory.set('');
      this.filterStock.set('');
      this.filterMinPrice.set(null);
      this.filterMaxPrice.set(null);
  }

  edit(product: any) {
    this.form = { ...product };
    this.isEditing = true;
    this.showForm.set(true);
  }

  async save() {
    console.log('Produit sauvegardé', this.form);
    if (!this.isEditing) {
        await addDoc(collection(db, "products"), this.form);
    } else {
        await updateDoc(doc(db, "products", this.form.id), this.form);
    }
    this.closeForm();
  }

  async delete(id: string) {
    if(confirm('Supprimer ce produit ?')) {
        await deleteDoc(doc(db, "products", id));
    }
  }
}
