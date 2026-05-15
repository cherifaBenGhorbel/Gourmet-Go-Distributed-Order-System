import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  error?: string;
  timestamp: number;
}

export interface CreateOrderRequest {
  amount: number;
}

export interface CreateOrderResponse {
  orderId: string;
  status: string;
  amount: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = '/api/orders';

  constructor(private http: HttpClient) {}

  createOrder(request: CreateOrderRequest): Observable<ApiResponse<CreateOrderResponse>> {
    return this.http.post<ApiResponse<CreateOrderResponse>>(this.apiUrl, request);
  }

  getOrderStatus(orderId: string): Observable<ApiResponse<string>> {
    return this.http.get<ApiResponse<string>>(`${this.apiUrl}/${orderId}`);
  }

  getAllOrders(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.apiUrl);
  }
}
