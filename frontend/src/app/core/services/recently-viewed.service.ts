import { Injectable, signal } from '@angular/core';
import { Product } from './product.service';

@Injectable({ providedIn: 'root' })
export class RecentlyViewedService {
  readonly items = signal<Product[]>(this.read());

  add(product: Product): void {
    const next = [product, ...this.items().filter(p => p.id !== product.id)].slice(0, 6);
    this.items.set(next);
    localStorage.setItem('cartify-recent', JSON.stringify(next));
  }

  private read(): Product[] {
    try { return JSON.parse(localStorage.getItem('cartify-recent') || '[]'); }
    catch { return []; }
  }
}
