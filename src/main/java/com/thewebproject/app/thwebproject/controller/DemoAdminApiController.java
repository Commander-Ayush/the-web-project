package com.thewebproject.app.thwebproject.controller;

import com.thewebproject.app.thwebproject.entity.*;
import com.thewebproject.app.thwebproject.repositories.*;
import com.thewebproject.app.thwebproject.service.ClientDirectoryService;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/demo/{clientId}/admin")
public class DemoAdminApiController {
    private static final Map<String,Integer> PRICE=Map.of("CCTV Installation",450,"Access Control Systems",600,"Alarm Monitoring",240,"Structured Cabling",300,"24/7 Remote Monitoring",320,"Maintenance & Support",160,"General Inquiry",200);
    private final DemoBookingRepository bookings;
    private final DemoReviewRepository reviews;
    private final ClientDirectoryService clients;
    public DemoAdminApiController(DemoBookingRepository bookings,DemoReviewRepository reviews,ClientDirectoryService clients){this.bookings=bookings;this.reviews=reviews;this.clients=clients;}
    private void requireClient(int id){if(id!=0&&clients.findById(id).isEmpty())throw new ResponseStatusException(HttpStatus.NOT_FOUND,"No demo client found for id "+id);}

    @GetMapping("/dashboard/summary")
    public Map<String,Object> summary(@PathVariable int clientId){
        requireClient(clientId); List<DemoBooking> all=bookings.findByClientIdOrderBySubmittedAtDesc(clientId);
        List<DemoReview> reviewList=reviews.findByClientIdOrderBySubmittedAtDesc(clientId);
        long complete=all.stream().filter(DemoBooking::isCompleted).count(); int revenue=all.stream().filter(DemoBooking::isCompleted).mapToInt(b->PRICE.getOrDefault(b.getService(),200)).sum();
        Map<String,Object> out=new LinkedHashMap<>(); out.put("totalRequests",all.size()); out.put("monthBookings",all.size()); out.put("pending",all.size()-complete); out.put("completed",complete);
        out.put("totalRevenue",revenue);out.put("monthRevenue",revenue);out.put("activeServiceCount",DemoBookingApiController.SERVICES.size());out.put("completionRate",all.isEmpty()?0:Math.round(complete*1000.0/all.size())/10.0);
        out.put("avgJobValue",complete==0?0:Math.round(revenue*100.0/complete)/100.0);out.put("yearRevenue",revenue);out.put("yearBookings",all.size());out.put("currentYearLabel",String.valueOf(LocalDateTime.now().getYear()));
        out.put("rev1m",revenue);out.put("rev3m",revenue);out.put("rev6m",revenue);out.put("rev12m",revenue);out.put("pendingReviewCount",reviewList.stream().filter(r->!r.isApproved()).count());
        out.put("monthlyChart",List.of(Map.of("label",LocalDateTime.now().getMonth().toString().substring(0,3),"revenue",revenue,"count",all.size())));
        out.put("serviceBreakdown",all.stream().collect(Collectors.groupingBy(DemoBooking::getService,Collectors.counting())));out.put("recentRequests",all.stream().limit(5).toList()); return out;
    }
    @GetMapping("/bookings") public List<DemoBooking> bookings(@PathVariable int clientId){requireClient(clientId);return bookings.findByClientIdOrderBySubmittedAtDesc(clientId);}
    @PostMapping("/bookings/{id}/complete") public ResponseEntity<Void> complete(@PathVariable int clientId,@PathVariable long id){return setBooking(clientId,id,true);}
    @PostMapping("/bookings/{id}/reopen") public ResponseEntity<Void> reopen(@PathVariable int clientId,@PathVariable long id){return setBooking(clientId,id,false);}
    private ResponseEntity<Void> setBooking(int clientId,long id,boolean value){return bookings.findByIdAndClientId(id,clientId).map(b->{b.setCompleted(value);bookings.save(b);return ResponseEntity.ok().<Void>build();}).orElse(ResponseEntity.notFound().build());}
    @DeleteMapping("/bookings/{id}") public ResponseEntity<Void> deleteBooking(@PathVariable int clientId,@PathVariable long id){return bookings.findByIdAndClientId(id,clientId).map(b->{bookings.delete(b);return ResponseEntity.ok().<Void>build();}).orElse(ResponseEntity.notFound().build());}

    @GetMapping("/reviews") public List<DemoReview> reviews(@PathVariable int clientId){requireClient(clientId);return reviews.findByClientIdOrderBySubmittedAtDesc(clientId);}
    @PostMapping("/reviews/{id}/approve") public ResponseEntity<Void> approve(@PathVariable int clientId,@PathVariable long id){return reviews.findByIdAndClientId(id,clientId).map(r->{r.setApproved(true);reviews.save(r);return ResponseEntity.ok().<Void>build();}).orElse(ResponseEntity.notFound().build());}
    @DeleteMapping("/reviews/{id}") public ResponseEntity<Void> deleteReview(@PathVariable int clientId,@PathVariable long id){return reviews.findByIdAndClientId(id,clientId).map(r->{reviews.delete(r);return ResponseEntity.ok().<Void>build();}).orElse(ResponseEntity.notFound().build());}

    @GetMapping("/services") public Map<String,Object> services(@PathVariable int clientId){requireClient(clientId);return Map.of("services",DemoBookingApiController.SERVICES,"plans",List.of(),"addons",List.of());}
    @PostMapping("/services") public ResponseEntity<Map<String,Object>> lockedServices(){return ResponseEntity.status(423).body(Map.of("message","Service editing is disabled in testing mode."));}
    @PutMapping("/services/{id}") public ResponseEntity<Map<String,Object>> lockedServiceEdit(){return lockedServices();}
    @DeleteMapping("/services/{id}") public ResponseEntity<Map<String,Object>> lockedServiceDelete(){return lockedServices();}
}
