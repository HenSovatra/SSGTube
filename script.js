const videoPlayer = document.getElementById("videoPlayer");
const videoTitle = document.getElementById("videoTitle");
const videoList = document.getElementById("videoList");

let videos = [];
let currentIndex = 0;

// Load saved index (if exists)
const savedIndex = localStorage.getItem("currentIndex");

fetch("videos.json")
  .then(res => res.json())
  .then(data => {
    videos = data;

    function loadVideo(index) {
      currentIndex = index;

      // 🔥 SAVE INDEX
      localStorage.setItem("currentIndex", index);

      const video = videos[index];
      videoPlayer.src = video.src;
      videoTitle.innerText = video.title;

      videoPlayer.play();
    }

    // Render list
    videos.forEach((video, index) => {
      const item = document.createElement("div");
      item.className = "video-item";

      item.innerHTML = `
        <img src="${video.thumbnail}">
        <div>
          <h4>${video.title}</h4>
        </div>
      `;

      item.onclick = () => loadVideo(index);

      videoList.appendChild(item);
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
    toggleBtn.innerText = "☀️";
    logo.src = "logo-dark.png";
}

// Toggle theme
toggleBtn.onclick = () => {
    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {

        localStorage.setItem("theme", "dark");
        toggleBtn.innerText = "☀️";
        logo.src = "logo-dark.png";
    } else {
        localStorage.setItem("theme", "light");
        toggleBtn.innerText = "🌙";
        logo.src = "logo.png";
    }
};