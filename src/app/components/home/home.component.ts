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
