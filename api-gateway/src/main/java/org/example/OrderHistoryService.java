package org.example;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

@Service
public class OrderHistoryService {
    private final OrderEventRepository repository;

    public OrderHistoryService(OrderEventRepository repository) {
        this.repository = repository;
    }

    public void recordEvent(String orderId, String event, String detail) {
        OrderEvent e = new OrderEvent(orderId, event, detail, System.currentTimeMillis());
        repository.save(e);
    }

    public List<OrderHistoryEntryDTO> getHistory(String orderId) {
        List<OrderEvent> events = repository.findByOrderIdOrderByTimestampAsc(orderId);
        List<OrderHistoryEntryDTO> entries = new ArrayList<>();
        for (OrderEvent e : events) {
            entries.add(new OrderHistoryEntryDTO(e.getEvent(), e.getDetail(), e.getTimestamp()));
        }
        return entries;
    }

    public OrderStatusDTO getLatestStatus(String orderId) {
        List<OrderEvent> events = repository.findByOrderIdOrderByTimestampAsc(orderId);
        if (events.isEmpty()) {
            return null;
        }

        OrderEvent latestEvent = events.get(events.size() - 1);
        return new OrderStatusDTO(
                orderId,
                mapStatus(latestEvent.getEvent()),
                latestEvent.getEvent(),
                latestEvent.getTimestamp());
    }

    public DashboardDTO getDashboard() {
        List<OrderEvent> events = repository.findAllByOrderByTimestampAsc();

        // find latest event per order
        Map<String, OrderEvent> latest = new HashMap<>();
        for (OrderEvent e : events) {
            latest.put(e.getOrderId(), e);
        }

        Map<String, Integer> counts = new HashMap<>();
        for (OrderEvent e : latest.values()) {
            String status = e.getEvent();
            counts.put(status, counts.getOrDefault(status, 0) + 1);
        }

        List<String> recent = latest.values().stream()
                .sorted((a, b) -> Long.compare(b.getTimestamp(), a.getTimestamp()))
                .limit(10)
                .map(OrderEvent::getOrderId)
                .collect(Collectors.toList());

        return new DashboardDTO(counts, recent);
    }

    private String mapStatus(String event) {
        if (event == null) {
            return "UNKNOWN";
        }

        return switch (event) {
            case "ORDER_CREATED" -> "CREATED";
            case "ORDER_CANCELLED" -> "CANCELLED";
            case "RETRY_TRIGGERED" -> "RETRY_REQUESTED";
            default -> event;
        };
    }
}
