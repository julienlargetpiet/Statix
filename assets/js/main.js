function initThemeToggle() {
  const root = document.documentElement;
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;

  btn.textContent = root.dataset.theme === "dark" ? "☀︎" : "⏾";

  btn.addEventListener("click", () => {
    const isDark = root.dataset.theme === "dark";
    root.dataset.theme = isDark ? "light" : "dark";
    localStorage.setItem("theme", root.dataset.theme);
    btn.textContent = isDark ? "⏾" : "☀︎";
  });
}

document.addEventListener("DOMContentLoaded", () => {

  document.addEventListener("click", async (event) => {
    const btn = event.target.closest(".copy-btn");
    if (!btn) return;
  
    const pre = btn.closest("pre");
    if (!pre) return;
  
    const code = pre.querySelector("code");
    if (!code) return;
  
    const text = code.innerText.trim();
  
    try {
      await navigator.clipboard.writeText(text);
  
      // Visual feedback
      const original = btn.textContent;
      btn.textContent = "✅ Copied";
      btn.disabled = true;
  
      setTimeout(() => {
        btn.textContent = original;
        btn.disabled = false;
      }, 1500);
    } catch (err) {
      console.error("Copy failed", err);
      btn.textContent = "❌ Error";
    }
  });

  initThemeToggle();

});


(function () {
  const top = document.querySelector('.admin-table-scroll-top');
  const topInner = document.querySelector('.admin-table-scroll-inner');
  const wrapper = document.querySelector('.admin-table-wrapper');
  const table = wrapper?.querySelector('.admin-table');

  if (!top || !topInner || !wrapper || !table) return;

  function updateWidth() {
    topInner.style.width = table.scrollWidth + 'px';
  }

  let syncing = false;

  top.addEventListener('scroll', () => {
    if (syncing) return;
    syncing = true;
    wrapper.scrollLeft = top.scrollLeft;
    syncing = false;
  });

  wrapper.addEventListener('scroll', () => {
    if (syncing) return;
    syncing = true;
    top.scrollLeft = wrapper.scrollLeft;
    syncing = false;
  });

  updateWidth();
  window.addEventListener('resize', updateWidth);

  if ('ResizeObserver' in window) {
    new ResizeObserver(updateWidth).observe(table);
  }
})();


document.addEventListener("DOMContentLoaded", function () {
  const summary = document.getElementById("article-summary");
  const toggle = document.getElementById("summary-toggle");

  if (summary && toggle) {
    toggle.addEventListener("click", function () {
      summary.classList.toggle("open");
    });
  }
});

document.addEventListener("DOMContentLoaded", function () {
  initSummary();
  initMoreIndex();
});

function initMoreIndex() {
  const morePanel = document.getElementById("index-more");
  if (!morePanel) return;

  const toggleBtn = document.getElementById("index-toggle");

  if (window.innerWidth >= 1100) {
    morePanel.classList.add("open");
  }

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      morePanel.classList.toggle("open");
    });
  }

}

function initSummary() {
  const content = document.querySelector(".article-content");
  const summaryNav = document.getElementById("summary-content");
  const summaryPanel = document.getElementById("article-summary");

  if (!content || !summaryNav || !summaryPanel) return;

  const headings = content.querySelectorAll("h2, h3");

  if (headings.length < 2) return;

  headings.forEach((heading) => {
    if (!heading.id) {
      heading.id = slugify(heading.textContent);
    }
    const id = heading.id;

    const link = document.createElement("a");
    link.href = "#" + id;
    link.textContent = heading.textContent;

    if (heading.tagName === "H3") {
      link.style.paddingLeft = "1rem";
    }

    link.addEventListener("click", () => {
      if (window.innerWidth <= 1100) {
        summaryPanel.classList.remove("open");
      }
    });

    summaryNav.appendChild(link);
  });

  // Auto-open on large screens
  if (window.innerWidth >= 1100) {
    summaryPanel.classList.add("open");
  }
}

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "")
    .replace(/\s+/g, "-");
}

document.addEventListener("DOMContentLoaded", function () {
  initReslugFlash();
});

function initReslugFlash() {
  const form = document.querySelector('form[action="/admin/reslug"]');
  const flash = document.getElementById("flash-message");

  if (!form || !flash) return;

  form.addEventListener("submit", function (e) {

      e.preventDefault(); // ⬅️ stop immediate submission

      showFlashMessage("Build All to see changes");

      setTimeout(() => {
        form.submit(); // submit after delay
      }, 3000);

  });
}

function showFlashMessage(message) {
  const flash = document.getElementById("flash-message");
  if (!flash) return;

  flash.textContent = message;
  flash.classList.remove("hidden");

  setTimeout(() => {
    flash.classList.add("hidden");
  }, 3000);
}

document.addEventListener("DOMContentLoaded", function () {
  const progressBar = document.querySelector(".scroll-progress-bar");
  if (!progressBar) return;

  let ticking = false;

  function updateScrollProgress() {
    const scrollTop = window.scrollY;
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;

    const progress = docHeight > 0
      ? scrollTop / docHeight
      : 0;

    progressBar.style.transform = `scaleX(${progress})`;
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(updateScrollProgress);
      ticking = true;
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  updateScrollProgress();
});

//document.addEventListener("DOMContentLoaded", function () {
//
//  document.querySelectorAll(".code-tabs").forEach((tabs) => {
//    const buttons = tabs.querySelectorAll(".code-tab");
//    const panels = tabs.querySelectorAll(".code-tab-panel");
//  
//    buttons.forEach((button) => {
//      button.addEventListener("click", () => {
//        const target = button.dataset.tab;
//  
//        buttons.forEach((btn) => {
//          btn.classList.remove("active");
//        });
//  
//        panels.forEach((panel) => {
//          panel.classList.remove("active");
//        });
//  
//        button.classList.add("active");
//  
//        tabs
//          .querySelector(`[data-panel="${target}"]`)
//          .classList.add("active");
//      });
//    });
//  });
//
//});

document.addEventListener("DOMContentLoaded", function () {

  function setupPanelLoader(panel) {
    const images = panel.querySelectorAll("img");

    if (images.length === 0) {
      panel.classList.add("loaded");
      return;
    }

    let loadedCount = 0;

    function markOneImageDone() {
      loadedCount += 1;

      if (loadedCount === images.length) {
        panel.classList.add("loaded");
      }
    }

    images.forEach(function (img) {
      if (img.complete && img.naturalWidth > 0) {
        markOneImageDone();
      } else {
        img.addEventListener("load", markOneImageDone, { once: true });
        img.addEventListener("error", markOneImageDone, { once: true });
      }
    });
  }

  document.querySelectorAll(".code-tabs").forEach(function (tabs) {
    const buttons = tabs.querySelectorAll(".code-tab");
    const panels = tabs.querySelectorAll(".code-tab-panel");

    panels.forEach(function (panel) {
      setupPanelLoader(panel);
    });

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        const target = button.dataset.tab;

        buttons.forEach(function (btn) {
          btn.classList.remove("active");
        });

        panels.forEach(function (panel) {
          panel.classList.remove("active");
        });

        button.classList.add("active");

        const targetPanel = tabs.querySelector(`[data-panel="${target}"]`);

        if (targetPanel) {
          targetPanel.classList.add("active");
        }
      });
    });
  });

});

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("[data-matrix-tabs]").forEach(function (tabs) {
    const cells = tabs.querySelectorAll(".matrix-cell");
    const panels = tabs.querySelectorAll(".matrix-tab-panel");

    function markLoaded(panel) {
      panel.classList.add("loaded");
    }

    panels.forEach(function (panel) {
      const img = panel.querySelector("img.matrix-img");

      if (!img) {
        panel.classList.add("loaded");
        return;
      }

      if (img.complete && img.naturalWidth > 0) {
        markLoaded(panel);
      } else {
        img.addEventListener("load", function () {
          markLoaded(panel);
        });

        img.addEventListener("error", function () {
          panel.classList.add("loaded");
          panel.classList.add("load-error");
        });
      }
    });

    function setActive(row, col) {
      cells.forEach(function (cell) {
        const match =
          cell.dataset.row === row &&
          cell.dataset.col === col;

        cell.classList.toggle("active", match);
      });

      panels.forEach(function (panel) {
        const match =
          panel.dataset.row === row &&
          panel.dataset.col === col;

        panel.classList.toggle("active", match);
      });
    }

    cells.forEach(function (cell) {
      cell.addEventListener("click", function () {
        setActive(cell.dataset.row, cell.dataset.col);
      });
    });

    const initialCell = tabs.querySelector(".matrix-cell.active");

    if (initialCell) {
      setActive(initialCell.dataset.row, initialCell.dataset.col);
    } else {
      setActive("system", "readr");
    }
  });
});


document.addEventListener("DOMContentLoaded", function () {

  const containers = document.querySelectorAll(".lone-img-container");

  containers.forEach(function (container) {

    const imgs = container.querySelectorAll("img");

    if (imgs.length === 0) {
      container.classList.add("loaded");
      return;
    }

    let loadedCount = 0;

    function markOneImageDone() {
      loadedCount += 1;

      if (loadedCount === imgs.length) {
        container.classList.add("loaded");
      }
    }

    imgs.forEach(function (img) {
      if (img.complete && img.naturalWidth > 0) {
        markOneImageDone();
      } else {
        img.addEventListener("load", markOneImageDone, { once: true });
        img.addEventListener("error", markOneImageDone, { once: true });
      }
    });

  });

});



document.querySelectorAll(".image-carousel").forEach(carousel => {
    const slides = [...carousel.querySelectorAll(".carousel-slide")];

    slides.forEach((slide, index) => {
        const prev = slide.querySelector(".carousel-prev");
        const next = slide.querySelector(".carousel-next");

        prev.addEventListener("click", event => {
            event.preventDefault();

            const target = slides[(index - 1 + slides.length) % slides.length];

            carousel.scrollTo({
                left: target.offsetLeft - slides[0].offsetLeft,
                behavior: "instant"
            });
        });

        next.addEventListener("click", event => {
            event.preventDefault();

            const target = slides[(index + 1) % slides.length];

            carousel.scrollTo({
                left: target.offsetLeft - slides[0].offsetLeft,
                behavior: "instant"
            });
        });
    });
});

document.addEventListener("DOMContentLoaded", function () {

  const selector = document.querySelector(".subject-selector");
  if (!selector) return;

  const pills = [...selector.querySelectorAll(
    ".subject-pills .subject-pill"
  )];

  const prev = selector.querySelector("#subjects-prev");
  const next = selector.querySelector("#subjects-next");

  if (!prev || !next || pills.length === 0) return;

  const pageSize = 1;
  const totalPages = Math.ceil(pills.length / pageSize);

  // Create the page counter above the subject selector.
  const counter = document.createElement("div");
  counter.className = "subject-counter";
  counter.setAttribute("aria-live", "polite");
  
  selector.parentNode.insertBefore(counter, selector);

  // Start on the page containing the active subject.
  const activeIndex = pills.findIndex(pill =>
    pill.classList.contains("active")
  );

  let page = Math.floor(Math.max(activeIndex, 0) / pageSize);

  function renderSubjects() {
    const start = page * pageSize;
    const end = start + pageSize;

    counter.textContent = `${page + 1}/${totalPages}`;

    pills.forEach((pill, index) => {
      pill.hidden = index < start || index >= end;
    });

    prev.disabled = page === 0;
    next.disabled = page >= totalPages - 1;
  }

  prev.addEventListener("click", () => {
    if (page > 0) {
      page--;
      renderSubjects();
    }
  });

  next.addEventListener("click", () => {
    if (page < totalPages - 1) {
      page++;
      renderSubjects();
    }
  });

  renderSubjects();

});

(function () {
    function initLightbox() {
        const overlay = document.createElement("div");
        overlay.className = "image-lightbox";
        overlay.hidden = true;

        const enlarged = document.createElement("img");
        enlarged.alt = "";

        const frame = document.createElement("div");
        frame.className = "image-lightbox-frame";
        
        frame.appendChild(enlarged);
        overlay.appendChild(frame);

        document.body.appendChild(overlay);

        let previousOverflow = "";

        function closeLightbox() {
            if (overlay.hidden) return;

            overlay.hidden = true;
            enlarged.removeAttribute("src");
            document.body.style.overflow = previousOverflow;
        }

        document.addEventListener("click", event => {
            if (!overlay.hidden) {

                if (
                    event.target === overlay ||
                    event.target === frame ||
                    event.target === enlarged
                ) {
                    closeLightbox();
                }

                return;
            }

            const img = event.target.closest(
                ".portrait-light, .portrait-dark, .pixel-portrait img, .matrix-img"
            );

            if (!img) return;

            enlarged.src = img.currentSrc || img.src;
            enlarged.alt = img.alt || "";

            previousOverflow = document.body.style.overflow;
            document.body.style.overflow = "hidden";

            overlay.hidden = false;
        });

        document.addEventListener("keydown", event => {
            if (event.key === "Escape") {
                closeLightbox();
            }
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initLightbox);
    } else {
        initLightbox();
    }
})();

/* ==========================================
   CLICKABLE ARTICLE HEADINGS
   ========================================== */

document.addEventListener("DOMContentLoaded", () => {

    const headings = document.querySelectorAll(
        ".article-content h1, " +
        ".article-content h2, " +
        ".article-content h3, " +
        ".article-content h4, " +
        ".article-content h5, " +
        ".article-content h6"
    );

    const usedIds = new Set(
        [...document.querySelectorAll("[id]")]
            .map(el => el.id)
    );

    headings.forEach(heading => {

        // Preserve existing heading IDs.
        if (!heading.id) {
            const base = heading.textContent
                .normalize("NFKD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, "")
                .replace(/\s+/g, "-") || "section";

            let id = base;
            let index = 2;

            while (usedIds.has(id)) {
                id = `${base}-${index++}`;
            }

            heading.id = id;
            usedIds.add(id);
        }

        // Avoid nested or duplicate links.
        if (heading.querySelector("a")) return;

        const link = document.createElement("a");
        link.href = "#" + heading.id;
        link.className = "heading-anchor";

        while (heading.firstChild) {
            link.appendChild(heading.firstChild);
        }

        heading.appendChild(link);
    });

});


document.addEventListener("DOMContentLoaded", () => {

    document.querySelectorAll("[data-matrix-tabs]").forEach(matrix => {

        const top = matrix.querySelector(".matrix-scroll-top");
        const topInner = matrix.querySelector(".matrix-scroll-inner");

        const wrapper = matrix.querySelector(".matrix-tabs-scroll");
        const grid = matrix.querySelector(".matrix-tabs-grid");

        if (!top || !topInner || !wrapper || !grid) return;

        function updateWidth() {
            topInner.style.width = wrapper.scrollWidth + "px";
            top.scrollLeft = wrapper.scrollLeft;
        }

        let syncing = false;

        // Top scrollbar -> Bottom scrollbar
        top.addEventListener("scroll", () => {
            if (syncing) return;

            syncing = true;
            wrapper.scrollLeft = top.scrollLeft;
            syncing = false;
        });

        // Bottom scrollbar -> Top scrollbar
        wrapper.addEventListener("scroll", () => {
            if (syncing) return;

            syncing = true;
            top.scrollLeft = wrapper.scrollLeft;
            syncing = false;
        });

        updateWidth();

        window.addEventListener("resize", updateWidth);

        if ("ResizeObserver" in window) {
            new ResizeObserver(updateWidth).observe(grid);
        }
    });

});


document.addEventListener("DOMContentLoaded", () => {

    const trigger = document.getElementById("home-search-trigger");
    const dialog = document.getElementById("home-search-dialog");
    const closeButton = document.getElementById("home-search-close");
    const input = document.getElementById("home-search-input");
    const form = document.getElementById("home-search-form");
    const results = document.getElementById("home-search-results");
    const status = document.getElementById("home-search-status");

    if (!trigger || !dialog || !input || !form || !results || !status) {
        return;
    }

    const normalize = text =>
        text.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

    const articles = [...document.querySelectorAll(".doc-card")]
        .map(card => {
    
            const link = card.matches("a[href]")
                ? card
                : card.querySelector("a.btn[href], h3 a[href], a[href]");
    
            const title = card.querySelector("h3")?.textContent.trim() || "";
            const category = card.querySelector(".subject-bookmark")?.textContent.trim() || "";
            const description = card.querySelector("p")?.textContent.trim() || "";
    
            return {
                title,
                category,
                description,
                href: link?.getAttribute("href") || "",
    
                // Precomputed search fields
                searchTitle: normalize(title),
                searchCategory: normalize(category),
                searchDescription: normalize(description)
            };
        })
        .filter(article => article.title && article.href);

    function findArticles(query) {
        const words = normalize(query.trim())
            .split(/\s+/)
            .filter(Boolean);
    
        if (words.length === 0) {
            return articles;
        }
    
        return articles
            .map(article => {
                const title = article.searchTitle;
                const category = article.searchCategory;
                const description = article.searchDescription;
    
                let score = 0;
    
                for (const word of words) {
                    const inTitle = title.includes(word);
                    const inCategory = category.includes(word);
                    const inDescription = description.includes(word);
    
                    // Every word must match at least one field.
                    if (!inTitle && !inCategory && !inDescription) {
                        return null;
                    }
    
                    if (inTitle) score += 8;
                    if (inCategory) score += 4;
                    if (inDescription) score += 2;
                }
    
                return { ...article, score };
            })
            .filter(Boolean)
            .sort((a, b) => b.score - a.score);
    }

    function renderResults() {
        const query = input.value.trim();
        const matches = findArticles(query);

        results.replaceChildren();

        const visible = matches.slice(0, 8);

        status.textContent = query
            ? `${matches.length} MATCHING ARTICLE${matches.length === 1 ? "" : "S"}`
            : `RECENT ARTICLES · ${articles.length} INDEXED`;

        if (visible.length === 0) {
            const empty = document.createElement("li");

            empty.className = "home-search-empty";
            empty.textContent = "NO RESULTS FOUND :(";

            results.appendChild(empty);
            return;
        }

        for (const article of visible) {

            const item = document.createElement("li");
            item.className = "home-search-result";

            const link = document.createElement("a");
            link.href = article.href;

            const title = document.createElement("span");
            title.className = "home-search-result-title";
            title.textContent = article.title;

            const category = document.createElement("span");
            category.className = "home-search-result-category";
            category.textContent = article.category;

            const description = document.createElement("span");
            description.className = "home-search-result-description";
            description.textContent = article.description;

            link.append(title, category, description);
            item.appendChild(link);
            results.appendChild(item);
        }
    }

    let selectedIndex = -1;
    
    function selectResult(index) {
        const links = [
            ...results.querySelectorAll(".home-search-result a")
        ];
    
        if (links.length === 0) {
            selectedIndex = -1;
            return;
        }
    
        // Wrap around at the beginning and end.
        selectedIndex = (index + links.length) % links.length;
    
        links.forEach((link, i) => {
            link.classList.toggle("is-selected", i === selectedIndex);
        });
    
        links[selectedIndex].scrollIntoView({
            block: "nearest"
        });
    }

    input.addEventListener("keydown", event => {
        if (event.key === "ArrowDown") {
            event.preventDefault();
            selectResult(selectedIndex + 1);
        }
    
        if (event.key === "ArrowUp") {
            event.preventDefault();
            selectResult(selectedIndex - 1);
        }
    });

    function openSearch() {
        if (dialog.open) return;

        input.value = "";
        renderResults();

        dialog.showModal();
        input.focus({ preventScroll: true });
    }

    function closeSearch() {
        if (dialog.open) {
            dialog.close();
        }
    }

    // Open / close

    trigger.addEventListener("click", openSearch);
    closeButton.addEventListener("click", closeSearch);

    // Instant search while typing.

    input.addEventListener("input", renderResults);

    // Enter opens the first matching article.

    form.addEventListener("submit", event => {
        event.preventDefault();

        const first = results.querySelector("a[href]");

        if (first) {
            window.location.href = first.href;
        }
    });

    // Click outside the window to close.

    dialog.addEventListener("click", event => {
        if (event.target === dialog) {
            closeSearch();
        }
    });

    // Keyboard shortcuts: / and Ctrl+K / Cmd+K

    document.addEventListener("keydown", event => {

        const target = event.target;

        const isTyping =
            target instanceof HTMLElement &&
            (
                target.isContentEditable ||
                ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
            );

        const shortcut =
            event.key === "/" ||
            ((event.ctrlKey || event.metaKey) &&
                event.key.toLowerCase() === "k");

        if (shortcut && !isTyping && !dialog.open) {
            event.preventDefault();
            openSearch();
        }
    });
});


