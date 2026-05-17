package org.example.orders.dto;

import java.util.List;
import java.util.Map;

public class WorkflowOverviewDTO {
    private Map<String, Integer> statusCounts;
    private int totalOrders;
    private int totalTickets;
    private int totalPayments;
    private int currentPage;
    private int pageSize;
    private int totalOrderPages;
    private List<WorkflowOrderDTO> orders;
    private List<WorkflowTicketDTO> tickets;
    private List<WorkflowPaymentDTO> payments;

    public WorkflowOverviewDTO() {
    }

    public WorkflowOverviewDTO(Map<String, Integer> statusCounts,
            int totalOrders,
            int totalTickets,
            int totalPayments,
            int currentPage,
            int pageSize,
            int totalOrderPages,
            List<WorkflowOrderDTO> orders,
            List<WorkflowTicketDTO> tickets,
            List<WorkflowPaymentDTO> payments) {
        this.statusCounts = statusCounts;
        this.totalOrders = totalOrders;
        this.totalTickets = totalTickets;
        this.totalPayments = totalPayments;
        this.currentPage = currentPage;
        this.pageSize = pageSize;
        this.totalOrderPages = totalOrderPages;
        this.orders = orders;
        this.tickets = tickets;
        this.payments = payments;
    }

    public Map<String, Integer> getStatusCounts() {
        return statusCounts;
    }

    public void setStatusCounts(Map<String, Integer> statusCounts) {
        this.statusCounts = statusCounts;
    }

    public int getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(int totalOrders) {
        this.totalOrders = totalOrders;
    }

    public int getTotalTickets() {
        return totalTickets;
    }

    public void setTotalTickets(int totalTickets) {
        this.totalTickets = totalTickets;
    }

    public int getTotalPayments() {
        return totalPayments;
    }

    public void setTotalPayments(int totalPayments) {
        this.totalPayments = totalPayments;
    }

    public int getCurrentPage() {
        return currentPage;
    }

    public void setCurrentPage(int currentPage) {
        this.currentPage = currentPage;
    }

    public int getPageSize() {
        return pageSize;
    }

    public void setPageSize(int pageSize) {
        this.pageSize = pageSize;
    }

    public int getTotalOrderPages() {
        return totalOrderPages;
    }

    public void setTotalOrderPages(int totalOrderPages) {
        this.totalOrderPages = totalOrderPages;
    }

    public List<WorkflowOrderDTO> getOrders() {
        return orders;
    }

    public void setOrders(List<WorkflowOrderDTO> orders) {
        this.orders = orders;
    }

    public List<WorkflowTicketDTO> getTickets() {
        return tickets;
    }

    public void setTickets(List<WorkflowTicketDTO> tickets) {
        this.tickets = tickets;
    }

    public List<WorkflowPaymentDTO> getPayments() {
        return payments;
    }

    public void setPayments(List<WorkflowPaymentDTO> payments) {
        this.payments = payments;
    }
}
