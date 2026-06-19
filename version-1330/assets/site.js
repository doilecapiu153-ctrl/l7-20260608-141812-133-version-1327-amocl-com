import { H as Hls } from "./hls-vendor.js";

const header = document.querySelector("[data-header]");
const mobileToggle = document.querySelector("[data-mobile-toggle]");

function updateHeader() {
    if (!header) {
        return;
    }
    header.classList.toggle("is-scrolled", window.scrollY > 36);
}

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

if (mobileToggle && header) {
    mobileToggle.addEventListener("click", () => {
        header.classList.toggle("is-open");
    });
}

const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
const prevButton = document.querySelector("[data-hero-prev]");
const nextButton = document.querySelector("[data-hero-next]");
let currentSlide = 0;
let heroTimer = null;

function showSlide(index) {
    if (!slides.length) {
        return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
        slide.classList.toggle("is-active", slideIndex === currentSlide);
    });

    dots.forEach((dot, dotIndex) => {
        dot.classList.toggle("is-active", dotIndex === currentSlide);
    });
}

function restartHeroTimer() {
    if (heroTimer) {
        window.clearInterval(heroTimer);
    }

    if (slides.length > 1) {
        heroTimer = window.setInterval(() => showSlide(currentSlide + 1), 5200);
    }
}

if (slides.length) {
    showSlide(0);
    restartHeroTimer();

    if (prevButton) {
        prevButton.addEventListener("click", () => {
            showSlide(currentSlide - 1);
            restartHeroTimer();
        });
    }

    if (nextButton) {
        nextButton.addEventListener("click", () => {
            showSlide(currentSlide + 1);
            restartHeroTimer();
        });
    }

    dots.forEach((dot) => {
        dot.addEventListener("click", () => {
            showSlide(Number(dot.dataset.heroDot || 0));
            restartHeroTimer();
        });
    });
}

const filterPanels = Array.from(document.querySelectorAll(".filter-panel"));

filterPanels.forEach((panel) => {
    const scope = panel.parentElement || document;
    const searchInput = panel.querySelector(".js-search");
    const yearSelect = panel.querySelector(".js-filter-year");
    const regionSelect = panel.querySelector(".js-filter-region");
    const countBox = panel.querySelector("[data-filter-count]");
    const cards = Array.from(scope.querySelectorAll("[data-filter-list] .movie-card, [data-filter-list] .rank-item"));

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function applyFilter() {
        const keyword = normalize(searchInput ? searchInput.value : "");
        const year = normalize(yearSelect ? yearSelect.value : "");
        const region = normalize(regionSelect ? regionSelect.value : "");
        let visible = 0;

        cards.forEach((card) => {
            const haystack = normalize([
                card.dataset.title,
                card.dataset.year,
                card.dataset.region,
                card.dataset.type,
                card.dataset.genre,
                card.dataset.category
            ].join(" "));

            const matchKeyword = !keyword || haystack.includes(keyword);
            const matchYear = !year || normalize(card.dataset.year).includes(year);
            const matchRegion = !region || normalize(card.dataset.region).includes(region);
            const shouldShow = matchKeyword && matchYear && matchRegion;

            card.classList.toggle("is-hidden-by-filter", !shouldShow);
            if (shouldShow) {
                visible += 1;
            }
        });

        if (countBox) {
            countBox.textContent = `当前显示 ${visible} / ${cards.length} 部影片`;
        }
    }

    [searchInput, yearSelect, regionSelect].forEach((control) => {
        if (control) {
            control.addEventListener("input", applyFilter);
            control.addEventListener("change", applyFilter);
        }
    });

    applyFilter();
});

function initializePlayer(video) {
    const source = video.dataset.videoUrl;

    if (!source) {
        return Promise.reject(new Error("缺少播放源"));
    }

    if (video.dataset.ready === "true") {
        return video.play();
    }

    video.dataset.ready = "true";

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return video.play();
    }

    if (Hls && Hls.isSupported()) {
        const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        return new Promise((resolve) => {
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                resolve(video.play());
            });
        });
    }

    video.src = source;
    return video.play();
}

Array.from(document.querySelectorAll("[data-player-shell]")).forEach((shell) => {
    const video = shell.querySelector("video[data-video-url]");
    const button = shell.querySelector("[data-play-button]");

    if (!video || !button) {
        return;
    }

    const start = () => {
        initializePlayer(video)
            .then(() => {
                shell.classList.add("is-playing");
            })
            .catch(() => {
                shell.classList.add("is-playing");
                video.controls = true;
            });
    };

    button.addEventListener("click", start);
    video.addEventListener("play", () => shell.classList.add("is-playing"));
});
