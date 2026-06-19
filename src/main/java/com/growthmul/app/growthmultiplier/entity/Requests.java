package com.growthmul.app.growthmultiplier.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Requests {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;

    private String fullname;
    private String email;
    private String phone;

    @Column(length =1000)
    private String query;
}
