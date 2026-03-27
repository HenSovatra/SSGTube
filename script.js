$(document).ready(function () {

  let videos = [];
  let currentIndex = 0;
  let videoItems = [];

  const $videoPlayer = $("#videoPlayer");
  const $videoTitle = $("#videoTitle");
  const $videoList = $("#videoList");
  const $artistContainer = $("#artistContainer");

  let isLoop = false;
  let isShuffle = false;

  // ✅ Load JSON (jQuery way)
  $.getJSON("videos.json", function (data) {
    videos = data;

    // ================= SEARCH =================
    $("#searchInput").on("keyup", function () {
      let keyword = $(this).val().toLowerCase();
      let $dropdown = $("#searchDropdown");

      $dropdown.empty();

      if (keyword === "") {
        $dropdown.hide();
        return;
      }

      let results = videos.filter(v => {
        let titleMatch = v.title.toLowerCase().includes(keyword);
        let artistMatch = v.artist.some(a =>
          a.toLowerCase().includes(keyword)
        );
        return titleMatch || artistMatch;
      });

      if (results.length === 0) {
        $dropdown.html("<div class='search-item'>No results</div>");
        $dropdown.show();
        return;
      }

      results.slice(0, 6).forEach(v => {
        let index = videos.indexOf(v);
        let artists = v.artist.join(", ");

        let item = `
          <div class="search-item" data-index="${index}">
            <img src="${v.thumbnail}">
            <div>
              <div>${v.title}</div>
              <small>${artists}</small>
            </div>
          </div>
        `;

        $dropdown.append(item);
      });

      $dropdown.show();
    });

    // click search result
    $(document).on("click", ".search-item", function () {
      let index = $(this).data("index");
      loadVideo(index);
      $("#searchDropdown").hide();
    });

    // hide dropdown
    $(document).click(function (e) {
      if (!$(e.target).closest(".search-box").length) {
        $("#searchDropdown").hide();
      }
    });

    // ================= LOAD VIDEO =================
    function loadVideo(index) {
      currentIndex = index;
      localStorage.setItem("currentIndex", index);

      const video = videos[index];

      $videoPlayer.attr("src", video.src);
      $videoTitle.text(video.title);

      $videoPlayer[0].play();

      // MEDIA SESSION (unchanged)
      if ("mediaSession" in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: video.title,
          artist: "SSGTube",
          album: "Local Playlist",
          artwork: [
            { src: video.thumbnail, sizes: "96x96", type: "image/png" },
            { src: video.thumbnail, sizes: "192x192", type: "image/png" },
            { src: video.thumbnail, sizes: "512x512", type: "image/png" }
          ]
        });

        navigator.mediaSession.setActionHandler("play", () => {
          $videoPlayer[0].play();
        });

        navigator.mediaSession.setActionHandler("pause", () => {
          $videoPlayer[0].pause();
        });

        navigator.mediaSession.setActionHandler("nexttrack", () => {

          if (isShuffle) {
            let randomIndex = Math.floor(Math.random() * videos.length);
            loadVideo(randomIndex);
          } else {
            let next = (currentIndex + 1) % videos.length;
            loadVideo(next);
          }
        });

        navigator.mediaSession.setActionHandler("previoustrack", () => {
          let prev = (currentIndex - 1 + videos.length) % videos.length;
          loadVideo(prev);
        });
      }

      // highlight active
      $(".video-item").removeClass("active");
      $(".video-item").eq(index).addClass("active");

      // scroll top
      $("html, body").animate({ scrollTop: 0 }, "smooth");

      // render artists
      $artistContainer.empty();

      let avatarWrapper = $("<div>").addClass("artist-avatars");

      video.artist.forEach(name => {
        let img = $("<img>").attr(
          "src",
          `artists/${name.toLowerCase()}.jpg`
        );
        avatarWrapper.append(img);
      });

      let names = $("<div>")
        .addClass("artist-names")
        .text(video.artist.join(" & "));

      $artistContainer.append(avatarWrapper, names);
    }

    // ================= RENDER LIST =================
    videos.forEach((video, index) => {
      let item = $(`
        <div class="video-item">
          <img src="${video.thumbnail}">
          <div style="padding-left:15px">
            <h4>${video.title}</h4>
            <span>${video.artist.join(" & ")}</span>
            <span>${video.duration ?? "0:00"}</span>
          </div>
        </div>
      `);

      item.on("click", function () {
        loadVideo(index);
        window.history.replaceState({}, "", "player.html");
      });

      $videoList.append(item);
      videoItems.push(item);
    });

    // ================= AUTO NEXT =================
    $videoPlayer.on("ended", function () {

      // 🔁 LOOP (repeat same song)
      if (isLoop) {
        loadVideo(currentIndex);
        return;
      }

      // 🔀 SHUFFLE (random song)
      if (isShuffle) {
        let randomIndex;

        do {
          randomIndex = Math.floor(Math.random() * videos.length);
        } while (randomIndex === currentIndex && videos.length > 1);

        loadVideo(randomIndex);
        return;
      }

      // ▶ NORMAL NEXT
      let nextIndex = (currentIndex + 1) % videos.length;
      loadVideo(nextIndex);
    });

    // ================= INIT =================
    const params = new URLSearchParams(window.location.search);
    const indexFromURL = parseInt(params.get("index"));
    const savedIndex = parseInt(localStorage.getItem("currentIndex"));

    let startIndex = !isNaN(indexFromURL)
      ? indexFromURL
      : !isNaN(savedIndex)
        ? savedIndex
        : 0;

    loadVideo(startIndex);
  });

  // ================= THEME =================
  const $toggleBtn = $("#themeToggle");
  const $logo = $("#logo");

  if (localStorage.getItem("theme") === "dark") {
    $("body").addClass("dark");
    $toggleBtn.html('<i class="bi bi-brightness-high"></i>');
    $logo.attr("src", "logo-dark.png");
  }

  $toggleBtn.on("click", function () {
    $("body").toggleClass("dark");

    if ($("body").hasClass("dark")) {
      localStorage.setItem("theme", "dark");
      $toggleBtn.html('<i class="bi bi-brightness-high"></i>');
      $logo.attr("src", "logo-dark.png");
    } else {
      localStorage.setItem("theme", "light");
      $toggleBtn.html('<i class="bi bi-moon"></i>');
      $logo.attr("src", "logo.png");
    }
  });

  $("#loopBtn").on("click", function () {
    isLoop = !isLoop;

    if (isLoop) {
      isShuffle = false;
      $("#shuffleBtn").removeClass("active");
    }

    $(this).toggleClass("active", isLoop);
  });

  $("#shuffleBtn").on("click", function () {
    isShuffle = !isShuffle;

    if (isShuffle) {
      isLoop = false;
      $("#loopBtn").removeClass("active");
    }

    $(this).toggleClass("active", isShuffle);
  });
});