document.addEventListener("DOMContentLoaded", () => {
  setYear();
  smoothAnchors();
  activeCategoryLink();
  setupSearch();
  setupQuoteForm();
  backToTop();
});

/* utils */
const qs = (s, r = document) => r.querySelector(s);
const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));

function setYear() {
  const y = qs("#year");
  if (y) y.textContent = new Date().getFullYear();
}

function smoothAnchors() {
  qsa('a[href^="#"]').forEach(a => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const t = qs(id);
      if (!t) return;
      e.preventDefault();
      t.scrollIntoView({ behavior: "smooth", block: "start" });
      history.pushState(null, "", id);
    });
  });
}

/* Active category link (scroll spy) */
function activeCategoryLink() {
  const links = qsa(".categories-nav a");
  if (!links.length) return;

  const sections = links
    .map(a => qs(a.getAttribute("href")))
    .filter(Boolean);

  if (!sections.length) return;

  const obs = new IntersectionObserver((entries) => {
    const best = entries
      .filter(e => e.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!best) return;

    links.forEach(l => l.classList.remove("is-active"));
    const active = links.find(l => l.getAttribute("href") === `#${best.target.id}`);
    if (active) active.classList.add("is-active");
  }, { threshold: [0.25, 0.4, 0.6] });

  sections.forEach(s => obs.observe(s));
}

/* Search filter */
function setupSearch() {
  const input = qs("#q");
  if (!input) return;

  const items = [
    ...qsa(".category-tile"),
    ...qsa(".product-card"),
    ...qsa(".hero-card"),
    ...qsa(".info-card"),
  ];

  input.addEventListener("input", () => {
    const term = input.value.trim().toLowerCase();

    if (!term) {
      items.forEach(el => (el.style.display = ""));
      return;
    }

    items.forEach(el => {
      const txt = el.textContent.toLowerCase();
      el.style.display = txt.includes(term) ? "" : "none";
    });
  });

  // prevent submit reload
  const form = qs(".search-form");
  if (form) form.addEventListener("submit", (e) => e.preventDefault());
}

/* Quote form */
function setupQuoteForm() {
  const form = qs(".quote-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const org = qs('input[name="org"]', form)?.value.trim();
    const email = qs('input[name="email"]', form)?.value.trim();
    const need = qs('textarea[name="need"]', form)?.value.trim();

    if (!org || !email || !need) {
      toast("Merci de remplir les champs obligatoires : Structure, Email, Besoin.", "error");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast("Email invalide (ex: contact@club.fr).", "error");
      return;
    }

    const btn = qs('button[type="submit"]', form);
    const old = btn ? btn.textContent : "";
    if (btn) { btn.disabled = true; btn.textContent = "Envoi..."; }

    // simulate send
    setTimeout(() => {
      toast("Demande envoyée ✅ Un conseiller vous recontacte sous 24h ouvrées.", "success");
      form.reset();

      // refill with demo defaults (A→Z, no need to type)
      qs('input[name="org"]', form).value = "AS Montbrun Athlétisme";
      qs('input[name="email"]', form).value = "contact@asmontbrun.fr";
      qs('input[name="phone"]', form).value = "06 22 14 80 19";
      qs('input[name="budget"]', form).value = "1 250 €";
      qs('textarea[name="need"]', form).value =
        "Nous souhaitons : 25 ballons taille 5 (compétition), 80 plots, 20 chasubles réversibles, 18 maillots personnalisés (logo + numéro), livraison avant le 15 du mois.";

      if (btn) { btn.disabled = false; btn.textContent = old || "Envoyer la demande"; }
    }, 700);
  });
}

/* Back to top button */
function backToTop() {
  const btn = document.createElement("button");
  btn.className = "back-to-top";
  btn.type = "button";
  btn.textContent = "↑";
  btn.setAttribute("aria-label", "Retour en haut");
  document.body.appendChild(btn);

  const toggle = () => {
    const y = window.scrollY || document.documentElement.scrollTop;
    btn.style.opacity = y > 550 ? "1" : "0";
    btn.style.pointerEvents = y > 550 ? "auto" : "none";
  };
  window.addEventListener("scroll", toggle, { passive: true });
  toggle();

  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  // small inline css to ensure it works even if CSS missing
  const st = document.createElement("style");
  st.textContent = `
    .back-to-top{
      position:fixed; right:18px; bottom:18px;
      width:44px; height:44px;
      border-radius:12px;
      border:1px solid rgba(0,0,0,.12);
      background:#fff;
      box-shadow:0 12px 28px rgba(0,0,0,.18);
      cursor:pointer;
      opacity:0; pointer-events:none;
      transition:opacity .18s ease, transform .18s ease;
      z-index:9999;
    }
    .back-to-top:hover{ transform: translateY(-2px); }
  `;
  document.head.appendChild(st);
}

/* Toast notifications */
function toast(msg, type = "info") {
  let wrap = qs(".toast-wrap");
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.className = "toast-wrap";
    document.body.appendChild(wrap);

    const st = document.createElement("style");
    st.textContent = `
      .toast-wrap{
        position:fixed; left:18px; bottom:18px;
        display:grid; gap:10px; z-index:9999;
      }
      .toast{
        max-width:420px;
        padding:12px 14px;
        border-radius:12px;
        color:#fff; background:#111827;
        box-shadow:0 14px 35px rgba(0,0,0,.25);
        border:1px solid rgba(255,255,255,.12);
        font-size:14px; line-height:1.35;
        animation:toastIn .16s ease-out;
      }
      .toast.success{ background:#064e3b; }
      .toast.error{ background:#7f1d1d; }
      @keyframes toastIn{ from{ transform:translateY(8px); opacity:0 } to{ transform:translateY(0); opacity:1 } }
    `;
    document.head.appendChild(st);
  }

  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.textContent = msg;
  wrap.appendChild(el);

  setTimeout(() => {
    el.style.opacity = "0";
    el.style.transform = "translateY(6px)";
    el.style.transition = "opacity .16s ease, transform .16s ease";
    setTimeout(() => el.remove(), 180);
  }, 3200);
}
