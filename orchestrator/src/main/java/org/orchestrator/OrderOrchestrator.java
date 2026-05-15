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
        ManagedChannel orderChannel = ManagedChannelBuilder.forAddress("localhost", 50051)
                .usePlaintext()
                .build();

        ManagedChannel kitchenChannel = ManagedChannelBuilder.forAddress("localhost", 50052)
                .usePlaintext()
                .build();

        ManagedChannel accountingChannel = ManagedChannelBuilder.forAddress("localhost", 50053)
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
            orderStub.updateStatus(UpdateStatusRequest.newBuilder()
                    .setOrderId(orderId)
                    .setStatus("APPROVAL_PENDING")
                    .build());

            // STEP 2: Kitchen
            TicketResponse kitchenResp = kitchenStub.createTicket(
                    TicketRequest.newBuilder()
                            .setOrderId(orderId)
                            .build()
            );

            if (!kitchenResp.getSuccess()) {
                throw new RuntimeException("Kitchen failed");
            }

            // STEP 3: Accounting
            AuthorizeResponse authResp = accountingStub.authorizeCard(
                    AuthorizeRequest.newBuilder()
                            .setOrderId(orderId)
                            .setAmount(amount)
                            .build()
            );

            if (!authResp.getAuthorized()) {

                // ❌ COMPENSATION FLOW
                kitchenStub.rejectTicket(
                        RejectRequest.newBuilder()
                                .setOrderId(orderId)
                                .build()
                );

                orderStub.updateStatus(UpdateStatusRequest.newBuilder()
                        .setOrderId(orderId)
                        .setStatus("REJECTED")
                        .build());

                System.out.println("❌ Order rejected (payment failed)");
                return;
            }

            // STEP 4: SUCCESS
            orderStub.updateStatus(UpdateStatusRequest.newBuilder()
                    .setOrderId(orderId)
                    .setStatus("APPROVED")
                    .build());

            System.out.println("✅ Order APPROVED successfully");

        } finally {
            orderChannel.shutdown();
            kitchenChannel.shutdown();
            accountingChannel.shutdown();
        }
    }
}