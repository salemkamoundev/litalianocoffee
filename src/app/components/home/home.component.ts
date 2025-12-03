import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-home', standalone: true, imports: [CommonModule, RouterLink],
  template: `
    <section class="hero">
      <div class="slider"><div class="slide slide-1"></div><div class="slide slide-2"></div><div class="slide slide-3"></div></div>
      <div class="overlay"></div>
      <div class="content">
        <h1 class="fade-in">L'Italiano Coffee</h1><p class="fade-in delay-1">Le goût authentique.</p>
        <a routerLink="/products" class="cta-btn fade-in delay-2">Voir la Collection</a>
      </div>
    </section>
    <section class="categories">
        <div class="container"><h2>Nos Univers</h2><div class="grid">
            <div class="card" routerLink="/products"><div class="card-bg" style="background-image: url('/assets/cat_grains.jpg')"></div><div class="card-content"><h3>Grains</h3></div></div>
            <div class="card" routerLink="/products"><div class="card-bg" style="background-image: url('/assets/cat_capsules.jpg')"></div><div class="card-content"><h3>Capsules</h3></div></div>
            <div class="card" routerLink="/products"><div class="card-bg" style="background-image: url('/assets/cat_machine.jpg')"></div><div class="card-content"><h3>Machines</h3></div></div>
        </div></div>
    </section>
  `,
  styles: [`
    .hero { height: 90vh; position: relative; display: flex; align-items: center; justify-content: center; text-align: center; color: white; overflow: hidden; }
    .slider, .slide { position: absolute; inset: 0; width: 100%; height: 100%; }
    .slide { background-size: cover; background-position: center; opacity: 0; animation: slideShow 15s infinite; }
    .slide-1 { background-image: url('/assets/slider1.png'); animation-delay: 0s; }
    .slide-2 { background-image: url('/assets/slider2.png'); animation-delay: 5s; }
    .slide-3 { background-image: url('/assets/slider3.png'); animation-delay: 10s; }
    @keyframes slideShow { 0%, 10% { opacity: 1; } 33%, 100% { opacity: 0; } }
    .overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.4); z-index: 1; }
    .content { position: relative; z-index: 2; padding: 20px; }
    h1 { font-size: 5rem; text-shadow: 0 2px 10px rgba(0,0,0,0.5); font-family: 'Playfair Display', serif; }
    .cta-btn { background: var(--accent-color); color: white; padding: 15px 40px; border-radius: 30px; text-decoration: none; font-weight: bold; text-transform: uppercase; }
    .categories { padding: 80px 0; text-align: center; }
    .grid { display: flex; justify-content: center; gap: 30px; flex-wrap: wrap; padding: 20px; }
    .card { width: 300px; height: 400px; position: relative; border-radius: 15px; overflow: hidden; cursor: pointer; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
    .card-bg { position: absolute; inset: 0; background-size: cover; transition: 0.5s; }
    .card:hover .card-bg { transform: scale(1.1); }
    .card-content { position: absolute; bottom: 0; width: 100%; padding: 30px; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); color: white; }
  `]
})
export class HomeComponent {}
