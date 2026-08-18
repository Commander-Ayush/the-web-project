package com.growthmul.app.growthmultiplier.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Demo-only public API backing the SecureVista demosite.html booking form.
 * No persistence layer — this exists purely so a prospective client can see
 * a fully working "request a consultation" flow when previewing their demo
 * site. Submissions are handed off to DemoAdminApiController's in-memory
 * store so they show up live in the admin panel during the same session.
 */
@RestController
public class DemoBookingApiController {

    // Same fixed catalog the admin panel's dummy /admin/services returns,
    // trimmed to the shape the booking form's dropdown actually needs.
    private static final List<Map<String, Object>> SERVICES = List.of(
            serviceOption(1, "CCTV Installation", "From $450"),
            serviceOption(2, "Access Control Systems", "From $600"),
            serviceOption(3, "Alarm Monitoring", "From $60/mo"),
            serviceOption(4, "Structured Cabling", "From $300"),
            serviceOption(5, "24/7 Remote Monitoring", "From $80/mo"),
            serviceOption(6, "Maintenance & Support", "From $40/mo")
    );

    private static Map<String, Object> serviceOption(int id, String name, String price) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", id);
        m.put("name", name);
        m.put("price", price);
        return m;
    }

    @GetMapping("/services")
    public List<Map<String, Object>> getServices() {
        return SERVICES;
    }

    @PostMapping("/booking")
    public ResponseEntity<Map<String, Object>> submitBooking(@RequestBody Map<String, Object> body) {
        String firstName = String.valueOf(body.getOrDefault("firstName", "")).trim();
        String lastName = String.valueOf(body.getOrDefault("lastName", "")).trim();

        if (firstName.isEmpty() || lastName.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "First and last name are required."));
        }

        String serviceName = SERVICES.stream()
                .filter(s -> String.valueOf(s.get("id")).equals(String.valueOf(body.get("serviceOfferingId"))))
                .map(s -> (String) s.get("name"))
                .findFirst()
                .orElse("General Inquiry");

        Map<String, Object> booking = new LinkedHashMap<>();
        booking.put("id", DemoAdminApiController.NEXT_BOOKING_ID.getAndIncrement());
        booking.put("firstName", firstName);
        booking.put("lastName", lastName);
        booking.put("email", body.getOrDefault("email", ""));
        booking.put("phone", body.getOrDefault("phone", ""));
        booking.put("service", serviceName);
        booking.put("preferredDate", body.getOrDefault("preferredDate", ""));
        booking.put("submittedAt", LocalDateTime.now().toString());
        booking.put("completed", false);

        DemoAdminApiController.BOOKINGS.add(0, booking);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("message", "Booking received.");
        response.put("id", booking.get("id"));
        return ResponseEntity.ok(response);
    }
}
