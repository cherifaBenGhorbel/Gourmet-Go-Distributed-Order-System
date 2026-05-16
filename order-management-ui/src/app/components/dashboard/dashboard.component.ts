import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="workflow-page">
      <div class="hero">
        <div>
          <p class="eyebrow">Saga architecture</p>
          <h2>Workflow Tables</h2>
          <p class="subcopy">This view surfaces the order, kitchen, and accounting read models side by side so the distributed flow is visible at a glance.</p>
        </div>
        <button class="refresh-btn" (click)="loadWorkflow()" [disabled]="loading">{{ loading ? 'Refreshing...' : 'Refresh' }}</button>
      </div>

      <div *ngIf="error" class="alert-error">{{ error }}</div>
      <div *ngIf="loading" class="loading">Loading workflow data...</div>

      <div *ngIf="workflow && !loading" class="workflow-grid">
        <section class="panel summary-panel">
          <h3>Saga Status</h3>
          <div class="counts">
            <div *ngFor="let key of statusKeys" class="count-box">
              <div class="count">{{ workflow.statusCounts[key] || 0 }}</div>
              <div class="label">{{ key }}</div>
            </div>
          </div>
        </section>

        <section class="panel table-panel">
          <h3>Orders Table</h3>
          <table>
            <thead>
              <tr><th>Order ID</th><th>Status</th><th>Created At</th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let row of workflow.orders">
                <td>{{ row.orderId }}</td>
                <td><span class="pill">{{ row.status }}</span></td>
                <td>{{ formatTimestamp(row.createdAt) }}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section class="panel table-panel">
          <h3>Tickets Table</h3>
          <table>
            <thead>
              <tr><th>Order ID</th><th>Status</th><th>Created At</th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let row of workflow.tickets">
                <td>{{ row.orderId }}</td>
                <td><span class="pill pill-soft">{{ row.status }}</span></td>
                <td>{{ formatTimestamp(row.createdAt) }}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section class="panel table-panel">
          <h3>Accounting Table</h3>
          <table>
            <thead>
              <tr><th>Order ID</th><th>Amount</th><th>Authorized</th><th>Created At</th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let row of workflow.payments">
                <td>{{ row.orderId }}</td>
                <td>{{ row.amount | number:'1.2-2' }}</td>
                <td><span class="pill" [class.pill-yes]="row.authorized" [class.pill-no]="!row.authorized">{{ row.authorized ? 'YES' : 'NO' }}</span></td>
                <td>{{ formatTimestamp(row.createdAt) }}</td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>
    </div>
  `,
  styles: [
    `
    .workflow-page { display:flex; flex-direction:column; gap:20px; max-width:1200px; margin:0 auto; }
    .hero { display:flex; justify-content:space-between; align-items:flex-start; gap:16px; padding:24px; border-radius:20px; background:linear-gradient(135deg,#10182f 0%,#1d2b53 45%,#263b7f 100%); color:white; box-shadow:0 18px 36px rgba(15,23,42,0.22); }
    .eyebrow { margin:0 0 8px; text-transform:uppercase; letter-spacing:0.16em; font-size:12px; opacity:0.75; }
    .hero h2 { margin:0; font-size:34px; }
    .subcopy { margin:10px 0 0; max-width:760px; color:rgba(255,255,255,0.82); }
    .refresh-btn { border:none; border-radius:999px; padding:12px 18px; background:#f6f7fb; color:#14213d; font-weight:700; cursor:pointer; }
    .workflow-grid { display:grid; gap:18px; }
    .panel { background:white; border-radius:18px; padding:22px; box-shadow:0 10px 24px rgba(15,23,42,0.08); }
    .summary-panel .counts { display:grid; grid-template-columns:repeat(auto-fit,minmax(130px,1fr)); gap:12px; }
    .count-box { background:linear-gradient(180deg,#f4f7ff 0%,#edf3ff 100%); padding:14px; border-radius:14px; text-align:center; }
    .count { font-size:24px; font-weight:800; color:#1d2b53; }
    .label { font-size:12px; color:#5f6b86; text-transform:uppercase; letter-spacing:0.08em; }
    .table-panel table { width:100%; border-collapse:collapse; }
    .table-panel th, .table-panel td { padding:12px 10px; text-align:left; border-bottom:1px solid #eef1f8; vertical-align:top; }
    .table-panel th { font-size:12px; text-transform:uppercase; letter-spacing:0.08em; color:#667085; }
    .pill { display:inline-flex; align-items:center; padding:6px 10px; border-radius:999px; background:#e9eefc; color:#1d2b53; font-size:12px; font-weight:700; }
    .pill-soft { background:#eef5ef; color:#23613f; }
    .pill-yes { background:#e8f7ee; color:#0f7a41; }
    .pill-no { background:#fdecec; color:#b42318; }
    .loading { color:#667085; }
    .alert-error { color:#b42318; background:#fdecec; padding:12px 14px; border-radius:12px; }
    @media (max-width: 900px) {
      .hero { flex-direction:column; }
      .table-panel { overflow-x:auto; }
      .table-panel table { min-width:700px; }
    }
    `
  ]
})
export class DashboardComponent implements OnInit {
  workflow: any = null;
  loading = false;
  error = '';
  statusKeys: string[] = [];

  constructor(private orderService: OrderService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadWorkflow();
  }

  formatTimestamp(timestamp: number): string {
    return timestamp ? new Date(timestamp).toLocaleString() : 'N/A';
  }

  loadWorkflow() {
    this.loading = true;
    this.error = '';
    this.orderService.getWorkflowOverview().subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.workflow = res.data;
          this.statusKeys = Object.keys(this.workflow.statusCounts || {});
        } else {
          this.error = res.message || 'Failed to load dashboard';
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Failed to load dashboard';
        this.cdr.detectChanges();
      }
    });
  }
}
