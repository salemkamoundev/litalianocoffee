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
