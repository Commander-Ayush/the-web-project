package com.thewebproject.app.thwebproject.service;

import com.thewebproject.app.thwebproject.entity.DemoReview;
import com.thewebproject.app.thwebproject.repositories.DemoReviewRepository;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Puts a few sample reviews in front of every demo client so the admin panel's
 * review moderation has something to show: several already-approved reviews
 * (these appear on the demo site) plus one pending review to approve.
 *
 * Seeding runs lazily, once per client per server start, the first time that
 * client's reviews are requested. It only inserts a sample review if an
 * identical one (same reviewer + text) isn't already stored, so real
 * submissions are never touched and restarts don't create duplicates.
 */
@Component
public class DemoReviewSeeder {

    private record Sample(String name, String city, int stars, String text, int daysAgo, boolean approved) {}

    private static final List<Sample> SAMPLES = List.of(
            new Sample("Alex M.", "Austin, TX", 5,
                    "Outstanding setup. Installed 8 CCTV cameras around our warehouse with zero downtime.", 21, true),
            new Sample("Sarah K.", "Phoenix, AZ", 5,
                    "The access control app is super smooth. Our office team loves not carrying physical keys.", 18, true),
            new Sample("David P.", "Dallas, TX", 5,
                    "Fast maintenance response time! They fixed our panel issue within 2 hours.", 14, true),
            new Sample("Elena R.", "Denver, CO", 5,
                    "Clean cabling and high quality 4K camera streams. Very professional team.", 10, true),
            new Sample("Marcus T.", "Chicago, IL", 5,
                    "24/7 monitoring gives us total peace of mind for our retail store.", 7, true),
            new Sample("Priya N.", "San Jose, CA", 4,
                    "Great communication from survey to install. The crew was tidy and finished a day early.", 4, true),
            // Left pending on purpose so the approve button has something to do.
            new Sample("Jordan L.", "Miami, FL", 4,
                    "Smooth installation and friendly technicians. Would love a bit more detail on pricing up front.", 1, false)
    );

    private final DemoReviewRepository reviews;
    private final Set<Integer> seededClients = ConcurrentHashMap.newKeySet();

    public DemoReviewSeeder(DemoReviewRepository reviews) {
        this.reviews = reviews;
    }

    public void ensureSeeded(int clientId) {
        if (!seededClients.add(clientId)) return;
        LocalDateTime now = LocalDateTime.now();
        for (Sample s : SAMPLES) {
            if (reviews.existsByClientIdAndReviewerNameAndText(clientId, s.name(), s.text())) continue;
            DemoReview r = new DemoReview();
            r.setClientId(clientId);
            r.setReviewerName(s.name());
            r.setReviewerCity(s.city());
            r.setStars(s.stars());
            r.setText(s.text());
            r.setSubmittedAt(now.minusDays(s.daysAgo()));
            r.setApproved(s.approved());
            reviews.save(r);
        }
    }
}
