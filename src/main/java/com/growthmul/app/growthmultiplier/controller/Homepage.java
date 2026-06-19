package com.growthmul.app.growthmultiplier.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class Homepage {

    @GetMapping({"", "/", "/home", "/index"})
    public String homepage() {
        return "Home";
    }
}
