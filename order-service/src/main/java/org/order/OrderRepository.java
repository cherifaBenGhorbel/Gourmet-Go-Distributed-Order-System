package org.order;

import java.util.concurrent.ConcurrentHashMap;

public class OrderRepository {

    private final ConcurrentHashMap<String, String> store = new ConcurrentHashMap<>();

    public void updateStatus(String orderId, String status) {
        store.put(orderId, status);
        System.out.println("📦 Order updated: " + orderId + " -> " + status);
    }

    public String getStatus(String orderId) {
        return store.getOrDefault(orderId, "UNKNOWN");
    }
}