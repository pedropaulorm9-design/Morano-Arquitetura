const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const revealItems = document.querySelectorAll(".reveal");
const parallaxItems = document.querySelectorAll("[data-parallax-speed]");
const countItems = document.querySelectorAll("[data-count]");
const form = document.querySelector(".contact-form");
const formNote = document.querySelector("[data-form-note]");
const cursorLight = document.querySelector(".cursor-light");
const images = document.querySelectorAll("img");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function markMissingImage(image) {
  const holder = image.closest(".brand") || image.parentElement;
  holder?.classList.add("image-fallback");
}

images.forEach((image) => {
  image.addEventListener("error", () => markMissingImage(image), { once: true });

  if (image.complete && image.naturalWidth === 0) {
    markMissingImage(image);
  }
});

function setHeaderState() {
  header.classList.toggle("is-scrolled", window.scrollY > 18);
}

let scrollPosition = 0;

function lockScroll() {
  scrollPosition = window.scrollY;
  document.body.classList.add("nav-open");
  document.body.style.position = "fixed";
  document.body.style.top = `-${scrollPosition}px`;
  document.body.style.width = "100%";
}

function unlockScroll() {
  document.body.classList.remove("nav-open");
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.width = "";
  window.scrollTo(0, scrollPosition);
}

function closeNav() {
  header.classList.remove("menu-open");
  navToggle.setAttribute("aria-expanded", "false");
  unlockScroll();
}

navToggle.addEventListener("click", () => {
  const isOpen = header.classList.toggle("menu-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
  if (isOpen) {
    lockScroll();
  } else {
    unlockScroll();
  }
});

nav.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    closeNav();
  }
});

window.addEventListener("scroll", setHeaderState, { passive: true });
setHeaderState();

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
);

revealItems.forEach((item) => revealObserver.observe(item));

const countObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        countObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.7 }
);

countItems.forEach((item) => countObserver.observe(item));

function animateCount(element) {
  const target = Number(element.dataset.count);
  const suffix = element.dataset.suffix || "";
  const duration = 1100;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = `${Math.round(target * eased)}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  }

  requestAnimationFrame(tick);
}

function updateParallax() {
  const viewportHeight = window.innerHeight;

  parallaxItems.forEach((item) => {
    const speed = Number(item.dataset.parallaxSpeed) || 0.12;
    const rect = item.getBoundingClientRect();

    if (rect.bottom < 0 || rect.top > viewportHeight) {
      return;
    }

    const offset = (viewportHeight / 2 - (rect.top + rect.height / 2)) * speed;
    item.style.transform = `translate3d(0, ${offset}px, 0)`;
  });
}

if (!prefersReducedMotion) {
  let ticking = false;

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateParallax();
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true }
  );

  window.addEventListener("resize", updateParallax);
  updateParallax();

  window.addEventListener(
    "pointermove",
    (event) => {
      cursorLight.style.opacity = "1";
      cursorLight.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate3d(-50%, -50%, 0)`;
    },
    { passive: true }
  );
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const name = formData.get("nome") || "Obrigado";

  fetch("https://formspree.io/f/meewyrro", {
    method: "POST",
    body: formData,
    headers: { Accept: "application/json" }
  })
    .then((response) => {
      if (response.ok) {
        formNote.textContent = `${name}, sua mensagem foi enviada com sucesso! Entraremos em contato em breve.`;
        form.reset();
      } else {
        formNote.textContent = "Ops! Algo deu errado ao enviar. Tente novamente.";
      }
    })
    .catch(() => {
      formNote.textContent = "Erro de conexão. Verifique sua internet e tente de novo.";
    });
});