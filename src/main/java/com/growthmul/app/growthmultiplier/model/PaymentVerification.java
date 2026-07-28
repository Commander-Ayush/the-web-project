package com.growthmul.app.growthmultiplier.model;

import lombok.Data;

@Data
public class PaymentVerification {
    private String razorpayPaymentId;
    private String razorpayOrderId;
    private String razorpaySignature;
}