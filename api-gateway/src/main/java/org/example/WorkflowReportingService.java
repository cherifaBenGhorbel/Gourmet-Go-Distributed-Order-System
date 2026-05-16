package org.example;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class WorkflowReportingService {

    private final String orderUrl;
    private final String orderUser;
    private final String orderPassword;
    private final String kitchenUrl;
    private final String kitchenUser;
    private final String kitchenPassword;
    private final String accountingUrl;
    private final String accountingUser;
    private final String accountingPassword;

    public WorkflowReportingService(
            @Value("${workflow.databases.order.url}") String orderUrl,
            @Value("${workflow.databases.order.username}") String orderUser,
            @Value("${workflow.databases.order.password}") String orderPassword,
            @Value("${workflow.databases.kitchen.url}") String kitchenUrl,
            @Value("${workflow.databases.kitchen.username}") String kitchenUser,
            @Value("${workflow.databases.kitchen.password}") String kitchenPassword,
            @Value("${workflow.databases.accounting.url}") String accountingUrl,
            @Value("${workflow.databases.accounting.username}") String accountingUser,
            @Value("${workflow.databases.accounting.password}") String accountingPassword) {
        this.orderUrl = orderUrl;
        this.orderUser = orderUser;
        this.orderPassword = orderPassword;
        this.kitchenUrl = kitchenUrl;
        this.kitchenUser = kitchenUser;
        this.kitchenPassword = kitchenPassword;
        this.accountingUrl = accountingUrl;
        this.accountingUser = accountingUser;
        this.accountingPassword = accountingPassword;
    }

    public WorkflowOverviewDTO getWorkflowOverview() {
        List<WorkflowOrderDTO> orders = loadOrders();
        List<WorkflowTicketDTO> tickets = loadTickets();
        List<WorkflowPaymentDTO> payments = loadPayments();

        Map<String, Integer> statusCounts = new HashMap<>();
        for (WorkflowOrderDTO order : orders) {
            statusCounts.put(order.getStatus(), statusCounts.getOrDefault(order.getStatus(), 0) + 1);
        }

        return new WorkflowOverviewDTO(statusCounts, orders, tickets, payments);
    }

    private List<WorkflowOrderDTO> loadOrders() {
        String sql = "SELECT order_id, status, created_at FROM orders ORDER BY created_at DESC LIMIT 25";
        List<WorkflowOrderDTO> rows = new ArrayList<>();

        try (Connection connection = openConnection(orderUrl, orderUser, orderPassword);
                Statement statement = connection.createStatement();
                ResultSet resultSet = statement.executeQuery(sql)) {
            while (resultSet.next()) {
                rows.add(new WorkflowOrderDTO(
                        resultSet.getString("order_id"),
                        resultSet.getString("status"),
                        toMillis(resultSet.getTimestamp("created_at"))));
            }
        } catch (SQLException ex) {
            throw new IllegalStateException("Failed to load order workflow rows", ex);
        }

        return rows;
    }

    private List<WorkflowTicketDTO> loadTickets() {
        String sql = "SELECT order_id, status, created_at FROM tickets ORDER BY created_at DESC LIMIT 25";
        List<WorkflowTicketDTO> rows = new ArrayList<>();

        try (Connection connection = openConnection(kitchenUrl, kitchenUser, kitchenPassword);
                Statement statement = connection.createStatement();
                ResultSet resultSet = statement.executeQuery(sql)) {
            while (resultSet.next()) {
                rows.add(new WorkflowTicketDTO(
                        resultSet.getString("order_id"),
                        resultSet.getString("status"),
                        toMillis(resultSet.getTimestamp("created_at"))));
            }
        } catch (SQLException ex) {
            throw new IllegalStateException("Failed to load kitchen workflow rows", ex);
        }

        return rows;
    }

    private List<WorkflowPaymentDTO> loadPayments() {
        String sql = "SELECT order_id, amount, authorized, created_at FROM payments ORDER BY created_at DESC LIMIT 25";
        List<WorkflowPaymentDTO> rows = new ArrayList<>();

        try (Connection connection = openConnection(accountingUrl, accountingUser, accountingPassword);
                Statement statement = connection.createStatement();
                ResultSet resultSet = statement.executeQuery(sql)) {
            while (resultSet.next()) {
                rows.add(new WorkflowPaymentDTO(
                        resultSet.getString("order_id"),
                        resultSet.getDouble("amount"),
                        resultSet.getBoolean("authorized"),
                        toMillis(resultSet.getTimestamp("created_at"))));
            }
        } catch (SQLException ex) {
            throw new IllegalStateException("Failed to load accounting workflow rows", ex);
        }

        return rows;
    }

    private Connection openConnection(String url, String username, String password) throws SQLException {
        return DriverManager.getConnection(url, username, password);
    }

    private long toMillis(java.sql.Timestamp timestamp) {
        return timestamp == null ? 0L : timestamp.getTime();
    }
}