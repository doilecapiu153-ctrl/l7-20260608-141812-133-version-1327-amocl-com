(function () {
  document.querySelectorAll("[data-player]").forEach(function (shell) {
    var video = shell.querySelector("video");
    var button = shell.querySelector("[data-play-button]");
    var source = video ? video.getAttribute("data-src") : "";
    var initialized = false;

    function initialize() {
      if (!video || !source || initialized) {
        return;
      }
      initialized = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        shell.hlsInstance = hls;
        return;
      }

      video.src = source;
    }

    function play() {
      initialize();
      shell.classList.add("is-playing");
      video.setAttribute("controls", "controls");
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", play);
    }
    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
    }
  });
})();
