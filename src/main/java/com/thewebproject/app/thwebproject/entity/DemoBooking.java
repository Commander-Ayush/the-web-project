package com.thewebproject.app.thwebproject.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "demo_bookings", indexes = @Index(name = "idx_demo_booking_client", columnList = "client_id"))
public class DemoBooking {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "client_id", nullable = false) private Integer clientId;
    @Column(nullable = false) private String firstName;
    @Column(nullable = false) private String lastName;
    private String phone;
    private String email;
    private String address;
    private String service;
    private String preferredDate;
    @Column(length = 2000) private String notes;
    @Column(nullable = false) private LocalDateTime submittedAt = LocalDateTime.now();
    @Column(nullable = false) private boolean completed;

    public Long getId() { return id; }
    public Integer getClientId() { return clientId; }
    public void setClientId(Integer clientId) { this.clientId = clientId; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getService() { return service; }
    public void setService(String service) { this.service = service; }
    public String getPreferredDate() { return preferredDate; }
    public void setPreferredDate(String preferredDate) { this.preferredDate = preferredDate; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }
}
