import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router'; // Ajout de RouterLink

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink], // Import RouterLink
  template: `
    <!-- Hero Section (Parallax) -->
    <section class="hero" id="home">
      <div class="overlay"></div>
      <div class="content fade-in-up">
        <h1 class="main-title">L'Italiano Coffee</h1>
        <p class="subtitle">Le goût authentique, de la fève à votre tasse.</p>
        <button class="cta-button" routerLink="/products">Découvrir nos Cafés</button> <!-- Lien vers Produits -->
      </div>
    </section>

    <!-- Section Équipe / Slogan -->
    <section class="team-section" id="about">
      <div class="container">
        <div class="text-block">
          <h2>Une Équipe Imbattable</h2>
          <p class="lead">"L'italiano l'équipe imbattable"</p>
          <p>
            Nous sélectionnons les meilleures origines pour vous offrir un espresso italien
            d'exception. Notre passion pour le café se reflète dans chaque capsule et chaque grain.
          </p>
        </div>
        <div class="image-block">
          <img src="https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=1000&auto=format&fit=crop" alt="Barista Coffee">
        </div>
      </div>
    </section>

    <!-- Section Produits (Aperçu) -->
    <section class="products-preview" id="products">
      <div class="container">
        <h2>Nos Univers</h2>
        <div class="grid">
          <div class="card">
            <div class="card-img" style="background-image: url('https://images.unsplash.com/photo-1559056199-6410ac8b55e?q=80&w=1000&auto=format&fit=crop');"></div>
            <div class="card-content">
              <h3>Café en Grains</h3>
              <p>L'arôme pur pour les puristes.</p>
              <a routerLink="/products" class="discover-link">Voir la catégorie</a>
            </div>
          </div>
          <div class="card">
            <div class="card-img" style="background-image: url('https://images.unsplash.com/photo-1621255535941-83c3eb6f07d2?q=80&w=1000&auto=format&fit=crop');"></div>
            <div class="card-content">
              <h3>Capsules</h3>
              <p>Compatible & Intense.</p>
              <a routerLink="/products" class="discover-link">Voir la catégorie</a>
            </div>
          </div>
          <div class="card">
            <div class="card-img" style="background-image: url('https://images.unsplash.com/photo-1517080315877-62f90dc68725?q=80&w=1000&auto=format&fit=crop');"></div>
            <div class="card-content">
              <h3>Machines</h3>
              <p>La technologie au service du goût.</p>
              <a routerLink="/products" class="discover-link">Voir la catégorie</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    /* Hero & Parallax */
    .hero {
      position: relative;
      height: 100vh;
      background-image: url('https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=2000&auto=format&fit=crop'); /* Image de fond Café */
      background-attachment: fixed; /* Effet Parallaxe */
      background-position: center;
      background-repeat: no-repeat;
      background-size: cover;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      color: white;
    }
    .overlay {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.5); /* Assombrir l'image */
    }
    .content {
      position: relative;
      z-index: 1;
      padding: 20px;
    }
    .main-title {
      font-size: 4rem;
      margin-bottom: 10px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
    }
    .subtitle {
      font-size: 1.5rem;
      font-weight: 300;
      margin-bottom: 30px;
      letter-spacing: 1px;
    }
    .cta-button {
      background-color: #d4a373;
      color: white;
      border: none;
      padding: 15px 40px;
      font-size: 1.1rem;
      text-transform: uppercase;
      letter-spacing: 2px;
      border-radius: 50px;
      font-weight: bold;
    }
    .cta-button:hover {
      background-color: #b58055;
      transform: scale(1.05);
    }

    /* Team Section */
    .team-section {
      padding: 80px 20px;
      background: #fff;
    }
    .team-section .container {
      max-width: 1000px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      gap: 50px;
      flex-wrap: wrap;
    }
    .text-block { flex: 1; min-width: 300px; }
    .image-block { flex: 1; min-width: 300px; }
    .image-block img {
      width: 100%;
      border-radius: 10px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      transition: transform 0.5s;
    }
    .image-block img:hover { transform: scale(1.02); }
    .lead {
      font-size: 1.8rem;
      font-family: 'Playfair Display', serif;
      color: #6f4e37;
      font-style: italic;
      margin-bottom: 20px;
    }

    /* Products Preview */
    .products-preview {
      padding: 80px 20px;
      background-color: #f5f5f5;
    }
    .products-preview h2 {
      text-align: center;
      font-size: 2.5rem;
      margin-bottom: 50px;
      color: #2c3e50;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 30px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .card {
      background: white;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 5px 15px rgba(0,0,0,0.05);
      transition: transform 0.3s;
    }
    .card:hover { transform: translateY(-10px); }
    .card-img {
      height: 250px;
      background-size: cover;
      background-position: center;
    }
    .card-content { padding: 20px; text-align: center; }
    .card-content h3 { margin: 0; color: #6f4e37; }
    .card-content p { color: #777; font-size: 0.9rem; }
    .discover-link {
        display: block;
        margin-top: 10px;
        color: var(--accent-color);
        text-decoration: underline;
        font-weight: bold;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .main-title { font-size: 2.5rem; }
      .team-section .container { flex-direction: column; }
    }
  `]
})
export class HomeComponent {}
