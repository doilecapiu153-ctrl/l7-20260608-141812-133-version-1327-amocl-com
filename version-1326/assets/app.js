(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-button]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHeaderSearch() {
    selectAll('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"], input[type="search"]');
        var query = input ? input.value.trim() : '';
        if (query) {
          window.location.href = './search.html?q=' + encodeURIComponent(query);
        }
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    var next = hero.querySelector('[data-hero-next]');
    var prev = hero.querySelector('[data-hero-prev]');
    var current = 0;
    var timer;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }
    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(parseInt(dot.getAttribute('data-hero-dot'), 10) || 0);
        start();
      });
    });
    start();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function filterCards(container, query, year) {
    var normalizedQuery = normalize(query);
    selectAll('[data-search]', container).forEach(function (card) {
      var haystack = normalize(card.getAttribute('data-search'));
      var cardYear = card.getAttribute('data-year') || '';
      var matchQuery = !normalizedQuery || haystack.indexOf(normalizedQuery) !== -1;
      var matchYear = !year || year === 'all' || cardYear === year;
      card.classList.toggle('is-hidden-card', !(matchQuery && matchYear));
    });
  }

  function setupLocalFilters() {
    selectAll('[data-local-filter]').forEach(function (form) {
      var input = form.querySelector('[data-card-filter]');
      var grid = document.querySelector('[data-card-grid]');
      var year = 'all';
      var pills = document.querySelector('[data-year-pills]');
      if (!input || !grid) {
        return;
      }
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        filterCards(grid, input.value, year);
      });
      input.addEventListener('input', function () {
        filterCards(grid, input.value, year);
      });
      if (pills) {
        selectAll('[data-filter-year]', pills).forEach(function (button) {
          button.addEventListener('click', function () {
            year = button.getAttribute('data-filter-year') || 'all';
            selectAll('[data-filter-year]', pills).forEach(function (item) {
              item.classList.toggle('is-active', item === button);
            });
            filterCards(grid, input.value, year);
          });
        });
      }
    });
  }

  function setupSearchPage() {
    var form = document.querySelector('[data-search-page-form]');
    var input = document.getElementById('searchInput');
    var results = document.querySelector('[data-search-results]');
    if (!form || !input || !results) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    input.value = query;
    filterCards(results, query, 'all');
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      filterCards(results, input.value, 'all');
      var url = './search.html';
      if (input.value.trim()) {
        url += '?q=' + encodeURIComponent(input.value.trim());
      }
      window.history.replaceState({}, '', url);
    });
    input.addEventListener('input', function () {
      filterCards(results, input.value, 'all');
    });
  }

  function startVideo(shell) {
    var video = shell.querySelector('video');
    var cover = shell.querySelector('.player-cover');
    var url = shell.getAttribute('data-play');
    if (!video || !url) {
      return;
    }
    if (!video.getAttribute('data-ready')) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
      video.setAttribute('data-ready', '1');
    }
    if (cover) {
      cover.classList.add('is-hidden');
    }
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  function setupPlayers() {
    selectAll('[data-player]').forEach(function (shell) {
      var cover = shell.querySelector('.player-cover');
      var video = shell.querySelector('video');
      if (cover) {
        cover.addEventListener('click', function () {
          startVideo(shell);
        });
      }
      if (video) {
        video.addEventListener('click', function () {
          if (!video.getAttribute('data-ready')) {
            startVideo(shell);
          }
        });
        video.addEventListener('play', function () {
          if (cover) {
            cover.classList.add('is-hidden');
          }
        });
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHeaderSearch();
    setupHero();
    setupLocalFilters();
    setupSearchPage();
    setupPlayers();
  });
})();
