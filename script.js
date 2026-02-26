const form = document.getElementById("bookingForm");
const summaryList = document.getElementById("summaryList");
const formMessage = document.getElementById("formMessage");
const clearBookingButton = document.getElementById("clearBooking");
const viewBookingsButton = document.getElementById("viewBookings");
const bookingsHistory = document.getElementById("bookingsHistory");

const STORAGE_KEY = "bagno-booking";
const HISTORY_KEY = "bagno-bookings-history";

const formatTime = (timeValue) => {
  const [hour, minute] = timeValue.split(":");
  return `${hour}:${minute}`;
};

const renderSummary = (booking) => {
  if (!booking) {
    summaryList.innerHTML = "<li>Nessuna prenotazione ancora registrata.</li>";
    return;
  }

  const fields = [
    ["Cliente", booking.fullName],
    ["Orario", booking.time ? formatTime(booking.time) : "--:--"],
    ["Note", booking.notes || "Nessuna"],
  ];

  summaryList.innerHTML = "";
  fields.forEach(([label, value]) => {
    const item = document.createElement("li");
    const strong = document.createElement("strong");
    strong.textContent = `${label}: `;
    item.append(strong, document.createTextNode(value));
    summaryList.appendChild(item);
  });
};

const setMessage = (text, type) => {
  formMessage.textContent = text;
  formMessage.className = `message ${type}`;
};

const getStoredBooking = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
};

const getBookingsHistory = () => {
  const raw = localStorage.getItem(HISTORY_KEY);
  return raw ? JSON.parse(raw) : [];
};

const setBookingsHistory = (bookings) => {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(bookings));
};

const renderHistory = () => {
  const bookings = getBookingsHistory();
  bookingsHistory.innerHTML = "";

  if (bookings.length === 0) {
    const item = document.createElement("li");
    item.textContent = "Nessuna prenotazione salvata.";
    bookingsHistory.appendChild(item);
    return;
  }

  bookings.forEach((booking) => {
    const item = document.createElement("li");
    const timeText = booking.time ? formatTime(booking.time) : "--:--";
    item.textContent = `${timeText} - ${booking.fullName}`;
    bookingsHistory.appendChild(item);
  });
};

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!form.checkValidity()) {
    setMessage("Compila tutti i campi obbligatori correttamente.", "error");
    form.reportValidity();
    return;
  }

  const booking = {
    fullName: form.fullName.value.trim(),
    time: form.time.value,
    notes: form.notes.value.trim(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(booking));
  const history = getBookingsHistory();
  history.unshift(booking);
  setBookingsHistory(history.slice(0, 20));
  renderSummary(booking);
  renderHistory();
  setMessage("Prenotazione confermata con successo.", "success");
  form.reset();
});

clearBookingButton.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(HISTORY_KEY);
  renderSummary(null);
  renderHistory();
  setMessage("Prenotazione cancellata.", "success");
});

viewBookingsButton.addEventListener("click", () => {
  const isHidden = bookingsHistory.classList.contains("hidden");
  bookingsHistory.classList.toggle("hidden", !isHidden);
  viewBookingsButton.textContent = isHidden
    ? "Nascondi prenotazioni"
    : "Vedi prenotazioni";
  if (isHidden) {
    renderHistory();
  }
});

renderSummary(getStoredBooking());
renderHistory();
