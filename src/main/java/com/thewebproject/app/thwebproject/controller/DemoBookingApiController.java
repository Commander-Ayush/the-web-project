package com.thewebproject.app.thwebproject.controller;

import com.thewebproject.app.thwebproject.entity.DemoBooking;
import com.thewebproject.app.thwebproject.entity.DemoReview;
import com.thewebproject.app.thwebproject.repositories.DemoBookingRepository;
import com.thewebproject.app.thwebproject.repositories.DemoReviewRepository;
import com.thewebproject.app.thwebproject.service.ClientDirectoryService;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;

@RestController
@RequestMapping("/api/demo/{clientId}")
public class DemoBookingApiController {
    static final List<Map<String, Object>> SERVICES = List.of(
        service(1,"shield","CCTV Installation","From $450"), service(2,"key","Access Control Systems","From $600"),
        service(3,"bell","Alarm Monitoring","From $60/mo"), service(4,"cable","Structured Cabling","From $300"),
        service(5,"radio","24/7 Remote Monitoring","From $80/mo"), service(6,"tool","Maintenance & Support","From $40/mo"));
    private final DemoBookingRepository bookings;
    private final DemoReviewRepository reviews;
    private final ClientDirectoryService clients;

    public DemoBookingApiController(DemoBookingRepository bookings, DemoReviewRepository reviews, ClientDirectoryService clients) {
        this.bookings=bookings; this.reviews=reviews; this.clients=clients;
    }
    private static Map<String,Object> service(int id,String icon,String name,String price) {
        Map<String,Object> s=new LinkedHashMap<>();
        s.put("id",id); s.put("icon",icon); s.put("name",name); s.put("price",price);
        s.put("description",name+" configured for your property by a qualified security integrator.");
        s.put("featured",id==1); s.put("features",List.of()); return s;
    }
    private void requireClient(int id) {
        if(id!=0 && clients.findById(id).isEmpty()) throw new ResponseStatusException(HttpStatus.NOT_FOUND,"No demo client found for id "+id);
    }
    @GetMapping("/services")
    public List<Map<String,Object>> services(@PathVariable int clientId) { requireClient(clientId); return SERVICES; }

    @PostMapping("/bookings")
    public ResponseEntity<Map<String,Object>> booking(@PathVariable int clientId,@RequestBody Map<String,Object> body) {
        requireClient(clientId);
        String first=text(body,"firstName"), last=text(body,"lastName");
        if(first.isBlank()||last.isBlank()) return ResponseEntity.badRequest().body(Map.of("message","First and last name are required."));
        DemoBooking b=new DemoBooking(); b.setClientId(clientId); b.setFirstName(first); b.setLastName(last);
        b.setEmail(text(body,"email")); b.setPhone(text(body,"phone")); b.setAddress(text(body,"address"));
        b.setPreferredDate(text(body,"preferredDate")); b.setNotes(text(body,"notes")); b.setService(serviceName(body.get("serviceOfferingId")));
        b=bookings.save(b); return ResponseEntity.ok(Map.of("message","Booking received.","id",b.getId()));
    }
    @GetMapping("/reviews")
    public List<DemoReview> reviews(@PathVariable int clientId) { requireClient(clientId); return reviews.findByClientIdAndApprovedTrueOrderBySubmittedAtDesc(clientId); }

    @PostMapping("/reviews")
    public ResponseEntity<Map<String,Object>> review(@PathVariable int clientId,@RequestBody Map<String,Object> body) {
        requireClient(clientId); String name=text(body,"reviewerName"), value=text(body,"text"); int stars;
        try { stars=Integer.parseInt(String.valueOf(body.getOrDefault("stars",0))); } catch(NumberFormatException e) { stars=0; }
        if(name.isBlank()||value.isBlank()||stars<1||stars>5) return ResponseEntity.badRequest().body(Map.of("message","Name, feedback, and a 1-5 star rating are required."));
        DemoReview r=new DemoReview(); r.setClientId(clientId); r.setReviewerName(name); r.setReviewerCity(text(body,"reviewerCity"));
        r.setStars(stars); r.setText(value); r=reviews.save(r); return ResponseEntity.ok(Map.of("message","Review submitted for approval.","id",r.getId()));
    }
    static String text(Map<String,Object> body,String key) { Object v=body.get(key); return v==null?"":String.valueOf(v).trim(); }
    private String serviceName(Object id) { return SERVICES.stream().filter(s->String.valueOf(s.get("id")).equals(String.valueOf(id))).map(s->String.valueOf(s.get("name"))).findFirst().orElse("General Inquiry"); }
}
