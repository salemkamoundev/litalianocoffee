import { Injectable, signal, computed } from '@angular/core';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { environment } from '../../environments/environment';

const app = initializeApp(environment.firebaseConfig);
const db = getFirestore(app);
export interface CartItem { id: string; name: string; price: number; quantity: number; imageUrl: string; }

@Injectable({ providedIn: 'root' })
export class CartService {
  cartItems = signal<CartItem[]>([]);
  subTotal = computed(() => this.cartItems().reduce((acc, i) => acc + (i.price * i.quantity), 0));
  itemCount = computed(() => this.cartItems().reduce((acc, i) => acc + i.quantity, 0));

  constructor() { if(typeof localStorage !== 'undefined') { const s = localStorage.getItem('cart'); if(s) this.cartItems.set(JSON.parse(s)); } }
  save() { if(typeof localStorage !== 'undefined') localStorage.setItem('cart', JSON.stringify(this.cartItems())); }
  
  addItem(p: any, q: number = 1) {
    this.cartItems.update(i => {
      const x = i.find(z => z.id === p.id);
      if(x) x.quantity += q; else i.push({id:p.id, name:p.name, price:Number(p.price), quantity:q, imageUrl:p.imageUrl});
      return [...i];
    }); this.save();
  }
  removeItem(id: string) { this.cartItems.update(i => i.filter(x => x.id !== id)); this.save(); }
  updateQuantity(id: string, q: number) {
    if(q<=0) return this.removeItem(id);
    this.cartItems.update(i => { const x = i.find(z => z.id === id); if(x) x.quantity = q; return [...i]; }); this.save();
  }
  async checkout(d: any) {
    if(this.cartItems().length === 0) return;
    await addDoc(collection(db, 'orders'), {customer:d, items:this.cartItems(), total:this.subTotal(), date:serverTimestamp(), status:'En cours'});
    this.cartItems.set([]); this.save();
  }
}
