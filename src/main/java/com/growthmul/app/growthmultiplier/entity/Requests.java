package com.growthmul.app.growthmultiplier.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Requests {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;

    private String fullName;
    private String contactNumber;
    private String emailAddress;
    private String domain;
    private String plan;

    @Column(length =1000)
    private String query;
}