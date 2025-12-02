import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ProductsComponent } from './pages/products/products.component';
import { ProductDetailComponent } from './pages/products/product-detail.component';
import { CartComponent } from './pages/cart/cart.component';
import { ContactComponent } from './pages/contact/contact.component';

export const routes: Routes = [
  // Page d'accueil
  { path: '', component: HomeComponent },
  
  // Catalogue et détails des produits
  { path: 'products', component: ProductsComponent },
  { path: 'product/:id', component: ProductDetailComponent },
  
  // Panier et commande (sans paiement)
  { path: 'cart', component: CartComponent },
  
  // Page de contact
  { path: 'contact', component: ContactComponent },

  // Route 404/Wildcard
  { path: '**', redirectTo: '' }
];
