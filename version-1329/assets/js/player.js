(function () {
  function setup(box) {
    var video = box.querySelector("video");
    var layer = box.querySelector(".player-layer");
    var playUrl = box.getAttribute("data-play");
    var prepared = false;
    var hls = null;

    function prepare() {
      if (prepared || !video || !playUrl) {
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(playUrl);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = playUrl;
      } else {
        video.src = playUrl;
      }
      prepared = true;
    }

    function start() {
      prepare();
      if (layer) {
        layer.classList.add("is-hidden");
      }
      if (video) {
        video.controls = true;
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }
    }

    if (layer) {
      layer.addEventListener("click", start);
    }
    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        }
      });
    }
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  }

  document.querySelectorAll("[data-player]").forEach(setup);
})();
