(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');

    if (toggle && menu) {
        toggle.addEventListener('click', function () {
            menu.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var currentSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        currentSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === currentSlide);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === currentSlide);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(currentSlide + 1);
        }, 5200);
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    var input = document.querySelector('[data-filter-input]');

    if (input && query) {
        input.value = query;
    }

    function applyFilters() {
        var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
        var empty = document.querySelector('[data-empty-state]');
        var search = (document.querySelector('[data-filter-input]') || {}).value || '';
        var region = (document.querySelector('[data-filter-region]') || {}).value || '';
        var type = (document.querySelector('[data-filter-type]') || {}).value || '';
        var year = (document.querySelector('[data-filter-year]') || {}).value || '';
        var normalized = search.trim().toLowerCase();
        var shown = 0;

        cards.forEach(function (card) {
            var title = (card.getAttribute('data-title') || '').toLowerCase();
            var tags = (card.getAttribute('data-tags') || '').toLowerCase();
            var cardRegion = card.getAttribute('data-region') || '';
            var cardType = card.getAttribute('data-type') || '';
            var cardYear = card.getAttribute('data-year') || '';
            var matched = true;

            if (normalized && title.indexOf(normalized) === -1 && tags.indexOf(normalized) === -1) {
                matched = false;
            }

            if (region && cardRegion !== region) {
                matched = false;
            }

            if (type && cardType !== type) {
                matched = false;
            }

            if (year && cardYear !== year) {
                matched = false;
            }

            card.style.display = matched ? '' : 'none';
            if (matched) {
                shown += 1;
            }
        });

        if (empty) {
            empty.classList.toggle('show', shown === 0);
        }
    }

    ['data-filter-input', 'data-filter-region', 'data-filter-type', 'data-filter-year'].forEach(function (name) {
        var node = document.querySelector('[' + name + ']');
        if (node) {
            node.addEventListener('input', applyFilters);
            node.addEventListener('change', applyFilters);
        }
    });

    if (document.querySelector('.movie-card')) {
        applyFilters();
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-video-url]')).forEach(function (panel) {
        var video = panel.querySelector('video');
        var button = panel.querySelector('[data-player-control]');
        var url = panel.getAttribute('data-video-url');
        var ready = false;
        var hlsInstance = null;

        function attachVideo() {
            if (!video || !url || ready) {
                return;
            }

            ready = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(url);
                hlsInstance.attachMedia(video);
            } else {
                video.src = url;
            }
        }

        function startPlayback() {
            attachVideo();
            panel.classList.add('is-playing');
            if (video) {
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {});
                }
            }
        }

        if (button) {
            button.addEventListener('click', startPlayback);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!ready) {
                    startPlayback();
                }
            });
            video.addEventListener('play', function () {
                panel.classList.add('is-playing');
            });
        }

        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
