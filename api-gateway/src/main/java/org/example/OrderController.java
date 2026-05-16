package org.example;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gourmet.orchestrator.CreateOrderRequest;
import com.gourmet.orchestrator.CreateOrderResponse;
import com.gourmet.orchestrator.OrchestratorServiceGrpc;

import io.grpc.StatusRuntimeException;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/orders")
public class OrderController {
    private static final Logger logger = LoggerFactory.getLogger(OrderController.class);

    private final OrchestratorServiceGrpc.OrchestratorServiceBlockingStub orchestratorStub;
    private final OrderHistoryService historyService;
    private final WorkflowReportingService workflowReportingService;

    public OrderController(OrchestratorServiceGrpc.OrchestratorServiceBlockingStub orchestratorStub,
            OrderHistoryService historyService,
            WorkflowReportingService workflowReportingService) {
        this.orchestratorStub = orchestratorStub;
        this.historyService = historyService;
        this.workflowReportingService = workflowReportingService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CreateOrderResponseDTO>> createOrder(
            @Valid @RequestBody CreateOrderRequestDTO request) {

        logger.info("Creating order with amount: {}", request.getAmount());

        try {
            CreateOrderResponse response = orchestratorStub.createOrder(
                    CreateOrderRequest.newBuilder()
                            .setAmount(request.getAmount())
                            .build());

            CreateOrderResponseDTO responseDTO = new CreateOrderResponseDTO(
                    response.getOrderId(),
                    response.getStatus(),
                    request.getAmount());

            logger.info("Order created successfully: {} with status: {}",
                    response.getOrderId(), response.getStatus());

            HttpStatus statusCode = response.getStatus().equals("APPROVED")
                    ? HttpStatus.CREATED
                    : HttpStatus.OK;

            // persist event
            try {
                historyService.recordEvent(response.getOrderId(), "ORDER_CREATED",
                        "Order created with status: " + response.getStatus());
            } catch (Exception ex) {
                logger.warn("Failed to persist order-created event", ex);
            }

            return ResponseEntity.status(statusCode)
                    .body(ApiResponse.success(responseDTO, "Order created successfully"));

        } catch (StatusRuntimeException e) {
            logger.error("gRPC error while creating order", e);
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(ApiResponse.error("SERVICE_UNAVAILABLE",
                            "Orchestration service is unavailable"));
        }
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<OrderStatusDTO>> getOrderStatus(@PathVariable("orderId") String orderId) {
        logger.info("Fetching status for order: {}", orderId);

        if (orderId == null || orderId.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("INVALID_ORDER_ID", "Order ID cannot be empty"));
        }

        OrderStatusDTO status = historyService.getLatestStatus(orderId);
        if (status == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("ORDER_NOT_FOUND", "No workflow data found for order"));
        }

        return ResponseEntity.ok()
                .body(ApiResponse.success(status, "Order status"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<WorkflowOrderDTO>>> getOrders() {
        logger.info("Fetching all orders from workflow view");

        WorkflowOverviewDTO overview = workflowReportingService.getWorkflowOverview();
        return ResponseEntity.ok()
                .body(ApiResponse.success(overview.getOrders(), "Orders overview"));
    }

    @DeleteMapping("/{orderId}")
    public ResponseEntity<ApiResponse<String>> cancelOrder(@PathVariable("orderId") String orderId) {
        logger.info("Cancelling order: {}", orderId);

        if (orderId == null || orderId.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("INVALID_ORDER_ID", "Order ID cannot be empty"));
        }

        // perform cancellation (placeholder orchestration) and persist event
        logger.info("Cancel request accepted for order {}", orderId);
        try {
            historyService.recordEvent(orderId, "ORDER_CANCELLED", "Cancel requested from API");
        } catch (Exception ex) {
            logger.warn("Failed to persist cancel event", ex);
        }
        return ResponseEntity.accepted()
                .body(ApiResponse.success(orderId, "Cancel request accepted"));
    }

    @GetMapping("/{orderId}/history")
    public ResponseEntity<ApiResponse<OrderHistoryDTO>> getOrderHistory(@PathVariable("orderId") String orderId) {
        logger.info("Fetching history for order: {}", orderId);

        if (orderId == null || orderId.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("INVALID_ORDER_ID", "Order ID cannot be empty"));
        }

        List<OrderHistoryEntryDTO> entries = historyService.getHistory(orderId);
        OrderHistoryDTO history = new OrderHistoryDTO(orderId, entries);
        return ResponseEntity.ok().body(ApiResponse.success(history, "Order history"));
    }

    @PostMapping("/{orderId}/retry")
    public ResponseEntity<ApiResponse<String>> retryOrder(@PathVariable("orderId") String orderId) {
        logger.info("Retry requested for order: {}", orderId);

        if (orderId == null || orderId.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("INVALID_ORDER_ID", "Order ID cannot be empty"));
        }

        logger.info("Retry triggered for order {}", orderId);
        try {
            historyService.recordEvent(orderId, "RETRY_TRIGGERED", "Retry requested from API");
        } catch (Exception ex) {
            logger.warn("Failed to persist retry event", ex);
        }
        return ResponseEntity.ok().body(ApiResponse.success(orderId, "Retry triggered"));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<WorkflowOverviewDTO>> getDashboard() {
        logger.info("Fetching workflow dashboard summary");

        WorkflowOverviewDTO overview = workflowReportingService.getWorkflowOverview();
        return ResponseEntity.ok().body(ApiResponse.success(overview, "Workflow dashboard"));
    }

    @GetMapping("/workflow")
    public ResponseEntity<ApiResponse<WorkflowOverviewDTO>> getWorkflowOverview() {
        logger.info("Fetching full workflow overview");

        WorkflowOverviewDTO overview = workflowReportingService.getWorkflowOverview();
        return ResponseEntity.ok().body(ApiResponse.success(overview, "Workflow overview"));
    }
}