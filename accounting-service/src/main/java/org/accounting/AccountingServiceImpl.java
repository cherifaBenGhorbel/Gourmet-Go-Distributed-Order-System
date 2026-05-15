package org.accounting;

import com.gourmet.accounting.*;
import io.grpc.stub.StreamObserver;

public class AccountingServiceImpl extends AccountingServiceGrpc.AccountingServiceImplBase {

    @Override
    public void authorizeCard(AuthorizeRequest request,
                              StreamObserver<AuthorizeResponse> responseObserver) {

        boolean authorized = request.getAmount() < 100;

        System.out.println("💳 Payment check for order: " + request.getOrderId()
                + " amount=" + request.getAmount()
                + " → " + (authorized ? "APPROVED" : "REJECTED"));

        AuthorizeResponse response = AuthorizeResponse.newBuilder()
                .setAuthorized(authorized)
                .build();

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }
}