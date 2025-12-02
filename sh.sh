#!/bin/bash

# Nom du dossier du projet
PROJECT_DIR="cafe-ecommerce-app"

echo "==================================================="
echo "🎨 FINALISATION ULTIME DU TEMPLATE (Admin Connecté Firestore)"
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
input, select { outline: none; }

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
        <div class="logo">
            <span class="brand">L'ITALIANO</span><span class="suffix">COFFEE</span>
        </div>
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
    header { position: fixed; top: 0; width: 100%; z-index: 1000; padding: 20px 0; transition: 0.3s; background: linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%); }
    header.scrolled { padding: 10px 0; background: rgba(10, 10, 10, 0.95); backdrop-filter: blur(10px); box-shadow: 0 4px 20px rgba(0,0,0,0.4); }
    .container { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 0 20px; }
    .logo { font-family: 'Playfair Display', serif; font-size: 1.8rem; font-weight: 700; color: white; letter-spacing: 2px; }
    .suffix { color: #d4a373; font-style: italic; }
    nav ul { list-style: none; display: flex; gap: 25px; margin: 0; padding: 0; align-items: center; }
    nav a, button { text-decoration: none; color: #eee; font-size: 0.85rem; text-transform: uppercase; font-weight: 500; letter-spacing: 1px; background: none; border: none; cursor: pointer; transition: color 0.3s; }
    nav a:hover, button:hover { color: #d4a373; }
    .btn-contact { border: 1px solid #d4a373; padding: 8px 20px; border-radius: 30px; transition: all 0.3s; }
    .btn-contact:hover { background: #d4a373; color: #000; }
    .btn-logout { color: #e74c3c; }
    .btn-admin { color: #f1c40f; font-weight: bold; border-bottom: 2px solid #f1c40f; }
    .cart-link { position: relative; padding-right: 20px; }
    .cart-badge { position: absolute; top: -8px; right: 0; background: #e74c3c; color: white; border-radius: 50%; padding: 2px 6px; font-size: 0.7rem; }
  `]
})
export class HeaderComponent {
  isScrolled = false;
  auth = inject(AuthService);
  cart = inject(CartService);
  private router = inject(Router);

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
  template: `
    <footer>
      <div class="container">
        <div class="col">
            <h3>L'Italiano Coffee</h3>
            <p>Le goût de l'excellence italienne.</p>
        </div>
        <div class="col">
            <h4>Contact</h4>
            <p>Email: contact@litalianocaffe.tn</p>
        </div>
      </div>
      <div class="bottom"><p>&copy; 2025 L'Italiano Coffee. Tous droits réservés.</p></div>
    </footer>
  `,
  styles: [`
    footer { background: #111; color: #ccc; padding-top: 60px; font-size: 0.9rem; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 20px 40px; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 40px; }
    h3 { color: #d4a373; font-size: 1.5rem; margin-bottom: 10px; }
    h4 { color: #fff; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px; }
    .bottom { background: #000; text-align: center; padding: 20px; color: #555; }
  `]
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
    .cta-btn { background-color: #d4a373; color: white; padding: 18px 50px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 1.1rem; text-transform: uppercase; transition: 0.3s; box-shadow: 0 10px 30px rgba(212, 163, 115, 0.4); }
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

# 6. Products
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

# 9.5 Checkout
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