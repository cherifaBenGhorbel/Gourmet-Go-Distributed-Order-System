package org.example;

import java.util.List;
import java.util.Map;

public class DashboardDTO {
    private Map<String, Integer> statusCounts;
    private List<String> recentOrders;

    public DashboardDTO() {
    }

    public DashboardDTO(Map<String, Integer> statusCounts, List<String> recentOrders) {
        this.statusCounts = statusCounts;
        this.recentOrders = recentOrders;
    }

    public Map<String, Integer> getStatusCounts() {
        return statusCounts;
    }

    public void setStatusCounts(Map<String, Integer> statusCounts) {
        this.statusCounts = statusCounts;
    }

    public List<String> getRecentOrders() {
        return recentOrders;
    }

    public void setRecentOrders(List<String> recentOrders) {
        this.recentOrders = recentOrders;
    }
}
