package com.growthmul.app.growthmultiplier.service;

import com.growthmul.app.growthmultiplier.entity.Requests;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ResponseStatus;

public interface RequestRepoServiceInterface {

    ResponseEntity<String> saveRequests(Requests request);
}
