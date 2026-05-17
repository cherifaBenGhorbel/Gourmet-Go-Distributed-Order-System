import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { OrderService } from '../../services/order.service';

interface WorkflowData {
  statusCounts: { [key: string]: number };
  totalOrders?: number;
  currentPage?: number;
  pageSize?: number;
  totalOrderPages?: number;
  orders: Array<{ orderId: string; status: string; createdAt: number }>;
  tickets: Array<{ orderId: string; status: string; createdAt: number }>;
  payments: Array<{ orderId: string; amount: number; authorized: boolean; createdAt: number }>;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dash-page">

      <!-- Page header -->
      <div class="page-header">
        <div class="page-header-inner">
          <div>
            <h2 class="page-title">Workflow Dashboard</h2>
            <p class="page-sub">Real-time overview of all saga activity</p>
          </div>
          <button class="refresh-btn" (click)="loadWorkflow()" [disabled]="loading">
            <span [class.spinning]="loading">↻</span>
            {{ loading ? 'Syncing...' : 'Refresh' }}
          </button>
        </div>
      </div>

      <div class="dash-content">

        <!-- Error -->
        <div *ngIf="error" class="error-bar">
          ⚠️ {{ error }}
          <button (click)="error=''" class="close-err">✕</button>
        </div>

        <!-- Loading -->
        <div *ngIf="loading && !workflow" class="loading-block">
          <div class="spinner-lg"></div>
          <p>Connecting to saga engine…</p>
        </div>

        <!-- Data -->
        <ng-container *ngIf="workflow && !loading">

          <!-- Stats -->
          <div class="stats-grid">
            <div class="stat-card" *ngFor="let s of topStats">
              <div class="stat-emoji">{{ s.icon }}</div>
              <div>
                <div class="stat-num">{{ s.value }}</div>
                <div class="stat-label">{{ s.label }}</div>
              </div>
            </div>
          </div>

          <!-- Tables -->
          <div class="tables-grid">

            <!-- Orders -->
            <div class="table-card">
              <div class="table-header">
                <span class="table-icon">📦</span>
                <h3>Orders</h3>
                <span class="badge">{{ totalOrdersCount }}</span>
              </div>
              <div class="table-body">
                <table *ngIf="workflow.orders.length">
                  <thead><tr><th>Order ID</th><th>Status</th><th>Time</th></tr></thead>
                  <tbody>
                    <tr *ngFor="let o of workflow.orders">
                      <td class="mono">{{ o.orderId }}</td>
                      <td><span class="pill" [ngClass]="getStatusClass(o.status)">{{ o.status }}</span></td>
                      <td class="ts">{{ formatTime(o.createdAt) }}</td>
                    </tr>
                  </tbody>
                </table>
                <div *ngIf="!workflow.orders.length" class="no-rows">No orders yet</div>

                <div class="pager" *ngIf="totalPages > 1">
                  <button class="pager-btn" (click)="prevPage()" [disabled]="loading || page <= 0">Previous</button>
                  <span class="pager-info">Page {{ page + 1 }} / {{ totalPages }}</span>
                  <button class="pager-btn" (click)="nextPage()" [disabled]="loading || page + 1 >= totalPages">Next</button>
                </div>
              </div>
            </div>

          </div>
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&display=swap');

    :host {
      --red:    #e8382b;
      --orange: #f97316;
      --yellow: #fbbf24;
      --green:  #16a34a;
      --cream:  #fffbf5;
      --ink:    #1a0a00;
      --muted:  #7c6a5a;
      font-family: 'Nunito', sans-serif;
    }

    .dash-page { min-height: calc(100vh - 68px); background: var(--cream); }

    /* Page header */
    .page-header {
      background: linear-gradient(100deg, var(--red) 0%, var(--orange) 100%);
      padding: 36px 32px;
    }
    .page-header-inner {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .page-title {
      font-family: 'Fredoka One', cursive;
      font-size: 2.4rem;
      color: #fff;
      text-shadow: 2px 3px 0 rgba(0,0,0,.18);
    }
    .page-sub { color: rgba(255,255,255,.85); font-weight: 600; margin-top: 4px; }

    .refresh-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 26px;
      background: rgba(255,255,255,.18);
      border: 2px solid rgba(255,255,255,.4);
      border-radius: 14px;
      color: #fff;
      font-family: 'Nunito', sans-serif;
      font-weight: 800;
      font-size: 1rem;
      cursor: pointer;
      transition: all .2s;
    }
    .refresh-btn:hover:not(:disabled) { background: rgba(255,255,255,.3); }
    .refresh-btn:disabled { opacity: .6; cursor: not-allowed; }
    .spinning { display: inline-block; animation: spin .6s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Content */
    .dash-content { max-width: 1400px; margin: 0 auto; padding: 32px; }

    .error-bar {
      background: #fef2f2;
      border: 1.5px solid #fca5a5;
      border-radius: 14px;
      padding: 14px 20px;
      color: #b91c1c;
      font-weight: 700;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .close-err { background: none; border: none; font-size: 1.1rem; cursor: pointer; color: #b91c1c; }

    .loading-block {
      text-align: center;
      padding: 80px 32px;
      color: var(--muted);
      font-weight: 700;
    }

    .spinner-lg {
      width: 56px; height: 56px;
      border: 5px solid #e5e1da;
      border-top-color: var(--orange);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    /* Stats */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 20px;
      margin-bottom: 28px;
    }

    .stat-card {
      background: #fff;
      border: 1.5px solid rgba(26,10,0,.07);
      border-radius: 20px;
      padding: 24px 28px;
      display: flex;
      align-items: center;
      gap: 20px;
      box-shadow: 0 2px 12px rgba(26,10,0,.05);
      transition: transform .2s, box-shadow .2s;
    }
    .stat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(26,10,0,.1); }

    .stat-emoji { font-size: 2.6rem; }
    .stat-num { font-family: 'Fredoka One', cursive; font-size: 2.5rem; color: var(--ink); line-height: 1; }
    .stat-label { font-size: .85rem; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: .4px; margin-top: 4px; }

    /* Tables */
    .tables-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 24px;
    }

    .table-card {
      background: #fff;
      border: 1.5px solid rgba(26,10,0,.07);
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 2px 12px rgba(26,10,0,.05);
    }

    .table-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 18px 24px;
      border-bottom: 2px dashed rgba(26,10,0,.07);
      background: #fffaf5;
    }
    .table-icon { font-size: 1.35rem; }
    .table-header h3 { font-family: 'Fredoka One', cursive; font-size: 1.2rem; color: var(--ink); flex: 1; margin: 0; }
    .badge {
      background: var(--orange);
      color: #fff;
      font-size: .78rem;
      font-weight: 800;
      padding: 3px 12px;
      border-radius: 50px;
    }

    .table-body { overflow-x: auto; }

    table { width: 100%; border-collapse: collapse; }

    th {
      text-align: left;
      padding: 12px 18px;
      font-size: .75rem;
      font-weight: 800;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: .5px;
      background: #fffaf5;
    }

    td {
      padding: 14px 18px;
      border-top: 1px solid #f0ebe2;
      font-weight: 600;
      font-size: .9rem;
      color: var(--ink);
    }

    tr:hover td { background: #fffaf5; }

    .mono { font-family: ui-monospace, monospace; font-size: .85rem; color: var(--muted); }
    .ts   { color: var(--muted); font-size: .85rem; }
    .amount-cell { font-family: 'Fredoka One', cursive; font-size: 1rem; color: var(--orange); }

    .pill {
      display: inline-block;
      padding: 4px 14px;
      border-radius: 50px;
      font-size: .75rem;
      font-weight: 800;
      letter-spacing: .3px;
    }
    .pill.success { background: #dcfce7; color: var(--green); }
    .pill.danger  { background: #fef2f2; color: var(--red); }
    .pill.warning { background: #fff3e0; color: var(--orange); }
    .pill.neutral { background: #f0ebe2; color: var(--muted); }

    .no-rows { padding: 48px; text-align: center; color: var(--muted); font-weight: 600; font-style: italic; }

    .pager {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 16px;
      border-top: 1px solid #f0ebe2;
      background: #fffaf5;
    }

    .pager-btn {
      padding: 8px 14px;
      border: 1px solid #e5e1da;
      border-radius: 10px;
      background: #fff;
      font-weight: 700;
      cursor: pointer;
    }

    .pager-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .pager-info {
      font-size: .85rem;
      font-weight: 800;
      color: var(--muted);
    }

    @media (max-width: 900px) {
      .tables-grid { grid-template-columns: 1fr; }
      .full-width { grid-column: auto; }
      .dash-content { padding: 20px; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  workflow: WorkflowData | null = null;
  loading = false;
  error = '';
  topStats: any[] = [];
  page = 0;
  readonly pageSize = 10;

  get totalOrdersCount(): number {
    if (!this.workflow) return 0;
    return this.workflow.totalOrders ?? this.workflow.orders.length ?? 0;
  }

  get totalPages(): number {
    if (!this.workflow) return 0;
    if ((this.workflow.totalOrderPages ?? 0) > 0) {
      return this.workflow.totalOrderPages as number;
    }
    const total = this.totalOrdersCount;
    const size = this.workflow.pageSize ?? this.pageSize;
    return size > 0 ? Math.ceil(total / size) : 0;
  }

  constructor(private orderService: OrderService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.loadWorkflow(0); }

  loadWorkflow(page = this.page) {
    this.page = Math.max(0, page);
    this.loading = true;
    this.error = '';
    this.orderService.getWorkflowOverview(this.page, this.pageSize).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success && res.data) {
          this.workflow = res.data;
          this.page = res.data.currentPage ?? this.page;
          this.processStats();
        } else {
          this.error = res.message || 'Failed to load data';
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.error = 'Unable to connect to server';
        this.cdr.markForCheck();
      }
    });
  }

  private processStats() {
    if (!this.workflow) return;

    this.topStats = [
      { icon: '📦', label: 'Total Orders',  value: this.totalOrdersCount },
      { icon: '✅', label: 'Approved',       value: this.workflow.statusCounts['APPROVED'] || 0 },
      { icon: '❌', label: 'Rejected',       value: this.workflow.statusCounts['REJECTED'] || 0 }
    ];
  }

  prevPage() {
    if (this.page > 0) {
      this.loadWorkflow(this.page - 1);
    }
  }

  nextPage() {
    if (this.page + 1 < this.totalPages) {
      this.loadWorkflow(this.page + 1);
    }
  }

  getStatusClass(s: string) {
    if (s === 'APPROVED') return 'success';
    if (s === 'REJECTED') return 'danger';
    return 'neutral';
  }

  formatTime(ts: number) {
    return ts ? new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';
  }
}