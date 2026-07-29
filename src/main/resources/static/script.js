const reveals = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
        if (e.isIntersecting) {
            setTimeout(() => e.target.classList.add('visible'), i * 80);
            io.unobserve(e.target);
        }
    });
}, { threshold: 0.1 });
reveals.forEach(el => io.observe(el));

// MODAL LOGIC
const modalOverlay = document.getElementById('bookingModal');
const modalFormView = document.getElementById('modalFormView');
const modalSuccessView = document.getElementById('modalSuccessView');
const bookingForm = document.getElementById('bookingForm');

const planSelect = document.getElementById('plan');
const planValues = {
    flexible: "Flexible - $1,000 setup + $120/mo",
    "2year": "2-Year Bundle - $2,800 one-time",
    "4year": "4-Year Bundle - $4,800 one-time"
};

function openModal(planKey) {
    if (planKey && planValues[planKey] && planSelect) {
        planSelect.value = planValues[planKey];
    }
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => {
        modalFormView.style.display = '';
        modalSuccessView.classList.remove('active');
        bookingForm.reset();
    }, 250);
}

modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) closeModal();
    if (e.key === 'Escape' && termsOverlay.classList.contains('active')) closeTerms();
});

// TERMS MODAL LOGIC
const termsOverlay = document.getElementById('termsModal');

function openTerms() {
    termsOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeTerms() {
    termsOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

termsOverlay.addEventListener('click', (e) => {
    if (e.target === termsOverlay) closeTerms();
});

bookingForm.addEventListener('submit', function (e) {

    console.log("Data was sent from this side");
    modalFormView.style.display = 'none';
    modalSuccessView.classList.add('active');
});