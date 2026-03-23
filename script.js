const videoPlayer = document.getElementById("videoPlayer");
const videoTitle = document.getElementById("videoTitle");
const videoList = document.getElementById("videoList");
const artistContainer = document.getElementById("artistContainer");

let videos = [];
let currentIndex = 0;
let videoItems = [];


fetch("videos.json")
  .then(res => res.json())
  .then(data => {
    videos = data;
    

    let videoss = [];

    $.getJSON("videos.json", function (data) {
      videoss = data;
    });


    $("#searchInput").on("keyup", function () {
      let keyword = $(this).val().toLowerCase();
      let dropdown = $("#searchDropdown");

      dropdown.empty();

      if (keyword === "") {
        dropdown.hide();
        return;
      }

      let results = videoss.filter(v => {
        let titleMatch = v.title.toLowerCase().includes(keyword);

        let artistMatch = v.artist.some(a =>
          a.toLowerCase().includes(keyword)
        );

        return titleMatch || artistMatch;
      });

      if (results.length === 0) {
        dropdown.html("<div class='search-item'>No results</div>");
        dropdown.show();
        return;
      }

        results.slice(0, 6).forEach(v => {
        let index = videoss.indexOf(v); // 🔑 get real index
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

        dropdown.append(item);
        });

      dropdown.show();
    });

    $(document).on("click", ".search-item", function () {
      let index = $(this).data("index");
      loadVideo(index);
        $("#searchDropdown").hide();
    });


    $(document).click(function (e) {
      if (!$(e.target).closest(".search-box").length) {
        $("#searchDropdown").hide();
      }
    });

    function loadVideo(index) {
      currentIndex = index;

      localStorage.setItem("currentIndex", index);

      const video = videos[index];

      videoPlayer.src = video.src;
      videoTitle.innerText = video.title;

      videoPlayer.play();

      // 🔥 MEDIA SESSION (THIS IS THE KEY)
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

        // Optional controls
        navigator.mediaSession.setActionHandler("play", () => {
          videoPlayer.play();
        });

        navigator.mediaSession.setActionHandler("pause", () => {
          videoPlayer.pause();
        });

        navigator.mediaSession.setActionHandler("nexttrack", () => {
          let next = currentIndex + 1;
          if (next >= videos.length) next = 0;
          loadVideo(next);
        });

        navigator.mediaSession.setActionHandler("previoustrack", () => {
          let prev = currentIndex - 1;
          if (prev < 0) prev = videos.length - 1;
          loadVideo(prev);
        });
      }
      // 🔥 HIGHLIGHT CURRENT VIDEO
      videoItems.forEach(item => item.classList.remove("active"));

      if (videoItems[index]) {
        videoItems[index].classList.add("active");

        // optional: auto scroll to active
        videoItems[index].scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }
      // 🔥 RENDER ARTISTS
      artistContainer.innerHTML = "";

      const avatarWrapper = document.createElement("div");
      avatarWrapper.className = "artist-avatars";

      video.artist.forEach(name => {
        const img = document.createElement("img");

        // 👇 map artist name to image file
        img.src = `artists/${name.toLowerCase()}.jpg`; // example: artists/Chetra.jpg

        avatarWrapper.appendChild(img);
      });

      // names: A & B
      const names = document.createElement("div");
      names.className = "artist-names";
      names.innerText = video.artist.join(" & ");

      artistContainer.appendChild(avatarWrapper);
      artistContainer.appendChild(names);
    }

    // Render list
    videos.forEach((video, index) => {
      const item = document.createElement("div");
      item.className = "video-item";

      item.innerHTML = `
        <img src="${video.thumbnail}">
        <div style="padding-left:15px" >
          <h4 style="padding-bottom:5px;">${video.title}</h4>
          <span>${(Array.isArray(video.artist) && video.artist.length > 0 ? video.artist.join(" & ") : "")}</span>
          <span >${video.duration ?? "0:00"}</span>
        </div>
      `;

      item.onclick = () => {
        loadVideo(index);

        // 🔥 remove ?index from URL
        window.history.replaceState({}, "", "player.html");
      };

      videoList.appendChild(item);
      videoItems.push(item);
    });

    // 🔥 AUTO NEXT
    videoPlayer.addEventListener("ended", () => {
      let nextIndex = currentIndex + 1;

      if (nextIndex >= videos.length) {
        nextIndex = 0;
      }

      loadVideo(nextIndex);
    });

    // ✅ NEW LOGIC (URL + localStorage)
    const params = new URLSearchParams(window.location.search);
    const indexFromURL = parseInt(params.get("index"));
    const savedIndexParsed = parseInt(localStorage.getItem("currentIndex"));

    let startIndex = 0;

    if (!isNaN(indexFromURL)) {
      startIndex = indexFromURL;
    } else if (!isNaN(savedIndexParsed)) {
      startIndex = savedIndexParsed;
    }

    // 🔥 LOAD HERE (IMPORTANT)
    loadVideo(startIndex);
  });

const toggleBtn = document.getElementById("themeToggle");
const logo = document.getElementById("logo");
// Load saved theme
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
  toggleBtn.innerHTML = '<i class="bi bi-brightness-high"></i>';
  logo.src = "logo-dark.png";
}

// Toggle theme
toggleBtn.onclick = () => {
  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {

    localStorage.setItem("theme", "dark");
    toggleBtn.innerHTML = '<i class="bi bi-brightness-high"></i>';
    logo.src = "logo-dark.png";
  } else {
    localStorage.setItem("theme", "light");
    toggleBtn.innerHTML = '<i class="bi bi-moon"></i>';
    logo.src = "logo.png";
  }
};
