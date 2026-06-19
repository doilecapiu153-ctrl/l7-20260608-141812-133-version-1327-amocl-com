document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");

    if (toggle && menu) {
        toggle.addEventListener("click", function () {
            menu.classList.toggle("open");
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var active = 0;
        var timer = null;

        function showSlide(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle("active", itemIndex === active);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle("active", itemIndex === active);
            });
        }

        function startTimer() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(active + 1);
            }, 5000);
        }

        if (slides.length > 1) {
            if (prev) {
                prev.addEventListener("click", function () {
                    showSlide(active - 1);
                    startTimer();
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    showSlide(active + 1);
                    startTimer();
                });
            }
            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                    startTimer();
                });
            });
            startTimer();
        }
    }

    Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]")).forEach(function (scope) {
        var holder = scope.nextElementSibling || document;
        var cards = Array.prototype.slice.call(holder.querySelectorAll(".movie-card"));
        if (!cards.length) {
            cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
        }
        var input = scope.querySelector("[data-search-input]");
        var region = scope.querySelector("[data-filter-region]");
        var type = scope.querySelector("[data-filter-type]");
        var year = scope.querySelector("[data-filter-year]");
        var reset = scope.querySelector("[data-filter-reset]");

        function fillSelect(select, attr) {
            if (!select) {
                return;
            }
            var values = [];
            cards.forEach(function (card) {
                var value = card.getAttribute(attr) || "";
                if (value && values.indexOf(value) === -1) {
                    values.push(value);
                }
            });
            values.sort().forEach(function (value) {
                var option = document.createElement("option");
                option.value = value;
                option.textContent = value;
                select.appendChild(option);
            });
        }

        function filterCards() {
            var query = input ? input.value.trim().toLowerCase() : "";
            var regionValue = region ? region.value : "";
            var typeValue = type ? type.value : "";
            var yearValue = year ? year.value : "";

            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute("data-title") || "",
                    card.getAttribute("data-region") || "",
                    card.getAttribute("data-year") || "",
                    card.getAttribute("data-type") || "",
                    card.getAttribute("data-genre") || "",
                    card.getAttribute("data-keywords") || ""
                ].join(" ").toLowerCase();
                var matched = true;
                matched = matched && (!query || haystack.indexOf(query) !== -1);
                matched = matched && (!regionValue || card.getAttribute("data-region") === regionValue);
                matched = matched && (!typeValue || card.getAttribute("data-type") === typeValue);
                matched = matched && (!yearValue || card.getAttribute("data-year") === yearValue);
                card.classList.toggle("is-hidden", !matched);
            });
        }

        fillSelect(region, "data-region");
        fillSelect(type, "data-type");
        fillSelect(year, "data-year");

        [input, region, type, year].forEach(function (element) {
            if (element) {
                element.addEventListener("input", filterCards);
                element.addEventListener("change", filterCards);
            }
        });

        if (reset) {
            reset.addEventListener("click", function () {
                if (input) {
                    input.value = "";
                }
                if (region) {
                    region.value = "";
                }
                if (type) {
                    type.value = "";
                }
                if (year) {
                    year.value = "";
                }
                filterCards();
            });
        }
    });

    var pageSearch = document.querySelector("[data-page-search]");

    if (pageSearch) {
        var pageCards = Array.prototype.slice.call(document.querySelectorAll(".page-search-scope .movie-card"));
        pageSearch.addEventListener("input", function () {
            var query = pageSearch.value.trim().toLowerCase();
            pageCards.forEach(function (card) {
                var haystack = [
                    card.getAttribute("data-title") || "",
                    card.getAttribute("data-region") || "",
                    card.getAttribute("data-year") || "",
                    card.getAttribute("data-type") || "",
                    card.getAttribute("data-genre") || "",
                    card.getAttribute("data-keywords") || ""
                ].join(" ").toLowerCase();
                card.classList.toggle("is-hidden", query && haystack.indexOf(query) === -1);
            });
        });
    }
});

function initMoviePlayer(source) {
    var video = document.querySelector("[data-player]");
    var cover = document.querySelector("[data-cover]");
    var attached = false;

    if (!video || !source) {
        return;
    }

    function attach() {
        if (attached) {
            return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: false
            });
            hls.loadSource(source);
            hls.attachMedia(video);
        } else {
            video.src = source;
        }
    }

    function play() {
        attach();
        if (cover) {
            cover.classList.add("hidden");
        }
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {});
        }
    }

    if (cover) {
        cover.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
        if (video.paused) {
            play();
        }
    });
}
