const header = document.querySelector("#site-header");
const menuToggle = document.querySelector(".menu-toggle");
const navMenu = document.querySelector("#nav-menu");
const navLinks = [...document.querySelectorAll(".nav-link")];
const sections = [...document.querySelectorAll("main section[id]")];
const form = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");

const closeMenu = ({ returnFocus = false } = {}) => {
  navMenu.classList.remove("open");
  header.classList.remove("menu-active");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation menu");
  document.body.classList.remove("menu-open");

  if (returnFocus) {
    menuToggle.focus();
  }
};

menuToggle.addEventListener("click", () => {
  const isOpening = menuToggle.getAttribute("aria-expanded") === "false";
  menuToggle.setAttribute("aria-expanded", String(isOpening));
  menuToggle.setAttribute("aria-label", isOpening ? "Close navigation menu" : "Open navigation menu");
  navMenu.classList.toggle("open", isOpening);
  header.classList.toggle("menu-active", isOpening);
  document.body.classList.toggle("menu-open", isOpening);

  if (isOpening) {
    navLinks[0].focus();
  }
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => closeMenu());
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && navMenu.classList.contains("open")) {
    closeMenu({ returnFocus: true });
  }

  if (event.key === "Tab" && navMenu.classList.contains("open")) {
    const focusableItems = [menuToggle, ...navLinks];
    const firstItem = focusableItems[0];
    const lastItem = focusableItems[focusableItems.length - 1];

    if (event.shiftKey && document.activeElement === firstItem) {
      event.preventDefault();
      lastItem.focus();
    } else if (!event.shiftKey && document.activeElement === lastItem) {
      event.preventDefault();
      firstItem.focus();
    }
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 1000 && navMenu.classList.contains("open")) {
    closeMenu();
  }
});

const updateHeader = () => {
  header.classList.toggle("scrolled", window.scrollY > 24);
};

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      navLinks.forEach((link) => {
        const isActive = link.getAttribute("href") === `#${entry.target.id}`;
        link.classList.toggle("active", isActive);

        if (isActive) {
          link.setAttribute("aria-current", "page");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    });
  },
  { rootMargin: "-30% 0px -60% 0px" },
);

sections.forEach((section) => sectionObserver.observe(section));

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealItems = document.querySelectorAll(".reveal");

if (reduceMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

const validators = {
  name: (value) => (value.trim() ? "" : "Please enter your name."),
  email: (value) => {
    if (!value.trim()) return "Please enter your email address.";
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
      ? ""
      : "Please enter a valid email address.";
  },
  subject: (value) => (value.trim() ? "" : "Please add a subject."),
  message: (value) => (value.trim() ? "" : "Please write a message."),
};

const validateField = (field) => {
  const errorMessage = validators[field.name](field.value);
  const errorElement = document.querySelector(`#${field.name}-error`);

  field.setAttribute("aria-invalid", String(Boolean(errorMessage)));
  field.setAttribute("aria-describedby", errorElement.id);
  errorElement.textContent = errorMessage;

  return !errorMessage;
};

Object.keys(validators).forEach((fieldName) => {
  const field = form.elements[fieldName];

  field.addEventListener("blur", () => validateField(field));
  field.addEventListener("input", () => {
    if (field.getAttribute("aria-invalid") === "true") {
      validateField(field);
    }
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const fields = Object.keys(validators).map((fieldName) => form.elements[fieldName]);
  const isValid = fields.map(validateField).every(Boolean);

  formStatus.classList.add("visible");

  if (!isValid) {
    formStatus.textContent = "Please review the highlighted fields and try again.";
    fields.find((field) => field.getAttribute("aria-invalid") === "true")?.focus();
    return;
  }

  formStatus.textContent =
    "Your message is ready, but this form is not connected to a sending service yet. Please contact Camille directly once an email address is added.";
});

document.querySelector("#current-year").textContent = new Date().getFullYear();
