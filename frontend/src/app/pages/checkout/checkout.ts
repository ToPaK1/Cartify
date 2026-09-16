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
  paymentMethod = signal<'COD' | 'MockCard'>('COD');

  form = this.fb.nonNullable.group({
    full_name: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', [Validators.required]],
    address: ['', [Validators.required, Validators.minLength(8)]],
    city: ['', [Validators.required]],
    governorate: ['Cairo', [Validators.required]],
    card_number: [''],
    card_name: [''],
    expiry: [''],
    cvv: ['']
  });

  selectPayment(method: 'COD' | 'MockCard'): void {
    this.paymentMethod.set(method);

    const cardNumber = this.form.controls.card_number;
    const cardName = this.form.controls.card_name;
    const expiry = this.form.controls.expiry;
    const cvv = this.form.controls.cvv;

    if (method === 'MockCard') {
      cardNumber.setValidators([Validators.required, Validators.pattern(/^[0-9]{16}$/)]);
      cardName.setValidators([Validators.required, Validators.minLength(2)]);
      expiry.setValidators([Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)]);
      cvv.setValidators([Validators.required, Validators.pattern(/^[0-9]{3,4}$/)]);
    } else {
      cardNumber.clearValidators();
      cardName.clearValidators();
      expiry.clearValidators();
      cvv.clearValidators();
    }

    cardNumber.updateValueAndValidity();
    cardName.updateValueAndValidity();
    expiry.updateValueAndValidity();
    cvv.updateValueAndValidity();
  }

  submit(): void {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }

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
          payment_method: this.paymentMethod()
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
