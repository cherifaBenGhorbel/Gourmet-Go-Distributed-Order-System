package org.kitchen;

import io.grpc.Server;
import io.grpc.ServerBuilder;

import java.io.IOException;

public class KitchenServer {

    public static void main(String[] args) throws IOException, InterruptedException {

        Server server = ServerBuilder
                .forPort(50052)
                .addService(new KitchenServiceImpl())
                .build();

        server.start();

        System.out.println("🍳 Kitchen Service running on port 50052");

        server.awaitTermination();
    }
}