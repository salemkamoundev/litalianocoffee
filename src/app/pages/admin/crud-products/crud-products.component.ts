import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-crud-products', standalone: true, imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <h1>Gestion Produits</h1>
      <button (click)="isAdding.set(true)" style="background:#2ecc71; color:white; padding:10px 20px; border:none; border-radius:5px;">+ Nouveau</button>
      
      <div *ngIf="isAdding()" style="background:#fff; padding:20px; margin:20px 0; border:1px solid #ddd;">
        <form (ngSubmit)="save()">
            <input placeholder="Nom" [(ngModel)]="form.name" name="name" style="display:block; width:100%; margin-bottom:10px; padding:10px;">
            <input placeholder="Prix" type="number" [(ngModel)]="form.price" name="price" style="display:block; width:100%; margin-bottom:10px; padding:10px;">
            <button type="submit" style="background:var(--primary-color); color:white; padding:10px 20px; border:none;">Enregistrer</button>
            <button type="button" (click)="isAdding.set(false)" style="margin-left:10px;">Annuler</button>
        </form>
      </div>
      <p>Liste des produits (WIP)...</p>
    </div>
  `
})
export class CrudProductsComponent {
  isAdding = signal(false);
  form = { name: '', price: 0 };
  save() { console.log(this.form); this.isAdding.set(false); }
}
