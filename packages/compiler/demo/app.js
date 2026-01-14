const loginForm = document.getElementById('login-form');
const appointmentModal = document.getElementById('appointment-modal');
const confirmation = document.getElementById('confirmation');

if (loginForm) {
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    window.location.href = 'schedule.html';
  });
}

const closeModal = (modal) => {
  if (modal) {
    modal.style.display = 'none';
  }
};

if (appointmentModal) {
  const slotButtons = Array.from(document.querySelectorAll('.slot'));
  slotButtons.forEach((button) => {
    button.addEventListener('click', () => {
      appointmentModal.style.display = 'flex';
    });
  });

  const closeButton = document.getElementById('appointment-close');
  closeButton?.addEventListener('click', () => closeModal(appointmentModal));

  const appointmentForm = document.getElementById('appointment-form');
  appointmentForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    closeModal(appointmentModal);
    if (confirmation) {
      confirmation.style.display = 'block';
    }
  });
}
