import { Injectable, signal } from '@angular/core';
import { Product } from './product.service';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  readonly items = signal<Product[]>(this.read());

  isSaved(id: number): boolean { return this.items().some(p => p.id === id); }

  toggle(product: Product): void {
    const next = this.isSaved(product.id)
      ? this.items().filter(p => p.id !== product.id)
      : [...this.items(), product];
    this.items.set(next);
    localStorage.setItem('cartify-wishlist', JSON.stringify(next));
  }

  private read(): Product[] {
    try { return JSON.parse(localStorage.getItem('cartify-wishlist') || '[]'); }
    catch { return []; }
  }
}
