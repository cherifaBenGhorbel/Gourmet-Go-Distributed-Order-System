package org.kitchen;

import com.gourmet.kitchen.*;
import io.grpc.stub.StreamObserver;

public class KitchenServiceImpl extends KitchenServiceGrpc.KitchenServiceImplBase {

    private final KitchenRepository repository = new KitchenRepository();

    // EXECUTION STEP
    @Override
    public void createTicket(TicketRequest request,
                             StreamObserver<TicketResponse> responseObserver) {

        boolean result = repository.createTicket(request.getOrderId());

        TicketResponse response = TicketResponse.newBuilder()
                .setSuccess(result)
                .build();

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    // COMPENSATION STEP
    @Override
    public void rejectTicket(RejectRequest request,
                             StreamObserver<RejectResponse> responseObserver) {

        boolean result = repository.rejectTicket(request.getOrderId());

        RejectResponse response = RejectResponse.newBuilder()
                .setAcknowledged(result)
                .build();

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }
}