# API Gateway for Order Management System

A Spring Boot REST API Gateway designed for Angular/Frontend integration. This gateway bridges the gap between your frontend and gRPC-based microservices.

## Features

✅ **CORS Enabled** - Ready for Angular (localhost:4200, localhost:3000)
✅ **Input Validation** - Automatic request validation with error messages
✅ **Global Error Handling** - Consistent error responses across all endpoints
✅ **Structured Responses** - All responses follow standard ApiResponse format
✅ **Logging** - Request/response logging for debugging
✅ **Configuration** - Externalized configuration (application.yml)

## API Endpoints

### 1. Create Order (POST)
```
POST /api/orders
Content-Type: application/json

Request Body:
{
  "amount": 150.50
}

Response (Success - 201):
{
  "success": true,
  "data": {
    "orderId": "ORDER-a1b2c3d4-e5f6",
    "status": "APPROVED",
    "amount": 150.50
  },
  "message": "Order created successfully",
  "timestamp": 1715784000000
}

Response (Failure - 200):
{
  "success": true,
  "data": {
    "orderId": "ORDER-x9y8z7w6-v5u4",
    "status": "REJECTED",
    "amount": 150.50
  },
  "message": "Order created successfully",
  "timestamp": 1715784000000
}

Response (Validation Error - 400):
{
  "success": false,
  "message": "Validation failed",
  "error": "VALIDATION_ERROR",
  "timestamp": 1715784000000
}

Response (Service Unavailable - 503):
{
  "success": false,
  "message": "Service temporarily unavailable",
  "error": "SERVICE_UNAVAILABLE",
  "timestamp": 1715784000000
}
```

### 2. Get Order Status (GET)
```
GET /api/orders/{orderId}

Response:
{
  "success": true,
  "data": "ORDER-a1b2c3d4-e5f6",
  "message": "Order ID: ORDER-a1b2c3d4-e5f6",
  "timestamp": 1715784000000
}
```

### 3. Get All Orders (GET)
```
GET /api/orders

Response:
{
  "success": true,
  "data": null,
  "message": "Endpoint for fetching all orders - to be implemented",
  "timestamp": 1715784000000
}
```

## Angular Integration Guide

### 1. Install Angular (if not already done)
```bash
ng new order-management-ui
cd order-management-ui
```

### 2. Create Order Service
```typescript
// src/app/services/order.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  error?: string;
  timestamp: number;
}

interface CreateOrderRequest {
  amount: number;
}

interface CreateOrderResponse {
  orderId: string;
  status: string;
  amount: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:8080/api/orders';

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
```

### 3. Add HttpClientModule to App Module
```typescript
// src/app/app.module.ts
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [
    // ... other imports
    HttpClientModule
  ],
  // ...
})
export class AppModule { }
```

### 4. Create Order Form Component
```typescript
// src/app/components/order-form/order-form.component.ts
import { Component } from '@angular/core';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-order-form',
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.css']
})
export class OrderFormComponent {
  amount: number = 0;
  orderResponse: any = null;
  loading: boolean = false;
  error: string = '';

  constructor(private orderService: OrderService) {}

  submitOrder() {
    if (this.amount <= 0) {
      this.error = 'Amount must be greater than 0';
      return;
    }

    this.loading = true;
    this.error = '';

    this.orderService.createOrder({ amount: this.amount }).subscribe({
      next: (response) => {
        this.orderResponse = response;
        this.loading = false;
        if (response.success) {
          // Order created successfully
          console.log('Order created:', response.data);
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Failed to create order';
        console.error('Error creating order:', err);
      }
    });
  }
}
```

### 5. Create HTML Template
```html
<!-- src/app/components/order-form/order-form.component.html -->
<div class="order-form">
  <h2>Create Order</h2>
  
  <form (ngSubmit)="submitOrder()">
    <div>
      <label for="amount">Amount:</label>
      <input 
        type="number" 
        id="amount" 
        [(ngModel)]="amount" 
        name="amount"
        step="0.01"
        min="0"
        placeholder="Enter order amount"
      />
    </div>

    <button type="submit" [disabled]="loading">
      {{ loading ? 'Creating...' : 'Create Order' }}
    </button>
  </form>

  <div *ngIf="error" class="error">
    {{ error }}
  </div>

  <div *ngIf="orderResponse" class="response">
    <h3>Order Created</h3>
    <p><strong>Order ID:</strong> {{ orderResponse.data.orderId }}</p>
    <p><strong>Status:</strong> {{ orderResponse.data.status }}</p>
    <p><strong>Amount:</strong> ${{ orderResponse.data.amount }}</p>
  </div>
</div>
```

## Configuration

Edit `application.yml` to customize settings:

```yaml
spring:
  application:
    name: api-gateway
  boot:
    webflux:
      base-path: /api

server:
  port: 8080
  servlet:
    context-path: /api

grpc:
  orchestrator:
    host: orchestrator      # Change for local testing
    port: 50054

logging:
  level:
    org.example: DEBUG
```

### For Local Testing:
```yaml
grpc:
  orchestrator:
    host: localhost
    port: 50054
```

## Response Format

All API responses follow this standard format:

```json
{
  "success": boolean,
  "data": T (generic data),
  "message": string,
  "error": string (only on error),
  "timestamp": number (milliseconds)
}
```

## Error Codes

| Code | HTTP Status | Description |
|------|------------|-------------|
| VALIDATION_ERROR | 400 | Request validation failed |
| INVALID_REQUEST | 400 | Invalid request parameters |
| INVALID_ORDER_ID | 400 | Order ID is invalid or empty |
| SERVICE_UNAVAILABLE | 503 | gRPC service is down |
| GRPC_ERROR | 503 | gRPC communication error |
| INTERNAL_ERROR | 500 | Unexpected server error |

## Running the Gateway

```bash
# From the project root
mvn clean install
mvn spring-boot:run -pl api-gateway

# Or
cd api-gateway
mvn spring-boot:run
```

The API will be available at: `http://localhost:8080/api`

## CORS Configuration

Currently configured for:
- `http://localhost:4200` (Angular dev server)
- `http://localhost:3000` (Alternative dev server)

To add more origins, update [CorsConfig.java](CorsConfig.java):

```java
.allowedOrigins("http://localhost:4200", "http://yourdomain.com", "https://production.com")
```

## Future Enhancements

- [ ] Add GET endpoint for order status queries
- [ ] Add GET endpoint for order history
- [ ] Add authentication/authorization (JWT)
- [ ] Add rate limiting
- [ ] Add request/response logging middleware
- [ ] Add API documentation (Swagger/OpenAPI)
- [ ] Add WebSocket support for real-time order updates
- [ ] Add pagination for list endpoints

