/*
 * TH WEB PROJECT
 * Complete replacement script.
 * Uses existing elements; no HTML changes required.
 * Native Spring Boot form submissions are preserved.
 */

(() => {
    function initialize() {
        const reducedMotion = matchMedia(
            "(prefers-reduced-motion: reduce)"
        );

        const precisePointer = matchMedia(
            "(hover: hover) and (pointer: fine)"
        );

        const hero = document.querySelector(".hero");
        const nav = document.querySelector("nav");
        const cta = document.querySelector(".cta-strip");

        // Update text without adding or removing elements.
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT
        );

        let node;

        while ((node = walker.nextNode())) {
            const parent = node.parentElement;

            if (
                parent &&
                !["SCRIPT", "STYLE"].includes(parent.tagName)
            ) {
                node.nodeValue = node.nodeValue.replaceAll(
                    "Growth Multiplier",
                    "Th Web Project"
                );
            }
        }

        document.title = document.title.replaceAll(
            "Growth Multiplier",
            "Th Web Project"
        );

        document
            .querySelectorAll(".nav-logo, .footer-logo")
            .forEach(element => {
                element.setAttribute(
                    "aria-label",
                    "Th Web Project"
                );
            });

        // Scroll reveals.
        const revealElements = [
            ...document.querySelectorAll(".reveal")
        ];

        if (
            "IntersectionObserver" in window &&
            !reducedMotion.matches
        ) {
            const revealObserver = new IntersectionObserver(
                entries => {
                    entries.forEach(entry => {
                        if (!entry.isIntersecting) return;

                        entry.target.classList.remove("is-pending");
                        entry.target.classList.add("visible");

                        revealObserver.unobserve(entry.target);
                    });
                },
                {
                    threshold: 0,
                    rootMargin: "0px 0px -24px 0px"
                }
            );

            revealElements.forEach(element => {
                if (
                    element.getBoundingClientRect().top >
                    window.innerHeight
                ) {
                    element.classList.add("is-pending");
                }

                revealObserver.observe(element);
            });

            reducedMotion.addEventListener("change", () => {
                if (!reducedMotion.matches) return;

                revealElements.forEach(element => {
                    element.classList.remove("is-pending");
                    element.classList.add("visible");
                });

                revealObserver.disconnect();
            });
        }

        // Parallax calculations are scheduled once per frame.
        let scrollFrame = 0;

        const clamp = (value, minimum, maximum) => {
            return Math.min(maximum, Math.max(minimum, value));
        };

        function paintScrollEffects() {
            scrollFrame = 0;

            const viewportHeight = window.innerHeight;
            const scrollTop = window.scrollY;

            // Read layout before writing styles.
            const pageDistance =
                document.documentElement.scrollHeight -
                viewportHeight;

            const heroBounds = hero?.getBoundingClientRect();
            const ctaBounds = cta?.getBoundingClientRect();

            const progress = pageDistance > 0
                ? clamp(scrollTop / pageDistance, 0, 1)
                : 0;

            nav?.classList.toggle(
                "is-scrolled",
                scrollTop > 16
            );

            nav?.style.setProperty(
                "--scroll-progress",
                String(progress)
            );

            const motionEnabled = !reducedMotion.matches;
            const mobile = window.innerWidth <= 760;

            if (hero && heroBounds) {
                const travelled = clamp(
                    -heroBounds.top,
                    0,
                    heroBounds.height
                );

                // Background travels faster than the text.
                const backgroundShift = motionEnabled
                    ? travelled * (mobile ? 0.16 : 0.38)
                    : 0;

                const titleShift = motionEnabled
                    ? travelled * (mobile ? 0.035 : 0.10)
                    : 0;

                const eyebrowShift = motionEnabled
                    ? travelled * (mobile ? 0.025 : 0.07)
                    : 0;

                const subShift = motionEnabled
                    ? travelled * (mobile ? 0.015 : 0.045)
                    : 0;

                hero.style.setProperty(
                    "--parallax",
                    `${backgroundShift.toFixed(2)}px`
                );

                hero.style.setProperty(
                    "--hero-title-shift",
                    `${titleShift.toFixed(2)}px`
                );

                hero.style.setProperty(
                    "--hero-eyebrow-shift",
                    `${eyebrowShift.toFixed(2)}px`
                );

                hero.style.setProperty(
                    "--hero-sub-shift",
                    `${subShift.toFixed(2)}px`
                );
            }

            if (cta && ctaBounds) {
                const centerDistance =
                    viewportHeight / 2 -
                    (ctaBounds.top + ctaBounds.height / 2);

                const shift = motionEnabled
                    ? clamp(
                        centerDistance * (mobile ? 0.16 : 0.35),
                        -180,
                        180
                    )
                    : 0;

                cta.style.setProperty(
                    "--cta-shift",
                    `${shift.toFixed(2)}px`
                );
            }
        }

        function scheduleScrollEffects() {
            if (scrollFrame) return;

            scrollFrame = requestAnimationFrame(
                paintScrollEffects
            );
        }

        window.addEventListener(
            "scroll",
            scheduleScrollEffects,
            { passive: true }
        );

        window.addEventListener(
            "resize",
            scheduleScrollEffects,
            { passive: true }
        );

        window.addEventListener(
            "load",
            scheduleScrollEffects,
            { once: true }
        );

        reducedMotion.addEventListener(
            "change",
            scheduleScrollEffects
        );

        document.fonts?.ready.then(scheduleScrollEffects);

        paintScrollEffects();

        // Pointer lighting: desktop mouse/trackpad only.
        const lightingElements = [
            hero,
            ...document.querySelectorAll(".feature-card")
        ].filter(Boolean);

        lightingElements.forEach(element => {
            const prefix = element === hero
                ? "--light-"
                : "--card-";

            let pointerFrame = 0;
            let pointerX = 0;
            let pointerY = 0;

            function resetLighting() {
                if (pointerFrame) {
                    cancelAnimationFrame(pointerFrame);
                }

                pointerFrame = 0;
                element.style.removeProperty(prefix + "x");
                element.style.removeProperty(prefix + "y");
            }

            element.addEventListener(
                "pointermove",
                event => {
                    if (
                        reducedMotion.matches ||
                        !precisePointer.matches
                    ) {
                        return;
                    }

                    pointerX = event.clientX;
                    pointerY = event.clientY;

                    if (pointerFrame) return;

                    pointerFrame = requestAnimationFrame(() => {
                        pointerFrame = 0;

                        if (
                            reducedMotion.matches ||
                            !precisePointer.matches
                        ) {
                            return;
                        }

                        const bounds =
                            element.getBoundingClientRect();

                        element.style.setProperty(
                            prefix + "x",
                            `${pointerX - bounds.left}px`
                        );

                        element.style.setProperty(
                            prefix + "y",
                            `${pointerY - bounds.top}px`
                        );
                    });
                },
                { passive: true }
            );

            element.addEventListener(
                "pointerleave",
                resetLighting
            );

            reducedMotion.addEventListener(
                "change",
                resetLighting
            );
        });

        // Pause decorative animation outside the viewport.
        if ("IntersectionObserver" in window) {
            const animatedElements = [hero, cta].filter(Boolean);
            const visibleElements = new Set();

            function updatePlayback() {
                animatedElements.forEach(element => {
                    element.classList.toggle(
                        "effects-paused",
                        document.hidden ||
                        !visibleElements.has(element)
                    );
                });
            }

            const animationObserver = new IntersectionObserver(
                entries => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            visibleElements.add(entry.target);
                        } else {
                            visibleElements.delete(entry.target);
                        }
                    });

                    updatePlayback();
                }
            );

            animatedElements.forEach(element => {
                animationObserver.observe(element);
            });

            document.addEventListener(
                "visibilitychange",
                updatePlayback
            );
        }

        // Respect reduced motion despite the original inline handler.
        document.querySelector(".hero-arrow")?.addEventListener(
            "click",
            event => {
                if (!reducedMotion.matches) return;

                event.preventDefault();
                event.stopImmediatePropagation();

                document.getElementById("pricing")?.scrollIntoView({
                    behavior: "instant"
                });
            },
            true
        );

        // Existing booking and terms dialogs.
        const bookingOverlay =
            document.getElementById("bookingModal");

        const termsOverlay =
            document.getElementById("termsModal");

        const bookingForm =
            document.getElementById("bookingForm");

        const formView =
            document.getElementById("modalFormView");

        const successView =
            document.getElementById("modalSuccessView");

        const planSelect =
            document.getElementById("plan");

        const dialogs = [
            bookingOverlay,
            termsOverlay
        ].filter(Boolean);

        const previousFocus = new WeakMap();

        let savedBodyOverflow = "";
        let bookingResetTimer = 0;

        const planValues = {
            flexible: "Flexible - $1,199 setup + $119/mo",
            "2year": "2-Year Bundle - $2,799 one-time",
            "4year": "4-Year Bundle - $3,799 one-time"
        };

        function getFocusableElements(overlay) {
            return [
                ...overlay.querySelectorAll(
                    'button, a[href], input, select, textarea, ' +
                    '[tabindex]:not([tabindex="-1"])'
                )
            ].filter(element => {
                return (
                    !element.disabled &&
                    element.getClientRects().length > 0 &&
                    getComputedStyle(element).visibility !== "hidden"
                );
            });
        }

        function showDialog(overlay) {
            if (!overlay) return;

            if (overlay.classList.contains("active")) return;

            const anotherDialogOpen = dialogs.some(dialog => {
                return dialog.classList.contains("active");
            });

            if (!anotherDialogOpen) {
                savedBodyOverflow = document.body.style.overflow;
            }

            previousFocus.set(overlay, document.activeElement);

            overlay.classList.add("active");
            overlay.setAttribute("aria-hidden", "false");
            document.body.style.overflow = "hidden";

            requestAnimationFrame(() => {
                if (!overlay.classList.contains("active")) return;

                const items = getFocusableElements(overlay);
                const box = overlay.querySelector(".modal-box");

                (items[0] || box)?.focus();
            });
        }

        function hideDialog(overlay) {
            if (!overlay) return;

            overlay.classList.remove("active");
            overlay.setAttribute("aria-hidden", "true");

            const anotherDialogOpen = dialogs.some(dialog => {
                return dialog.classList.contains("active");
            });

            if (!anotherDialogOpen) {
                document.body.style.overflow = savedBodyOverflow;
            }

            const target = previousFocus.get(overlay);

            if (target?.isConnected) {
                target.focus({ preventScroll: true });
            }
        }

        // These must be global for the existing HTML onclick handlers.
        window.openModal = function (planKey) {
            clearTimeout(bookingResetTimer);

            if (formView) {
                formView.style.display = "";
            }

            successView?.classList.remove("active");

            if (planKey && planValues[planKey] && planSelect) {
                planSelect.value = planValues[planKey];
            }

            showDialog(bookingOverlay);
        };

        window.closeModal = function () {
            hideDialog(bookingOverlay);

            clearTimeout(bookingResetTimer);

            bookingResetTimer = setTimeout(() => {
                if (bookingOverlay?.classList.contains("active")) {
                    return;
                }

                if (formView) {
                    formView.style.display = "";
                }

                successView?.classList.remove("active");
                bookingForm?.reset();
            }, 220);
        };

        window.openTerms = function () {
            showDialog(termsOverlay);
        };

        window.closeTerms = function () {
            hideDialog(termsOverlay);
        };

        dialogs.forEach(overlay => {
            const box = overlay.querySelector(".modal-box");
            const title = overlay.querySelector(".modal-title");

            overlay.setAttribute("aria-hidden", "true");

            if (box) {
                box.setAttribute("role", "dialog");
                box.setAttribute("aria-modal", "true");
                box.setAttribute("tabindex", "-1");

                if (title) {
                    box.setAttribute(
                        "aria-label",
                        title.textContent.trim()
                    );
                }
            }

            overlay.addEventListener("click", event => {
                if (event.target !== overlay) return;

                if (overlay === bookingOverlay) {
                    window.closeModal();
                } else {
                    window.closeTerms();
                }
            });

            overlay.addEventListener("keydown", event => {
                if (event.key !== "Tab") return;

                const items = getFocusableElements(overlay);

                if (!items.length) {
                    event.preventDefault();
                    box?.focus();
                    return;
                }

                const first = items[0];
                const last = items[items.length - 1];
                const active = document.activeElement;

                if (
                    event.shiftKey &&
                    (active === first || active === box)
                ) {
                    event.preventDefault();
                    last.focus();
                } else if (!event.shiftKey && active === last) {
                    event.preventDefault();
                    first.focus();
                }
            });
        });

        document.addEventListener("keydown", event => {
            if (event.key !== "Escape") return;

            if (termsOverlay?.classList.contains("active")) {
                window.closeTerms();
            } else if (
                bookingOverlay?.classList.contains("active")
            ) {
                window.closeModal();
            }
        });

        // No submit interception:
        // Thymeleaf/Spring Boot remains responsible for form submission.
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initialize,
            { once: true }
        );
    } else {
        initialize();
    }
})();