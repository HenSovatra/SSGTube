const videoPlayer = document.getElementById("videoPlayer");
const videoTitle = document.getElementById("videoTitle");
const videoList = document.getElementById("videoList");

let videos = [];
let currentIndex = 0;
let videoItems = [];

// Load saved index (if exists)
const savedIndex = localStorage.getItem("currentIndex");

fetch("videos.json")
  .then(res => res.json())
  .then(data => {
    videos = data;

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
    }

    // Render list
    videos.forEach((video, index) => {
      const item = document.createElement("div");
      item.className = "video-item";

      item.innerHTML = `
        <img src="${video.thumbnail}">
        <div style="padding-left:15px" >
          <h4 style="padding-bottom:5px;">${video.title}</h4>
          <span >${video.duration??"0:00"}</span>
        </div>
      `;

      item.onclick = () => loadVideo(index);

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

    // ✅ LOAD SAVED INDEX OR DEFAULT 0
    if (savedIndex !== null && savedIndex < videos.length) {
      loadVideo(parseInt(savedIndex));
    } else {
      loadVideo(0);
    }
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