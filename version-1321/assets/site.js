(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupMobileNavigation() {
        var toggle = document.querySelector('.mobile-toggle');
        var nav = document.querySelector('.mobile-nav');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            var open = toggle.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            nav.hidden = !open;
        });
    }

    function setupHero() {
        var root = document.querySelector('[data-hero]');
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('.hero-dot'));
        var prev = root.querySelector('.hero-prev');
        var next = root.querySelector('.hero-next');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });
        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
        panels.forEach(function (panel) {
            var list = panel.parentElement.querySelector('[data-filter-list]');
            if (!list) {
                return;
            }
            var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
            var queryInput = panel.querySelector('input[name="q"]');
            var typeSelect = panel.querySelector('select[name="type"]');
            var yearSelect = panel.querySelector('select[name="year"]');

            function valueOf(element) {
                return element ? element.value.trim().toLowerCase() : '';
            }

            function apply() {
                var query = valueOf(queryInput);
                var type = valueOf(typeSelect);
                var year = valueOf(yearSelect);
                cards.forEach(function (card) {
                    var text = [
                        card.dataset.title,
                        card.dataset.region,
                        card.dataset.type,
                        card.dataset.year,
                        card.dataset.genre,
                        card.dataset.tags
                    ].join(' ').toLowerCase();
                    var matchesQuery = !query || text.indexOf(query) !== -1;
                    var matchesType = !type || (card.dataset.type || '').toLowerCase().indexOf(type) !== -1;
                    var matchesYear = !year || (card.dataset.year || '').toLowerCase().indexOf(year) !== -1;
                    card.classList.toggle('is-hidden', !(matchesQuery && matchesType && matchesYear));
                });
            }

            [queryInput, typeSelect, yearSelect].forEach(function (element) {
                if (element) {
                    element.addEventListener('input', apply);
                    element.addEventListener('change', apply);
                }
            });
        });
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('.movie-player'));
        players.forEach(function (wrapper) {
            var video = wrapper.querySelector('video');
            var cover = wrapper.querySelector('.player-cover');
            var source = video ? video.querySelector('source') : null;
            var streamUrl = source ? source.getAttribute('src') : '';
            var attached = false;
            var hlsInstance = null;

            function attach() {
                if (!video || attached || !streamUrl) {
                    return;
                }
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = streamUrl;
                    attached = true;
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false
                    });
                    hlsInstance.loadSource(streamUrl);
                    hlsInstance.attachMedia(video);
                    attached = true;
                    return;
                }
                video.src = streamUrl;
                attached = true;
            }

            function startPlayback() {
                attach();
                if (cover) {
                    cover.classList.add('is-hidden');
                }
                if (video) {
                    var playPromise = video.play();
                    if (playPromise && typeof playPromise.catch === 'function') {
                        playPromise.catch(function () {});
                    }
                }
            }

            if (cover) {
                cover.addEventListener('click', startPlayback);
            }
            if (video) {
                video.addEventListener('click', function () {
                    if (video.paused) {
                        startPlayback();
                    }
                });
                video.addEventListener('play', function () {
                    if (cover) {
                        cover.classList.add('is-hidden');
                    }
                });
                window.addEventListener('pagehide', function () {
                    if (hlsInstance) {
                        hlsInstance.destroy();
                    }
                });
            }
        });
    }

    ready(function () {
        setupMobileNavigation();
        setupHero();
        setupFilters();
        setupPlayers();
    });
})();
