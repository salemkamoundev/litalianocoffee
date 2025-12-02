import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-crud-products',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <h1>Gérer les Produits (CRUD)</h1>
      <p>Ici l'administrateur pourra ajouter, modifier et supprimer les produits de la collection Firestore/products.</p>
      <!-- Logique CRUD à venir ici -->
    </div>
  `
})
export class CrudProductsComponent {}
