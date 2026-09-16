import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
interface CartItem { id:number; product_id:number; quantity:number; name:string; price:number; image?:string; total:number; }
@Component({selector:'app-cart',imports:[CommonModule,RouterLink],templateUrl:'./cart.html',styleUrl:'./cart.css'})
export class Cart implements OnInit { private http=inject(HttpClient); items=signal<CartItem[]>([]); loading=signal(true); total=signal(0);
 ngOnInit(){this.load()}
 load(){this.http.get<{success:boolean;items:CartItem[];total:number}>('http://localhost:3000/api/cart').subscribe({next:r=>{this.items.set(r.items??[]);this.total.set(r.total??0);this.loading.set(false)},error:()=>this.loading.set(false)})}
 remove(id:number){this.http.delete(`http://localhost:3000/api/cart/${id}`).subscribe(()=>this.load())}
 update(id:number,quantity:number){this.http.put(`http://localhost:3000/api/cart/${id}`,{quantity}).subscribe(()=>this.load())}
}
