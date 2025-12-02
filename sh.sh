#!/bin/bash

# Nom du dossier du projet
PROJECT_DIR="cafe-ecommerce-app"

echo "==================================================="
echo "🎨 FINALISATION ULTIME DU TEMPLATE (Mode RAW)"
echo "==================================================="

# Vérification si on est dans le dossier ou à l'extérieur
if [ -d "$PROJECT_DIR" ]; then
    cd $PROJECT_DIR
fi

# 0. Nettoyage et Structure
echo "🧹 Nettoyage..."
if [ -f "src/app/app.ts" ]; then rm src/app/app.ts; fi

# Création de toute l'arborescence
mkdir -p src/app/components/{header,footer,home}
mkdir -p src/app/services
mkdir -p src/app/pages/{products,cart,checkout,contact,login,signup,admin,admin/crud-products,admin/orders}

# 1. Styles globaux
echo "💅 Styles..."
cat > src/styles.scss <<'EOF'
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lato:wght@300;400;700&display=swap');

:root {
  --primary-color: #6f4e37;
  --secondary-color: #2c3e50;
  --accent-color: #d4a373;
  --text-color: #333;
  --light-bg: #f9f9f9;
  --error-color: #e74c3c;
  --success-color: #2ecc71;
}

body, html { margin: 0; padding: 0; font-family: 'Lato', sans-serif; color: var(--text-color); background-color: var(--light-bg); }
h1, h2, h3, h4, h5, h6 { font-family: 'Playfair Display', serif; margin-bottom: 1rem; }
button { cursor: pointer; transition: all 0.3s ease; }
input { outline: none; }

.page-container { padding: 100px 20px 50px; max-width: 1200px; margin: 0 auto; min-height: 80vh; }
.page-container h1 { font-size: 3rem; color: var(--primary-color); border-bottom: 2px solid var(--accent-color); padding-bottom: 10px; margin-bottom: 30px; }

/* Auth Styles */
.form-wrapper { display: flex; justify-content: center; padding-top: 50px; }
.auth-card { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); width: 100%; max-width: 400px; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; margin-bottom: 5px; font-weight: bold; color: var(--secondary-color); }
.form-group input, .form-group textarea { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box; }
.btn-submit { width: 100%; padding: 12px; background: var(--primary-color); color: white; border: none; border-radius: 5px; font-weight: bold; margin-top: 10px; }
.google-btn { width: 100%; padding: 12px; background: #fff; border: 1px solid #ccc; border-radius: 5px; margin-top: 15px; font-weight: bold; color: #555; display: flex; align-items: center; justify-content: center; gap: 10px;}
.error-alert { color: var(--error-color); text-align: center; margin-bottom: 15px; }
EOF

# 2. Services
echo "⚙️  Services..."

# 2.1 AuthService
cat > src/app/services/auth.service.ts <<'EOF'
import { Injectable, signal } from '@angular/core';
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, User } from "firebase/auth";
import { environment } from '../../environments/environment';

const app = initializeApp(environment.firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

@Injectable({ providedIn: 'root' })
export class AuthService {
  private ADMIN_EMAIL = 'litaliano@gmail.com';
  currentUser = signal<User | null>(null);
  isAuthenticated = signal(false);
  isAdmin = signal(false);

  constructor() {
    onAuthStateChanged(auth, (user) => {
      this.currentUser.set(user);
      this.isAuthenticated.set(!!user);
      this.isAdmin.set(user?.email === this.ADMIN_EMAIL);
    });
  }

  async signIn(email: string, pass: string) { return signInWithEmailAndPassword(auth, email, pass); }
  async signInWithGoogle() { return signInWithPopup(auth, googleProvider); }
  async signUp(email: string, pass: string) { return createUserWithEmailAndPassword(auth, email, pass); }
  async signOut() { return signOut(auth); }
}
EOF

# 2.2 CartService (Avec checkout)
cat > src/app/services/cart.service.ts <<'EOF'
import { Injectable, signal, computed } from '@angular/core';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { environment } from '../../environments/environment';

const app = initializeApp(environment.firebaseConfig);
const db = getFirestore(app);

export interface CartItem {
  id: string; name: string; price: number; quantity: number; imageUrl: string;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  cartItems = signal<CartItem[]>([]);
  
  subTotal = computed(() => this.cartItems().reduce((acc, item) => acc + (item.price * item.quantity), 0));
  itemCount = computed(() => this.cartItems().reduce((acc, item) => acc + item.quantity, 0));

  constructor() { this.loadCart(); }

  private loadCart() {
    if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('litaliano_cart');
        if (saved) { try { this.cartItems.set(JSON.parse(saved)); } catch (e) { this.cartItems.set([]); } }
    }
  }
  private save() { if (typeof localStorage !== 'undefined') localStorage.setItem('litaliano_cart', JSON.stringify(this.cartItems())); }

  addItem(product: any, quantity: number = 1) {
    this.cartItems.update(items => {
      const existing = items.find(i => i.id === product.id);
      if (existing) existing.quantity += quantity;
      else items.push({ id: product.id, name: product.name, price: Number(product.price), quantity, imageUrl: product.imageUrl });
      return [...items];
    });
    this.save();
  }

  removeItem(id: string) {
    this.cartItems.update(items => items.filter(i => i.id !== id));
    this.save();
  }

  updateQuantity(id: string, qty: number) {
    if (qty <= 0) return this.removeItem(id);
    this.cartItems.update(items => {
      const item = items.find(i => i.id === id);
      if (item) item.quantity = qty;
      return [...items];
    });
    this.save();
  }

  clearCart() { this.cartItems.set([]); this.save(); }
  
  // La méthode checkout est ici
  async checkout(details: any) {
    if (this.cartItems().length === 0) return;
    const order = { customer: details, items: this.cartItems(), total: this.subTotal(), createdAt: serverTimestamp(), status: 'En cours' };
    await addDoc(collection(db, 'orders'), order);
    this.clearCart();
  }
}
EOF

# 3. Header
echo "🎩 Header..."
cat > src/app/components/header/header.component.ts <<'EOF'
import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header [class.scrolled]="isScrolled">
      <div class="container">
        <div class="logo"><span class="brand">L'ITALIANO</span><span class="suffix">COFFEE</span></div>
        <nav>
          <ul>
            <li><a routerLink="/" fragment="home">Accueil</a></li>
            <li><a routerLink="/products">Produits</a></li>
            <li>
                <a routerLink="/cart" class="cart-link">
                    Panier @if (cart.itemCount() > 0) { <span class="cart-badge">{{ cart.itemCount() }}</span> }
                </a>
            </li>
            @if (auth.isAdmin()) { <li><a routerLink="/admin" class="btn-admin">ADMIN</a></li> }
            @if (auth.isAuthenticated()) {
                <li><button (click)="logout()" class="btn-logout">Déconnexion</button></li>
            } @else {
                <li><a routerLink="/login" class="btn-contact">Connexion</a></li>
            }
          </ul>
        </nav>
      </div>
    </header>
  `,
  styles: [`
    header { position: fixed; top: 0; width: 100%; z-index: 1000; padding: 20px 0; transition: 0.3s; background: rgba(0,0,0,0.9); }
    header.scrolled { padding: 10px 0; }
    .container { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 0 20px; }
    .logo { font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 700; color: white; }
    .suffix { color: #d4a373; }
    nav ul { list-style: none; display: flex; gap: 20px; margin: 0; padding: 0; align-items: center; }
    nav a, button { text-decoration: none; color: white; font-size: 0.9rem; text-transform: uppercase; background: none; border: none; cursor: pointer; }
    .btn-contact { border: 1px solid #d4a373; padding: 8px 15px; border-radius: 20px; }
    .btn-contact:hover { background: #d4a373; color: #000; }
    .btn-logout { color: #e74c3c; }
    .btn-admin { color: #f1c40f; font-weight: bold; }
    .cart-link { position: relative; padding-right: 20px; }
    .cart-badge { position: absolute; top: -8px; right: 0; background: #e74c3c; color: white; border-radius: 50%; padding: 2px 6px; font-size: 0.7rem; }
  `]
})
export class HeaderComponent {
  isScrolled = false;
  auth = inject(AuthService);
  cart = inject(CartService);

  @HostListener('window:scroll', []) onWindowScroll() { this.isScrolled = window.scrollY > 50; }
  logout() { this.auth.signOut(); }
}
EOF

# 4. Footer
cat > src/app/components/footer/footer.component.ts <<'EOF'
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-footer', standalone: true, imports: [CommonModule],
  template: `<footer><div class="container"><p>L'Italiano Coffee &copy; 2025.</p></div></footer>`,
  styles: [`footer { background: #1a1a1a; color: #fff; padding: 40px 0; text-align: center; }`]
})
export class FooterComponent {}
EOF

# 5. Home
cat > src/app/components/home/home.component.ts <<'EOF'
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-home', standalone: true, imports: [CommonModule, RouterLink],
  template: `
    <section class="hero">
      <div class="content">
        <h1>L'Italiano Coffee</h1><p>Le goût authentique.</p>
        <a routerLink="/products" class="cta-btn">Découvrir</a>
      </div>
    </section>
  `,
  styles: [`
    .hero { height: 90vh; background: url('https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=2000') center/cover; display: flex; align-items: center; justify-content: center; text-align: center; color: white; }
    .content h1 { font-size: 4rem; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); }
    .cta-btn { background: #d4a373; color: white; padding: 15px 40px; border-radius: 30px; text-decoration: none; font-weight: bold; display: inline-block; margin-top: 20px; }
  `]
})
export class HomeComponent {}
EOF

# 6. Products
echo "🛍️  Products..."
cat > src/app/pages/products/products.component.ts <<'EOF'
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
EOF

# 7. Product Detail
cat > src/app/pages/products/product-detail.component.ts <<'EOF'
import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, DocumentData } from "firebase/firestore";
import { environment } from '../../../environments/environment';
import { CartService } from '../../services/cart.service';

interface Product extends DocumentData { id: string; name: string; price: number; category: string; imageUrl: string; description: string; }
const app = initializeApp(environment.firebaseConfig);
const db = getFirestore(app);

@Component({
  selector: 'app-product-detail', standalone: true, imports: [CommonModule],
  template: `
    <div class="page-container" *ngIf="product() as p">
      <div class="detail-layout">
        <img [src]="p.imageUrl" class="img">
        <div class="info">
          <h1>{{ p.name }}</h1>
          <p class="price">{{ p.price | number:'1.2-2' }} DT</p>
          <p class="desc">{{ p.description }}</p>
          <button (click)="add(p)" class="btn-add">Ajouter au Panier</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .detail-layout { display: flex; gap: 40px; margin-top: 20px; }
    .img { width: 100%; max-width: 500px; border-radius: 10px; }
    .info { flex: 1; }
    .price { font-size: 2rem; color: var(--secondary-color); font-weight: bold; }
    .btn-add { background: var(--primary-color); color: white; padding: 15px 40px; border: none; border-radius: 5px; font-size: 1.2rem; margin-top: 20px; }
    @media (max-width: 768px) { .detail-layout { flex-direction: column; } }
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
        if(snap.exists()) this.product.set({ ...snap.data(), id: snap.id } as Product);
      }
    });
  }
  add(p: Product) { this.cart.addItem(p); }
}
EOF

# 8. Auth Components (CORRECTION: Utilisation de ` pour les templates en mode RAW)
echo "🔑 Auth..."

cat > src/app/pages/login/login.component.ts <<'EOF'
import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container form-wrapper">
      <div class="auth-card">
        <h1>Connexion</h1>
        <div class="form-group"><label>Email</label><input type="email" [(ngModel)]="email" name="email"></div>
        <div class="form-group"><label>Mot de passe</label><input type="password" [(ngModel)]="password" name="pass"></div>
        <p *ngIf="error()" class="error">{{ error() }}</p>
        <button (click)="login()" class="btn-submit">Se connecter</button>
        <button (click)="google()" class="google-btn">Google</button>
        <p style="margin-top:20px;text-align:center"><a routerLink="/signup">Créer un compte</a></p>
      </div>
    </div>
  `,
  styles: [`.auth-card { max-width:400px; margin:0 auto; background:white; padding:40px; border-radius:10px; box-shadow:0 10px 25px rgba(0,0,0,0.1); } .form-group input { width:100%; padding:10px; margin-top:5px; border:1px solid #ddd; } .btn-submit { width:100%; padding:12px; background:var(--primary-color); color:white; border:none; margin-top:10px; } .google-btn { width:100%; padding:10px; margin-top:10px; background:#eee; border:none; } .error { color:red; text-align:center; }`]
})
export class LoginComponent {
  email = ''; password = ''; error = signal('');
  auth = inject(AuthService);
  router = inject(Router);

  async login() {
    try { await this.auth.signIn(this.email, this.password); this.router.navigate(['/']); }
    catch(e:any) { this.error.set("Erreur de connexion"); }
  }
  async google() {
    try { await this.auth.signInWithGoogle(); this.router.navigate(['/']); }
    catch(e:any) { this.error.set("Erreur Google"); }
  }
}
EOF

cat > src/app/pages/signup/signup.component.ts <<'EOF'
import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container form-wrapper">
      <div class="auth-card">
        <h1>Inscription</h1>
        <div class="form-group"><label>Email</label><input type="email" [(ngModel)]="email" name="email"></div>
        <div class="form-group"><label>Mot de passe</label><input type="password" [(ngModel)]="password" name="pass"></div>
        <p *ngIf="error()" class="error">{{ error() }}</p>
        <button (click)="register()" class="btn-submit">S'inscrire</button>
        <p style="margin-top:20px;text-align:center"><a routerLink="/login">Déjà un compte ?</a></p>
      </div>
    </div>
  `,
  styles: [`.auth-card { max-width:400px; margin:0 auto; background:white; padding:40px; border-radius:10px; box-shadow:0 10px 25px rgba(0,0,0,0.1); } .form-group input { width:100%; padding:10px; margin-top:5px; border:1px solid #ddd; } .btn-submit { width:100%; padding:12px; background:var(--primary-color); color:white; border:none; margin-top:10px; } .error { color:red; text-align:center; }`]
})
export class SignupComponent {
  email = ''; password = ''; error = signal('');
  auth = inject(AuthService);
  router = inject(Router);

  async register() {
    try { await this.auth.signUp(this.email, this.password); this.router.navigate(['/']); }
    catch(e:any) { this.error.set("Erreur d'inscription"); }
  }
}
EOF

# 9. Cart
echo "🛒 Cart..."
cat > src/app/pages/cart/cart.component.ts <<'EOF'
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart', standalone: true, imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container">
      <h1>Panier</h1>
      <div *ngIf="cart.cartItems().length === 0" style="text-align:center; padding:50px;">
        <p>Votre panier est vide.</p>
        <a routerLink="/products" style="color:var(--primary-color); font-weight:bold;">Aller à la boutique</a>
      </div>
      <div *ngIf="cart.cartItems().length > 0">
        <div *ngFor="let item of cart.cartItems()" style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #eee; padding:15px 0;">
            <div style="display:flex; align-items:center;">
                <img [src]="item.imageUrl" style="width:60px; height:60px; border-radius:5px; margin-right:15px; object-fit:cover;">
                <div><h3>{{item.name}}</h3><p>{{item.price | number:'1.2-2'}} DT</p></div>
            </div>
            <div style="display:flex; align-items:center; gap:10px;">
                <input type="number" [ngModel]="item.quantity" (ngModelChange)="cart.updateQuantity(item.id, $event)" min="1" style="width:50px; text-align:center;">
                <button (click)="cart.removeItem(item.id)" style="color:red; background:none; border:none;">X</button>
            </div>
        </div>
        <div style="margin-top:30px; text-align:right;">
            <h2>Total: {{ cart.subTotal() | number:'1.2-2' }} DT</h2>
            <a routerLink="/checkout" style="background:var(--primary-color); color:white; padding:15px 40px; border-radius:5px; text-decoration:none; display:inline-block; margin-top:10px;">Commander</a>
        </div>
      </div>
    </div>
  `
})
export class CartComponent { cart = inject(CartService); }
EOF

# 9.5 Checkout (Page de commande)
echo "📝 Checkout..."
cat > src/app/pages/checkout/checkout.component.ts <<'EOF'
import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-checkout', standalone: true, imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container form-wrapper">
      <div class="auth-card" style="max-width:600px;">
        <h1>Validation</h1>
        <div *ngIf="cart.cartItems().length > 0">
            <p style="text-align:center; margin-bottom:20px;">Total: <strong>{{ cart.subTotal() | number:'1.2-2' }} DT</strong></p>
            <form (ngSubmit)="submit()">
                <div class="form-group"><label>Nom complet</label><input type="text" [(ngModel)]="data.name" name="name" required></div>
                <div class="form-group"><label>Téléphone</label><input type="tel" [(ngModel)]="data.phone" name="phone" required></div>
                <div class="form-group"><label>Adresse</label><textarea [(ngModel)]="data.address" name="addr" required style="width:100%; padding:10px; border:1px solid #ddd;"></textarea></div>
                <button type="submit" class="btn-submit">Confirmer la commande</button>
            </form>
        </div>
        <div *ngIf="cart.cartItems().length === 0" style="text-align:center">Panier vide.</div>
      </div>
    </div>
  `
})
export class CheckoutComponent {
  cart = inject(CartService); router = inject(Router);
  data = { name: '', phone: '', address: '' };
  
  async submit() {
    if(!this.data.name || !this.data.phone) return;
    await this.cart.checkout(this.data);
    alert("Commande reçue !");
    this.router.navigate(['/']);
  }
}
EOF

# 10. Contact (Inchangé)
cat > src/app/pages/contact/contact.component.ts <<'EOF'
import { Component } from '@angular/core';
@Component({ selector: 'app-contact', standalone: true, template: `<div class="page-container"><h1>Contact</h1><p>contact@litalianocaffe.tn</p></div>` }) export class ContactComponent {}
EOF

# 11. Admin (Simplifié)
echo "🛠️  Admin..."
cat > src/app/pages/admin/admin.component.ts <<'EOF'
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-admin', standalone: true, imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container">
      <h1>Admin Dashboard</h1>
      <div *ngIf="auth.isAdmin()" style="display:grid; grid-template-columns:1fr 1fr; gap:30px;">
        <div style="background:white; padding:30px; border-radius:10px; box-shadow:0 5px 15px rgba(0,0,0,0.1); cursor:pointer;" routerLink="/admin/products"><h2>📦 Produits</h2></div>
        <div style="background:white; padding:30px; border-radius:10px; box-shadow:0 5px 15px rgba(0,0,0,0.1); cursor:pointer;" routerLink="/admin/orders"><h2>📄 Commandes</h2></div>
      </div>
      <div *ngIf="!auth.isAdmin()" style="text-align:center;"><p>Accès réservé.</p><button (click)="router.navigate(['/'])">Retour</button></div>
    </div>
  `
})
export class AdminComponent { auth = inject(AuthService); router = inject(Router); }
EOF

cat > src/app/pages/admin/crud-products/crud-products.component.ts <<'EOF'
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
EOF

cat > src/app/pages/admin/orders/orders.component.ts <<'EOF'
import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, query, orderBy, doc, updateDoc, Timestamp } from "firebase/firestore";
import { environment } from '../../../../environments/environment';

interface Order {
  id: string;
  customer: { name: string; phone: string; address: string };
  items: any[];
  total: number;
  status: string;
  date: Timestamp;
}

const app = initializeApp(environment.firebaseConfig);
const db = getFirestore(app);

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, CurrencyPipe],
  template: `
    <div class="page-container">
      <h1>📦 Gestion des Commandes</h1>
      
      <div *ngIf="loading()" class="loading">Chargement des commandes...</div>
      
      <div *ngIf="!loading() && orders().length === 0" class="no-orders">
        Aucune commande trouvée.
      </div>

      <div class="orders-list" *ngIf="orders().length > 0">
        <div class="order-card" *ngFor="let order of orders()">
          <div class="order-header">
            <div>
                <h3>Commande #{{ order.id | slice:0:8 }}</h3>
                <span class="date">{{ order.date?.toDate() | date:'medium' }}</span>
            </div>
            <div class="status-group">
                <select [ngModel]="order.status" (ngModelChange)="updateStatus(order.id, $event)" [class]="'status-' + getStatusClass(order.status)">
                    <option value="En cours">En cours</option>
                    <option value="Livrée">Livrée</option>
                    <option value="Annulée">Annulée</option>
                </select>
            </div>
          </div>
          
          <div class="customer-info">
            <p><strong>Client:</strong> {{ order.customer.name }} | 📞 {{ order.customer.phone }}</p>
            <p><strong>Adresse:</strong> {{ order.customer.address }}</p>
          </div>

          <div class="order-items">
            <div *ngFor="let item of order.items" class="item-row">
                <span>{{ item.quantity }}x {{ item.name }}</span>
                <span>{{ (item.price * item.quantity) | number:'1.2-2' }} DT</span>
            </div>
          </div>

          <div class="order-total">
            Total: {{ order.total | number:'1.2-2' }} DT
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .order-card { background: white; border-radius: 10px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); border-left: 5px solid var(--accent-color); }
    .order-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 10px; }
    .order-header h3 { margin: 0; color: var(--primary-color); }
    .date { color: #888; font-size: 0.9rem; }
    .customer-info { background: #f9f9f9; padding: 10px; border-radius: 5px; margin-bottom: 15px; font-size: 0.95rem; }
    .customer-info p { margin: 5px 0; }
    .item-row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px dashed #eee; }
    .order-total { text-align: right; font-size: 1.2rem; font-weight: bold; margin-top: 15px; color: var(--secondary-color); }
    
    select { padding: 5px 10px; border-radius: 20px; border: 1px solid #ddd; font-weight: bold; cursor: pointer; }
    .status-warning { background: #fff3cd; color: #856404; } /* En cours */
    .status-success { background: #d4edda; color: #155724; } /* Livrée */
    .status-danger { background: #f8d7da; color: #721c24; } /* Annulée */
    
    .loading, .no-orders { text-align: center; padding: 40px; font-size: 1.2rem; color: #666; }
  `]
})
export class OrdersComponent implements OnInit {
  orders = signal<Order[]>([]);
  loading = signal(true);

  ngOnInit() {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    onSnapshot(q, (snapshot) => {
        this.orders.set(snapshot.docs.map(d => {
            const data = d.data();
            return { id: d.id, ...data, date: data['createdAt'] } as Order;
        }));
        this.loading.set(false);
    });
  }

  async updateStatus(id: string, newStatus: string) {
    await updateDoc(doc(db, "orders", id), { status: newStatus });
  }

  getStatusClass(status: string) {
    if (status === 'Livrée') return 'success';
    if (status === 'Annulée') return 'danger';
    return 'warning';
  }
}
EOF

# 12. Routes
echo "🔗 Routes..."
cat > src/app/app.routes.ts <<'EOF'
import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ProductsComponent } from './pages/products/products.component';
import { ProductDetailComponent } from './pages/products/product-detail.component';
import { CartComponent } from './pages/cart/cart.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { ContactComponent } from './pages/contact/contact.component';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { AdminComponent } from './pages/admin/admin.component';
import { CrudProductsComponent } from './pages/admin/crud-products/crud-products.component';
import { OrdersComponent } from './pages/admin/orders/orders.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'products', component: ProductsComponent },
  { path: 'product/:id', component: ProductDetailComponent },
  { path: 'cart', component: CartComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'admin/products', component: CrudProductsComponent },
  { path: 'admin/orders', component: OrdersComponent },
  { path: '**', redirectTo: '' }
];
EOF

# 13. App Component
cat > src/app/app.component.ts <<'EOF'
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
@Component({
  selector: 'app-root', standalone: true, imports: [RouterOutlet, HeaderComponent, FooterComponent],
  template: `<app-header></app-header><main style="padding-top:80px;min-height:80vh"><router-outlet></router-outlet></main><app-footer></app-footer>`
})
export class AppComponent { title = 'cafe-ecommerce-app'; }
EOF

echo "==================================================="
echo "✅ TERMINÉ !"
echo "   - Authentification corrigée."
echo "   - Checkout ajouté."
echo "   - CartService mis à jour avec Firestore."
echo "==================================================="