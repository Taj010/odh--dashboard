/**
 * Tiny quiz widget. Each .quiz[data-quiz] holds JSON:
 * { q, options: [{id, text}], answer, why }
 * Options should be equal word-count so length is not a hint.
 */
(function () {
  function render(el) {
    var spec;
    try {
      spec = JSON.parse(el.getAttribute("data-quiz"));
    } catch (e) {
      el.textContent = "Quiz failed to parse.";
      return;
    }
    var h = document.createElement("h3");
    h.textContent = spec.q;
    el.appendChild(h);

    var feedback = document.createElement("div");
    feedback.className = "feedback";
    feedback.setAttribute("aria-live", "polite");

    spec.options.forEach(function (opt) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "opt";
      b.dataset.id = opt.id;
      b.textContent = opt.text;
      b.addEventListener("click", function () {
        var buttons = el.querySelectorAll("button.opt");
        buttons.forEach(function (x) {
          x.disabled = true;
          if (x.dataset.id === spec.answer) {
            x.style.background = "var(--good-bg)";
          }
        });
        var ok = opt.id === spec.answer;
        if (!ok) b.style.background = "var(--bad-bg)";
        feedback.textContent = (ok ? "Yes. " : "Not that one. ") + spec.why;
      });
      el.appendChild(b);
    });
    el.appendChild(feedback);
  }

  document.querySelectorAll(".quiz[data-quiz]").forEach(render);
})();
