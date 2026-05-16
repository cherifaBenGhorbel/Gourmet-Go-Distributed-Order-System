package org.example;

import java.util.List;

public class OrderHistoryDTO {
    private String orderId;
    private List<OrderHistoryEntryDTO> events;

    public OrderHistoryDTO() {
    }

    public OrderHistoryDTO(String orderId, List<OrderHistoryEntryDTO> events) {
        this.orderId = orderId;
        this.events = events;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public List<OrderHistoryEntryDTO> getEvents() {
        return events;
    }

    public void setEvents(List<OrderHistoryEntryDTO> events) {
        this.events = events;
    }
}
