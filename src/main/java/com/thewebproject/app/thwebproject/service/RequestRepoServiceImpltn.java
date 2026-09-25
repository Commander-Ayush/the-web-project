package com.thewebproject.app.thwebproject.service;

import com.thewebproject.app.thwebproject.entity.Requests;
import com.thewebproject.app.thwebproject.repositories.RequestRepo;
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
        System.out.println("flow reached here and got saved in the repo");
        return ResponseEntity.ok("Request saved successfully");
    }
}
