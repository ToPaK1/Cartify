import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Stats { users:number; products:number; orders:number; categories:number; sales:number; }
interface AdminOrder { id:number; status:string; payment_method:string; subtotal:number; shipping_fee:number; total:number; created_at:string; user_name:string; user_email:string; }
interface AdminUser { id:number; name:string; email:string; phone?:string; role:string; created_at:string; }
interface Category { id:number; name:string; slug:string; }
interface Product { id:number; category_id:number|null; category_name?:string; name:string; slug:string; description:string; brand:string; price:number; old_price:number|null; stock:number; rating:number; image:string|null; }

@Component({selector:'app-admin',imports:[CommonModule,FormsModule],templateUrl:'./admin.html',styleUrl:'./admin.css'})
export class Admin implements OnInit {
  private http=inject(HttpClient);
  private api='http://localhost:3000/api';
  stats=signal<Stats>({users:0,products:0,orders:0,categories:0,sales:0});
  orders=signal<AdminOrder[]>([]); users=signal<AdminUser[]>([]); products=signal<Product[]>([]); categories=signal<Category[]>([]);
  loading=signal(true); message=''; editingId:number|null=null; categoryEditingId:number|null=null;
  productForm:Partial<Product>={name:'',category_id:null,description:'',brand:'',price:0,old_price:null,stock:0,rating:0,image:''};
  categoryName='';

  ngOnInit(){this.load();}
  load(){
    this.loading.set(true);
    this.http.get<{success:boolean;stats:Stats}>(`${this.api}/admin/stats`).subscribe({next:r=>this.stats.set(r.stats),complete:()=>this.loading.set(false)});
    this.http.get<{success:boolean;orders:AdminOrder[]}>(`${this.api}/admin/orders`).subscribe({next:r=>this.orders.set(r.orders??[])});
    this.http.get<{success:boolean;users:AdminUser[]}>(`${this.api}/admin/users`).subscribe({next:r=>this.users.set(r.users??[])});
    this.http.get<{success:boolean;products:Product[]}>(`${this.api}/products?limit=100`).subscribe({next:r=>this.products.set(r.products??[])});
    this.http.get<{success:boolean;categories:Category[]}>(`${this.api}/categories`).subscribe({next:r=>this.categories.set(r.categories??[])});
  }

  saveProduct(){
    const p=this.productForm;
    if(!p.name?.trim() || p.price===undefined || Number(p.price)<0){this.message='Product name and a valid price are required.';return;}
    const body={category_id:p.category_id||null,name:p.name.trim(),description:p.description||'',brand:p.brand||'',price:Number(p.price),old_price:p.old_price===null||p.old_price===undefined||p.old_price===''?null:Number(p.old_price),stock:Number(p.stock)||0,rating:Number(p.rating)||0,image:p.image||null};
    const request=this.editingId===null ? this.http.post(`${this.api}/products`,body) : this.http.put(`${this.api}/products/${this.editingId}`,body);
    request.subscribe({next:()=>{this.message=this.editingId===null?'Product added successfully.':'Product updated successfully.';this.resetProduct();this.load();},error:e=>this.message=e.error?.message||'Could not save product.'});
  }
  editProduct(p:Product){this.editingId=p.id;this.productForm={...p};window.scrollTo({top:0,behavior:'smooth'});}
  deleteProduct(id:number){if(!confirm('Delete this product?'))return;this.http.delete(`${this.api}/products/${id}`).subscribe({next:()=>{this.message='Product deleted.';this.load();},error:e=>this.message=e.error?.message||'Could not delete product.'});}
  resetProduct(){this.editingId=null;this.productForm={name:'',category_id:null,description:'',brand:'',price:0,old_price:null,stock:0,rating:0,image:''};}

  saveCategory(){
    const name=this.categoryName.trim(); if(!name){this.message='Category name is required.';return;}
    const request=this.categoryEditingId===null ? this.http.post(`${this.api}/categories`,{name}) : this.http.put(`${this.api}/categories/${this.categoryEditingId}`,{name});
    request.subscribe({next:()=>{this.message=this.categoryEditingId===null?'Category added successfully.':'Category updated successfully.';this.resetCategory();this.load();},error:e=>this.message=e.error?.message||'Could not save category.'});
  }
  editCategory(c:Category){this.categoryEditingId=c.id;this.categoryName=c.name;}
  deleteCategory(id:number){if(!confirm('Delete this category? Products in it will remain without a category.'))return;this.http.delete(`${this.api}/categories/${id}`).subscribe({next:()=>{this.message='Category deleted.';this.load();},error:e=>this.message=e.error?.message||'Could not delete category.'});}
  resetCategory(){this.categoryEditingId=null;this.categoryName='';}
  setStatus(id:number,status:string){this.http.patch(`${this.api}/admin/orders/${id}/status`,{status}).subscribe({next:()=>{this.message='Order status updated.';this.load();},error:e=>this.message=e.error?.message||'Could not update order.'});}
}
