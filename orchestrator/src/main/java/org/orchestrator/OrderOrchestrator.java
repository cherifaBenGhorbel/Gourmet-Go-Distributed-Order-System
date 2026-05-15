package org.orchestrator;

import com.gourmet.order.*;
import com.gourmet.kitchen.*;
import com.gourmet.accounting.*;

import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;

public class OrderOrchestrator {

    public static void main(String[] args) {

        if (args.length < 2) {
            System.out.println("Usage: <orderId> <amount>");
            return;
        }

        String orderId = args[0];
        double amount = Double.parseDouble(args[1]);

        // Channels
        ManagedChannel orderChannel = ManagedChannelBuilder.forAddress("order-service", 50051)
                .usePlaintext()
                .build();

        ManagedChannel kitchenChannel = ManagedChannelBuilder.forAddress("kitchen-service", 50052)
                .usePlaintext()
                .build();

        ManagedChannel accountingChannel = ManagedChannelBuilder.forAddress("accounting-service", 50053)
                .usePlaintext()
                .build();

        // Stubs
        OrderServiceGrpc.OrderServiceBlockingStub orderStub =
                OrderServiceGrpc.newBlockingStub(orderChannel);

        KitchenServiceGrpc.KitchenServiceBlockingStub kitchenStub =
                KitchenServiceGrpc.newBlockingStub(kitchenChannel);

        AccountingServiceGrpc.AccountingServiceBlockingStub accountingStub =
                AccountingServiceGrpc.newBlockingStub(accountingChannel);

        try {
            // STEP 1: PENDING
            orderStub.updateStatus(
                    UpdateStatusRequest.newBuilder()
                            .setOrderId(orderId)
                            .setStatus("PENDING_KITCHEN")
                            .build()
            );

            // STEP 2: Kitchen create ticket
            TicketResponse kitchenResp = kitchenStub.createTicket(
                    TicketRequest.newBuilder()
                            .setOrderId(orderId)
                            .build()
            );

            if (!kitchenResp.getSuccess()) {
                orderStub.updateStatus(
                        UpdateStatusRequest.newBuilder()
                                .setOrderId(orderId)
                                .setStatus("REJECTED")
                                .build()
                );
                return;
            }

            // STEP 3: Payment
            AuthorizeResponse authResp = accountingStub.authorizeCard(
                    AuthorizeRequest.newBuilder()
                            .setOrderId(orderId)
                            .setAmount(amount)
                            .build()
            );

            if (!authResp.getAuthorized()) {

                // COMPENSATION
                kitchenStub.rejectTicket(
                        RejectRequest.newBuilder()
                                .setOrderId(orderId)
                                .build()
                );

                orderStub.updateStatus(
                        UpdateStatusRequest.newBuilder()
                                .setOrderId(orderId)
                                .setStatus("REJECTED")
                                .build()
                );

                System.out.println("❌ Order REJECTED (payment failed)");
                return;
            }

            // STEP 4: SUCCESS - approve kitchen ticket
            ApproveResponse approveResp = kitchenStub.approveTicket(
                    ApproveRequest.newBuilder()
                            .setOrderId(orderId)
                            .build()
            );

            if (!approveResp.getAcknowledged()) {
                System.out.println("⚠️ Kitchen approval failed");
                orderStub.updateStatus(
                        UpdateStatusRequest.newBuilder()
                                .setOrderId(orderId)
                                .setStatus("APPROVED_BUT_KITCHEN_FAILED")
                                .build()
                );
                return;
            }

            orderStub.updateStatus(
                    UpdateStatusRequest.newBuilder()
                            .setOrderId(orderId)
                            .setStatus("APPROVED")
                            .build()
            );

            System.out.println("✅ Order APPROVED");



        } finally {
            orderChannel.shutdown();
            kitchenChannel.shutdown();
            accountingChannel.shutdown();
        }
    }
}