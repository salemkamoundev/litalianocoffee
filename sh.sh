#!/bin/bash

echo "==================================================="
echo "🔧 CORRECTIF : AFFICHAGE IMAGE PRODUIT (CRUD)"
echo "==================================================="

cat > src/app/pages/admin/crud-products/crud-products.component.ts <<'EOF'
import { Component, signal, computed, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { environment } from '../../../../environments/environment';
import { SupabaseService } from '../../../../services/supabase.service';

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
            <p class="subtitle">Gérez vos produits, stocks et prix.</p>
        </div>
        <button (click)="openForm()" class="btn-add"><span>+</span> Nouveau Produit</button>
      </div>

      <!-- Toolbar -->
      <div class="toolbar-stack">
        <div class="toolbar-row main-row">
            <div class="search-wrapper">
                <span class="search-icon">🔍</span>
                <input type="text" placeholder="Rechercher..." [ngModel]="searchTerm()" (ngModelChange)="searchTerm.set($event)">
            </div>
            <span class="badge">{{ filteredProducts().length }} Produits</span>
        </div>
      </div>
      
      <!-- Grille -->
      <div class="product-grid">
        @for (p of filteredProducts(); track p.id) {
            <div class="product-card">
                <div class="card-image" [style.background-image]="'url(' + (p.imageUrl || 'assets/slider1.png') + ')'"></div>
                <div class="card-details">
                    <h3>{{ p.name }}</h3>
                    <p class="category">{{ p.category }}</p>
                    <div class="card-footer">
                        <span class="price">{{ p.price }} DT</span>
                        <div class="actions">
                            <button (click)="edit(p)" class="btn-icon edit">✎</button>
                            <button (click)="delete(p.id)" class="btn-icon delete">🗑</button>
                        </div>
                    </div>
                </div>
            </div>
        }
      </div>

      <!-- Modal Formulaire -->
      <div class="modal-backdrop" *ngIf="showForm()" (click)="closeForm()"></div>
      <div class="slide-panel" [class.open]="showForm()">
        <div class="panel-header">
            <h2>{{ isEditing ? 'Modifier le produit' : 'Nouveau produit' }}</h2>
            <button (click)="closeForm()" class="btn-close">×</button>
        </div>
        
        <form (ngSubmit)="save()" class="panel-body">
            <!-- Message d'erreur Global -->
            <div *ngIf="uploadError()" class="alert-error">
                <strong>Erreur :</strong> {{ uploadError() }}
            </div>

            <div class="form-group">
                <label>Nom</label>
                <input [(ngModel)]="form.name" name="name" required class="input-modern">
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label>Prix</label>
                    <input type="number" [(ngModel)]="form.price" name="price" required class="input-modern">
                </div>
                <div class="form-group">
                    <label>Stock</label>
                    <input type="number" [(ngModel)]="form.stock" name="stock" required class="input-modern">
                </div>
            </div>

            <div class="form-group">
                <label>Catégorie</label>
                <input list="categoryList" [(ngModel)]="form.category" name="cat" class="input-modern">
                <datalist id="categoryList">
                    @for (cat of categories(); track cat) { <option [value]="cat"> }
                </datalist>
            </div>

            <!-- Gestion Image (DESIGN CORRIGÉ) -->
            <div class="form-group">
                <label class="label-outside">Image du produit</label>
                
                <div class="image-upload-box">
                    <!-- Zone Aperçu -->
                    <div class="preview-area">
                        <div *ngIf="form.imageUrl" class="img-container">
                            <img [src]="form.imageUrl" alt="Aperçu">
                            <button type="button" class="btn-remove-img" (click)="removeImage()" title="Supprimer l'image">×</button>
                        </div>
                        <div *ngIf="!form.imageUrl" class="placeholder">
                            <span class="icon">📷</span>
                            <p>Aucune image</p>
                        </div>
                    </div>

                    <!-- Bouton Upload -->
                    <div class="file-input-wrapper">
                        <input type="file" #fileInput (change)="onFileSelected($event)" accept="image/*" id="fileUp" class="hidden-input">
                        <label for="fileUp" class="btn-upload" [class.disabled]="isUploading()">
                            <span *ngIf="isUploading()" class="loader"></span>
                            {{ isUploading() ? 'Envoi...' : (form.imageUrl ? "Changer l'image" : "Choisir une image") }}
                        </label>
                    </div>
                </div>
            </div>

            <div class="panel-footer">
                <button type="button" (click)="closeForm()" class="btn-cancel">Annuler</button>
                <button type="submit" class="btn-save" [disabled]="isUploading()">Enregistrer</button>
            </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .page-container { max-width: 1400px; }
    .header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 20px; }
    .subtitle { color: #666; margin: 5px 0 0; }
    .toolbar-stack { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); margin-bottom: 30px; }
    .toolbar-row { display: flex; align-items: center; justify-content: space-between; gap: 15px; }
    .search-wrapper { flex: 1; display: flex; align-items: center; background: #f5f5f5; padding: 10px 15px; border-radius: 8px; }
    .search-wrapper input { border: none; background: transparent; margin-left: 10px; width: 100%; font-size: 0.95rem; }
    .badge { background: var(--secondary-color); color: white; padding: 5px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: bold; }
    .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 25px; }
    .product-card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); transition: transform 0.3s; border: 1px solid #f0f0f0; }
    .product-card:hover { transform: translateY(-5px); }
    .card-image { height: 180px; background-size: cover; background-position: center; }
    .card-details { padding: 20px; }
    .card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 15px; }
    .price { font-size: 1.2rem; font-weight: 800; color: var(--primary-color); }
    .actions { display: flex; gap: 8px; }
    .btn-icon { width: 32px; height: 32px; border-radius: 50%; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; }
    .edit { background: #e0f2f1; color: #009688; } .delete { background: #ffebee; color: #e53935; }
    .btn-add { background: var(--primary-color); color: white; border: none; padding: 12px 25px; border-radius: 30px; font-weight: bold; }

    /* Modal */
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 998; backdrop-filter: blur(2px); }
    .slide-panel { position: fixed; top: 0; right: -450px; width: 400px; height: 100vh; background: white; z-index: 999; box-shadow: -5px 0 30px rgba(0,0,0,0.1); transition: right 0.4s ease; display: flex; flex-direction: column; }
    .slide-panel.open { right: 0; }
    .panel-header { padding: 25px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
    .btn-close { background: none; border: none; font-size: 2rem; cursor: pointer; }
    .panel-body { padding: 30px; overflow-y: auto; flex-grow: 1; }
    .form-group { margin-bottom: 20px; }
    .form-row { display: flex; gap: 20px; } .form-row .form-group { flex: 1; }
    .input-modern { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem; background: #fafafa; }
    
    /* NOUVEAUX STYLES IMAGE UPLOAD */
    label { display: block; margin-bottom: 8px; font-weight: 600; color: #555; font-size: 0.9rem; }
    .label-outside { color: var(--secondary-color); }
    
    .image-upload-box { 
        border: 2px dashed #e0d6ce; padding: 15px; border-radius: 12px; 
        text-align: center; background: #fffbf8; 
        display: flex; flex-direction: column; align-items: center; gap: 15px;
    }
    
    .preview-area { 
        width: 100%; height: 200px; background: #fff; border-radius: 8px; 
        border: 1px solid #eee; overflow: hidden; display: flex; align-items: center; justify-content: center;
        position: relative;
    }
    
    .img-container { width: 100%; height: 100%; position: relative; }
    .img-container img { width: 100%; height: 100%; object-fit: contain; }
    
    .btn-remove-img {
        position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.6); color: white;
        border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer;
        display: flex; align-items: center; justify-content: center; font-size: 1.2rem;
        transition: background 0.2s;
    }
    .btn-remove-img:hover { background: rgba(255,0,0,0.8); }
    
    .placeholder { color: #bbb; display: flex; flex-direction: column; align-items: center; }
    .placeholder .icon { font-size: 2.5rem; margin-bottom: 5px; display: block; opacity: 0.5; }
    
    .hidden-input { display: none; }
    .btn-upload { 
        display: inline-flex; align-items: center; justify-content: center; gap: 8px;
        padding: 10px 25px; background: white; color: var(--primary-color); 
        border-radius: 50px; cursor: pointer; font-weight: bold; border: 2px solid var(--primary-color); 
        transition: all 0.2s; font-size: 0.9rem;
    }
    .btn-upload:hover { background: var(--primary-color); color: white; }
    .btn-upload.disabled { opacity: 0.7; cursor: wait; }
    
    .alert-error { color: #721c24; background-color: #f8d7da; border-color: #f5c6cb; padding: 15px; border-radius: 5px; margin-bottom: 20px; font-size: 0.9rem; }
    
    .panel-footer { padding: 25px; border-top: 1px solid #eee; display: flex; gap: 15px; justify-content: flex-end; }
    .btn-save { background: var(--primary-color); color: white; border: none; padding: 12px 30px; border-radius: 8px; font-weight: bold; }
    .btn-save:disabled { background: #ccc; cursor: not-allowed; }
    
    .loader { border: 2px solid #f3f3f3; border-top: 2px solid var(--primary-color); border-radius: 50%; width: 14px; height: 14px; animation: spin 1s linear infinite; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  `]
})
export class CrudProductsComponent implements OnInit {
  supabase = inject(SupabaseService);
  @ViewChild('fileInput') fileInput!: ElementRef;
  
  products = signal<any[]>([]);
  showForm = signal(false);
  isEditing = false;
  isUploading = signal(false);
  uploadError = signal('');
  searchTerm = signal('');

  form: any = { id: '', name: '', price: 0, stock: 0, category: '', imageUrl: '' };

  categories = computed(() => [...new Set(this.products().map(p => p.category).filter(Boolean))].sort());
  filteredProducts = computed(() => {
    const t = this.searchTerm().toLowerCase();
    return this.products().filter(p => p.name.toLowerCase().includes(t));
  });

  ngOnInit() {
    onSnapshot(collection(db, "products"), (snap) => {
        this.products.set(snap.docs.map(d => ({ ...d.data(), id: d.id })));
    });
  }

  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.isUploading.set(true);
    this.uploadError.set('');
    
    try {
        const url = await this.supabase.uploadImage(file);
        this.form.imageUrl = url; 
    } catch (error: any) {
        let msg = "Erreur inconnue.";
        if (error.message.includes("row-level security")) {
            msg = "Erreur de droits (RLS) sur Supabase. Activez l'upload public.";
        }
        this.uploadError.set(msg);
        console.error(error);
    } finally {
        this.isUploading.set(false);
    }
  }

  removeImage() {
      this.form.imageUrl = '';
      if(this.fileInput) this.fileInput.nativeElement.value = '';
  }

  openForm() { this.resetForm(); this.isEditing = false; this.showForm.set(true); }
  closeForm() { this.showForm.set(false); }
  resetForm() { 
      this.form = { id: '', name: '', price: 0, stock: 0, category: 'Grains', imageUrl: '' }; 
      if(this.fileInput && this.fileInput.nativeElement) this.fileInput.nativeElement.value = ''; 
      this.uploadError.set(''); 
  }
  edit(p: any) { this.form = { ...p }; this.isEditing = true; this.showForm.set(true); }

  async save() {
    if (this.isUploading()) return;
    try {
        if (!this.isEditing) { await addDoc(collection(db, "products"), this.form); } 
        else { await updateDoc(doc(db, "products", this.form.id), this.form); }
        this.closeForm();
    } catch (e) {
        console.error("Erreur Save:", e);
        this.uploadError.set("Erreur lors de la sauvegarde dans Firestore.");
    }
  }

  async delete(id: string) { if(confirm('Supprimer ce produit ?')) { await deleteDoc(doc(db, "products", id)); } }
}
EOF

echo "✅ Correctif appliqué : Affichage propre de l'upload image."