import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';

@Component({selector:'app-checkout',imports:[CommonModule,ReactiveFormsModule,RouterLink],templateUrl:'./checkout.html',styleUrl:'./checkout.css'})
export class Checkout {
 private fb=inject(FormBuilder); private http=inject(HttpClient); private router=inject(Router);
 loading=signal(false); error='';
 form=this.fb.nonNullable.group({full_name:['',[Validators.required,Validators.minLength(2)]],phone:['',[Validators.required]],address:['',[Validators.required,Validators.minLength(8)]],city:['',[Validators.required]]});
 submit(){if(this.form.invalid)return;this.loading.set(true);this.error='';this.http.post<{success:boolean;order?:{id:number};message?:string}>('http://localhost:3000/api/orders',this.form.getRawValue()).subscribe({next:r=>this.router.navigate(['/orders']),error:e=>{this.error=e.error?.message||'Could not place order';this.loading.set(false)}})}
}