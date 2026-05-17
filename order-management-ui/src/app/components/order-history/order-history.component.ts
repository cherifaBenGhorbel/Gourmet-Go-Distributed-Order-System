import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="history-page">

      <div class="page-header">
        <div class="page-header-inner">
          <div>
            <h2 class="page-title">Order History</h2>
            <p class="page-sub">Look up any order by its ID</p>
          </div>
        </div>
      </div>

      <div class="search-area">

        <div class="search-card">
          <div class="search-icon-wrap">🔎</div>
          <h3>Find Your Order</h3>
          <p class="search-hint">Enter the Order ID you received after placing your order</p>

          <div class="search-row">
            <input
              type="text"
              [(ngModel)]="searchOrderId"
              placeholder="e.g. ORD-123456"
              class="search-input"
              (keydown.enter)="searchOrder()"
            />
            <button class="search-btn" (click)="searchOrder()"
                    [disabled]="loading || !searchOrderId?.trim()">
              <span *ngIf="loading" class="btn-spin"></span>
              <span *ngIf="!loading">Search</span>
            </button>
          </div>

          <div *ngIf="error" class="error-toast">⚠️ {{ error }}</div>
        </div>

        <!-- Result -->
        <div *ngIf="orderStatus && !loading" class="result-card">

          <div class="result-top">
            <div class="result-icon">📋</div>
            <div>
              <h4>Order Found</h4>
              <code class="order-id-mono">{{ orderStatus.data?.orderId }}</code>
            </div>
            <span class="result-status-pill"
                  [ngClass]="getStatusClass(orderStatus.data?.status)">
              {{ orderStatus.data?.status || 'Unknown' }}
            </span>
          </div>

          <div class="result-details">
            <div class="detail-tile">
              <span class="detail-label">Last Event</span>
              <span class="detail-value">{{ orderStatus.data?.lastEvent || 'N/A' }}</span>
            </div>
            <div class="detail-tile">
              <span class="detail-label">Retrieved At</span>
              <span class="detail-value">{{ formatTimestamp(orderStatus.timestamp) }}</span>
            </div>
          </div>

        </div>

        <!-- Initial state -->
        <div *ngIf="!searchPerformed && !loading && !error" class="initial-hint">
          <p>🍽️ Your order saga details will appear here</p>
        </div>

      </div>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&display=swap');

    :host {
      --red:    #e8382b;
      --orange: #f97316;
      --green:  #16a34a;
      --cream:  #fffbf5;
      --ink:    #1a0a00;
      --muted:  #7c6a5a;
      font-family: 'Nunito', sans-serif;
    }

    .history-page { min-height: calc(100vh - 68px); background: var(--cream); }

    /* Page header */
    .page-header {
      background: linear-gradient(100deg, var(--red) 0%, var(--orange) 100%);
      padding: 36px 32px;
    }
    .page-header-inner { max-width: 720px; margin: 0 auto; }
    .page-title {
      font-family: 'Fredoka One', cursive;
      font-size: 2.4rem;
      color: #fff;
      text-shadow: 2px 3px 0 rgba(0,0,0,.18);
    }
    .page-sub { color: rgba(255,255,255,.85); font-weight: 600; margin-top: 4px; }

    /* Search area */
    .search-area {
      max-width: 720px;
      margin: 0 auto;
      padding: 32px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .search-card {
      background: #fff;
      border: 1.5px solid rgba(26,10,0,.07);
      border-radius: 24px;
      padding: 36px 36px 32px;
      box-shadow: 0 4px 24px rgba(26,10,0,.07);
      text-align: center;
    }

    .search-icon-wrap {
      font-size: 3.5rem;
      margin-bottom: 12px;
    }

    .search-card h3 {
      font-family: 'Fredoka One', cursive;
      font-size: 1.8rem;
      color: var(--ink);
      margin-bottom: 6px;
    }

    .search-hint { color: var(--muted); font-weight: 600; margin-bottom: 24px; font-size: .95rem; }

    .search-row {
      display: flex;
      gap: 12px;
    }

    .search-input {
      flex: 1;
      padding: 16px 20px;
      border: 2.5px solid #e5e1da;
      border-radius: 14px;
      font-family: 'Nunito', sans-serif;
      font-size: 1rem;
      font-weight: 700;
      color: var(--ink);
      background: #fffaf5;
      outline: none;
      transition: border-color .2s, box-shadow .2s;
    }
    .search-input::placeholder { color: #c4b8ae; }
    .search-input:focus { border-color: var(--orange); box-shadow: 0 0 0 4px rgba(249,115,22,.12); }

    .search-btn {
      padding: 16px 32px;
      background: linear-gradient(135deg, var(--red) 0%, var(--orange) 100%);
      color: #fff;
      font-family: 'Fredoka One', cursive;
      font-size: 1.1rem;
      border: none;
      border-radius: 14px;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(232,56,43,.28);
      transition: transform .15s, box-shadow .15s;
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 110px;
      justify-content: center;
    }
    .search-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(232,56,43,.35); }
    .search-btn:disabled { opacity: .6; cursor: not-allowed; }

    .btn-spin {
      width: 20px; height: 20px;
      border: 3px solid rgba(255,255,255,.4);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin .8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .error-toast {
      margin-top: 16px;
      padding: 14px 18px;
      background: #fef2f2;
      border: 1.5px solid #fca5a5;
      border-radius: 12px;
      color: #b91c1c;
      font-weight: 700;
      font-size: .9rem;
    }

    /* Result card */
    .result-card {
      background: #fff;
      border: 1.5px solid rgba(26,10,0,.07);
      border-radius: 24px;
      padding: 28px 32px;
      box-shadow: 0 4px 24px rgba(26,10,0,.07);
    }

    .result-top {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }

    .result-icon { font-size: 2.5rem; }

    .result-top h4 {
      font-family: 'Fredoka One', cursive;
      font-size: 1.3rem;
      color: var(--ink);
      margin-bottom: 4px;
    }

    .order-id-mono {
      font-family: ui-monospace, monospace;
      font-size: .85rem;
      color: var(--muted);
      background: #f5f0e8;
      padding: 3px 10px;
      border-radius: 6px;
    }

    .result-status-pill {
      margin-left: auto;
      padding: 8px 22px;
      border-radius: 50px;
      font-weight: 800;
      font-size: .9rem;
    }
    .result-status-pill.success { background: #dcfce7; color: var(--green); }
    .result-status-pill.danger  { background: #fef2f2; color: var(--red); }
    .result-status-pill.warning { background: #fff3e0; color: var(--orange); }

    .result-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .detail-tile {
      background: #fffaf5;
      border: 1.5px solid #e5e1da;
      border-radius: 14px;
      padding: 16px 20px;
    }

    .detail-label {
      display: block;
      font-size: .75rem;
      font-weight: 800;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: .5px;
      margin-bottom: 6px;
    }

    .detail-value {
      font-weight: 700;
      color: var(--ink);
      font-size: .95rem;
    }

    /* Initial hint */
    .initial-hint {
      text-align: center;
      padding: 32px;
      color: var(--muted);
      font-weight: 600;
      font-size: 1rem;
    }

    @media (max-width: 600px) {
      .search-area { padding: 20px; }
      .search-card { padding: 24px 20px; }
      .result-details { grid-template-columns: 1fr; }
    }
  `]
})
export class OrderHistoryComponent {
  searchOrderId: string = '';
  orderStatus: any = null;
  loading: boolean = false;
  error: string = '';
  searchPerformed: boolean = false;

  constructor(private orderService: OrderService, private cdr: ChangeDetectorRef) {}

  formatTimestamp(ts: number) { return ts ? new Date(ts).toLocaleString() : 'N/A'; }

  getStatusClass(status: string) {
    if (status === 'APPROVED') return 'success';
    if (status === 'REJECTED') return 'danger';
    return 'warning';
  }

  searchOrder() {
    if (!this.searchOrderId.trim()) { this.error = 'Please enter an Order ID'; return; }
    this.loading = true;
    this.error = '';
    this.searchPerformed = true;
    this.orderStatus = null;

    this.orderService.getOrderStatus(this.searchOrderId).subscribe({
      next: (res) => {
        this.loading = false;
        this.orderStatus = res;
        if (!res.success) this.error = 'Order not found';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Failed to fetch order status';
        this.cdr.detectChanges();
      }
    });
  }
}