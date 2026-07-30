package com.growthmul.app.growthmultiplier.controller;

import com.growthmul.app.growthmultiplier.model.Client;
import com.growthmul.app.growthmultiplier.service.ClientDirectoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.server.ResponseStatusException;

@Controller
public class DemoController {

    private final ClientDirectoryService clientDirectoryService;

    @Autowired
    public DemoController(ClientDirectoryService clientDirectoryService) {
        this.clientDirectoryService = clientDirectoryService;
    }

    // Generic/default demo preview — shows the SecureVista placeholder data.
    @GetMapping("/demo-security-site")
    public String demoSecuritySite(Model model) {
        model.addAttribute("client", defaultClient());
        return "demosite";
    }

    // Per-client demo link, e.g. /demo-security-site/17 — pulls that client's
    // details from clients.csv and renders the same template with their data filled in.
    @GetMapping("/demo-security-site/{id}")
    public String demoSecuritySiteForClient(@PathVariable int id, Model model) {
        Client client = clientDirectoryService.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "No client found for id " + id));
        model.addAttribute("client", client);
        return "demosite";
    }

    private Client defaultClient() {
        return new Client(
                0,
                "SecureVista",
                "Security You Can See. Peace You Can Feel.",
                "(555) 123-4567",
                "hello@securevista.com",
                "123 Main Street, Phoenix, AZ"
        );
    }
}
