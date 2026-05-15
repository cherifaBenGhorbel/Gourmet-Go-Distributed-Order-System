package org.example;

import com.gourmet.orchestrator.OrchestratorServiceGrpc;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GrpcConfig {

    @Bean
    public OrchestratorServiceGrpc.OrchestratorServiceBlockingStub orchestratorStub() {

        ManagedChannel channel = ManagedChannelBuilder
                .forAddress("orchestrator", 50054)
                .usePlaintext()
                .build();

        return OrchestratorServiceGrpc.newBlockingStub(channel);
    }
}