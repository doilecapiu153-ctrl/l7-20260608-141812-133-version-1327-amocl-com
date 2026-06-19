(function () {
    var mobileButton = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (mobileButton && mobileNav) {
        mobileButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
        var previous = carousel.querySelector('[data-hero-prev]');
        var next = carousel.querySelector('[data-hero-next]');
        var current = 0;
        var timer;

        function show(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function restart() {
            window.clearInterval(timer);
            start();
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-slide')) || 0);
                restart();
            });
        });

        if (previous) {
            previous.addEventListener('click', function () {
                show(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                restart();
            });
        }

        show(0);
        start();
    });

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function applyFilter(scope) {
        var input = scope.querySelector('.site-search');
        var activeButton = scope.querySelector('.filter-button.active');
        var query = normalize(input ? input.value : '');
        var filter = activeButton ? activeButton.getAttribute('data-filter') : 'all';
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-search]'));

        cards.forEach(function (card) {
            var searchText = normalize(card.getAttribute('data-search'));
            var category = card.getAttribute('data-category') || '';
            var type = card.getAttribute('data-type') || '';
            var matchesQuery = !query || searchText.indexOf(query) !== -1;
            var matchesFilter = !filter || filter === 'all' || category === filter || type === filter || searchText.indexOf(normalize(filter)) !== -1;
            card.classList.toggle('is-hidden', !(matchesQuery && matchesFilter));
        });
    }

    document.querySelectorAll('.content-section, .quick-search').forEach(function (scope) {
        var input = scope.querySelector('.site-search');
        var buttons = Array.prototype.slice.call(scope.querySelectorAll('.filter-button'));

        if (input) {
            input.addEventListener('input', function () {
                applyFilter(scope);
            });
        }

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                buttons.forEach(function (item) {
                    item.classList.remove('active');
                });
                button.classList.add('active');
                applyFilter(scope);
            });
        });
    });

    function attachVideo(video) {
        var source = video.getAttribute('data-src');

        if (!source || video.getAttribute('data-ready') === '1') {
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            video._hls = hls;
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else {
            video.src = source;
        }

        video.setAttribute('data-ready', '1');
    }

    document.querySelectorAll('.player-stage').forEach(function (stage) {
        var video = stage.querySelector('.player-video');
        var button = stage.querySelector('.player-start');

        function play() {
            if (!video) {
                return;
            }

            attachVideo(video);
            var playPromise = video.play();
            stage.classList.add('is-playing');

            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    stage.classList.remove('is-playing');
                });
            }
        }

        if (button) {
            button.addEventListener('click', play);
        }

        if (video) {
            video.addEventListener('play', function () {
                stage.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                if (video.currentTime === 0 || video.ended) {
                    stage.classList.remove('is-playing');
                }
            });
            video.addEventListener('click', function () {
                if (video.getAttribute('data-ready') !== '1') {
                    play();
                }
            });
        }
    });
})();
