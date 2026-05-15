import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-create-order',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="order-form-container">
      <div class="form-card">
        <h2>Create New Order</h2>
        
        <form (ngSubmit)="submitOrder()" #orderForm="ngForm">
          <div class="form-group">
            <label for="amount">Order Amount ($):</label>
            <input 
              type="number" 
              id="amount" 
              [(ngModel)]="amount" 
              name="amount"
              step="0.01"
              min="0"
              placeholder="Enter order amount"
              required
            />
          </div>

          <button 
            type="submit" 
            [disabled]="loading || amount <= 0"
            class="btn-submit"
          >
            {{ loading ? 'Creating Order...' : 'Create Order' }}
          </button>
        </form>

        <div *ngIf="error" class="alert alert-error">
          <strong>Error:</strong> {{ error }}
        </div>

        <div *ngIf="orderResponse && orderResponse.success" class="alert alert-success">
          <h3>✓ Order Created Successfully!</h3>
          <p><strong>Order ID:</strong> {{ orderResponse.data.orderId }}</p>
          <p><strong>Status:</strong> 
            <span [ngClass]="'status-' + orderResponse.data.status.toLowerCase()">
              {{ orderResponse.data.status }}
            </span>
          </p>
          <p><strong>Amount:</strong> &#36;{{ orderResponse.data.amount | number:'1.2-2' }}</p>
        </div>

        <div *ngIf="orderResponse && !orderResponse.success" class="alert alert-warning">
          <h3>⚠ Order Processing</h3>
          <p><strong>Order ID:</strong> {{ orderResponse.data.orderId }}</p>
          <p><strong>Status:</strong> {{ orderResponse.data.status }}</p>
          <p><strong>Amount:</strong> &#36;{{ orderResponse.data.amount | number:'1.2-2' }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .order-form-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .form-card {
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      max-width: 500px;
      width: 100%;
    }

    h2 {
      color: #333;
      margin-bottom: 30px;
      text-align: center;
      font-size: 28px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      margin-bottom: 8px;
      color: #555;
      font-weight: 500;
    }

    input[type="number"] {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 16px;
      transition: border-color 0.3s;
    }

    input[type="number"]:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 5px rgba(102, 126, 234, 0.1);
    }

    .btn-submit {
      width: 100%;
      padding: 12px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.3s;
    }

    .btn-submit:hover:not(:disabled) {
      background: #764ba2;
    }

    .btn-submit:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .alert {
      margin-top: 20px;
      padding: 15px;
      border-radius: 4px;
      animation: slideIn 0.3s ease-in;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .alert-error {
      background-color: #fee;
      color: #c33;
      border: 1px solid #fcc;
    }

    .alert-success {
      background-color: #efe;
      color: #3c3;
      border: 1px solid #cfc;
    }

    .alert-warning {
      background-color: #ffe;
      color: #ca0;
      border: 1px solid #fdb;
    }

    .alert h3 {
      margin-top: 0;
      margin-bottom: 10px;
    }

    .alert p {
      margin: 8px 0;
    }

    .status-approved {
      color: #3c3;
      font-weight: bold;
    }

    .status-rejected {
      color: #c33;
      font-weight: bold;
    }

    .status-pending_kitchen {
      color: #ca0;
      font-weight: bold;
    }
  `]
})
export class CreateOrderComponent {
  amount: number = 0;
  orderResponse: any = null;
  loading: boolean = false;
  error: string = '';

  constructor(
    private orderService: OrderService,
    private cdr: ChangeDetectorRef
  ) {}

  submitOrder() {
    if (this.amount <= 0) {
      this.error = 'Amount must be greater than 0';
      return;
    }

    this.loading = true;
    this.error = '';
    this.orderResponse = null;

    this.orderService.createOrder({ amount: this.amount }).subscribe({
      next: (response) => {
        this.loading = false;
        this.orderResponse = response;
        this.cdr.detectChanges();
        
        if (response.success) {
          console.log('Order created successfully:', response.data);
          // Reset form after successful submission
          setTimeout(() => {
            this.amount = 0;
            this.orderResponse = null;
            this.cdr.detectChanges();
          }, 3000);
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Failed to create order. Please try again.';
        this.cdr.detectChanges();
        console.error('Error creating order:', err);
      }
    });
  }
}
