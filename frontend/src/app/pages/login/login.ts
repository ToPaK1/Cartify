import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({selector:'app-login',imports:[CommonModule,ReactiveFormsModule,RouterLink],templateUrl:'./login.html',styleUrl:'./login.css'})
export class Login { private fb=inject(FormBuilder); private auth=inject(AuthService); private router=inject(Router); show=false; error=''; loading=false;
 form=this.fb.nonNullable.group({email:['',[Validators.required,Validators.email]],password:['',[Validators.required,Validators.minLength(6)]]});
 submit(){if(this.form.invalid)return;this.loading=true;this.error='';this.auth.login(this.form.value.email!,this.form.value.password!).subscribe({next:()=>this.router.navigate(['/']),error:e=>{this.error=e.error?.message||'Invalid email or password';this.loading=false}})} }
