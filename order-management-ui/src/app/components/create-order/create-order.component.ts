import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OrderService } from '../../services/order.service';

interface WorkflowStep {
  id: string;
  label: string;
  service: string;
  action: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'compensated';
  icon: string;
  timestamp?: number;
  errorMessage?: string;
}

interface OrderSession {
  orderId: string;
  amount: number;
  sagaFlow: string;
  finalStatus: string;
  workflowSteps: WorkflowStep[];
  createdAt?: number;
}

@Component({
  selector: 'app-create-order',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: 'create-order.component.html',  // ✅ external HTML
  styleUrls: ['create-order.component.css']    // ✅ external CSS
})
export class CreateOrderComponent implements OnInit, OnDestroy {
  amount = 0;
  loading = false;
  error = '';
  currentSession: OrderSession | null = null;

  private destroy$ = new Subject<void>();
  private pollInterval: any;

  constructor(
    private orderService: OrderService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {}

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.pollInterval) clearInterval(this.pollInterval);
  }

  get isFinished(): boolean {
    return this.currentSession?.finalStatus === 'APPROVED' ||
           this.currentSession?.finalStatus === 'REJECTED';
  }

  setAmount(val: number) {
    this.amount = val;
  }

  submitOrder() {
    if (this.amount <= 0) return;
    this.loading = true;
    this.error = '';

    this.orderService.createOrder({ amount: this.amount })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.success && res.data?.orderId) {
            this.currentSession = {
              orderId: res.data.orderId,
              amount: this.amount,
              sagaFlow: 'IN_PROGRESS',
              finalStatus: '',
              workflowSteps: [],
              createdAt: Date.now()
            };
            this.startPolling();
          }
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to create order';
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  private startPolling() {
    if (this.pollInterval) clearInterval(this.pollInterval);

    this.pollInterval = setInterval(() => {
      if (!this.currentSession) return;

      this.orderService.getOrderStatus(this.currentSession.orderId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res) => {
            if (res.success && res.data) {
              this.currentSession!.workflowSteps = res.data.steps || [];
              this.currentSession!.finalStatus = res.data.status || '';
              if (this.isFinished) clearInterval(this.pollInterval);
              this.cdr.detectChanges();
            }
          },
          error: () => {}
        });
    }, 850);
  }

  getProgress(): number {
    if (!this.currentSession?.workflowSteps?.length) return 0;
    const done = this.currentSession.workflowSteps.filter(s =>
      ['completed', 'failed', 'compensated'].includes(s.status)
    ).length;
    return Math.round((done / this.currentSession.workflowSteps.length) * 100);
  }

  getStepIcon(status: string): string {
    const icons: Record<string, string> = {
      pending: '⭕',
      running: '⚡',
      completed: '✅',
      failed: '❌',
      compensated: '🔄'
    };
    return icons[status] ?? '•';
  }

  getStatusText(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  formatTime(ts: number): string {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) {
      return diff + 's ago';
    }
    return new Date(ts).toLocaleTimeString();
  }

  copyOrderId() {
    if (this.currentSession?.orderId) {
      navigator.clipboard.writeText(this.currentSession.orderId);
    }
  }
}