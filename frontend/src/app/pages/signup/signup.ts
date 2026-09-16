import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({selector:'app-signup',imports:[CommonModule,ReactiveFormsModule,RouterLink],templateUrl:'./signup.html',styleUrl:'./signup.css'})
export class Signup { private fb=inject(FormBuilder); private auth=inject(AuthService); private router=inject(Router); show=false; error=''; loading=false;
 form=this.fb.nonNullable.group({name:['',[Validators.required,Validators.minLength(2)]],email:['',[Validators.required,Validators.email]],phone:['',[Validators.required]],password:['',[Validators.required,Validators.minLength(6)]]});
 submit(){if(this.form.invalid)return;this.loading=true;this.error='';this.auth.signup(this.form.getRawValue()).subscribe({next:()=>this.router.navigate(['/login']),error:e=>{this.error=e.error?.message||'Could not create account';this.loading=false}})} }
