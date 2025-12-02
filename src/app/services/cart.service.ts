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
