document.addEventListener("DOMContentLoaded", function () {
  /* =================================================
     DỰ ÁN — sửa mảng này để thêm clip riêng.
     - title: tên dự án
     - category: nhóm (dùng cho bộ lọc)
     - year / tools: hiển thị trên thẻ
     - description: mô tả ngắn
     - video: link clip — 3 kiểu đều được:
         + Nguyên bộ iframe embed của YouTube (copy từ "Chia sẻ > Nhúng" dán thẳng vào)
         + Link YouTube (vd: https://www.youtube.com/watch?v=xxxx) hoặc YouTube Shorts
         + Đường dẫn file .mp4 (vd: "assets/videos/project-1.mp4")
       Lưu ý: video YouTube sẽ hiện thumbnail + nút "Xem trên YouTube"
       (mở tab mới) thay vì phát nhúng — tránh hẳn lỗi error 153 trên mọi trình duyệt.
         File .mp4 phát ngay trong trang.
     - poster: (tùy chọn) ảnh đại diện riêng.
         Để trống: video YouTube sẽ TỰ LẤY ảnh bìa từ YouTube (HD + tự
         fallback); file .mp4 sẽ dùng màu gradient.
     ================================================= */
  var projects = [
    {
      title: "Talk Show",
      category: "Talk Show",
      year: "2026",
      tools: "Premiere Pro",
      description: "Talk SHow Practice Project · Edited by NTHP · Personal Project",
      video:
        "https://www.youtube.com/watch?v=Cp5G9IyMzsY",
      poster: ""
    },
    {
      title: "Documentary",
      category: "Documentary",
      year: "2026",
      tools: "Premiere Pro",
      description: "EditStock Practice Project · Edited by NTHP · Personal Project",
      video:
        "https://www.youtube.com/watch?v=UjZNfrIV784",
      poster: ""
    },
    // {
    //   title: "Promotional Videos",
    //   category: "Promotional Videos",
    //   year: "2026",
    //   tools: "Premiere Pro",
    //   description: "Commercial & Real Estate Video Editing Showcase | [NTHP] - Personal Project",
    //   video:
    //     "https://www.youtube.com/watch?v=bYJqvlPfHZo",
    //   poster: ""
    // },
    {
      title: "Promotional Videos",
      category: "Promotional Videos",
      year: "2026",
      tools: "Premiere Pro",
      description: "TVC khoai tây - Personal Project",
      video:
        "https://www.youtube.com/watch?v=69gjCrmYtzk",
      poster: ""
    },
    {
      title: "Motion Graphics",
      category: "Motion",
      year: "2026",
      tools: "After Effects · Premiere Pro · Google Earth Studio ",
      description: "Vinhomes Grand Park - Khơi nguồn chất sống tinh hoa, kiến tạo giá trị tương lai- Personal Project",
      video:'<iframe width="560" height="315" src="https://www.youtube.com/embed/snKHJ9XvK0U?si=a9O1yjz_4zH89ygX" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>',
      poster: ""
    },
    {
      title: "Cooking Show",
      category: "Cooking Show",
      year: "2026",
      tools: "Premiere Pro",
      description: "Cooking Show Editing Practice",
      video: "https://www.youtube.com/watch?v=dKq01vitpFk",
      poster: ""
    },
    {
      title: "Những video khác",
      category: "Other videos",
      year: "2026",
      tools: "Premiere Pro · After Effects",
      description: "Bài hát Ngọn Gió Trong Ngực - NTHP + Suno",
      video:
        "https://www.youtube.com/watch?v=kizKUh8V6J4",
      poster: ""
    }
  ];

  var fallbackGradients = [
    "linear-gradient(135deg, #7c3aed, #ff6b4a)",
    "linear-gradient(135deg, #0ea5e9, #7c3aed)",
    "linear-gradient(135deg, #ff5c8a, #7c3aed)",
    "linear-gradient(135deg, #f59e0b, #ff6b4a)",
    "linear-gradient(135deg, #10b981, #7c3aed)",
    "linear-gradient(135deg, #6366f1, #ff6b4a)"
  ];

  var grid = document.getElementById("projectsGrid");
  var filters = document.getElementById("filters");
  var lightbox = document.getElementById("lightbox");
  var player = document.getElementById("lightboxPlayer");
  var caption = document.getElementById("lightboxCaption");
  var closeBtn = document.getElementById("lightboxClose");
  var activeVideo = null;

  /* ---------- Filters ---------- */
  var categories = ["Tất cả"].concat(
    projects.map(function (p) {
      return p.category;
    }).filter(function (c, i, arr) {
      return arr.indexOf(c) === i;
    })
  );

  perPage = 6;
  var pagination = document.getElementById("projectsPagination");

  /* ---------- Khôi phục bộ lọc & trang từ URL (?cat=...&page=...) ---------- */
  var urlParams = new URLSearchParams(window.location.search);
  var urlCat = urlParams.get("cat");
  var urlPageNum = parseInt(urlParams.get("page"), 10);
  var currentFilter = urlCat && categories.indexOf(urlCat) !== -1 ? urlCat : "Tất cả";
  var initialPage = urlPageNum && urlPageNum > 0 ? urlPageNum : 1;

  categories.forEach(function (cat) {
    var btn = document.createElement("button");
    btn.className = "filter__btn" + (cat === currentFilter ? " active" : "");
    btn.textContent = cat;
    btn.addEventListener("click", function () {
      document.querySelectorAll(".filter__btn").forEach(function (b) {
        b.classList.remove("active");
      });
      btn.classList.add("active");
      currentFilter = cat;
      renderProjects(cat, 1);
    });
    filters.appendChild(btn);
  });

  renderProjects(currentFilter, initialPage);

  /* ---------- Render cards ---------- */
  function renderProjects(filter, page) {
    var items = projects.filter(function (p) {
      return filter === "Tất cả" || p.category === filter;
    });
    var totalPages = Math.max(1, Math.ceil(items.length / perPage));
    if (!page || page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    var pageItems = items.slice((page - 1) * perPage, page * perPage);
    updateURL(filter, page);
    grid.innerHTML = "";
    pageItems.forEach(function (p, i) {
      var card = document.createElement("article");
      var ytId = getYouTubeId(p.video);
      var img = "";
      var bg = "";
      if (p.poster) {
        img = '<img class="project__thumb" src="' + p.poster + '" alt="' + p.title + '" />';
      } else if (ytId) {
        img = ytThumbImg(ytId, p.title, "project__thumb");
      } else {
        bg = ' style="background-image:' + fallbackGradients[i % fallbackGradients.length] + '"';
      }
      card.className = "project__card";
      card.innerHTML =
        '<div class="project__poster"' + bg + ">" +
        img +
        '  <span class="project__play">' +
        '    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">' +
        "      <path d='M8 5.5v13l11-6.5-11-6.5Z' />" +
        "    </svg>" +
        "  </span>" +
        "</div>" +
        '  <div class="project__body">' +
        '    <div class="project__meta">' + p.category + " · " + p.year + "</div>" +
        '    <h3 class="project__title">' + p.title + "</h3>" +
        '    <p class="project__desc">' + p.description + "</p>" +
        "  </div>";
      card.querySelector(".project__poster").addEventListener("click", function () {
        openLightbox(p);
      });
      grid.appendChild(card);
    });
    renderPagination(totalPages, page);
  }

  function renderPagination(totalPages, page) {
    pagination.innerHTML = "";
    if (totalPages <= 1) return;
    var prev = document.createElement("button");
    prev.className = "page__btn";
    prev.textContent = "‹";
    prev.disabled = page === 1;
    prev.setAttribute("aria-label", "Trang trước");
    prev.addEventListener("click", function () {
      renderProjects(currentFilter, page - 1);
      scrollToProjects();
    });
    pagination.appendChild(prev);

    for (var p = 1; p <= totalPages; p++) {
      (function (n) {
        var btn = document.createElement("button");
        btn.className = "page__btn" + (n === page ? " active" : "");
        btn.textContent = n;
        btn.setAttribute("aria-label", "Trang " + n);
        btn.addEventListener("click", function () {
          renderProjects(currentFilter, n);
          scrollToProjects();
        });
        pagination.appendChild(btn);
      })(p);
    }

    var next = document.createElement("button");
    next.className = "page__btn";
    next.textContent = "›";
    next.disabled = page === totalPages;
    next.setAttribute("aria-label", "Trang sau");
    next.addEventListener("click", function () {
      renderProjects(currentFilter, page + 1);
      scrollToProjects();
    });
    pagination.appendChild(next);
  }

  function updateURL(filter, page) {
    var params = new URLSearchParams();
    if (filter && filter !== "Tất cả") params.set("cat", filter);
    if (page && page > 1) params.set("page", page);
    var query = params.toString();
    var newUrl =
      window.location.pathname +
      (query ? "?" + query : "") +
      window.location.hash;
    window.history.replaceState(null, "", newUrl);
  }

  function scrollToProjects() {
    var section = document.getElementById("projects");
    if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function ytThumbImg(ytId, alt, cls) {
    return '<img class="' + cls + '" src="https://i.ytimg.com/vi/' + ytId +
      '/maxresdefault.jpg" onerror="this.onerror=null;this.src=' +
      "'https://i.ytimg.com/vi/" + ytId + "/hqdefault.jpg'" +
      '" alt="' + alt + '" />';
  }

  /* ---------- Lightbox / Video ---------- */
  var ytReady = false;
  var lastYt = null;
  var currentYtPlayer = null;
  var embedStarted = false;
  var embedTimer = null;

  function openLightbox(project) {
    var ytId = getYouTubeId(project.video);
    if (ytId) {
      lastYt = {
        id: ytId,
        url: "https://www.youtube.com/watch?v=" + ytId,
        title: project.title
      };
      embedStarted = false;
      if (embedTimer) clearTimeout(embedTimer);
      embedTimer = setTimeout(function () {
        if (!embedStarted) {
          embedTimer = null;
          showYtFallback();
        }
      }, 7000);
      player.innerHTML =
        '<div class="yt-card">' +
        ytThumbImg(ytId, project.title, "project__thumb") +
        '  <div class="yt-card__live" id="youtubeEmbed"><div class="yt-card__loading">Đang tải video…</div></div>' +
        "</div>";
      ensureYtApi();
      loadYtEmbed();
    } else {
      player.innerHTML =
        '<video src="' + project.video + '" controls autoplay playsinline preload="metadata"></video>';
      activeVideo = player.querySelector("video");
    }
    caption.innerHTML =
      "<strong>" + project.title + "</strong> &nbsp;·&nbsp; " + project.year + " &nbsp;·&nbsp; " + project.tools +
      (ytId
        ? ' &nbsp;·&nbsp; <a class="lightbox__open" href="' + (lastYt ? lastYt.url : "") +
          '" target="_blank" rel="noopener">Xem trên YouTube ↗</a>'
        : "");
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
  }

  function ensureYtApi() {
    if (document.getElementById("yt-api")) return;
    var tag = document.createElement("script");
    tag.id = "yt-api";
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  }

  window.onYouTubeIframeAPIReady = function () {
    ytReady = true;
    if (lastYt && document.getElementById("youtubeEmbed")) {
      createYtPlayer();
    }
  };

  function loadYtEmbed() {
    if (ytReady && document.getElementById("youtubeEmbed")) {
      createYtPlayer();
    }
  }

  function createYtPlayer() {
    destroyYtPlayer();
    currentYtPlayer = new YT.Player("youtubeEmbed", {
      videoId: lastYt.id,
      playerVars: { autoplay: 1, rel: 0, playsinline: 1 },
      events: {
        onReady: function (e) {
          embedStarted = true;
          if (embedTimer) {
            clearTimeout(embedTimer);
            embedTimer = null;
          }
          if (lastYt) e.target.playVideo();
        },
        onError: function () {
          if (embedTimer) {
            clearTimeout(embedTimer);
            embedTimer = null;
          }
          showYtFallback();
        }
      }
    });
  }

  function destroyYtPlayer() {
    if (currentYtPlayer) {
      try {
        currentYtPlayer.destroy();
      } catch (e) {}
      currentYtPlayer = null;
    }
  }

  function showYtFallback() {
    destroyYtPlayer();
    if (!lastYt) return;
    player.innerHTML =
      '<div class="yt-card">' +
      ytThumbImg(lastYt.id, lastYt.title, "project__thumb") +
      '  <a class="yt-card__watch" href="' + lastYt.url + '" target="_blank" rel="noopener">' +
      '    <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5-11-6.5Z" /></svg>' +
      "    <span>Xem trên YouTube</span>" +
      "  </a>" +
      "</div>";
  }

  function getYouTubeId(embedOrUrl) {
    if (!embedOrUrl) return null;
    var m = embedOrUrl.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/);
    return m ? m[1] : null;
  }

  function closeLightbox() {
    destroyYtPlayer();
    lastYt = null;
    if (activeVideo) {
      activeVideo.pause();
      activeVideo.removeAttribute("src");
      activeVideo.load();
      activeVideo = null;
    }
    player.innerHTML = "";
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
  }

  closeBtn.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox || e.target.closest(".lightbox__close")) {
      closeLightbox();
    }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeLightbox();
  });

  /* ---------- Light / Dark mode ---------- */
  var themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    var syncThemeLabel = function () {
      var isLight = document.documentElement.getAttribute("data-theme") === "light";
      themeToggle.setAttribute(
        "aria-label",
        isLight ? "Chuyển sang giao diện tối" : "Chuyển sang giao diện sáng"
      );
    };
    syncThemeLabel();
    themeToggle.addEventListener("click", function () {
      var root = document.documentElement;
      var current = root.getAttribute("data-theme") === "light" ? "light" : "dark";
      var next = current === "light" ? "dark" : "light";
      root.setAttribute("data-theme", next);
      try {
        localStorage.setItem("theme", next);
      } catch (e) {}
      syncThemeLabel();
    });
  }

  /* ---------- Header scroll ---------- */
  var header = document.getElementById("header");
  window.addEventListener("scroll", function () {
    header.classList.toggle("scrolled", window.scrollY > 20);
  });

  /* ---------- Mobile menu ---------- */
  var menuTrigger = document.getElementById("menuTrigger");
  var nav = document.getElementById("nav");
  menuTrigger.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    menuTrigger.classList.toggle("active", open);
    menuTrigger.setAttribute("aria-expanded", open ? "true" : "false");
  });
  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      nav.classList.remove("open");
      menuTrigger.classList.remove("active");
      menuTrigger.setAttribute("aria-expanded", "false");
    });
  });

  /* ---------- Link "Trang chủ" / logo: đưa URL về gốc sạch ---------- */
  document.querySelectorAll('a[href="#home"]').forEach(function (homeLink) {
    homeLink.addEventListener("click", function () {
      // Để trình duyệt tự cuộn tới #home trước, sau đó mới dọn sạch URL
      // (bỏ ?cat=..., ?page=... và cả #home) mà không tạo thêm lịch sử back.
      setTimeout(function () {
        window.history.replaceState(null, "", window.location.pathname);
      }, 0);
    });
  });

  /* ---------- Marquee loop ---------- */
  var track = document.querySelector("[data-marquee]");
  if (track) track.innerHTML += track.innerHTML;

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  function doReveal(el) {
    var delay = parseInt(el.getAttribute("data-delay") || "0", 10);
    setTimeout(function () {
      el.classList.add("in");
    }, delay);
  }
  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          doReveal(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );
  revealEls.forEach(function (el) {
    observer.observe(el);
  });

  function forceRevealHash() {
    var hash = window.location.hash;
    if (!hash) return;
    var target;
    try {
      target = document.querySelector(hash);
    } catch (e) {
      return;
    }
    if (!target) return;
    target.querySelectorAll("[data-reveal]").forEach(function (el) {
      doReveal(el);
      observer.unobserve(el);
    });
  }
  window.addEventListener("load", function () {
    setTimeout(forceRevealHash, 120);
  });
  window.addEventListener("hashchange", function () {
    setTimeout(forceRevealHash, 300);
  });
});