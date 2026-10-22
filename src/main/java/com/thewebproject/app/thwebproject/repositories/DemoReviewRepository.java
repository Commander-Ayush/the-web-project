package com.thewebproject.app.thwebproject.repositories;

import com.thewebproject.app.thwebproject.entity.DemoReview;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface DemoReviewRepository extends JpaRepository<DemoReview, Long> {
    List<DemoReview> findByClientIdOrderBySubmittedAtDesc(Integer clientId);
    List<DemoReview> findByClientIdAndApprovedTrueOrderBySubmittedAtDesc(Integer clientId);
    Optional<DemoReview> findByIdAndClientId(Long id, Integer clientId);
}
