package com.growthmul.app.growthmultiplier.service;

import com.growthmul.app.growthmultiplier.entity.Requests;
import com.growthmul.app.growthmultiplier.repositories.RequestRepo;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public class RequestRepoServiceImpltn implements  RequestRepoServiceInterface {

    private final RequestRepo requestRepo;

    public RequestRepoServiceImpltn(RequestRepo requestRepo) {
        this.requestRepo = requestRepo;
    }
    @Override
    public ResponseEntity<String> saveRequests(Requests request) {
        requestRepo.save(request);
        return ResponseEntity.ok("Request saved successfully");
    }
}
