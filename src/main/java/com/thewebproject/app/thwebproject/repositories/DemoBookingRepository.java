package com.thewebproject.app.thwebproject.repositories;

import com.thewebproject.app.thwebproject.entity.DemoBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface DemoBookingRepository extends JpaRepository<DemoBooking, Long> {
    List<DemoBooking> findByClientIdOrderBySubmittedAtDesc(Integer clientId);
    Optional<DemoBooking> findByIdAndClientId(Long id, Integer clientId);
}
