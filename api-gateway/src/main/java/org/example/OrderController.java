package org.example;

import com.gourmet.orchestrator.CreateOrderRequest;
import com.gourmet.orchestrator.CreateOrderResponse;
import com.gourmet.orchestrator.OrchestratorServiceGrpc;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrchestratorServiceGrpc.OrchestratorServiceBlockingStub stub;

    public OrderController(OrchestratorServiceGrpc.OrchestratorServiceBlockingStub stub) {
        this.stub = stub;
    }

    @PostMapping
    public CreateOrderResponseDTO create(@RequestBody CreateOrderRequestDTO req) {

        CreateOrderResponse response = stub.createOrder(
                CreateOrderRequest.newBuilder()
                        .setAmount(req.getAmount())
                        .build()
        );

        return new CreateOrderResponseDTO(
                response.getOrderId(),
                response.getStatus()
        );
    }
}