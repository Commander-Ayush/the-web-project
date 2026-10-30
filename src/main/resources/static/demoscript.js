document.addEventListener("DOMContentLoaded", function () {
    // 1. Client Data Injection (static fallback)
    const data = window.CLIENT_DATA || {};
    if (data.businessName) {
        const siteLogo = document.getElementById("site-logo");
        if (siteLogo) siteLogo.innerHTML = `${data.businessName.replace(/(Vista|Security)/, "<span>$1</span>")}`;
        const footerName = document.getElementById("footer-name");
        if (footerName) footerName.textContent = data.businessName;
    }

    if (data.phone) {
        const phoneEl = document.getElementById("contact-phone");
        if (phoneEl) phoneEl.textContent = data.phone;
    }

    if (data.email) {
        const emailEl = document.getElementById("contact-email");
        if (emailEl) emailEl.textContent = data.email;
    }

    if (data.address) {
        const addrEl = document.getElementById("contact-address");
        if (addrEl) addrEl.textContent = data.address;
    }

    const footerYear = document.getElementById("footer-year");
    if (footerYear) footerYear.textContent = new Date().getFullYear();

    function escapeHtml(str) {
        const div = document.createElement("div");
        div.textContent = str == null ? "" : String(str);
        return div.innerHTML;
    }

    // 1b. Live company info from the backend.
    if (typeof Api !== "undefined" && Api.getCompany) {
        Api.getCompany()
            .then((company) => {
                if (!company) return;

                if (company.name) {
                    const siteLogo = document.getElementById("site-logo");
                    if (siteLogo) siteLogo.innerHTML = company.name.replace(/(Vista|Security)/, "<span>$1</span>");
                    const footerName = document.getElementById("footer-name");
                    if (footerName) footerName.textContent = company.name;
                }

                if (company.phone) {
                    const phoneEl = document.getElementById("contact-phone");
                    if (phoneEl) phoneEl.textContent = company.phone;
                }

                if (company.email) {
                    const emailEl = document.getElementById("contact-email");
                    if (emailEl) emailEl.textContent = company.email;
                }

                if (company.city || company.foundedYear) {
                    const aboutSub = document.querySelector(".about-section .section-sub");
                    if (aboutSub) {
                        const founded = company.foundedYear ? ` since ${company.foundedYear}` : "";
                        const city = company.city ? ` in ${company.city}` : "";
                        aboutSub.textContent = `Providing top-tier low-voltage integration and peace of mind${city}${founded}.`;
                    }
                }
            })
            .catch((err) => {
                console.warn("Could not load company info from backend, keeping static content:", err.message);
            });
    }

    // 2. Mobile Nav Toggle
    const navToggle = document.getElementById("nav-toggle");
    const navMenu = document.getElementById("nav-menu");
    if (navToggle && navMenu) {
        navToggle.addEventListener("click", () => {
            navMenu.classList.toggle("active");
        });
    }

    // 3. Scroll Reveal & Diagonal Glare Observer
    const reveals = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
            }
        });
    }, { threshold: 0.1 });
    reveals.forEach(el => observer.observe(el));

    const glareCard = document.getElementById('glareCard');
    if (glareCard) {
        const glareObserver = new IntersectionObserver((entries, observerInstance) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    glareCard.classList.add('glare-active');
                    observerInstance.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });
        glareObserver.observe(glareCard);
    }

    // 4. Hero Plexus Interactive Background
    const canvas = document.getElementById("plexus-canvas");
    if (canvas) {
        const ctx = canvas.getContext("2d");
        let width = canvas.width = canvas.offsetWidth;
        let height = canvas.height = canvas.offsetHeight;

        const particles = [];
        const particleCount = Math.min(Math.floor(width / 15), 60);

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.6,
                vy: (Math.random() - 0.5) * 0.6,
                radius: Math.random() * 2 + 1
            });
        }

        function animate() {
            ctx.clearRect(0, 0, width, height);

            for (let i = 0; i < particles.length; i++) {
                let p = particles[i];
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0 || p.x > width) p.vx *= -1;
                if (p.y < 0 || p.y > height) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = '#1e293b';
                ctx.fill();

                for (let j = i + 1; j < particles.length; j++) {
                    let p2 = particles[j];
                    let dist = Math.hypot(p.x - p2.x, p.y - p2.y);
                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = 'rgba(30, 41, 59, 0.12)';
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(animate);
        }

        animate();

        window.addEventListener("resize", () => {
            width = canvas.width = canvas.offsetWidth;
            height = canvas.height = canvas.offsetHeight;
        });
    }

    // 5. Services Carousel (Symmetrical Centering - Left & Right Cards)
    function initServicesCarousel() {
        const stage = document.getElementById('services-stage');
        if (!stage) return;

        const cards = Array.from(stage.querySelectorAll('.service-card'));
        const totalCards = cards.length;
        if (totalCards === 0) return;

        let currentIndex = Math.floor(totalCards / 2);
        let isDragging = false;
        let startX = 0;
        let dragDistance = 0;
        const CLICK_THRESHOLD = 6;

        function getCardSpacing() {
            const vw = window.innerWidth;
            if (vw < 480) return 180;
            if (vw < 900) return 220;
            return 250;
        }

        function wrapDiff(diff, total) {
            diff = ((diff % total) + total) % total;
            if (diff > total / 2) diff -= total;
            return diff;
        }

        function renderServices() {
            const spacing = getCardSpacing();
            const vw = window.innerWidth;

            cards.forEach((card, i) => {
                const diff = wrapDiff(i - currentIndex, totalCards);
                const absDiff = Math.abs(diff);

                const translateX = diff * spacing;
                const baseScale = vw < 600 ? 1.0 : 1.15;
                const scale = Math.max(0.6, baseScale - (absDiff * 0.18));
                const zIndex = Math.round(100 - (absDiff * 20));

                let opacity = Math.max(0, 1 - (absDiff * 0.3));
                let brightness = Math.max(0.4, 1 - (absDiff * 0.25));

                card.style.transform = `translate3d(${translateX}px, 0, 0) scale(${scale})`;
                card.style.zIndex = zIndex;
                card.style.opacity = opacity;
                card.style.filter = `brightness(${brightness})`;

                if (absDiff < 0.4) {
                    card.classList.add('is-center');
                } else {
                    card.classList.remove('is-center');
                }
            });
        }

        function snapToNearestCard() {
            currentIndex = Math.round(currentIndex);
            currentIndex = ((currentIndex % totalCards) + totalCards) % totalCards;
            renderServices();
        }

        let lastClientX = 0;

        function onPointerDown(e) {
            isDragging = true;
            dragDistance = 0;
            startX = e.clientX || (e.touches && e.touches[0].clientX);
            lastClientX = startX;
            stage.style.cursor = 'grabbing';
        }

        function onPointerMove(e) {
            if (!isDragging) return;
            const currentX = e.clientX || (e.touches && e.touches[0].clientX);
            const deltaX = currentX - startX;
            dragDistance += Math.abs(deltaX);
            const spacing = getCardSpacing();

            currentIndex -= deltaX / (spacing * 1.8);

            startX = currentX;
            lastClientX = currentX;
            renderServices();
        }

        function onPointerUp() {
            if (!isDragging) return;
            isDragging = false;
            stage.style.cursor = 'grab';

            if (dragDistance < CLICK_THRESHOLD) {
                const stageRect = stage.getBoundingClientRect();
                const stageCenter = stageRect.left + stageRect.width / 2;
                currentIndex += lastClientX < stageCenter ? -1 : 1;
            }

            snapToNearestCard();
        }

        stage.addEventListener('mousedown', onPointerDown);
        window.addEventListener('mousemove', onPointerMove);
        window.addEventListener('mouseup', onPointerUp);

        stage.addEventListener('touchstart', onPointerDown, { passive: true });
        window.addEventListener('touchmove', onPointerMove, { passive: true });
        window.addEventListener('touchend', onPointerUp);

        window.addEventListener('resize', renderServices);
        renderServices();
    }

    // Global View Toggle Handler
    const toggleServicesBtn = document.getElementById('toggle-services-btn');
    const servicesGrid = document.getElementById('services-grid');
    const stage = document.getElementById('services-stage');

    if (toggleServicesBtn && servicesGrid && stage) {
        toggleServicesBtn.addEventListener('click', () => {
            const isGridVisible = !servicesGrid.classList.contains('hidden');

            if (isGridVisible) {
                servicesGrid.classList.add('hidden');
                stage.classList.remove('hidden');
                toggleServicesBtn.textContent = 'Show All';
            } else {
                servicesGrid.classList.remove('hidden');
                stage.classList.add('hidden');
                toggleServicesBtn.textContent = 'Show Carousel';
            }
        });
    }

    // 5b. Pull real service catalog from backend
    // `index` (grid only) staggers the soft-landing animation via the --i CSS variable.
    function buildServiceCardHTML(svc, index) {
        const iconSvg = typeof resolveIconSvg === "function"
            ? resolveIconSvg(svc.icon)
            : "";
        const styleAttr = typeof index === "number" ? ` style="--i:${Math.min(index, 8)}"` : "";
        return `
            <div class="service-card" data-id="${escapeHtml(svc.id)}"${styleAttr}>
                <div class="service-icon">${iconSvg}</div>
                <h3>${escapeHtml(svc.name)}</h3>
                <p>${escapeHtml(svc.description || "")}</p>
                ${svc.price ? `<span class="service-price">${escapeHtml(svc.price)}</span>` : ""}
            </div>`;
    }

    function renderServiceCards(services) {
        const stage = document.getElementById('services-stage');
        const servicesGrid = document.getElementById('services-grid');
        if (!stage || !Array.isArray(services) || services.length === 0) return false;

        stage.innerHTML = services.map((svc) => buildServiceCardHTML(svc)).join('');

        if (servicesGrid) {
            servicesGrid.innerHTML = services.map((svc, i) => buildServiceCardHTML(svc, i)).join('');
        }

        return true;
    }

    function renderBookingServiceOptions(services) {
        const select = document.getElementById('serviceOfferingId');
        if (!select || !Array.isArray(services)) return;

        select.innerHTML = '';
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.disabled = true;
        placeholder.selected = true;
        placeholder.textContent = 'Select a Service';
        select.appendChild(placeholder);

        services.forEach(svc => {
            const opt = document.createElement('option');
            opt.value = svc.id;
            opt.textContent = svc.name;
            select.appendChild(opt);
        });
    }

    function bootServices() {
        // Initialize carousel immediately so skeleton placeholders display with 3D positioning
        initServicesCarousel();

        if (typeof Api !== "undefined" && Api.getServices) {
            Api.getServices()
                .then((services) => {
                    if (renderServiceCards(services)) {
                        renderBookingServiceOptions(services);
                    }
                })
                .catch((err) => {
                    console.warn("Could not load services from backend, keeping static cards:", err.message);
                })
                .finally(() => {
                    // Re-run carousel logic once real cards are inserted into DOM
                    initServicesCarousel();
                });
        }
    }

    bootServices();

    // 7. Reviews — only reviews the admin has approved are shown (GET /reviews returns approved only).
    const REVIEW_SUMMARY_COUNT = 2;
    const toggleReviewsBtn = document.getElementById('toggle-reviews-btn');
    const reviewsSummaryLayout = document.getElementById('reviews-summary-layout');
    const reviewsList = document.getElementById('reviews-list');
    const reviewsGrid = document.getElementById('reviews-grid');

    function starString(n) {
        const count = Math.max(0, Math.min(5, Number(n) || 0));
        return '★'.repeat(count) + '☆'.repeat(5 - count);
    }

    function buildReviewCardHTML(rev) {
        return `
            <div class="review-card">
                <div class="review-header">
                    <span class="reviewer-name">${escapeHtml(rev.reviewerName)}</span>
                    <span class="review-stars" aria-label="${escapeHtml(rev.stars)} out of 5 stars">${starString(rev.stars)}</span>
                </div>
                <p class="review-text">${escapeHtml(rev.text)}</p>
            </div>`;
    }

    function renderReviews(list, emptyMessage) {
        if (!reviewsList || !reviewsGrid) return;
        const reviews = Array.isArray(list) ? list : [];

        reviewsList.innerHTML = reviews.length
            ? reviews.slice(0, REVIEW_SUMMARY_COUNT).map(buildReviewCardHTML).join('')
            : `<div class="review-card review-empty"><p class="review-text">${escapeHtml(emptyMessage || 'No reviews yet. Be the first to share your experience!')}</p></div>`;
        reviewsGrid.innerHTML = reviews.map(buildReviewCardHTML).join('');

        // Nothing more to expand when everything is already in the summary.
        if (toggleReviewsBtn) {
            toggleReviewsBtn.classList.toggle('hidden', reviews.length <= REVIEW_SUMMARY_COUNT);
        }
    }

    if (toggleReviewsBtn && reviewsSummaryLayout && reviewsGrid) {
        toggleReviewsBtn.addEventListener('click', () => {
            const isGridVisible = !reviewsGrid.classList.contains('hidden');

            if (isGridVisible) {
                reviewsGrid.classList.add('hidden');
                reviewsSummaryLayout.classList.remove('hidden');
                toggleReviewsBtn.textContent = 'Show All';
            } else {
                reviewsGrid.classList.remove('hidden');
                reviewsSummaryLayout.classList.add('hidden');
                toggleReviewsBtn.textContent = 'Show Summary';
            }
        });
    }

    if (typeof Api !== 'undefined' && Api.getReviews) {
        Api.getReviews()
            .then((reviews) => renderReviews(reviews))
            .catch((err) => {
                console.warn('Could not load reviews from backend:', err.message);
                renderReviews([], 'Reviews are unavailable right now.');
            });
    } else {
        renderReviews([]);
    }

    // 8. Photo Gallery Center Scroll Helper
    const galleryContainer = document.querySelector('.gallery-container');
    const centerCard = document.querySelector('.center-card');

    if (galleryContainer && centerCard) {
        const galleryObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && window.innerWidth <= 1024) {
                    centerCard.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                }
            });
        }, { threshold: 0.5 });

        galleryObserver.observe(galleryContainer);
    }

    // 8b. Gallery auto-rotation (looks like the static row; photos shift right one place,
    //     the last one fades out and a copy of it slides in at the front).
    (function initGalleryAutoplay() {
        const container = document.querySelector('.gallery-container');
        if (!container || typeof container.animate !== 'function') return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const CYCLE_MS = 2000;      // a new photo replaces the old one every 2 seconds
        const SLIDE_MS = 800;       // how long the slide itself takes (must stay below CYCLE_MS)
        const SCROLL_MAX_W = 1024;  // at/below this width the row is a swipeable strip (see CSS)
        const USER_PAUSE_MS = 4000; // pause after the visitor touches/scrolls the gallery

        let timer = null;
        let inView = false;
        let hovering = false;
        let busy = false;
        let pausedUntil = 0;

        const getCards = () => Array.from(container.querySelectorAll('.gallery-card:not(.gallery-ghost)'));

        function rotateRow() {
            const cards = getCards();
            if (cards.length < 3) return;
            const first = cards[0];
            const last = cards[cards.length - 1];
            const step = cards[1].offsetLeft - first.offsetLeft;
            if (!(step > 0)) return;

            busy = true;
            const ghost = last.cloneNode(true);
            ghost.classList.add('gallery-ghost');
            ghost.classList.remove('center-card');
            ghost.setAttribute('aria-hidden', 'true');
            ghost.style.left = first.offsetLeft + 'px';
            ghost.style.top = first.offsetTop + 'px';
            ghost.style.width = first.offsetWidth + 'px';
            ghost.style.height = first.offsetHeight + 'px';
            container.appendChild(ghost);

            const opts = { duration: SLIDE_MS, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'both' };
            const anims = cards.slice(0, -1).map((c) =>
                c.animate([{ transform: 'translateX(0)' }, { transform: `translateX(${step}px)` }], opts));
            anims.push(last.animate(
                [{ transform: 'translateX(0)', opacity: 1 }, { transform: `translateX(${step * 0.6}px)`, opacity: 0 }], opts));
            anims.push(ghost.animate(
                [{ transform: `translateX(${-step * 0.6}px)`, opacity: 0 }, { transform: 'translateX(0)', opacity: 1 }], opts));

            const cleanup = () => {
                anims.forEach((a) => { try { a.cancel(); } catch (e) { /* already cancelled */ } });
                ghost.remove();
                busy = false;
            };
            Promise.all(anims.map((a) => a.finished)).then(() => {
                container.insertBefore(last, first);   // commit the new order, then drop the temporary transforms
                cleanup();
            }).catch(cleanup);
        }

        function advanceStrip() {
            const cards = getCards();
            if (cards.length < 2) return;
            const mid = container.scrollLeft + container.clientWidth / 2;
            let idx = 0;
            let best = Infinity;
            cards.forEach((c, i) => {
                const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid);
                if (d < best) { best = d; idx = i; }
            });
            const next = cards[(idx + 1) % cards.length];
            container.scrollTo({ left: next.offsetLeft - (container.clientWidth - next.offsetWidth) / 2, behavior: 'smooth' });
        }

        function tick() {
            if (busy || Date.now() < pausedUntil) return;
            if (window.innerWidth <= SCROLL_MAX_W) advanceStrip(); else rotateRow();
        }

        function syncAutoplay() {
            const shouldPlay = inView && !hovering && !document.hidden;
            if (shouldPlay && !timer) timer = setInterval(tick, CYCLE_MS);
            else if (!shouldPlay && timer) { clearInterval(timer); timer = null; }
        }

        container.addEventListener('mouseenter', () => { hovering = true; syncAutoplay(); });
        container.addEventListener('mouseleave', () => { hovering = false; syncAutoplay(); });
        ['pointerdown', 'touchstart', 'wheel'].forEach((evt) => {
            container.addEventListener(evt, () => { pausedUntil = Date.now() + USER_PAUSE_MS; }, { passive: true });
        });
        document.addEventListener('visibilitychange', syncAutoplay);

        new IntersectionObserver((entries) => {
            inView = entries.some((en) => en.isIntersecting);
            syncAutoplay();
        }, { threshold: 0.3 }).observe(container);
    })();

    // 9. Booking Form Submission
    const bookingForm = document.getElementById('booking-form');
    const bookingStatus = document.getElementById('booking-status');

    if (bookingForm) {
        bookingForm.addEventListener("submit", function (e) {
            e.preventDefault();

            if (!bookingForm.checkValidity()) {
                bookingForm.reportValidity();
                return;
            }

            if (bookingStatus) {
                bookingStatus.textContent = "Sending consultation request...";
                bookingStatus.style.color = "var(--primary)";
            }

            const formData = new FormData(bookingForm);
            const payload = Object.fromEntries(formData.entries());

            if (payload.serviceOfferingId) {
                payload.serviceOfferingId = Number(payload.serviceOfferingId);
            }

            ["address", "preferredDate", "notes"].forEach((key) => {
                if (payload[key] === "") payload[key] = null;
            });

            if (typeof Api !== "undefined" && Api.submitBooking) {
                Api.submitBooking(payload)
                    .then(() => {
                        if (bookingStatus) {
                            bookingStatus.textContent = "Thank you! Your request has been submitted successfully.";
                            bookingStatus.style.color = "#10b981";
                        }
                        bookingForm.reset();
                    })
                    .catch((err) => {
                        if (bookingStatus) {
                            bookingStatus.textContent = err && err.message
                                ? err.message
                                : "An error occurred. Please try again later.";
                            bookingStatus.style.color = "#ef4444";
                        }
                    });
            } else {
                setTimeout(() => {
                    if (bookingStatus) {
                        bookingStatus.textContent = "Thank you! Your request has been submitted.";
                        bookingStatus.style.color = "#10b981";
                    }
                    bookingForm.reset();
                }, 800);
            }
        });
    }

    // 9b. Review Submission
    const reviewSubmitBtn = document.getElementById('review-submit-btn');
    const reviewNameInput = document.getElementById('review-name-input');
    const reviewTextInput = document.getElementById('review-text-input');
    const reviewStatus = document.getElementById('review-status');

    if (reviewSubmitBtn) {
        reviewSubmitBtn.addEventListener('click', function () {
            const name = reviewNameInput ? reviewNameInput.value.trim() : '';
            const text = reviewTextInput ? reviewTextInput.value.trim() : '';

            if (reviewStatus) reviewStatus.style.display = 'block';

            if (!name) {
                if (reviewStatus) {
                    reviewStatus.textContent = 'Please enter your name.';
                    reviewStatus.style.color = '#ef4444';
                }
                return;
            }
            if (!currentReviewRating) {
                if (reviewStatus) {
                    reviewStatus.textContent = 'Please select a star rating.';
                    reviewStatus.style.color = '#ef4444';
                }
                return;
            }
            if (!text) {
                if (reviewStatus) {
                    reviewStatus.textContent = 'Please write a short review.';
                    reviewStatus.style.color = '#ef4444';
                }
                return;
            }

            const payload = { reviewerName: name, stars: currentReviewRating, text: text };

            if (reviewStatus) {
                reviewStatus.textContent = 'Submitting your review...';
                reviewStatus.style.color = 'var(--primary)';
            }

            if (typeof Api !== 'undefined' && Api.submitReview) {
                Api.submitReview(payload)
                    .then(() => {
                        if (reviewStatus) {
                            reviewStatus.textContent = 'Thank you! Your review has been submitted and will appear once it is approved.';
                            reviewStatus.style.color = '#10b981';
                        }
                        if (reviewNameInput) reviewNameInput.value = '';
                        if (reviewTextInput) reviewTextInput.value = '';
                        setRating(0);
                    })
                    .catch((err) => {
                        if (reviewStatus) {
                            reviewStatus.textContent = err && err.message
                                ? err.message
                                : 'An error occurred. Please try again later.';
                            reviewStatus.style.color = '#ef4444';
                        }
                    });
            } else {
                setTimeout(() => {
                    if (reviewStatus) {
                        reviewStatus.textContent = 'Thank you! Your review has been submitted and will appear once it is approved.';
                        reviewStatus.style.color = '#10b981';
                    }
                    if (reviewNameInput) reviewNameInput.value = '';
                    if (reviewTextInput) reviewTextInput.value = '';
                    setRating(0);
                }, 800);
            }
        });
    }
});

let currentReviewRating = 0;
function setRating(rating) {
    currentReviewRating = rating;
    const stars = document.querySelectorAll('#starPicker span');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}