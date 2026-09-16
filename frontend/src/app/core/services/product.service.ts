import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface Category { id: number; name: string; slug: string; }
export interface Product {
  id: number;
  category_id: number;
  category_name?: string;
  name: string;
  slug: string;
  description: string;
  brand: string;
  price: number;
  old_price?: number | null;
  stock: number;
  rating: number;
  image?: string | null;
}
export interface ProductListResponse {
  success: boolean;
  products: Product[];
  pagination?: { page: number; limit: number; total: number; pages: number };
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly api = 'http://localhost:3000/api';
  readonly products = signal<Product[]>([]);
  readonly categories = signal<Category[]>([]);

  constructor(private http: HttpClient) {}

  getProducts(filters: Record<string, string | number | undefined> = {}): Observable<ProductListResponse> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') params = params.set(key, String(value));
    });
    return this.http.get<ProductListResponse>(`${this.api}/products`, { params }).pipe(
      tap((response) => this.products.set(response.products ?? []))
    );
  }

  getProduct(id: number): Observable<{ success: boolean; product: Product }> {
    return this.http.get<{ success: boolean; product: Product }>(`${this.api}/products/${id}`);
  }

  getCategories(): Observable<{ success: boolean; categories: Category[] }> {
    return this.http.get<{ success: boolean; categories: Category[] }>(`${this.api}/categories`).pipe(
      tap((response) => this.categories.set(response.categories ?? []))
    );
  }
}
