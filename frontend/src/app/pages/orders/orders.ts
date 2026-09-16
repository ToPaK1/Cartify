import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface Order {
  id: number;
  subtotal: number;
  shipping_fee: number;
  total: number;
  status: string;
  payment_method: string;
  created_at: string;
}

@Component({
  selector: 'app-orders',
  imports: [CommonModule, RouterLink],
  templateUrl: './orders.html',
  styleUrl: './orders.css'
})
export class Orders implements OnInit {
  private http = inject(HttpClient);
  orders = signal<Order[]>([]);
  loading = signal(true);
  error = signal('');

  ngOnInit(): void {
    this.http.get<{ success: boolean; orders: Order[] }>('http://localhost:3000/api/orders').subscribe({
      next: response => {
        this.orders.set(response.orders ?? []);
        this.loading.set(false);
      },
      error: error => {
        this.error.set(error.error?.message || 'Could not load your orders.');
        this.loading.set(false);
      }
    });
  }

  cancel(id: number): void {
    this.http.patch(`http://localhost:3000/api/orders/${id}/cancel`, {}).subscribe({
      next: () => this.ngOnInit(),
      error: error => this.error.set(error.error?.message || 'Could not cancel this order.')
    });
  }
}
