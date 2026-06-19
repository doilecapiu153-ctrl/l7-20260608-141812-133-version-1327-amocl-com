(function () {
  var toggle = document.querySelector("[data-menu-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(
      document.querySelectorAll("[data-hero-slide]"),
    );
    var dots = Array.prototype.slice.call(
      document.querySelectorAll("[data-hero-dot]"),
    );
    var current = 0;

    function activate(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        activate(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });

    window.setInterval(function () {
      activate(current + 1);
    }, 5800);
  }

  var urlParams = new URLSearchParams(window.location.search);
  var queryFromUrl = urlParams.get("q") || "";

  document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
    var input = scope.querySelector("[data-filter-input]");
    var year = scope.querySelector("[data-filter-year]");
    var type = scope.querySelector("[data-filter-type]");
    var cards = Array.prototype.slice.call(
      scope.querySelectorAll(".movie-card"),
    );

    if (input && queryFromUrl) {
      input.value = queryFromUrl;
    }

    function applyFilters() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var yearValue = year ? year.value : "";
      var typeValue = type ? type.value : "";

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags"),
        ]
          .join(" ")
          .toLowerCase();
        var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchesYear =
          !yearValue || card.getAttribute("data-year") === yearValue;
        var matchesType =
          !typeValue ||
          (card.getAttribute("data-type") || "").indexOf(typeValue) !== -1;
        card.classList.toggle(
          "is-hidden",
          !(matchesKeyword && matchesYear && matchesType),
        );
      });
    }

    if (input) {
      input.addEventListener("input", applyFilters);
    }
    if (year) {
      year.addEventListener("change", applyFilters);
    }
    if (type) {
      type.addEventListener("change", applyFilters);
    }
    applyFilters();
  });
})();
