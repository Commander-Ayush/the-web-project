package com.growthmul.app.growthmultiplier.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

/**
 * Demo-only admin API backing the SecureVista admin panel
 * (static/admin-panel) inside the GrowthMultiplier sales demo.
 *
 * No database, no entities, no real authentication — this exists purely
 * so a prospective client can click through a fully working-looking
 * admin dashboard (bookings, services, reviews) when evaluating whether
 * to buy the real site + admin panel. All data lives in memory and
 * resets whenever the app restarts. DO NOT use this pattern in the real
 * paid product — this is demo scaffolding only.
 */
@RestController
public class DemoAdminApiController {

    static final AtomicInteger NEXT_BOOKING_ID = new AtomicInteger(6);

    // Package-private + shared with DemoBookingApiController so bookings
    // submitted from the live demo site show up in this same session.
    static final List<Map<String, Object>> BOOKINGS = new CopyOnWriteArrayList<>(List.of(
            booking(1, "Rina", "Mehta", "rina@mehtaboutique.com", "555-0110", "CCTV Installation", "2026-08-12", "2026-08-01T09:14:00", true),
            booking(2, "David", "Kim", "david@kimlogistics.com", "555-0122", "Access Control Systems", "2026-08-15", "2026-08-02T11:40:00", true),
            booking(3, "Amara", "Torres", "amara@torresdiner.com", "555-0133", "Alarm Monitoring", "2026-08-20", "2026-08-03T14:05:00", false),
            booking(4, "Jordan", "Lee", "jordan.lee@example.com", "555-0144", "Structured Cabling", "2026-08-22", "2026-08-04T08:30:00", false),
            booking(5, "Priya", "Nair", "priya.nair@example.com", "555-0155", "24/7 Remote Monitoring", "2026-08-25", "2026-08-05T16:50:00", false)
    ));

    private static Map<String, Object> booking(int id, String firstName, String lastName, String email,
                                                 String phone, String service, String preferredDate,
                                                 String submittedAt, boolean completed) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", id);
        m.put("firstName", firstName);
        m.put("lastName", lastName);
        m.put("email", email);
        m.put("phone", phone);
        m.put("service", service);
        m.put("preferredDate", preferredDate);
        m.put("submittedAt", submittedAt);
        m.put("completed", completed);
        return m;
    }

    // Rough per-service dummy price, used only to make dashboard revenue
    // numbers look plausible — not a real pricing source.
    private static final Map<String, Integer> SERVICE_PRICE = Map.of(
            "CCTV Installation", 450,
            "Access Control Systems", 600,
            "Alarm Monitoring", 240,
            "Structured Cabling", 300,
            "24/7 Remote Monitoring", 320,
            "Maintenance & Support", 160,
            "General Inquiry", 200
    );

    private static final AtomicInteger NEXT_SERVICE_ID = new AtomicInteger(7);
    private static final List<Map<String, Object>> SERVICES = new CopyOnWriteArrayList<>(List.of(
            serviceItem(1, "🎥", "CCTV Installation", "High-definition cameras installed and configured for full property coverage.", "From $450", true, "service"),
            serviceItem(2, "🔑", "Access Control Systems", "Keycard, fob, and app-based entry systems for offices and residential buildings.", "From $600", false, "service"),
            serviceItem(3, "🛡️", "Alarm Monitoring", "24/7 monitored alarm systems with instant alerts.", "From $60/mo", true, "plan"),
            serviceItem(4, "🔌", "Structured Cabling", "Clean, professional low-voltage wiring for cameras, sensors, and network gear.", "From $300", false, "service"),
            serviceItem(5, "📡", "24/7 Remote Monitoring", "Round-the-clock live monitoring so nothing slips through.", "From $80/mo", false, "plan"),
            serviceItem(6, "🛠️", "Maintenance & Support", "Ongoing service plans to keep every camera, sensor, and panel running smoothly.", "From $40/mo", false, "addon")
    ));

    private static Map<String, Object> serviceItem(int id, String icon, String name, String description,
                                                      String price, boolean featured, String type) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", id);
        m.put("icon", icon);
        m.put("name", name);
        m.put("description", description);
        m.put("price", price);
        m.put("featured", featured);
        m.put("type", type);
        return m;
    }

    private static final AtomicInteger NEXT_REVIEW_ID = new AtomicInteger(4);
    private static final List<Map<String, Object>> REVIEWS = new CopyOnWriteArrayList<>(List.of(
            review(1, "Rina Mehta", "Phoenix, AZ", 5, "They installed our cameras in a single afternoon and actually explained how the system worked instead of rushing off.", "2026-08-02T10:00:00", true),
            review(2, "David Kim", "Phoenix, AZ", 5, "Our access control panel went down late on a Friday and someone was on-site within the hour.", "2026-08-03T09:00:00", true),
            review(3, "Amara Torres", "Phoenix, AZ", 4, "Clean cable runs, no mess left behind, and the monitoring app is genuinely easy to use.", "2026-08-06T12:00:00", false)
    ));

    private static Map<String, Object> review(int id, String reviewerName, String reviewerCity, int stars,
                                                 String text, String submittedAt, boolean approved) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", id);
        m.put("reviewerName", reviewerName);
        m.put("reviewerCity", reviewerCity);
        m.put("stars", stars);
        m.put("text", text);
        m.put("submittedAt", submittedAt);
        m.put("approved", approved);
        return m;
    }

    // ── Auth (demo only — accepts any non-blank email/password) ──
    @PostMapping("/auth/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, Object> body) {
        String email = String.valueOf(body.getOrDefault("email", "")).trim();
        String password = String.valueOf(body.getOrDefault("password", "")).trim();
        if (email.isEmpty() || password.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("message", "Incorrect email or password"));
        }
        return ResponseEntity.ok(Map.of("token", "demo-token-" + UUID.randomUUID()));
    }

    // ── Dashboard ──
    @GetMapping("/admin/dashboard/summary")
    public Map<String, Object> dashboardSummary() {
        int totalRequests = BOOKINGS.size();
        long completed = BOOKINGS.stream().filter(b -> (boolean) b.get("completed")).count();
        long pending = totalRequests - completed;

        int totalRevenue = BOOKINGS.stream()
                .filter(b -> (boolean) b.get("completed"))
                .mapToInt(b -> SERVICE_PRICE.getOrDefault((String) b.get("service"), 200))
                .sum();

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalRequests", totalRequests);
        summary.put("monthBookings", totalRequests);
        summary.put("pending", pending);
        summary.put("completed", completed);
        summary.put("totalRevenue", totalRevenue);
        summary.put("monthRevenue", totalRevenue);
        summary.put("activeServiceCount", SERVICES.size());
        summary.put("completionRate", totalRequests == 0 ? 0.0 : Math.round((completed * 1000.0 / totalRequests)) / 10.0);
        summary.put("avgJobValue", completed == 0 ? 0.0 : Math.round((totalRevenue * 100.0 / completed)) / 100.0);
        summary.put("yearRevenue", totalRevenue);
        summary.put("yearBookings", totalRequests);
        summary.put("currentYearLabel", String.valueOf(LocalDateTime.now().getYear()));
        summary.put("monthlyChart", List.of(Map.of("label", "Aug", "revenue", totalRevenue, "count", totalRequests)));

        Map<String, Long> breakdown = BOOKINGS.stream()
                .collect(Collectors.groupingBy(b -> (String) b.get("service"), Collectors.counting()));
        summary.put("serviceBreakdown", breakdown);

        List<Map<String, Object>> recent = BOOKINGS.stream()
                .limit(5)
                .map(b -> {
                    Map<String, Object> r = new LinkedHashMap<>();
                    r.put("id", b.get("id"));
                    r.put("firstName", b.get("firstName"));
                    r.put("lastName", b.get("lastName"));
                    r.put("service", b.get("service"));
                    r.put("preferredDate", b.get("preferredDate"));
                    r.put("completed", b.get("completed"));
                    return r;
                })
                .collect(Collectors.toList());
        summary.put("recentRequests", recent);

        return summary;
    }

    // ── Bookings ──
    @GetMapping("/admin/bookings")
    public List<Map<String, Object>> getBookings() {
        return BOOKINGS;
    }

    @PostMapping("/admin/bookings/{id}/complete")
    public ResponseEntity<Void> completeBooking(@PathVariable int id) {
        return setCompleted(id, true);
    }

    @PostMapping("/admin/bookings/{id}/reopen")
    public ResponseEntity<Void> reopenBooking(@PathVariable int id) {
        return setCompleted(id, false);
    }

    private ResponseEntity<Void> setCompleted(int id, boolean completed) {
        for (Map<String, Object> b : BOOKINGS) {
            if (Objects.equals(b.get("id"), id)) {
                b.put("completed", completed);
                return ResponseEntity.ok().build();
            }
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/admin/bookings/{id}")
    public ResponseEntity<Void> deleteBooking(@PathVariable int id) {
        BOOKINGS.removeIf(b -> Objects.equals(b.get("id"), id));
        return ResponseEntity.ok().build();
    }

    // ── Services & Plans ──
    @GetMapping("/admin/services")
    public Map<String, Object> getServiceCatalog() {
        Map<String, List<Map<String, Object>>> byType = SERVICES.stream()
                .collect(Collectors.groupingBy(s -> (String) s.get("type"), LinkedHashMap::new, Collectors.toList()));

        Map<String, Object> catalog = new LinkedHashMap<>();
        catalog.put("services", byType.getOrDefault("service", List.of()));
        catalog.put("plans", byType.getOrDefault("plan", List.of()));
        catalog.put("addons", byType.getOrDefault("addon", List.of()));
        return catalog;
    }

    @PostMapping("/admin/services")
    public Map<String, Object> addServiceItem(@RequestBody Map<String, Object> body) {
        Map<String, Object> item = serviceItem(
                NEXT_SERVICE_ID.getAndIncrement(),
                String.valueOf(body.getOrDefault("icon", "")),
                String.valueOf(body.getOrDefault("name", "Untitled")),
                String.valueOf(body.getOrDefault("description", "")),
                String.valueOf(body.getOrDefault("price", "")),
                Boolean.TRUE.equals(body.get("featured")),
                String.valueOf(body.getOrDefault("type", "service"))
        );
        SERVICES.add(item);
        return item;
    }

    @PutMapping("/admin/services/{id}")
    public ResponseEntity<Map<String, Object>> editServiceItem(@PathVariable int id, @RequestBody Map<String, Object> body) {
        for (int i = 0; i < SERVICES.size(); i++) {
            if (Objects.equals(SERVICES.get(i).get("id"), id)) {
                Map<String, Object> updated = serviceItem(
                        id,
                        String.valueOf(body.getOrDefault("icon", "")),
                        String.valueOf(body.getOrDefault("name", "Untitled")),
                        String.valueOf(body.getOrDefault("description", "")),
                        String.valueOf(body.getOrDefault("price", "")),
                        Boolean.TRUE.equals(body.get("featured")),
                        String.valueOf(body.getOrDefault("type", "service"))
                );
                SERVICES.set(i, updated);
                return ResponseEntity.ok(updated);
            }
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/admin/services/{id}")
    public ResponseEntity<Void> deleteServiceItem(@PathVariable int id) {
        SERVICES.removeIf(s -> Objects.equals(s.get("id"), id));
        return ResponseEntity.ok().build();
    }

    // ── Account ──
    @PostMapping("/admin/account/password")
    public ResponseEntity<Map<String, Object>> changePassword(@RequestBody Map<String, Object> body) {
        String current = String.valueOf(body.getOrDefault("currentPassword", ""));
        if (current.isBlank()) {
            return ResponseEntity.status(401).body(Map.of("message", "Current password is incorrect (demo mode)."));
        }
        return ResponseEntity.ok(Map.of("message", "Password updated (demo mode — not actually persisted)."));
    }

    // ── Reviews ──
    @GetMapping("/admin/reviews")
    public List<Map<String, Object>> getReviews() {
        return REVIEWS;
    }

    @PostMapping("/admin/reviews/{id}/approve")
    public ResponseEntity<Void> approveReview(@PathVariable int id) {
        for (Map<String, Object> r : REVIEWS) {
            if (Objects.equals(r.get("id"), id)) {
                r.put("approved", true);
                return ResponseEntity.ok().build();
            }
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/admin/reviews/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable int id) {
        REVIEWS.removeIf(r -> Objects.equals(r.get("id"), id));
        return ResponseEntity.ok().build();
    }
}
