const CLIENT = {
    businessName: "SecureVista",
    tagline: "Security You Can See. Peace You Can Feel.",
    phone: "(555) 123-4567",
    email: "hello@securevista.com",
    address: "123 Main Street, Phoenix, AZ"
};

// Render logo as "First" + "Rest" styled like the original two-tone logo.
// Splits on the first capital letter after the first word for a natural break;
// falls back to splitting at the midpoint if it can't find one.
function renderLogo(name) {
    const match = name.match(/^([A-Z][a-z]*)([A-Z].*)$/);
    if (match) {
        return `${match[1]}<span>${match[2]}</span>`;
    }
    const mid = Math.ceil(name.length / 2);
    return `${name.slice(0, mid)}<span>${name.slice(mid)}</span>`;
}

document.getElementById("site-logo").innerHTML = renderLogo(CLIENT.businessName);
document.title = `${CLIENT.businessName} | Security Solutions`;
document.getElementById("contact-phone").textContent = CLIENT.phone;
document.getElementById("contact-email").textContent = CLIENT.email;
document.getElementById("contact-address").textContent = CLIENT.address;
document.getElementById("footer-name").textContent = CLIENT.businessName;
document.getElementById("footer-year").textContent = new Date().getFullYear();

// ------------------------------------------------------
// Mobile nav — JS-driven, checks actual rendered width so
// it works reliably even inside scaled preview frames.
// ------------------------------------------------------
const navbarEl = document.querySelector(".navbar");
const navToggle = document.getElementById("nav-toggle");
const navMenu = document.getElementById("nav-menu");
const MOBILE_BREAKPOINT = 780;

function syncNavMode() {
    const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
    navbarEl.classList.toggle("mobile", isMobile);
    if (!isMobile) {
        navMenu.classList.remove("open");
        navToggle.classList.remove("open");
    }
}
syncNavMode();
window.addEventListener("resize", syncNavMode);

navToggle.addEventListener("click", () => {
    navMenu.classList.toggle("open");
    navToggle.classList.toggle("open");
});
navMenu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
        navMenu.classList.remove("open");
        navToggle.classList.remove("open");
    });
});

// Scroll-reveal animation
const revealEls = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });
revealEls.forEach(el => revealObserver.observe(el));

// ------------------------------------------------------
// "Invisible sticky band" hover substitute — MOBILE/TOUCH ONLY.
// On desktop, real :hover already handles this; running the
// observer there too would leave cards permanently "active"
// just because they sit in the scroll center, defeating the
// point of a hover effect. So this only activates when the
// device can't hover (touch) or the layout is in mobile mode.
// ------------------------------------------------------
const hoverTargets = document.querySelectorAll(".service-card, .review-card");
const noHoverQuery = window.matchMedia("(hover: none), (pointer: coarse)");

function bandHeightPercent() {
    // Roughly matches a single card's height relative to viewport.
    const sample = document.querySelector(".service-card");
    if (!sample) return 40;
    const cardHeight = sample.getBoundingClientRect().height;
    const pct = (cardHeight / window.innerHeight) * 100;
    return Math.min(Math.max(pct, 15), 45);
}

function buildCenterBandObserver() {
    const half = bandHeightPercent() / 2;
    const margin = Math.max(50 - half, 0);
    return new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            entry.target.classList.toggle("active", entry.isIntersecting);
        });
    }, {
        threshold: 0,
        rootMargin: `-${margin}% 0px -${margin}% 0px`
    });
}

let centerBandObserver = null;

function clearAllActive() {
    hoverTargets.forEach(el => el.classList.remove("active"));
}

function shouldUseTouchHover() {
    return noHoverQuery.matches || window.innerWidth <= MOBILE_BREAKPOINT;
}

function syncCenterBandObserver() {
    const wantIt = shouldUseTouchHover();

    if (wantIt && !centerBandObserver) {
        centerBandObserver = buildCenterBandObserver();
        hoverTargets.forEach(el => centerBandObserver.observe(el));
    } else if (!wantIt && centerBandObserver) {
        centerBandObserver.disconnect();
        centerBandObserver = null;
        clearAllActive();
    } else if (wantIt && centerBandObserver) {
        // Rebuild so the band height stays accurate after resizes.
        centerBandObserver.disconnect();
        centerBandObserver = buildCenterBandObserver();
        hoverTargets.forEach(el => centerBandObserver.observe(el));
    }
}

syncCenterBandObserver();

let resizeTimer;
window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(syncCenterBandObserver, 200);
});
noHoverQuery.addEventListener("change", syncCenterBandObserver);