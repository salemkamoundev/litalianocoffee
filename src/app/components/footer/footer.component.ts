import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({ selector: 'app-footer', standalone: true, imports: [CommonModule], template: `<footer><div class="container"><p>L'Italiano Coffee &copy; 2025.</p></div></footer>`, styles: [`footer { background: #1a1a1a; color: #fff; padding: 40px 0; text-align: center; }`] }) export class FooterComponent {}
