package org.kitchen;

import java.util.concurrent.ConcurrentHashMap;

public class KitchenRepository {

    private final ConcurrentHashMap<String, String> tickets = new ConcurrentHashMap<>();

    public boolean createTicket(String orderId) {
        System.out.println("🍳 Creating kitchen ticket for: " + orderId);

        tickets.put(orderId, "PENDING");
        return true;
    }

    public boolean rejectTicket(String orderId) {
        System.out.println("❌ Rejecting kitchen ticket for: " + orderId);

        tickets.put(orderId, "REJECTED");
        return true;
    }
}