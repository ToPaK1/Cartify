import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

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
  private route = inject(ActivatedRoute);
  private readonly api = 'http://localhost:3000/api';

  loading = signal(false);
  error = '';
  paymentMethod = signal<'COD' | 'CARD'>('COD');

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

  constructor() {
    this.route.queryParamMap.subscribe(params => {
      const payment = params.get('payment');
      const sessionId = params.get('session_id');
      if (payment === 'cancelled') this.error = 'Card payment was cancelled. You can try again or choose Cash on Delivery.';
      if (payment === 'success' && sessionId) this.verifyCardPayment(sessionId);
    });
  }

  selectPayment(method: 'COD' | 'CARD'): void {
    this.paymentMethod.set(method);
    const controls = [this.form.controls.card_number, this.form.controls.card_name, this.form.controls.expiry, this.form.controls.cvv];
    if (method === 'CARD') {
      controls[0].setValidators([Validators.required]);
      controls[1].setValidators([Validators.required, Validators.minLength(2)]);
      controls[2].setValidators([Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)]);
      controls[3].setValidators([Validators.required, Validators.pattern(/^[0-9]{3,4}$/)]);
    } else controls.forEach(control => control.clearValidators());
    controls.forEach(control => control.updateValueAndValidity());
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
        if (this.paymentMethod() === 'COD') {
          this.http.post(`${this.api}/orders`, { address_id: addressId, payment_method: 'COD' }).subscribe({
            next: () => this.router.navigate(['/orders']),
            error: error => { this.error = error.error?.message || 'Could not place order.'; this.loading.set(false); }
          });
          return;
        }
        this.http.post<{ success: boolean; checkout_url?: string; message?: string }>(`${this.api}/payments/create-checkout-session`, { address_id: addressId }).subscribe({
          next: response => {
            if (!response.checkout_url) {
              this.error = response.message || 'Could not start card payment.';
              this.loading.set(false);
              return;
            }
            window.location.href = response.checkout_url;
          },
          error: error => { this.error = error.error?.message || 'Could not start card payment.'; this.loading.set(false); }
        });
      },
      error: error => { this.error = error.error?.message || 'Could not save your delivery address.'; this.loading.set(false); }
    });
  }

  private verifyCardPayment(sessionId: string): void {
    this.loading.set(true);
    this.error = '';
    this.http.get<{ success: boolean; message?: string }>(`${this.api}/payments/verify/${encodeURIComponent(sessionId)}`).subscribe({
      next: () => this.router.navigate(['/orders']),
      error: error => { this.error = error.error?.message || 'We could not verify the card payment.'; this.loading.set(false); }
    });
  }
}
