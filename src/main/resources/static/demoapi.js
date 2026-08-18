// ============================================================
// SecureVista — Demo API layer (GrowthMultiplier demo scope)
// ============================================================
// This is the demo-site counterpart of the real storefront's api.js.
// It intentionally exposes ONLY the two endpoints the GrowthMultiplier
// backend actually serves for demo tenants — GET /services and
// POST /booking — so prospects can genuinely pick a service and submit
// a real consultation request while looking at their own business name.
//
// Company info and reviews stay static (see the CLIENT_DATA block and
// hardcoded review cards in demosite.html): demoscript.js checks for
// Api.getCompany / Api.getReviews before calling them, and since this
// object doesn't define them, those code paths fall back to the static
// content automatically — no changes needed there.
//
// Same-origin demo — runs inside the GrowthMultiplier server itself,
// so no separate backend URL is needed here (unlike the standalone
// per-client deploy, which points api.js at the client's own VPS).
const API_BASE = "";

async function apiGet(path) {
    const res = await fetch(API_BASE + path);
    if (!res.ok) {
        let message = `GET ${path} failed: ${res.status}`;
        try {
            const errBody = await res.json();
            if (errBody && errBody.message) message = errBody.message;
        } catch (_) { /* response wasn't JSON — keep the generic message */ }
        throw new Error(message);
    }
    return res.json();
}

async function apiPost(path, body) {
    const res = await fetch(API_BASE + path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        let message = `POST ${path} failed: ${res.status}`;
        try {
            const errBody = await res.json();
            if (errBody && errBody.message) message = errBody.message;
        } catch (_) { /* response wasn't JSON — keep the generic message */ }
        throw new Error(message);
    }
    return res.status === 204 ? null : res.json().catch(() => null);
}

const Api = {
    // GET /services -> [ { id, icon, name, description, price, featured, features }, ... ]
    getServices: () => apiGet("/services"),

    // POST /booking  body: { firstName, lastName, phone, email, address,
    //                         serviceOfferingId, preferredDate, notes }
    submitBooking: (payload) => apiPost("/booking", payload),

    // Deliberately no getCompany / getReviews / submitReview here —
    // demoscript.js guards every call with `Api.getX &&`, so those
    // features degrade to the static CLIENT_DATA / hardcoded reviews.
};
