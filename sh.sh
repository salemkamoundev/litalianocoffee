#!/bin/bash

# Nom du dossier du projet
PROJECT_DIR="cafe-ecommerce-app"

echo "==================================================="
echo "🎨 FINALISATION ULTIME DU TEMPLATE (Correction Typage)"
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
  --primary-color: #6f4e37; /* Brun Café */
  --secondary-color: #2c3e50; /* Gris Sombre */
  --accent-color: #d4a373; /* Doré Latte */
  --text-color: #333;
  --light-bg: #f9f9f9;
  --error-color: #e74c3c;
  --success-color: #2ecc71;
}

body, html { margin: 0; padding: 0; font-family: 'Lato', sans-serif; color: var(--text-color); background-color: var(--light-bg); overflow-x: hidden; }
h1, h2, h3, h4, h5, h6 { font-family: 'Playfair Display', serif; margin-bottom: 1rem; }
button { cursor: pointer; transition: all 0.3s ease; }
input { outline: none; }

.page-container { padding: 100px 20px 50px; max-width: 1400px; margin: 0 auto; min-height: 80vh; }
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

/* Modern Input Style */
.input-modern {
    width: 100%; padding: 15px; border: 1px solid #e0d6ce; background: #fff; border-radius: 8px; font-size: 1rem; transition: border 0.3s, box-shadow 0.3s;
}
.input-modern:focus { border-color: var(--accent-color); box-shadow: 0 0 0 3px rgba(212, 163, 115, 0.2); }

.btn-primary {
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    color: white; padding: 15px 30px; border: none; border-radius: 50px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; font-size: 1rem; box-shadow: 0 4px 15px rgba(111, 78, 55, 0.3); cursor: pointer; transition: all 0.3s ease;
}
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(111, 78, 55, 0.4); }
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

# 2.2 CartService
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
import { Component, HostListener, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header [class.scrolled]="isScrolled()">
      <div class="parallax-container">
          <div class="parallax-layer layer-back" [style.transform]="'translateY(' + scrollY() * 0.2 + 'px)'"></div>
          <div class="parallax-layer layer-mid" [style.transform]="'translateY(' + scrollY() * 0.4 + 'px)'"></div>
          <div class="parallax-layer layer-front" [style.transform]="'translateY(' + scrollY() * 0.6 + 'px)'"></div>
      </div>

      <div class="container header-content" [style.transform]="'translateY(' + scrollY() * -0.1 + 'px)'">
        <div class="logo" routerLink="/">
            <span class="icon">☕</span>
            <div class="text"><span class="brand">L'ITALIANO</span><span class="suffix">COFFEE</span></div>
        </div>
        <nav>
          <ul class="nav-links">
            <li><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Accueil</a></li>
            <li><a routerLink="/products" routerLinkActive="active">Nos Cafés</a></li>
            <li><a routerLink="/contact" routerLinkActive="active">Contact</a></li>
          </ul>
        </nav>
        <div class="actions">
            <a routerLink="/cart" class="cart-btn" [class.has-items]="cart.itemCount() > 0">
                <span class="cart-icon">🛒</span>
                <span class="cart-count" *ngIf="cart.itemCount() > 0">{{ cart.itemCount() }}</span>
            </a>
            <div class="auth-buttons">
                @if (auth.isAdmin()) { <a routerLink="/admin" class="admin-link">Dashboard</a> }
                @if (auth.isAuthenticated()) { <button (click)="logout()" class="logout-btn">Sortir</button> } 
                @else { <a routerLink="/login" class="login-link">Login</a> }
            </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    header { position: fixed; top: 0; left: 0; width: 100%; z-index: 1000; height: 140px; transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1); overflow: hidden; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .parallax-container { position: absolute; inset: 0; z-index: 1; pointer-events: none; }
    .parallax-layer { position: absolute; inset: -10% 0 -10% 0; background-size: cover; background-position: center top; will-change: transform; transition: opacity 0.4s; }
    .layer-back { background-image: url('https://www.transparenttextures.com/patterns/mocha-grunge.png'); opacity: 0.3; }
    .layer-mid { background-image: url('https://png.pngtree.com/png-clipart/20230427/original/pngtree-coffee-beans-falling-png-image_9112671.png'); opacity: 0.3; filter: blur(1px); }
    .layer-front { background-image: url('https://png.pngtree.com/png-clipart/20220131/original/pngtree-coffee-beans-png-image_7255859.png'); opacity: 0.5; }
    .header-content { position: relative; z-index: 10; height: 100%; display: flex; justify-content: space-between; align-items: flex-start; padding: 20px 30px; will-change: transform; }
    header.scrolled { height: 70px; background: rgba(43, 29, 22, 0.98); backdrop-filter: blur(15px); box-shadow: 0 4px 20px rgba(0,0,0,0.4); }
    header.scrolled .parallax-layer { opacity: 0; }
    header.scrolled .header-content { align-items: center; padding: 0 30px; }
    .logo { display: flex; align-items: center; gap: 10px; cursor: pointer; color: white; }
    .logo .icon { font-size: 2rem; transition: 0.3s; }
    header.scrolled .logo .icon { font-size: 1.5rem; }
    .brand { font-family: 'Playfair Display', serif; font-weight: 700; font-size: 1.2rem; letter-spacing: 2px; }
    .suffix { font-size: 0.7rem; color: var(--accent-gold); letter-spacing: 3px; display: block; }
    .nav-links { display: flex; gap: 40px; }
    .nav-links a { color: rgba(255,255,255,0.8); font-weight: 500; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; position: relative; }
    .nav-links a:hover, .nav-links a.active { color: var(--accent-gold); }
    .actions { display: flex; align-items: center; gap: 20px; }
    .cart-btn { position: relative; color: white; font-size: 1.2rem; }
    .cart-btn:hover { color: var(--accent-gold); }
    .cart-count { position: absolute; top: -8px; right: -8px; background: var(--accent-gold); color: #2b1d16; font-size: 0.7rem; font-weight: bold; padding: 2px 5px; border-radius: 50%; }
    .login-link { color: white; font-weight: bold; border: 1px solid rgba(255,255,255,0.3); padding: 6px 15px; border-radius: 30px; font-size: 0.8rem; }
    .login-link:hover { background: var(--accent-gold); color: #2b1d16; border-color: var(--accent-gold); }
    .logout-btn { background: none; border: none; color: #ccc; cursor: pointer; }
    .logout-btn:hover { color: #e74c3c; }
    .admin-link { color: #f1c40f; font-weight: bold; font-size: 0.8rem; text-transform: uppercase; }
    @media (max-width: 768px) { .nav-links { display: none; } header { height: 100px; } }
  `]
})
export class HeaderComponent {
  scrollY = signal(0);
  isScrolled = computed(() => this.scrollY() > 20);
  auth = inject(AuthService);
  cart = inject(CartService);
  
  @HostListener('window:scroll', []) onScroll() { this.scrollY.set(window.scrollY); }
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
    <!-- Hero Section -->
    <section class="hero">
      <div class="overlay"></div>
      <div class="hero-content">
        <h1 class="fade-in">L'Art du Café Italien</h1>
        <p class="fade-in-delay">Une expérience sensorielle unique, de la fève à la tasse.</p>
        <a routerLink="/products" class="cta-btn fade-in-delay-2">Découvrir la Collection</a>
      </div>
    </section>

    <!-- Univers Section -->
    <section class="univers">
      <div class="container">
        <h2 class="section-title">Nos Univers</h2>
        <div class="grid">
          <div class="category-card" routerLink="/products">
            <div class="card-bg" style="background-image: url('https://images.unsplash.com/photo-1611854779393-1b2ae563f974?q=80&w=800');"></div>
            <div class="card-content"><h3>Café en Grains</h3><p>L'arôme pur et intense.</p><span class="explore-link">Explorer →</span></div>
          </div>
          <div class="category-card" routerLink="/products">
            <div class="card-bg" style="background-image: url('https://images.unsplash.com/photo-1621255535941-83c3eb6f07d2?q=80&w=800');"></div>
            <div class="card-content"><h3>Capsules</h3><p>Compatibilité et goût exceptionnel.</p><span class="explore-link">Explorer →</span></div>
          </div>
          <div class="category-card" routerLink="/products">
            <div class="card-bg" style="background-image: url('https://images.unsplash.com/photo-1517080315877-62f90dc68725?q=80&w=800');"></div>
            <div class="card-content"><h3>Machines Pro</h3><p>Technologie et design.</p><span class="explore-link">Explorer →</span></div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .hero { height: 100vh; background: url('https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=2560') center/cover fixed; display: flex; align-items: center; justify-content: center; text-align: center; position: relative; }
    .overlay { position: absolute; inset: 0; background: linear-gradient(45deg, rgba(0,0,0,0.7), rgba(40,20,10,0.5)); }
    .hero-content { position: relative; z-index: 1; padding: 20px; color: white; }
    h1 { font-size: 4.5rem; margin-bottom: 20px; text-shadow: 0 4px 20px rgba(0,0,0,0.5); }
    .cta-btn { background-color: #d4a373; color: white; padding: 18px 50px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 1.1rem; text-transform: uppercase; transition: 0.3s; }
    .cta-btn:hover { background-color: #fff; color: #6f4e37; transform: translateY(-5px); }
    .fade-in { animation: fadeInUp 1s ease-out forwards; opacity: 0; transform: translateY(30px); }
    .fade-in-delay { animation: fadeInUp 1s ease-out 0.3s forwards; opacity: 0; transform: translateY(30px); }
    .fade-in-delay-2 { animation: fadeInUp 1s ease-out 0.6s forwards; opacity: 0; transform: translateY(30px); }
    @keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }
    .univers { padding: 100px 0; background-color: #f8f8f8; }
    .section-title { text-align: center; font-size: 2.5rem; margin-bottom: 60px; color: #2c3e50; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 40px; padding: 0 20px; }
    .category-card { position: relative; height: 450px; border-radius: 20px; overflow: hidden; cursor: pointer; box-shadow: 0 15px 40px rgba(0,0,0,0.1); transition: transform 0.4s ease; }
    .category-card:hover { transform: translateY(-10px); }
    .card-bg { position: absolute; inset: 0; background-size: cover; background-position: center; transition: transform 0.6s ease; }
    .category-card:hover .card-bg { transform: scale(1.1); }
    .card-content { position: absolute; bottom: 0; left: 0; width: 100%; padding: 40px 30px; background: linear-gradient(to top, rgba(0,0,0,0.9), transparent); color: white; }
    .explore-link { font-weight: bold; text-transform: uppercase; font-size: 0.8rem; color: #d4a373; }
    @media (max-width: 768px) { h1 { font-size: 3rem; } .hero { height: 80vh; } }
  `]
})
export class HomeComponent {}
EOF

# 6. Products (CORRECTION TYPAGE TS2345)
echo "🛍️  Correction de ProductsComponent..."
cat > src/app/pages/products/products.component.ts <<'EOF'
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

interface Product extends DocumentData { 
    id: string; name: string; price: number; category: string; displayCategory?: string;
    imageUrl: string; description: string; shortDescription?: string; stock: number; 
}
const app = initializeApp(environment.firebaseConfig);
const db = getFirestore(app);

@Component({
  selector: 'app-product-detail', standalone: true, imports: [CommonModule],
  template: `
    <div class="page-container" *ngIf="product() as p">
      <div class="detail-layout">
        <div class="img-col">
            <img [src]="p.imageUrl" class="img">
        </div>
        <div class="info-col">
          <span class="cat-badge">{{ p.displayCategory }}</span>
          <h1>{{ p.name }}</h1>
          <p class="price">{{ p.price | number:'1.2-2' }} DT</p>
          
          <div class="desc-box">
            <p [innerHTML]="p.description || p.shortDescription"></p>
          </div>
          
          <div class="stock-info">
             <span [class.in-stock]="p.stock > 0" [class.out-stock]="p.stock === 0">
                {{ p.stock > 0 ? 'En stock' : 'Rupture de stock' }}
             </span>
          </div>

          <button (click)="add(p)" class="btn-primary btn-lg" [disabled]="p.stock === 0">
            {{ p.stock > 0 ? 'Ajouter au Panier' : 'Indisponible' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .detail-layout { display: flex; gap: 60px; padding-top: 40px; }
    .img-col { flex: 1; }
    .img { width: 100%; border-radius: 20px; box-shadow: 0 20px 50px rgba(0,0,0,0.1); }
    .info-col { flex: 1.2; padding-top: 20px; }
    .cat-badge { color: var(--accent-color); font-weight: bold; text-transform: uppercase; letter-spacing: 1px; font-size: 0.9rem; }
    h1 { font-size: 3rem; margin: 10px 0 20px; line-height: 1.1; }
    .price { font-size: 2.5rem; color: var(--primary-color); font-weight: 800; margin-bottom: 30px; }
    .desc-box { background: #fff; padding: 30px; border-radius: 15px; margin-bottom: 30px; border: 1px solid #eee; line-height: 1.6; color: #555; }
    .stock-info { margin-bottom: 20px; font-weight: bold; }
    .in-stock { color: var(--success-color); }
    .out-stock { color: var(--error-color); }
    .btn-lg { font-size: 1.2rem; padding: 18px 40px; width: 100%; max-width: 300px; }
    .btn-lg:disabled { background: #ccc; cursor: not-allowed; box-shadow: none; transform: none; }
    @media (max-width: 900px) { .detail-layout { flex-direction: column; } }
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
        if(snap.exists()) {
            const data = snap.data() as Product;
            const cleanCat = this.cleanCategory(data.category);
            this.product.set({ ...data, id: snap.id, displayCategory: cleanCat });
        }
      }
    });
  }

  private cleanCategory(raw: string): string {
    if (!raw) return 'Autres';
    const paths = raw.split(',');
    let bestPath = paths.find(p => !p.includes('Non classé') && p.includes('>')) || paths[0];
    if (bestPath.trim() === 'Non classé') return 'Autres';
    const parts = bestPath.split('>');
    let leaf = parts[parts.length - 1].trim();
    if (leaf === 'Non classé' && parts.length > 1) leaf = parts[parts.length - 2].trim();
    return leaf;
  }

  add(p: Product) { this.cart.addItem(p); }
}
EOF

# 8. Auth
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
    <div class="auth-bg">
        <div class="auth-overlay"></div>
        <div class="auth-card fade-in-up">
            <div class="auth-header">
                <h2>Bon retour</h2>
                <p>Connectez-vous pour savourer votre café.</p>
            </div>
            
            <form (ngSubmit)="login()">
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" [(ngModel)]="email" name="email" class="input-modern" placeholder="exemple@email.com">
                </div>
                <div class="form-group">
                    <label>Mot de passe</label>
                    <input type="password" [(ngModel)]="password" name="pass" class="input-modern" placeholder="••••••••">
                </div>
                
                <p *ngIf="error()" class="error-msg">{{ error() }}</p>
                
                <button type="submit" class="btn-primary w-100" [disabled]="loading()">
                    {{ loading() ? 'Connexion...' : 'Se connecter' }}
                </button>
            </form>

            <div class="divider"><span>OU</span></div>

            <button (click)="google()" class="btn-google w-100">
                <span class="icon">G</span> Continuer avec Google
            </button>

            <p class="auth-footer">
                Nouveau client ? <a routerLink="/signup">Créer un compte</a>
            </p>
        </div>
    </div>
  `,
  styles: [`
    .auth-bg {
        min-height: 100vh; display: flex; align-items: center; justify-content: center;
        background: url('https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2000') center/cover;
        position: relative; padding: 20px;
    }
    .auth-overlay { position: absolute; inset: 0; background: rgba(43,29,22,0.6); backdrop-filter: blur(5px); }
    .auth-card {
        position: relative; z-index: 2; background: white; padding: 50px 40px;
        border-radius: 20px; width: 100%; max-width: 450px;
        box-shadow: 0 20px 50px rgba(0,0,0,0.3);
    }
    .auth-header { text-align: center; margin-bottom: 30px; }
    .auth-header h2 { font-size: 2.5rem; margin: 0; color: var(--primary-dark); }
    .auth-header p { color: var(--text-light); }
    
    .form-group { margin-bottom: 20px; }
    .form-group label { display: block; font-weight: bold; margin-bottom: 8px; font-size: 0.9rem; color: var(--primary-dark); }
    
    .w-100 { width: 100%; }
    .error-msg { color: var(--error); background: #fadbd8; padding: 10px; border-radius: 8px; text-align: center; font-size: 0.9rem; }
    
    .divider { margin: 30px 0; text-align: center; border-bottom: 1px solid #eee; line-height: 0.1em; }
    .divider span { background: #fff; padding: 0 10px; color: #999; font-size: 0.8rem; }
    
    .btn-google { background: white; border: 1px solid #ddd; padding: 12px; border-radius: 50px; font-weight: bold; color: #555; display: flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer; transition: 0.3s; }
    .btn-google:hover { background: #f9f9f9; }
    
    .auth-footer { text-align: center; margin-top: 30px; font-size: 0.9rem; color: #666; }
    .auth-footer a { color: var(--primary-color); font-weight: bold; }
    
    .fade-in-up { animation: fadeIn 0.6s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class LoginComponent {
  email = ''; password = ''; error = signal(''); loading = signal(false);
  auth = inject(AuthService); router = inject(Router);

  async login() {
    this.loading.set(true);
    try { await this.auth.signIn(this.email, this.password); this.router.navigate(['/']); }
    catch(e:any) { this.error.set("Email ou mot de passe incorrect."); }
    finally { this.loading.set(false); }
  }
  async google() {
    try { await this.auth.signInWithGoogle(); this.router.navigate(['/']); }
    catch(e:any) { this.error.set("Erreur Google."); }
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
    <div class="auth-bg">
        <div class="auth-overlay"></div>
        <div class="auth-card fade-in-up">
            <div class="auth-header">
                <h2>Rejoignez-nous</h2>
                <p>Créez votre compte L'Italiano.</p>
            </div>
            
            <form (ngSubmit)="register()">
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" [(ngModel)]="email" name="email" class="input-modern" placeholder="exemple@email.com">
                </div>
                <div class="form-group">
                    <label>Mot de passe</label>
                    <input type="password" [(ngModel)]="password" name="pass" class="input-modern" placeholder="Min 6 caractères">
                </div>
                
                <p *ngIf="error()" class="error-msg">{{ error() }}</p>
                
                <button type="submit" class="btn-primary w-100" [disabled]="loading()">
                    {{ loading() ? 'Création...' : 'S\'inscrire' }}
                </button>
            </form>

            <p class="auth-footer">
                Déjà membre ? <a routerLink="/login">Se connecter</a>
            </p>
        </div>
    </div>
  `,
  styles: [`
    .auth-bg {
        min-height: 100vh; display: flex; align-items: center; justify-content: center;
        background: url('https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=2000') center/cover;
        position: relative; padding: 20px;
    }
    .auth-overlay { position: absolute; inset: 0; background: rgba(43,29,22,0.6); backdrop-filter: blur(5px); }
    .auth-card {
        position: relative; z-index: 2; background: white; padding: 50px 40px;
        border-radius: 20px; width: 100%; max-width: 450px;
        box-shadow: 0 20px 50px rgba(0,0,0,0.3);
    }
    .auth-header { text-align: center; margin-bottom: 30px; }
    .auth-header h2 { font-size: 2.5rem; margin: 0; color: var(--primary-dark); }
    .auth-header p { color: var(--text-light); }
    .form-group { margin-bottom: 20px; }
    .form-group label { display: block; font-weight: bold; margin-bottom: 8px; font-size: 0.9rem; color: var(--primary-dark); }
    .w-100 { width: 100%; }
    .error-msg { color: var(--error); background: #fadbd8; padding: 10px; border-radius: 8px; text-align: center; font-size: 0.9rem; }
    .auth-footer { text-align: center; margin-top: 30px; font-size: 0.9rem; color: #666; }
    .auth-footer a { color: var(--primary-color); font-weight: bold; }
    .fade-in-up { animation: fadeIn 0.6s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class SignupComponent {
  email = ''; password = ''; error = signal(''); loading = signal(false);
  auth = inject(AuthService); router = inject(Router);

  async register() {
    this.loading.set(true);
    try { await this.auth.signUp(this.email, this.password); this.router.navigate(['/']); }
    catch(e:any) { this.error.set("Erreur d'inscription."); }
    finally { this.loading.set(false); }
  }
}
EOF

# 9. Cart
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

# 9.5 Checkout (Page de commande) - REDESIGN LUXE
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
    <div class="page-container">
      <div class="checkout-wrapper">
        
        <!-- Card de Validation -->
        <div class="checkout-card fade-in">
            <div class="card-header">
                <h1>Finaliser la Commande</h1>
                <p>Plus qu'une étape avant de déguster.</p>
            </div>
            
            <div *ngIf="cart.cartItems().length > 0; else empty">
                
                <div class="order-summary">
                    <span class="label">Total à régler</span>
                    <span class="amount">{{ cart.subTotal() | number:'1.2-2' }} DT</span>
                </div>

                <form (ngSubmit)="submit()">
                    <div class="form-group">
                        <label>Nom complet</label>
                        <input type="text" [(ngModel)]="data.name" name="name" required class="input-modern" placeholder="Votre Nom">
                    </div>
                    <div class="form-group">
                        <label>Téléphone</label>
                        <input type="tel" [(ngModel)]="data.phone" name="phone" required class="input-modern" placeholder="22 333 444">
                    </div>
                    <div class="form-group">
                        <label>Adresse de livraison</label>
                        <textarea [(ngModel)]="data.address" name="addr" required class="input-modern" rows="3" placeholder="Rue, Ville, Code Postal..."></textarea>
                    </div>

                    <button type="submit" class="btn-primary w-100 btn-confirm">
                        Confirmer la commande
                    </button>
                </form>
            </div>
            
            <ng-template #empty>
                <div class="empty-state">
                    <p>Votre panier est vide.</p>
                </div>
            </ng-template>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .checkout-wrapper { display: flex; justify-content: center; padding-top: 40px; }
    
    .checkout-card {
        background: white;
        padding: 50px;
        border-radius: 20px;
        box-shadow: 0 15px 40px rgba(0,0,0,0.08);
        width: 100%;
        max-width: 600px;
        border-top: 5px solid var(--primary-color);
    }

    .card-header { text-align: center; margin-bottom: 40px; }
    .card-header h1 { font-size: 2.5rem; margin: 0; color: var(--primary-dark); border: none; }
    .card-header p { color: #888; font-size: 1.1rem; margin-top: 10px; }

    .order-summary {
        background: #faf8f5; /* Very light cream */
        border: 1px solid #e0d6ce;
        padding: 20px 30px;
        border-radius: 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
    }
    .order-summary .label { font-size: 1.1rem; color: var(--secondary-color); font-weight: 600; }
    .order-summary .amount { font-size: 1.8rem; color: var(--primary-color); font-weight: 800; font-family: 'Playfair Display', serif; }

    .form-group { margin-bottom: 25px; }
    .form-group label { display: block; font-weight: 700; margin-bottom: 8px; color: var(--primary-dark); font-size: 0.95rem; }
    
    .w-100 { width: 100%; }
    .btn-confirm { padding: 18px; font-size: 1.1rem; letter-spacing: 2px; margin-top: 10px; }
    
    .empty-state { text-align: center; padding: 40px; color: #999; font-size: 1.2rem; }

    .fade-in { animation: fadeIn 0.8s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `]
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

# 12. Composant CRUD Produits (Gestion de l'inventaire) MODERNE AVEC FILTRES ET FIRESTORE
echo "📝 Création du Composant CRUD Produits MODERNE AVEC FILTRES..."
cat > src/app/pages/admin/crud-products/crud-products.component.ts <<'EOF'
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
EOF

cat > src/app/pages/admin/orders/orders.component.ts <<'EOF'
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, query, orderBy, doc, updateDoc } from "firebase/firestore";
import { environment } from '../../../../environments/environment';

const app = initializeApp(environment.firebaseConfig);
const db = getFirestore(app);

@Component({
  selector: 'app-orders', standalone: true, imports: [CommonModule, FormsModule, DatePipe, CurrencyPipe],
  template: `
    <div class="page-container">
      <h1>Commandes</h1>
      <div *ngFor="let o of orders()">
        <div style="background:white; padding:20px; margin-bottom:20px; border-radius:10px; box-shadow:0 2px 5px rgba(0,0,0,0.1);">
            <h3>Commande #{{o.id.slice(0,8)}} - {{o.total | number:'1.2-2'}} DT</h3>
            <p><strong>Client:</strong> {{o.customer.name}} ({{o.customer.phone}})</p>
            <p><strong>Statut:</strong> 
                <select [ngModel]="o.status" (ngModelChange)="updateStatus(o.id, $event)">
                    <option>En cours</option><option>Livrée</option><option>Annulée</option>
                </select>
            </p>
            <div *ngFor="let i of o.items">{{i.quantity}}x {{i.name}}</div>
        </div>
      </div>
    </div>
  `
})
export class OrdersComponent implements OnInit {
  orders = signal<any[]>([]);
  ngOnInit() {
    onSnapshot(query(collection(db,"orders"), orderBy("createdAt","desc")), s => {
        this.orders.set(s.docs.map(d => ({id:d.id, ...d.data()})));
    });
  }
  updateStatus(id:string, status:string) { updateDoc(doc(db,"orders",id), {status}); }
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
echo "✅ TERMINÉ ! Design Admin Moderne Appliqué"
echo "==================================================="