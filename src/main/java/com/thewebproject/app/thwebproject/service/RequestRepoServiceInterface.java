package com.thewebproject.app.thwebproject.service;

import com.thewebproject.app.thwebproject.entity.Requests;
import org.springframework.http.ResponseEntity;

public interface RequestRepoServiceInterface {

    ResponseEntity<String> saveRequests(Requests request);
}
