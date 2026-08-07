(() => {
  const body = document.body;
  const header = document.getElementById("introHeader");
  const rail = document.querySelector(".scene-rail");
  const progress = document.getElementById("scrollProgress");
  const scenes = [...document.querySelectorAll(".scene")];
  const railLinks = [...document.querySelectorAll(".scene-rail a")];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add(entry.target.classList.contains("reveal-title") ? "is-visible" : "in-view");
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.18 });

  document.querySelectorAll(".reveal-title, .reveal-block").forEach((element) => revealObserver.observe(element));

  const sceneObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;

    const id = visible.target.id;
    const isLight = visible.target.dataset.theme !== "dark";
    header.classList.toggle("is-light", isLight);
    rail.classList.toggle("is-light", isLight);
    railLinks.forEach((link) => link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`));
  }, { threshold: [0.25, 0.5, 0.7] });

  scenes.forEach((scene) => sceneObserver.observe(scene));

  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const value = max > 0 ? window.scrollY / max : 0;
    progress.style.width = `${Math.min(100, Math.max(0, value * 100))}%`;
  };
  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  const syncButton = (button, video) => {
    const paused = video.paused;
    button.setAttribute("aria-pressed", String(!paused));
    button.textContent = paused ? "PLAY FILM" : "PAUSE FILM";
  };

  document.querySelectorAll("[data-video-control]").forEach((button) => {
    const video = button.closest(".scene").querySelector("video");
    if (!video) return;
    button.addEventListener("click", async () => {
      if (video.paused) await video.play().catch(() => undefined);
      else video.pause();
      syncButton(button, video);
    });
    video.addEventListener("play", () => syncButton(button, video));
    video.addEventListener("pause", () => syncButton(button, video));
  });

  const filmTabs = [...document.querySelectorAll(".film-tab")];
  const filmVideo = document.getElementById("filmVideo");
  const filmImage = document.getElementById("filmImage");
  const filmPlay = document.getElementById("filmPlay");
  const filmCode = document.getElementById("filmCode");
  const filmTitle = document.getElementById("filmTitle");
  const filmCopy = document.getElementById("filmCopy");
  const filmLink = document.getElementById("filmLink");
  const detailLinks = {
    "01 · AI CADWIN": "product-cadwin.html",
    "02 · CLIP PDM": "product-clippdm.html",
    "03 · MULTI-BOM EPL": "product-multibom.html",
    "04 · CLIP PMS": "product-clippms.html",
    "05 · AI CHATBOT": "index.html#product-tour"
  };

  const updateFilmPlay = () => {
    const paused = filmVideo.paused;
    filmPlay.innerHTML = paused ? '<span aria-hidden="true">▶</span> PLAY' : '<span aria-hidden="true">Ⅱ</span> PAUSE';
    filmPlay.setAttribute("aria-pressed", String(!paused));
  };

  filmTabs.forEach((tab) => {
    tab.addEventListener("click", async () => {
      filmTabs.forEach((item) => {
        const active = item === tab;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-selected", String(active));
      });

      const isVideo = tab.dataset.kind === "video";
      filmCode.textContent = tab.dataset.code;
      filmTitle.textContent = tab.dataset.title;
      filmCopy.textContent = tab.dataset.copy;
      filmLink.href = detailLinks[tab.dataset.code] || "index.html";
      filmVideo.pause();

      if (isVideo) {
        filmImage.hidden = true;
        filmVideo.hidden = false;
        filmVideo.poster = tab.dataset.poster || "";
        const source = filmVideo.querySelector("source");
        source.src = tab.dataset.src;
        source.type = tab.dataset.src.endsWith(".webm") ? "video/webm" : "video/mp4";
        filmVideo.load();
        if (!reducedMotion.matches) await filmVideo.play().catch(() => undefined);
        filmPlay.hidden = false;
      } else {
        filmVideo.hidden = true;
        filmImage.hidden = false;
        filmImage.src = tab.dataset.src;
        filmPlay.hidden = true;
      }
    });
  });

  filmPlay.addEventListener("click", async () => {
    if (filmVideo.paused) await filmVideo.play().catch(() => undefined);
    else filmVideo.pause();
    updateFilmPlay();
  });
  filmVideo.addEventListener("play", updateFilmPlay);
  filmVideo.addEventListener("pause", updateFilmPlay);

  const autoplayObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const videos = entry.target.querySelectorAll("video");
      videos.forEach((video) => {
        if (entry.isIntersecting && !reducedMotion.matches && !body.classList.contains("motion-off")) {
          video.play().catch(() => undefined);
        } else if (!entry.isIntersecting) {
          video.pause();
        }
      });
    });
  }, { threshold: 0.45 });
  scenes.forEach((scene) => autoplayObserver.observe(scene));

  const motionToggle = document.getElementById("motionToggle");
  motionToggle.addEventListener("click", () => {
    const off = body.classList.toggle("motion-off");
    motionToggle.setAttribute("aria-pressed", String(off));
    motionToggle.textContent = off ? "MOTION OFF" : "MOTION ON";
    document.querySelectorAll("video").forEach((video) => {
      if (off) video.pause();
      else if (video.closest(".scene")?.getBoundingClientRect().top < window.innerHeight * .7) video.play().catch(() => undefined);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.target.matches("input, textarea, select, button")) return;
    if (!["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft"].includes(event.key)) return;
    const current = scenes.reduce((best, scene, index) => {
      const distance = Math.abs(scene.getBoundingClientRect().top);
      return distance < best.distance ? { index, distance } : best;
    }, { index: 0, distance: Infinity }).index;
    const direction = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : -1;
    const next = scenes[Math.min(scenes.length - 1, Math.max(0, current + direction))];
    next.scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth" });
  });

  const map = document.getElementById("dataMap");
  const canvas = document.getElementById("flowCanvas");
  const context = canvas.getContext("2d");
  const identities = [...map.querySelectorAll(".identity-node")];
  const products = [...map.querySelectorAll(".product-node")];
  const core = document.getElementById("ssoCore");
  let mapVisible = false;
  let flowFrame = 0;

  const mapObserver = new IntersectionObserver(([entry]) => { mapVisible = entry.isIntersecting; }, { threshold: 0.15 });
  mapObserver.observe(map);

  const resizeCanvas = () => {
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    const rect = map.getBoundingClientRect();
    canvas.width = Math.max(1, Math.floor(rect.width * ratio));
    canvas.height = Math.max(1, Math.floor(rect.height * ratio));
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  };

  const point = (element, side) => {
    const rect = element.getBoundingClientRect();
    const mapRect = map.getBoundingClientRect();
    const x = side === "left" ? rect.left : side === "right" ? rect.right : rect.left + rect.width / 2;
    const y = side === "top" ? rect.top : side === "bottom" ? rect.bottom : rect.top + rect.height / 2;
    return { x: x - mapRect.left, y: y - mapRect.top };
  };

  const drawPath = (from, to, color, phase) => {
    const horizontal = Math.abs(to.x - from.x) > Math.abs(to.y - from.y);
    context.beginPath();
    context.moveTo(from.x, from.y);
    if (horizontal) {
      const bend = (to.x - from.x) * .52;
      context.bezierCurveTo(from.x + bend, from.y, to.x - bend, to.y, to.x, to.y);
    } else {
      const bend = (to.y - from.y) * .52;
      context.bezierCurveTo(from.x, from.y + bend, to.x, to.y - bend, to.x, to.y);
    }
    context.strokeStyle = color;
    context.lineWidth = 1;
    context.setLineDash([3, 8]);
    context.lineDashOffset = -phase;
    context.stroke();
    context.setLineDash([]);
  };

  const animateMap = () => {
    flowFrame += 0.55;
    if (mapVisible && !body.classList.contains("motion-off")) {
      const rect = map.getBoundingClientRect();
      context.clearRect(0, 0, rect.width, rect.height);
      const mobile = window.innerWidth <= 820;
      const coreIn = point(core, mobile ? "top" : "left");
      const coreOut = point(core, mobile ? "bottom" : "right");
      identities.forEach((node, index) => drawPath(point(node, mobile ? "bottom" : "right"), coreIn, "rgba(56,183,189,.62)", flowFrame + index * 2));
      products.forEach((node, index) => drawPath(coreOut, point(node, mobile ? "top" : "left"), "rgba(183,236,46,.62)", flowFrame + index * 2.4));
    }
    requestAnimationFrame(animateMap);
  };

  new ResizeObserver(resizeCanvas).observe(map);
  resizeCanvas();
  animateMap();
})();
