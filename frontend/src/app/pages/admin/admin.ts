import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
interface Stats { products:number; customers:number; orders:number; revenue:number; pending:number; lowStock:number; }
interface AdminOrder { id:number; status:string; payment_method:string; subtotal:number; shipping_fee:number; total:number; created_at:string; customer_name:string; customer_email:string; }
interface AdminUser { id:number; name:string; email:string; phone?:string; role:string; created_at:string; }
@Component({selector:'app-admin',imports:[CommonModule],templateUrl:'./admin.html',styleUrl:'./admin.css'})
export class Admin implements OnInit {
 private http=inject(HttpClient); private api='http://localhost:3000/api/admin';
 stats=signal<Stats>({products:0,customers:0,orders:0,revenue:0,pending:0,lowStock:0}); orders=signal<AdminOrder[]>([]); users=signal<AdminUser[]>([]); loading=signal(true); message='';
 ngOnInit(){this.load();}
 load(){this.loading.set(true);this.http.get<{success:boolean;stats:Stats}>(`${this.api}/stats`).subscribe({next:r=>this.stats.set(r.stats),error:()=>{},complete:()=>this.loading.set(false)});this.http.get<{success:boolean;orders:AdminOrder[]}>(`${this.api}/orders`).subscribe({next:r=>this.orders.set(r.orders??[])});this.http.get<{success:boolean;users:AdminUser[]}>(`${this.api}/users`).subscribe({next:r=>this.users.set(r.users??[])});}
 setStatus(id:number,status:string){this.http.patch(`${this.api}/orders/${id}/status`,{status}).subscribe({next:()=>{this.message='Order status updated.';this.load();},error:e=>this.message=e.error?.message||'Could not update order.'});}
}