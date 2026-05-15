package org.accounting;

import io.grpc.Server;
import io.grpc.ServerBuilder;

import java.io.IOException;

public class AccountingServer {

    public static void main(String[] args) throws IOException, InterruptedException {

        Server server = ServerBuilder
                .forPort(50053)
                .addService(new AccountingServiceImpl())
                .build();

        server.start();

        System.out.println("💳 Accounting Service running on port 50053");

        server.awaitTermination();
    }
}