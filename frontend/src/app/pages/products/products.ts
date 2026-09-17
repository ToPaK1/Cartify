import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Product, ProductService } from '../../core/services/product.service';
import { WishlistService } from '../../core/services/wishlist.service';

@Component({ selector:'app-products', imports:[CommonModule, FormsModule, RouterLink], templateUrl:'./products.html', styleUrl:'./products.css' })
export class Products implements OnInit {
  private service=inject(ProductService); private route=inject(ActivatedRoute);
  readonly wishlist=inject(WishlistService);
  products=signal<Product[]>([]); loading=signal(true); error=signal(''); search=''; category=''; sort='newest'; page=1; pages=1;
  ngOnInit(){ this.route.queryParams.subscribe(p=>{this.category=p['category'] ?? ''; this.search=p['search'] ?? ''; this.load();}); }
  load(){ this.loading.set(true); this.service.getProducts({search:this.search,category:this.category,sort:this.sort,page:this.page,limit:12}).subscribe({next:r=>{this.products.set(r.products??[]);this.pages=r.pagination?.pages??1;this.loading.set(false)},error:()=>{this.error.set('Failed to load products.');this.loading.set(false)}}); }
  apply(){this.page=1;this.load()} prev(){if(this.page>1){this.page--;this.load()}} next(){if(this.page<this.pages){this.page++;this.load()}}
  toggleWishlist(event: Event, product: Product){event.preventDefault();event.stopPropagation();this.wishlist.toggle(product)}
}
