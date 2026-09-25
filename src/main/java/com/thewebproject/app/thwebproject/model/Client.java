package com.thewebproject.app.thwebproject.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Client {
    private int id;
    private String businessName;
    private String tagline;
    private String phone;
    private String email;
    private String address;
}
