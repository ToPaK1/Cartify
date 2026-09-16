import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Product, ProductService } from '../../core/services/product.service';
import { HttpClient } from '@angular/common/http';

@Component({selector:'app-product-details',imports:[CommonModule,RouterLink],templateUrl:'./product-details.html',styleUrl:'./product-details.css'})
export class ProductDetails implements OnInit { private route=inject(ActivatedRoute); private service=inject(ProductService); private http=inject(HttpClient); product=signal<Product|null>(null); loading=signal(true); message=''; quantity=1;
 ngOnInit(){const id=Number(this.route.snapshot.paramMap.get('id'));this.service.getProduct(id).subscribe({next:r=>{this.product.set(r.product);this.loading.set(false)},error:()=>this.loading.set(false)});}
 add(){const p=this.product();if(!p)return;this.http.post<{message?:string}>('http://localhost:3000/api/cart',{product_id:p.id,quantity:this.quantity}).subscribe({next:r=>this.message=r.message||'Added to cart!',error:e=>this.message=e.error?.message||'Please login first.'})}
}
