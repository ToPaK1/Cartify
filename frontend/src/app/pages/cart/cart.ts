import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  name: string;
  price: number;
  image?: string;
  total: number;
}

interface CartResponse {
  success: boolean;
  items: CartItem[];
  subtotal: number;
  count: number;
}

@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class Cart implements OnInit {
  private http = inject(HttpClient);

  items = signal<CartItem[]>([]);
  loading = signal(true);
  subtotal = signal(0);

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);

    this.http.get<CartResponse>('http://localhost:3000/api/cart').subscribe({
      next: (response) => {
        this.items.set(response.items ?? []);
        this.subtotal.set(Number(response.subtotal ?? 0));
        this.loading.set(false);
      },
      error: () => {
        this.items.set([]);
        this.subtotal.set(0);
        this.loading.set(false);
      }
    });
  }

  remove(id: number) {
    this.http.delete(`http://localhost:3000/api/cart/${id}`).subscribe(() => this.load());
  }

  update(id: number, quantity: number) {
    if (quantity < 1) return;
    this.http.put(`http://localhost:3000/api/cart/${id}`, { quantity }).subscribe(() => this.load());
  }

  shipping(): number {
    return this.subtotal() >= 1000 ? 0 : 60;
  }

  grandTotal(): number {
    return this.subtotal() + this.shipping();
  }
}
