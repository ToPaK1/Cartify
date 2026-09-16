import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product, ProductService, Category } from '../../core/services/product.service';

@Component({ selector:'app-home', imports:[RouterLink], templateUrl:'./home.html', styleUrl:'./home.css' })
export class Home implements OnInit {
  private productsService = inject(ProductService);
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.productsService.getProducts({ limit: 6 }).subscribe({ next:r=>this.products.set(r.products ?? []), error:()=>{}, complete:()=>this.loading.set(false) });
    this.productsService.getCategories().subscribe({ next:r=>this.categories.set(r.categories ?? []), error:()=>{} });
  }
}
