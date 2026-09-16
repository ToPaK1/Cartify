import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product, ProductService, Category } from '../../core/services/product.service';

@Component({ selector:'app-home', imports:[CommonModule, RouterLink], templateUrl:'./home.html', styleUrl:'./home.css' })
export class Home implements OnInit {
  private productsService = inject(ProductService);
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.productsService.getProducts({ limit: 4 }).subscribe({ next:r=>this.products.set(r.products ?? []), error:()=>this.loading.set(false), complete:()=>this.loading.set(false) });
    this.productsService.getCategories().subscribe({ next:r=>this.categories.set((r.categories ?? []).slice(0, 6)), error:()=>{} });
  }
}
