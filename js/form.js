/* ===========================================================
   Contact form — client validation + Formspree submit
   • Set the form's action to your Formspree endpoint:
     https://formspree.io/f/XXXXXXX
   • Until then it gracefully falls back to opening the user's
     email app (the data-email address).
   =========================================================== */
(() => {
  "use strict";
  const form = document.getElementById("contactForm");
  if (!form) return;

  const statusEl = document.getElementById("cformStatus");
  const btn = form.querySelector(".cform__submit");
  const btnLabel = form.querySelector(".cform__btnlabel");
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const fieldOf = (input) => input.closest(".cform__field");
  const errOf = (input) => form.querySelector(`.cform__err[data-for="${input.id}"]`);

  function setError(input, msg) {
    const f = fieldOf(input); const e = errOf(input);
    if (msg) { f.classList.add("is-invalid"); if (e) e.textContent = msg; input.setAttribute("aria-invalid", "true"); }
    else { f.classList.remove("is-invalid"); if (e) e.textContent = ""; input.removeAttribute("aria-invalid"); }
  }

  function validate() {
    let ok = true;
    const name = form.elements.name, email = form.elements.email, message = form.elements.message;
    if (!name.value.trim()) { setError(name, "Please add your name."); ok = false; } else setError(name);
    if (!emailRe.test(email.value.trim())) { setError(email, "Enter a valid email."); ok = false; } else setError(email);
    if (message.value.trim().length < 10) { setError(message, "A line or two about the project, please."); ok = false; } else setError(message);
    return ok;
  }

  // live-clear errors as the user fixes them
  ["name", "email", "message"].forEach((n) => {
    form.elements[n].addEventListener("input", (e) => { if (fieldOf(e.target).classList.contains("is-invalid")) validate(); });
  });

  function mailtoFallback() {
    const to = form.dataset.email || "hello@example.com";
    const subj = encodeURIComponent("Project enquiry via portfolio");
    const body = encodeURIComponent(
      `Name: ${form.elements.name.value}\nEmail: ${form.elements.email.value}\n\n${form.elements.message.value}`
    );
    window.location.href = `mailto:${to}?subject=${subj}&body=${body}`;
  }

  function showSent() {
    form.classList.add("is-sent");
    form.innerHTML =
      '<p class="cform__sentmsg">Thanks — your brief is on its way.</p>' +
      '<p class="cform__sentsub">I read everything personally and reply within a couple of working days.</p>';
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const notConfigured = /your-form-id/.test(form.action);
    if (notConfigured) { mailtoFallback(); if (statusEl) { statusEl.textContent = "Opening your email app…"; } return; }

    btn.setAttribute("aria-busy", "true");
    if (btnLabel) btnLabel.textContent = "Sending…";
    if (statusEl) { statusEl.className = "cform__status"; statusEl.textContent = ""; }

    try {
      const res = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      if (res.ok) { showSent(); }
      else throw new Error("Submission failed");
    } catch (err) {
      btn.removeAttribute("aria-busy");
      if (btnLabel) btnLabel.textContent = "Send brief";
      if (statusEl) { statusEl.className = "cform__status is-err"; statusEl.textContent = "Something went wrong — email me directly at " + (form.dataset.email || "") + "."; }
    }
  });
})();
