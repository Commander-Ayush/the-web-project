package com.thewebproject.app.thwebproject.controller;

import com.thewebproject.app.thwebproject.entity.Requests;
import com.thewebproject.app.thwebproject.service.RequestRepoServiceInterface;
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
        System.out.println("this url was hit");
        try{
            requestRepoServiceInterface.saveRequests(request);
            System.out.println("saved request");
            return ResponseEntity.ok("Request sent Successfully");
        }catch(Exception e){
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }
}
