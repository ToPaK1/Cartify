import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class Checkout {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly api = 'http://localhost:3000/api';

  loading = signal(false);
  error = '';

  form = this.fb.nonNullable.group({
    full_name: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', [Validators.required]],
    address: ['', [Validators.required, Validators.minLength(8)]],
    city: ['', [Validators.required]],
    governorate: ['Cairo', [Validators.required]]
  });

  submit(): void {
    if (this.form.invalid || this.loading()) return;

    this.loading.set(true);
    this.error = '';
    const value = this.form.getRawValue();

    this.http.post<{ success: boolean; address?: { id: number }; message?: string }>(`${this.api}/addresses`, {
      full_name: value.full_name,
      phone: value.phone,
      address_line: value.address,
      city: value.city,
      governorate: value.governorate
    }).subscribe({
      next: addressResponse => {
        const addressId = addressResponse.address?.id;
        if (!addressId) {
          this.error = 'Could not save your delivery address.';
          this.loading.set(false);
          return;
        }

        this.http.post<{ success: boolean; message?: string }>(`${this.api}/orders`, {
          address_id: addressId,
          payment_method: 'COD'
        }).subscribe({
          next: () => this.router.navigate(['/orders']),
          error: error => {
            this.error = error.error?.message || 'Could not place order.';
            this.loading.set(false);
          }
        });
      },
      error: error => {
        this.error = error.error?.message || 'Could not save your delivery address.';
        this.loading.set(false);
      }
    });
  }
}
