(function () {
  var header = document.querySelector(".site-header");
  var menuToggle = document.querySelector(".menu-toggle");
  var mobileMenu = document.querySelector(".mobile-menu");

  function syncHeader() {
    if (!header) {
      return;
    }
    header.classList.toggle("is-scrolled", window.scrollY > 20);
  }

  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", function () {
      mobileMenu.hidden = !mobileMenu.hidden;
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var index = 0;

  function showSlide(nextIndex) {
    if (!slides.length) {
      return;
    }
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach(function (slide, position) {
      slide.classList.toggle("active", position === index);
    });
    dots.forEach(function (dot, position) {
      dot.classList.toggle("active", position === index);
    });
  }

  dots.forEach(function (dot, position) {
    dot.addEventListener("click", function () {
      showSlide(position);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(index + 1);
    }, 5200);
  }

  function getPrefix() {
    var depth = window.location.pathname.split("/").filter(Boolean).length - 1;
    if (depth <= 0) {
      return "./";
    }
    return "../".repeat(depth);
  }

  function renderResults(input, panel) {
    var term = input.value.trim().toLowerCase();
    var data = window.MOVIE_SEARCH || [];
    panel.innerHTML = "";
    if (!term) {
      panel.hidden = true;
      return;
    }
    var prefix = getPrefix();
    var hits = data.filter(function (item) {
      return item.text.indexOf(term) !== -1;
    }).slice(0, 8);
    hits.forEach(function (item) {
      var link = document.createElement("a");
      link.className = "search-hit";
      link.href = prefix + item.url;
      link.innerHTML = "<img src=\"" + prefix + item.cover + "\" alt=\"\"><div><strong>" + item.title + "</strong><span>" + item.category + " · " + item.year + "</span></div>";
      panel.appendChild(link);
    });
    if (!hits.length) {
      var empty = document.createElement("div");
      empty.className = "search-hit";
      empty.innerHTML = "<div></div><div><strong>未找到相关影片</strong><span>换个关键词试试</span></div>";
      panel.appendChild(empty);
    }
    panel.hidden = false;
  }

  document.querySelectorAll(".site-search-input").forEach(function (input) {
    var panel = input.parentElement.querySelector(".search-results");
    if (!panel) {
      return;
    }
    input.addEventListener("input", function () {
      renderResults(input, panel);
    });
    input.addEventListener("focus", function () {
      renderResults(input, panel);
    });
    document.addEventListener("click", function (event) {
      if (!input.parentElement.contains(event.target)) {
        panel.hidden = true;
      }
    });
  });

  var grid = document.querySelector(".filter-grid");
  var filterInput = document.querySelector(".page-filter-input");
  var fullSearchInput = document.getElementById("fullSearchInput");
  var categoryFilter = document.getElementById("categoryFilter");
  var sortSelect = document.querySelector(".sort-select");

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function applyGridTools() {
    if (!grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
    var term = normalize(fullSearchInput ? fullSearchInput.value : filterInput ? filterInput.value : "");
    var category = categoryFilter ? categoryFilter.value : "";
    cards.forEach(function (card) {
      var text = [card.dataset.title, card.dataset.year, card.dataset.tags, card.dataset.category].join(" ").toLowerCase();
      var matchTerm = !term || text.indexOf(term) !== -1;
      var matchCategory = !category || card.dataset.category === category;
      card.classList.toggle("is-filtered-out", !(matchTerm && matchCategory));
    });
    if (sortSelect) {
      var sortValue = sortSelect.value;
      cards.sort(function (a, b) {
        if (sortValue === "title") {
          return a.dataset.title.localeCompare(b.dataset.title, "zh-Hans-CN");
        }
        var av = Number(a.dataset[sortValue] || 0);
        var bv = Number(b.dataset[sortValue] || 0);
        return bv - av;
      }).forEach(function (card) {
        grid.appendChild(card);
      });
    }
  }

  [filterInput, fullSearchInput, categoryFilter, sortSelect].forEach(function (control) {
    if (control) {
      control.addEventListener("input", applyGridTools);
      control.addEventListener("change", applyGridTools);
    }
  });

  var params = new URLSearchParams(window.location.search);
  var query = params.get("q");
  if (query && fullSearchInput) {
    fullSearchInput.value = query;
  }
  applyGridTools();
})();
