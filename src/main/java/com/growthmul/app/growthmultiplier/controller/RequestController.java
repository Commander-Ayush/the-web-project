package com.growthmul.app.growthmultiplier.controller;

import com.growthmul.app.growthmultiplier.entity.Requests;
import com.growthmul.app.growthmultiplier.service.RequestRepoServiceInterface;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RequestController {

    @Autowired
    private RequestRepoServiceInterface requestRepoServiceInterface;

    @PostMapping("/submit/bookingForm")
    public ResponseEntity<String> postRequest(@ModelAttribute Requests request){
        try{
            requestRepoServiceInterface.saveRequests(request);
            return ResponseEntity.ok("Request sent Successfully");
        }catch(Exception e){
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }
}
