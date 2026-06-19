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

function openModal() {
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
});

bookingForm.addEventListener('submit', function (e) {
    e.preventDefault();
    modalFormView.style.display = 'none';
    modalSuccessView.classList.add('active');
});