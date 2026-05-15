package org.example;

public class CreateOrderResponseDTO {
    private String orderId;
    private String status;

    public CreateOrderResponseDTO(String orderId, String status) {
        this.orderId = orderId;
        this.status = status;
    }

    public String getOrderId() { return orderId; }
    public String getStatus() { return status; }
}