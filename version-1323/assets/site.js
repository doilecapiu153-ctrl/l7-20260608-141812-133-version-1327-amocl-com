(function () {
    var nav = document.querySelector('[data-site-nav]');
    var toggle = document.querySelector('[data-menu-toggle]');

    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === current);
            });

            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    var panels = Array.prototype.slice.call(document.querySelectorAll('.filter-panel'));

    panels.forEach(function (panel) {
        var input = panel.querySelector('[data-filter-input]');
        var root = panel.parentElement;
        var cards = Array.prototype.slice.call(root.querySelectorAll('[data-movie-card]'));
        var empty = panel.querySelector('[data-filter-empty]');
        var buttons = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-category], [data-filter-year], [data-filter-type]'));
        var state = {
            category: 'all',
            year: 'all',
            type: 'all',
            keyword: ''
        };

        function normalize(value) {
            return String(value || '').toLowerCase().replace(/\s+/g, '');
        }

        function apply() {
            var keyword = normalize(state.keyword);
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags')
                ].join(' '));
                var ok = true;

                if (state.category !== 'all' && card.getAttribute('data-category') !== state.category) {
                    ok = false;
                }

                if (state.year !== 'all' && card.getAttribute('data-year') !== state.year) {
                    ok = false;
                }

                if (state.type !== 'all' && card.getAttribute('data-type') !== state.type) {
                    ok = false;
                }

                if (keyword && haystack.indexOf(keyword) === -1) {
                    ok = false;
                }

                card.style.display = ok ? '' : 'none';

                if (ok) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('show', visible === 0);
            }
        }

        if (input) {
            var params = new URLSearchParams(window.location.search);
            var q = params.get('q');

            if (q) {
                input.value = q;
                state.keyword = q;
            }

            input.addEventListener('input', function () {
                state.keyword = input.value;
                apply();
            });
        }

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                var category = button.getAttribute('data-filter-category');
                var year = button.getAttribute('data-filter-year');
                var type = button.getAttribute('data-filter-type');

                if (category !== null) {
                    state.category = category;
                    buttons.filter(function (btn) {
                        return btn.hasAttribute('data-filter-category');
                    }).forEach(function (btn) {
                        btn.classList.toggle('active', btn === button);
                    });
                }

                if (year !== null) {
                    state.year = state.year === year ? 'all' : year;
                    button.classList.toggle('active', state.year === year);
                }

                if (type !== null) {
                    state.type = state.type === type ? 'all' : type;
                    button.classList.toggle('active', state.type === type);
                }

                apply();
            });
        });

        apply();
    });

    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('[data-play]');
        var hls = null;
        var loaded = false;

        if (!video || !button) {
            return;
        }

        function load() {
            if (loaded) {
                return;
            }

            loaded = true;
            var stream = video.getAttribute('data-stream');

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    maxBufferLength: 30,
                    backBufferLength: 30
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else {
                video.src = stream;
            }
        }

        function play() {
            load();
            button.classList.add('is-hidden');
            var request = video.play();

            if (request && typeof request.catch === 'function') {
                request.catch(function () {
                    button.classList.remove('is-hidden');
                });
            }
        }

        button.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener('play', function () {
            button.classList.add('is-hidden');
        });
        video.addEventListener('pause', function () {
            if (!video.ended) {
                button.classList.remove('is-hidden');
            }
        });
        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
            }
        });
    });
}());
