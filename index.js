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

const videoGrid = document.getElementById("videoGrid");
const artistSidebar = document.getElementById("artistSidebar");

let allVideos = [];
let allArtists = [];

// 🔥 LOAD BOTH JSON FILES
Promise.all([
  fetch("videos.json").then(res => res.json()),
  fetch("artist.json").then(res => res.json())
]).then(([videos, artists]) => {
  allVideos = videos;
  allArtists = artists;

  renderArtists(videos);
  renderVideos(videos);
});

// ======================
// HELPERS
// ======================

function getArtistNames(artist) {
  return Array.isArray(artist) && artist.length > 0
    ? artist.join(" & ")
    : "";
}

function getArtistInfo(name) {
  return allArtists.find(a => a.name === name) || {};
}

// ======================
// RENDER VIDEOS
// ======================

function renderVideos(videos) {
  videoGrid.innerHTML = "";

  videos.forEach((video) => {
    const card = document.createElement("div");
    card.className = "video-card";

    card.innerHTML = `
      <div class="thumbnail-wrapper">
        <img src="${video.thumbnail}">
        <div class="duration-badge">${video.duration}</div>
      </div>

      <div class="video-info">
        <h4>${video.title}</h4>
        <span>${getArtistNames(video.artist)}</span>
      </div>
    `;

    // 🔥 FIX INDEX
    card.onclick = () => {
      const realIndex = allVideos.indexOf(video);
      window.location.href = `player.html?index=${realIndex}`;
    };

    videoGrid.appendChild(card);
  });
}

// ======================
// GET ALL ARTISTS
// ======================

function getAllArtists(videos) {
  const set = new Set();

  videos.forEach(v => {
    if (Array.isArray(v.artist)) {
      v.artist.forEach(a => set.add(a));
    }
  });

  return Array.from(set);
}

// ======================
// RENDER SIDEBAR
// ======================

function renderArtists(videos) {
  artistSidebar.innerHTML = "";

  const artists = getAllArtists(videos);

  // 🔥 ALL BUTTON
  const allItem = document.createElement("div");
  allItem.className = "artist-item active";
  allItem.innerText = "All";

  allItem.onclick = () => {
    setActiveArtist(allItem);
    renderVideos(allVideos);
    document.getElementById("artistHeader").style.display = "none";
  };

  artistSidebar.appendChild(allItem);

  // 🔥 ARTIST LIST
  artists.forEach(name => {
    const item = document.createElement("div");
    item.className = "artist-item";

    item.innerHTML = `
      <img src="artists/${name.toLowerCase()}.jpg" 
           style="width:32px;height:32px;border-radius:50%;margin-right:8px;">
      ${name}
    `;

    item.onclick = () => {
      setActiveArtist(item);

      const filtered = allVideos.filter(v =>
        v.artist && v.artist.includes(name)
      );

      renderVideos(filtered);
      showArtistProfile(name);
    };

    artistSidebar.appendChild(item);
  });
}

// ======================
// ACTIVE STATE
// ======================

function setActiveArtist(selected) {
  document.querySelectorAll(".artist-item")
    .forEach(el => el.classList.remove("active"));

  selected.classList.add("active");
}

// ======================
// ARTIST PROFILE (UPDATED)
// ======================

function showArtistProfile(name) {
  const header = document.getElementById("artistHeader");

  const artistVideos = allVideos.filter(v =>
    v.artist && v.artist.includes(name)
  );

  if (artistVideos.length === 0) return;

  const info = getArtistInfo(name); // 🔥 FROM artist.json

  header.style.display = "flex";

header.innerHTML = `
  <img src="artists/${name.toLowerCase()}.jpg">

  <div class="artist-info">
    <h2>${info.FullName || name}</h2>
    <p>${artistVideos.length} Songs</p>

    <div class="artist-links">

      ${info.Facebook ? `
        <div class="social-item" onclick="window.open('https://facebook.com/${info.Facebook}', '_blank')">
          <i class="bi bi-facebook"></i>
          <span>${info.Facebook}</span>
        </div>
      ` : ""}

      ${info.Telegram ? `
        <div class="social-item" onclick="window.open('https://${info.Telegram}', '_blank')">
          <i class="bi bi-telegram"></i>
          <span>${info.Telegram}</span>
        </div>
      ` : ""}

    </div>
  </div>
`;
}
let videos = [];

$.getJSON("videos.json", function (data) {
  videos = data;
});


$("#searchInput").on("keyup", function () {
  let keyword = $(this).val().toLowerCase();
  let dropdown = $("#searchDropdown");

  dropdown.empty();

  if (keyword === "") {
    dropdown.hide();
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
    dropdown.html("<div class='search-item'>No results</div>");
    dropdown.show();
    return;
  }

    results.slice(0, 6).forEach(v => {
    let index = videos.indexOf(v); // 🔑 get real index
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

  window.location.href = `player.html?index=${index}`;
});


$(document).click(function (e) {
  if (!$(e.target).closest(".search-box").length) {
    $("#searchDropdown").hide();
  }
});

$("#sidebarButton").click(function () {
    console.log(1)
  $("#artistSidebar").toggleClass("active");
});

$(window).on("resize", function () {
  if (window.innerWidth > 768) {
    $("#artistSidebar").removeClass("active");
  }
});

$(document).click(function (e) {
  if (
    window.innerWidth <= 768 &&
    !$(e.target).closest("#artistSidebar, #sidebarButton").length
  ) {
    $("#artistSidebar").removeClass("active");
  }
});