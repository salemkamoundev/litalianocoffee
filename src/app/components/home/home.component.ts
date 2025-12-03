import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- Hero Section (Slider) -->
    <section class="hero">
      <div class="slider">
        <div class="slide slide-1"></div>
        <div class="slide slide-2"></div>
        <div class="slide slide-3"></div>
      </div>
      <div class="overlay"></div>
      <div class="content">
        <h1 class="fade-in">L'Italiano Coffee</h1>
        <p class="fade-in delay-1">Le goût authentique, de la fève à votre tasse.</p>
        <a routerLink="/products" class="cta-btn fade-in delay-2">Voir la Collection</a>
      </div>
    </section>

    <!-- Univers Section (Images corrigées) -->
    <section class="categories">
        <div class="container">
            <h2>Nos Univers</h2>
            <div class="grid">
                
                <!-- CARTE GRAINS -->
                <div class="card" routerLink="/products">
                    <div class="card-bg" style="background-image: url('/assets/cat_grains.jpg')"></div>
                    <div class="card-content">
                        <h3>Café en Grains</h3>
                        <p class="sub-text">Arôme intense</p>
                    </div>
                </div>

                <!-- CARTE CAPSULES -->
                <div class="card" routerLink="/products">
                    <div class="card-bg" style="background-image: url('/assets/cat_capsules.jpg')"></div>
                    <div class="card-content">
                        <h3>Capsules</h3>
                        <p class="sub-text">Compatibilité Parfaite</p>
                    </div>
                </div>

                <!-- CARTE MACHINES -->
                <div class="card" routerLink="/products">
                    <div class="card-bg" style="background-image: url('/assets/cat_machine.jpg')"></div>
                    <div class="card-content">
                        <h3>Machines Pro</h3>
                        <p class="sub-text">Technologie Barista</p>
                    </div>
                </div>

            </div>
        </div>
    </section>
  `,
  styles: [`
    /* Hero & Slider Styles */
    .hero { position: relative; height: 90vh; overflow: hidden; display: flex; align-items: center; justify-content: center; text-align: center; color: white; }
    .slider, .slide { position: absolute; inset: 0; width: 100%; height: 100%; }
    .slide { background-size: cover; background-position: center; opacity: 0; animation: slideShow 15s infinite; }
    
    .slide-1 { background-image: url('/assets/slider1.png'); animation-delay: 0s; }
    .slide-2 { background-image: url('/assets/slider2.png'); animation-delay: 5s; }
    .slide-3 { background-image: url('/assets/slider3.png'); animation-delay: 10s; }
    
    @keyframes slideShow { 0% { opacity: 0; transform: scale(1); } 10% { opacity: 1; } 33% { opacity: 1; } 43% { opacity: 0; transform: scale(1.1); } 100% { opacity: 0; } }
    
    .overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.4); z-index: 1; }
    .content { position: relative; z-index: 2; padding: 20px; }
    h1 { font-size: 5rem; margin-bottom: 10px; text-shadow: 0 4px 20px rgba(0,0,0,0.6); font-family: 'Playfair Display', serif; }
    p { font-size: 1.5rem; margin-bottom: 30px; font-weight: 300; letter-spacing: 1px; }
    .cta-btn { background: var(--accent-color); color: #fff; padding: 15px 40px; border-radius: 30px; text-decoration: none; font-weight: bold; text-transform: uppercase; transition: 0.3s; box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
    .cta-btn:hover { background: white; color: var(--primary-color); transform: translateY(-3px); }

    /* Categories Styles */
    .categories { padding: 80px 0; text-align: center; background: #f9f9f9; }
    .grid { display: flex; justify-content: center; gap: 30px; flex-wrap: wrap; padding: 20px; }
    
    .card { width: 300px; height: 450px; position: relative; border-radius: 20px; overflow: hidden; cursor: pointer; box-shadow: 0 15px 40px rgba(0,0,0,0.1); transition: transform 0.4s ease; }
    .card:hover { transform: translateY(-10px); box-shadow: 0 25px 50px rgba(0,0,0,0.15); }
    
    /* Background Image Fixe */
    .card-bg { 
        position: absolute; inset: 0; background-size: cover; background-position: center; 
        transition: transform 0.6s ease; 
    }
    .card:hover .card-bg { transform: scale(1.1); }
    
    .card-content { 
        position: absolute; bottom: 0; width: 100%; padding: 40px 20px; 
        background: linear-gradient(to top, rgba(0,0,0,0.9) 10%, transparent); color: white; 
        text-align: center;
    }
    .card-content h3 { margin: 0; font-size: 1.8rem; font-family: 'Playfair Display', serif; color: #fff; }
    .sub-text { color: var(--accent-color); text-transform: uppercase; font-size: 0.8rem; font-weight: bold; margin-top: 10px; letter-spacing: 2px; }

    /* Animations */
    .fade-in { animation: fadeInUp 1s ease-out forwards; opacity: 0; transform: translateY(20px); }
    .delay-1 { animation-delay: 0.2s; } .delay-2 { animation-delay: 0.4s; }
    @keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }
  `]
})
export class HomeComponent {}
