package com.growthmul.app.growthmultiplier.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class DemoController {

    @GetMapping("/demo-security-site")
    public String demoSecuritySite() {
        return "demosite";
    }
}
