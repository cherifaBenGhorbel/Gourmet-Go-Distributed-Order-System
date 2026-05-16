import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../services/order.service';

interface WorkflowStep {
  id: string;
  label: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  icon: string;
}

interface OrderSession {
  orderId: string;
  amount: number;
  scenario: 'happy' | 'compensation';
  currentStep: number;
  workflowSteps: WorkflowStep[];
  finalStatus: string;
}

@Component({
  selector: 'app-create-order',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="create-order-container">
      <!-- Header Section -->
      <div class="header-section">
        <div class="header-content">
          <h1>🍽️ Gourmet-Go Order Management</h1>
          <p>Saga Orchestration - Distributed Order System</p>
        </div>
      </div>

      <div class="main-container">
        <!-- Scenario Selection & Form Section -->
        <div class="left-panel">
          <div class="card scenario-card">
            <h2>Test Scenario</h2>
            <p class="instruction-text">Select a test scenario to demonstrate the Saga pattern:</p>
            
            <div class="scenario-buttons">
              <button 
                class="scenario-btn" 
                [class.active]="selectedScenario === 'happy'"
                (click)="selectScenario('happy')"
                [disabled]="loading"
              >
                <span class="scenario-icon">✅</span>
                <span class="scenario-name">Happy Path</span>
                <span class="scenario-desc">All services succeed → APPROVED</span>
              </button>

              <button 
                class="scenario-btn" 
                [class.active]="selectedScenario === 'compensation'"
                (click)="selectScenario('compensation')"
                [disabled]="loading"
              >
                <span class="scenario-icon">❌</span>
                <span class="scenario-name">Compensation Path</span>
                <span class="scenario-desc">Payment rejected → ROLLBACK</span>
              </button>
            </div>
          </div>

          <div class="card order-form-card">
            <h2>Create Order</h2>
            
            <form (ngSubmit)="submitOrder()" #orderForm="ngForm">
              <div class="form-group">
                <label for="amount">Order Amount ($):</label>
                <div class="input-wrapper">
                  <span class="currency">$</span>
                  <input 
                    type="number" 
                    id="amount" 
                    [(ngModel)]="amount" 
                    name="amount"
                    step="0.01"
                    min="1"
                    placeholder="Enter order amount"
                    required
                    [disabled]="loading"
                  />
                </div>
                <small class="form-hint">
                  Tip: Use amount ≥ $1000 for testing edge cases
                </small>
              </div>

              <button 
                type="submit" 
                [disabled]="loading || amount <= 0 || !selectedScenario"
                class="btn-primary btn-lg"
              >
                <span *ngIf="!loading" class="btn-icon">🚀</span>
                {{ loading ? 'Processing Order...' : 'Create & Execute Order' }}
              </button>
            </form>

            <div *ngIf="error" class="alert alert-error">
              <strong>⚠️ Error:</strong> {{ error }}
            </div>
          </div>
        </div>

        <!-- Workflow Timeline Section -->
        <div class="right-panel">
          <div class="card timeline-card">
            <h2>Saga Workflow Timeline</h2>
            <p class="instruction-text" *ngIf="!currentSession">
              Create an order to see the workflow execution
            </p>

            <div *ngIf="currentSession" class="workflow-container">
              <!-- Order Info -->
              <div class="order-info">
                <div class="info-item">
                  <span class="label">Order ID:</span>
                  <span class="value">{{ currentSession.orderId }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Amount:</span>
                  <span class="value">\${{ currentSession.amount | number:'1.2-2' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Scenario:</span>
                  <span class="value scenario-tag" [class]="currentSession.scenario">
                    {{ currentSession.scenario === 'happy' ? '✅ Happy Path' : '❌ Compensation' }}
                  </span>
                </div>
              </div>

              <!-- Timeline -->
              <div class="timeline">
                <div 
                  *ngFor="let step of currentSession.workflowSteps; let i = index"
                  class="timeline-step"
                  [class]="'step-' + step.status"
                  [class.current]="currentSession.currentStep === i"
                >
                  <div class="step-marker">
                    <div class="step-number">{{ i + 1 }}</div>
                  </div>
                  
                  <div class="step-content">
                    <h3 class="step-label">{{ step.label }}</h3>
                    <p class="step-description">{{ step.description }}</p>
                    
                    <span class="step-status" [class]="'status-' + step.status">
                      {{ getStatusLabel(step.status) }}
                    </span>
                  </div>

                  <div class="step-icon">{{ step.icon }}</div>
                </div>
              </div>

              <!-- Final Result -->
              <div 
                *ngIf="currentSession.finalStatus" 
                class="final-result" 
                [class]="'result-' + currentSession.finalStatus.toLowerCase()"
              >
                <div class="result-content">
                  <h3>
                    {{ currentSession.finalStatus === 'APPROVED' ? '✅ ORDER APPROVED' : '❌ ORDER REJECTED' }}
                  </h3>
                  <p class="result-description">
                    {{ currentSession.finalStatus === 'APPROVED' 
                      ? 'All services executed successfully. Order is ready for fulfillment.'
                      : 'Payment authorization failed. Compensation logic triggered. Kitchen ticket cancelled.' }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .create-order-container {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding-bottom: 40px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    }

    .header-section {
      background: rgba(0, 0, 0, 0.15);
      padding: 40px 20px;
      text-align: center;
      color: white;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .header-content h1 {
      font-size: 36px;
      margin: 0 0 10px 0;
      font-weight: 700;
      letter-spacing: -0.5px;
    }

    .header-content p {
      font-size: 16px;
      margin: 0;
      opacity: 0.9;
    }

    .main-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      max-width: 1400px;
      margin: 40px auto;
      padding: 0 20px;
    }

    @media (max-width: 1024px) {
      .main-container {
        grid-template-columns: 1fr;
      }
    }

    .card {
      background: white;
      border-radius: 12px;
      padding: 32px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
      animation: fadeInUp 0.5s ease-out;
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .card h2 {
      font-size: 24px;
      color: #222;
      margin: 0 0 16px 0;
      font-weight: 600;
    }

    .instruction-text {
      color: #666;
      font-size: 14px;
      margin: 0 0 20px 0;
    }

    /* Scenario Card */
    .scenario-card {
      margin-bottom: 24px;
    }

    .scenario-buttons {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .scenario-btn {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      padding: 16px;
      border: 2px solid #ddd;
      border-radius: 8px;
      background: white;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .scenario-btn:hover:not(:disabled) {
      border-color: #667eea;
      background: rgba(102, 126, 234, 0.05);
    }

    .scenario-btn.active {
      border-color: #667eea;
      background: rgba(102, 126, 234, 0.1);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
    }

    .scenario-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .scenario-icon {
      font-size: 28px;
      margin-bottom: 8px;
    }

    .scenario-name {
      font-weight: 600;
      color: #222;
      font-size: 16px;
      margin-bottom: 4px;
    }

    .scenario-desc {
      font-size: 12px;
      color: #999;
    }

    /* Form Styles */
    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      color: #333;
      font-weight: 600;
      font-size: 14px;
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .currency {
      position: absolute;
      left: 12px;
      color: #999;
      font-weight: 600;
      pointer-events: none;
    }

    input[type="number"] {
      width: 100%;
      padding: 12px 12px 12px 28px;
      border: 2px solid #ddd;
      border-radius: 6px;
      font-size: 16px;
      transition: all 0.3s;
      font-family: inherit;
    }

    input[type="number"]:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    input[type="number"]:disabled {
      background: #f5f5f5;
      color: #999;
    }

    .form-hint {
      display: block;
      margin-top: 6px;
      color: #999;
      font-size: 12px;
    }

    /* Buttons */
    .btn-primary {
      width: 100%;
      padding: 14px;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .btn-lg {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-lg:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
    }

    .btn-lg:disabled {
      background: #ddd;
      color: #999;
      cursor: not-allowed;
      transform: none;
    }

    .btn-icon {
      font-size: 18px;
    }

    /* Alerts */
    .alert {
      padding: 16px;
      border-radius: 6px;
      margin-top: 16px;
      font-size: 14px;
      line-height: 1.5;
    }

    .alert-error {
      background: #fee;
      color: #c33;
      border: 1px solid #fcc;
    }

    .alert strong {
      font-weight: 600;
    }

    /* Timeline Card */
    .timeline-card {
      min-height: 600px;
    }

    .order-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 28px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .info-item .label {
      font-size: 12px;
      color: #999;
      font-weight: 600;
      text-transform: uppercase;
    }

    .info-item .value {
      font-size: 16px;
      color: #222;
      font-weight: 600;
      word-break: break-all;
    }

    .scenario-tag {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }

    .scenario-tag.happy {
      background: #efe;
      color: #3c3;
    }

    .scenario-tag.compensation {
      background: #fee;
      color: #c33;
    }

    /* Timeline */
    .timeline {
      position: relative;
      padding: 0;
      margin-bottom: 28px;
    }

    .timeline-step {
      display: flex;
      gap: 20px;
      margin-bottom: 24px;
      position: relative;
      padding-bottom: 24px;
    }

    .timeline-step::after {
      content: '';
      position: absolute;
      left: 24px;
      top: 60px;
      width: 2px;
      height: calc(100% + 24px);
      background: #ddd;
    }

    .timeline-step:last-child::after {
      display: none;
    }

    .timeline-step.step-completed::after {
      background: #3c3;
    }

    .timeline-step.step-failed::after {
      background: #c33;
    }

    .step-marker {
      flex-shrink: 0;
    }

    .step-number {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #ddd;
      color: #666;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 16px;
      position: relative;
      z-index: 1;
      transition: all 0.3s;
    }

    .step-pending .step-number {
      background: #ddd;
      color: #999;
    }

    .step-running .step-number {
      background: #667eea;
      color: white;
      box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.2);
      animation: pulse 1.5s ease-in-out infinite;
    }

    .step-completed .step-number {
      background: #3c3;
      color: white;
    }

    .step-failed .step-number {
      background: #c33;
      color: white;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }

    .step-content {
      flex: 1;
      padding: 12px;
    }

    .step-label {
      font-size: 16px;
      font-weight: 600;
      color: #222;
      margin: 0 0 4px 0;
    }

    .step-description {
      font-size: 14px;
      color: #666;
      margin: 0 0 8px 0;
    }

    .step-status {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-pending {
      background: #f0f0f0;
      color: #999;
    }

    .status-running {
      background: rgba(102, 126, 234, 0.1);
      color: #667eea;
    }

    .status-completed {
      background: #efe;
      color: #3c3;
    }

    .status-failed {
      background: #fee;
      color: #c33;
    }

    .step-icon {
      font-size: 32px;
      flex-shrink: 0;
      opacity: 0.6;
      transition: opacity 0.3s;
    }

    .step-running .step-icon {
      opacity: 1;
      animation: bounce 1.5s ease-in-out infinite;
    }

    .step-completed .step-icon {
      opacity: 1;
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }

    /* Final Result */
    .final-result {
      padding: 24px;
      border-radius: 8px;
      text-align: center;
      animation: slideDown 0.5s ease-out;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .result-approved {
      background: #efe;
      border: 2px solid #3c3;
    }

    .result-rejected {
      background: #fee;
      border: 2px solid #c33;
    }

    .result-content h3 {
      font-size: 24px;
      margin: 0 0 8px 0;
      font-weight: 700;
    }

    .result-approved h3 {
      color: #3c3;
    }

    .result-rejected h3 {
      color: #c33;
    }

    .result-description {
      font-size: 14px;
      margin: 0;
      line-height: 1.5;
    }

    .result-approved .result-description {
      color: #3c3;
    }

    .result-rejected .result-description {
      color: #c33;
    }
  `]
})
export class CreateOrderComponent implements OnInit {
  amount: number = 0;
  loading = false;
  error = '';
  selectedScenario: 'happy' | 'compensation' | null = null;
  currentSession: OrderSession | null = null;

  constructor(
    private orderService: OrderService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {}

  selectScenario(scenario: 'happy' | 'compensation') {
    this.selectedScenario = scenario;
  }

  submitOrder() {
    if (this.amount <= 0) {
      this.error = 'Amount must be greater than 0';
      return;
    }

    if (!this.selectedScenario) {
      this.error = 'Please select a test scenario';
      return;
    }

    this.loading = true;
    this.error = '';

    // Initialize workflow session
    this.currentSession = {
      orderId: 'ORD-' + Date.now(),
      amount: this.amount,
      scenario: this.selectedScenario,
      currentStep: 0,
      finalStatus: '',
      workflowSteps: this.initializeWorkflowSteps()
    };

    // Simulate the order creation and workflow execution
    this.executeWorkflow();
  }

  private initializeWorkflowSteps(): WorkflowStep[] {
    if (this.selectedScenario === 'happy') {
      return [
        {
          id: 'create-order',
          label: 'Create Order',
          description: 'Order created and stored in database',
          status: 'pending',
          icon: '📋'
        },
        {
          id: 'kitchen-ticket',
          label: 'Create Kitchen Ticket',
          description: 'Kitchen service creates ticket for food preparation',
          status: 'pending',
          icon: '👨‍🍳'
        },
        {
          id: 'authorize-payment',
          label: 'Authorize Payment',
          description: 'Accounting service authorizes payment transaction',
          status: 'pending',
          icon: '💳'
        },
        {
          id: 'approve-ticket',
          label: 'Approve Kitchen Ticket',
          description: 'Kitchen ticket approved for preparation',
          status: 'pending',
          icon: '✓'
        },
        {
          id: 'finalize',
          label: 'Order Finalized',
          description: 'Order status updated to APPROVED',
          status: 'pending',
          icon: '🎉'
        }
      ];
    } else {
      return [
        {
          id: 'create-order',
          label: 'Create Order',
          description: 'Order created and stored in database',
          status: 'pending',
          icon: '📋'
        },
        {
          id: 'kitchen-ticket',
          label: 'Create Kitchen Ticket',
          description: 'Kitchen service creates ticket for food preparation',
          status: 'pending',
          icon: '👨‍🍳'
        },
        {
          id: 'authorize-payment',
          label: 'Authorize Payment',
          description: 'Accounting service attempts to authorize payment',
          status: 'pending',
          icon: '💳'
        },
        {
          id: 'payment-rejected',
          label: 'Payment Rejected',
          description: 'Payment authorization failed - compensation triggered',
          status: 'pending',
          icon: '❌'
        },
        {
          id: 'cancel-ticket',
          label: 'Cancel Kitchen Ticket',
          description: 'Kitchen ticket cancelled due to payment failure',
          status: 'pending',
          icon: '🔄'
        },
        {
          id: 'reject-order',
          label: 'Order Rejected',
          description: 'Order status updated to REJECTED',
          status: 'pending',
          icon: '⛔'
        }
      ];
    }
  }

  private executeWorkflow() {
    if (!this.currentSession) return;

    let stepIndex = 0;
    const totalSteps = this.currentSession.workflowSteps.length;

    const executeNextStep = () => {
      if (stepIndex >= totalSteps) {
        // Workflow complete
        this.finishWorkflow();
        return;
      }

      const step = this.currentSession!.workflowSteps[stepIndex];
      step.status = 'running';
      this.currentSession!.currentStep = stepIndex;
      this.cdr.detectChanges();

      // Simulate step execution (1-2 seconds per step)
      const delay = 1000 + Math.random() * 1000;

      setTimeout(() => {
        step.status = 'completed';
        this.cdr.detectChanges();

        // Move to next step after a short pause
        setTimeout(() => {
          stepIndex++;
          executeNextStep();
        }, 500);
      }, delay);
    };

    // Start executing steps
    executeNextStep();
  }

  private finishWorkflow() {
    if (!this.currentSession) return;

    this.loading = false;

    if (this.selectedScenario === 'happy') {
      this.currentSession.finalStatus = 'APPROVED';
      this.currentSession.workflowSteps.forEach(s => s.status = 'completed');
    } else {
      // Mark the failed payment step
      const paymentStep = this.currentSession.workflowSteps.find(s => s.id === 'authorize-payment' || s.id === 'payment-rejected');
      if (paymentStep) {
        paymentStep.status = 'failed';
      }
      this.currentSession.finalStatus = 'REJECTED';
      // Mark remaining steps as completed (compensation)
      this.currentSession.workflowSteps.forEach(s => {
        if (s.status !== 'failed') {
          s.status = 'completed';
        }
      });
    }

    this.currentSession.currentStep = this.currentSession.workflowSteps.length - 1;
    this.cdr.detectChanges();
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'running':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      default:
        return status;
    }
  }
}
