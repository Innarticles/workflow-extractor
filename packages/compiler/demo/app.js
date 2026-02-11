const loginForm = document.getElementById('login-form');
const manageLoginForm = document.getElementById('manage-login-form');
const appointmentModal = document.getElementById('appointment-modal');
const confirmation = document.getElementById('confirmation');
const editConfirmation = document.getElementById('edit-confirmation');

if (loginForm) {
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    window.location.href = 'schedule.html';
  });
}

if (manageLoginForm) {
  manageLoginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    window.location.href = 'appointments.html';
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

const editButtons = Array.from(document.querySelectorAll('[data-action="edit-appointment"]'));
if (editButtons.length) {
  editButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.getAttribute('data-id') || '1';
      window.location.href = `appointment-edit.html?id=${id}`;
    });
  });
}

const editAppointmentForm = document.getElementById('edit-appointment-form');
if (editAppointmentForm) {
  editAppointmentForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (editConfirmation) {
      editConfirmation.style.display = 'block';
    }
  });
}
