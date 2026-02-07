const LS_LANG_KEY = "bh_rules_lang";

let _currentLang = "en";
let _currentCategoryKey = null;
let _contentByLang = Object.create(null);
let _overlayReturnFocusEl = null;
let _overlayPanelEl = null;
let _lastLoadFailed = false;

function $(id) {
  return document.getElementById(id);
}

function safeSetText(id, value) {
  const el = $(id);
  if (!el) return;
  el.textContent = value;
}

function setHidden(id, hidden) {
  const el = $(id);
  if (!el) return;
  el.hidden = Boolean(hidden);
}

function showLoadError(lang) {
  _lastLoadFailed = true;
  setHidden("appRoot", true);
  setHidden("loadError", false);

  const isAr = lang === "ar";
  safeSetText("loadErrorTitle", isAr ? "تعذر تحميل القوانين" : "Couldn’t load rules");
  safeSetText(
    "loadErrorDesc",
    isAr ? "تحقق من الاتصال وحاول مرة أخرى." : "Please check your connection and try again."
  );
  safeSetText("loadRetryBtn", isAr ? "إعادة المحاولة" : "Retry");
}

function hideLoadError() {
  _lastLoadFailed = false;
  setHidden("loadError", true);
  setHidden("appRoot", false);
}

function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function badgeClassFromPenalty(penalty) {
  const p = String(penalty).toLowerCase();
  if (p.includes("perma")) return "badge--perma";
  if (p.includes("48")) return "badge--danger";
  if (p.includes("24")) return "badge--warn";
  if (p.includes("warn")) return "badge--mid";
  return "badge--mid";
}

function setView(view) {
  const root = $("appRoot");
  if (!root) return;
  root.dataset.view = view;
}

function setOverlayOpen(open) {
  const overlay = $("tocOverlay");
  if (!overlay) return;

  const tocToggle = $("tocToggle");
  if (tocToggle) tocToggle.setAttribute("aria-expanded", String(Boolean(open)));

  overlay.dataset.open = String(open);
  overlay.setAttribute("aria-hidden", String(!open));

  if (open) {
    document.body.style.overflow = "hidden";
    _overlayReturnFocusEl = document.activeElement;
    const panel = _overlayPanelEl || overlay.querySelector(".tocOverlay__panel");
    _overlayPanelEl = panel;
    queueMicrotask(() => {
      const focusTarget = panel?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      (focusTarget || panel)?.focus?.();
    });
  } else {
    document.body.style.overflow = "";
    const toFocus = _overlayReturnFocusEl;
    _overlayReturnFocusEl = null;
    toFocus?.focus?.();
  }
}

function getContent(lang) {
  return _contentByLang[lang];
}

async function loadContent(lang, options) {
  if (_contentByLang[lang]) return _contentByLang[lang];

  const cacheMode = options?.cache || "default";

  const url = `./content/rules.${lang}.json`;
  try {
    const res = await fetch(url, { cache: cacheMode });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    _contentByLang[lang] = data;
    return data;
  } catch (e) {
    console.error("Failed to load rules JSON", { lang, url, error: e });
    return null;
  }
}

function getFocusableElements(root) {
  if (!root) return [];
  const nodes = root.querySelectorAll(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  return Array.from(nodes).filter(
    (el) => el.offsetParent !== null && !el.hasAttribute("disabled") && el.getAttribute("aria-hidden") !== "true"
  );
}

function handleOverlayKeydown(e) {
  const overlay = $("tocOverlay");
  if (!overlay) return;
  if (overlay.dataset.open !== "true") return;

  if (e.key === "Escape") {
    e.preventDefault();
    setOverlayOpen(false);
    return;
  }

  if (e.key !== "Tab") return;
  const panel = _overlayPanelEl || overlay.querySelector(".tocOverlay__panel");
  if (!panel) return;
  const focusables = getFocusableElements(panel);
  if (focusables.length === 0) {
    e.preventDefault();
    panel.focus?.();
    return;
  }

  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  const active = document.activeElement;

  if (e.shiftKey) {
    if (active === first || active === panel) {
      e.preventDefault();
      last.focus();
    }
  } else {
    if (active === last) {
      e.preventDefault();
      first.focus();
    }
  }
}

function buildCategoryPickerLinks(t, isAr, container) {
  container.innerHTML = "";

  for (const item of t.toc) {
    const a = document.createElement("a");
    a.className = "toc__item";
    a.href = `#${slugify(item.key)}`;

    const left = document.createElement("div");
    left.className = "toc__label";
    left.textContent = item.label;

    const right = document.createElement("div");
    right.className = "toc__chev";
    right.textContent = isAr ? "←" : "→";

    a.appendChild(left);
    a.appendChild(right);

    a.addEventListener("click", (e) => {
      e.preventDefault();
      openCategory(item.key, true);
      setOverlayOpen(false);
    });

    container.appendChild(a);
  }
}

function openCategory(key, pushHash) {
  _currentCategoryKey = key;
  setView("detail");
  renderDetail(_currentLang);

  if ($("appRoot")) {
    renderCategories(_currentLang);
  }

  if (pushHash) {
    window.location.hash = `#${slugify(key)}`;
  }

  const title = $("detailTitle");
  if (title) title.focus?.();
}

function closeCategory() {
  _currentCategoryKey = null;
  setView("list");

  if (window.location.hash) {
    history.replaceState(null, "", window.location.pathname + window.location.search);
  }
}

function renderShell(lang) {
  _currentLang = lang;
  const t = getContent(lang);
  if (!t) return;
  const isAr = lang === "ar";

  document.documentElement.lang = lang;
  document.documentElement.dir = isAr ? "rtl" : "ltr";
  document.body.setAttribute("lang", lang);

  safeSetText("brandSubtitle", t.topSubtitle);
  safeSetText("pageTitle", t.title);
  safeSetText("pageSubtitle", t.subtitle);
  safeSetText("pageDesc", t.desc);

  const isHome = !$("appRoot");
  if (isHome) {
    if (lang === "ar") {
      safeSetText("brandSubtitle", "بوابة القوانين");
      safeSetText("pageTitle", "Brotherhood RP — بوابة القوانين");
      safeSetText("pageSubtitle", "حيث يبدأ الرول بلاي الجاد.");
      safeSetText(
        "pageDesc",
        "اعثر على كل ما تحتاج معرفته قبل دخول المدينة. قوانيننا مصممة للحفاظ على تجربة عادلة، واقعية، وممتعة للجميع — سواء كنت لاعبًا جديدًا أو من سكان المدينة القدامى. تصفّح الأقسام عبر الزر بالأسفل وخذ لحظة لفهم المعايير المتوقعة داخل السيرفر. احترام القوانين يحمي تقدمك وسمعتك والمجتمع. مخالفة القوانين قد تؤدي إلى تحذيرات، إيقافات مؤقتة، أو باند دائم."
      );
      const btn = $("homeBtn");
      if (btn) btn.textContent = "الدخول إلى الأقسام";
    } else {
      safeSetText("brandSubtitle", "Rules Portal");
      safeSetText("pageTitle", "Brotherhood RP — Rules Portal");
      safeSetText("pageSubtitle", "Where serious roleplay begins.");
      safeSetText(
        "pageDesc",
        "Find everything you need to know before stepping into the city. Our rules are designed to keep the experience fair, immersive, and enjoyable for everyone — whether you’re a new arrival or a long-time citizen. Browse the categories using the button below and take a moment to understand the standards expected on the server. Respecting the rules protects your progress, your reputation, and the community.\n\nFailure to follow them can result in warnings, temporary suspensions, or permanent bans."
      );
      const btn = $("homeBtn");
      if (btn) btn.textContent = "Open Categories";
    }
  }

  const categoriesTitle = $("categoriesTitle");
  if (categoriesTitle) categoriesTitle.textContent = isAr ? "الأقسام" : "Categories";

  const categoriesSubtitle = $("categoriesSubtitle");
  if (categoriesSubtitle) {
    categoriesSubtitle.textContent = isAr ? "اختر قسمًا لعرض القوانين الخاصة به." : "Choose a category to view its rules.";
  }

  const tocOverlayTitle = $("tocOverlayTitle");
  if (tocOverlayTitle) tocOverlayTitle.textContent = isAr ? "الأقسام" : "Categories";

  const tocToggle = $("tocToggle");
  if (tocToggle) tocToggle.textContent = isAr ? "الأقسام" : "Categories";

  const tocClose = $("tocClose");
  if (tocClose) tocClose.textContent = isAr ? "إغلاق" : "Close";

  const backBtn = $("backBtn");
  if (backBtn) backBtn.textContent = isAr ? "رجوع" : "Back";

  const nextBtn = $("nextCatBtn");
  if (nextBtn) {
    const arrow = isAr ? "←" : "→";
    nextBtn.textContent = isAr ? `التالي ${arrow}` : `Next ${arrow}`;
  }

  const langEnBtn = $("langEn");
  const langArBtn = $("langAr");
  if (langEnBtn) langEnBtn.setAttribute("aria-pressed", String(!isAr));
  if (langArBtn) langArBtn.setAttribute("aria-pressed", String(isAr));

  const tocGridMobile = $("tocGridMobile");
  if (tocGridMobile) buildCategoryPickerLinks(t, isAr, tocGridMobile);
}

function getNextCategoryKey(lang, currentKey) {
  const t = getContent(lang);
  const keys = t.toc.map((x) => x.key);
  const idx = keys.indexOf(currentKey);
  if (idx === -1) return keys[0] || null;
  return keys[(idx + 1) % keys.length];
}

function renderCategories(lang) {
  const t = getContent(lang);
  const grid = $("categoriesGrid");
  if (!grid) return;
  grid.innerHTML = "";

  for (const item of t.toc) {
    const s = t.sections[item.key];
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "catCard";
    if (_currentCategoryKey === item.key) btn.classList.add("catCard--active");

    const title = document.createElement("h3");
    title.className = "catCard__title";
    title.textContent = item.label;

    const desc = document.createElement("div");
    desc.className = "catCard__desc";
    desc.textContent = s?.hint || "";

    const arrow = document.createElement("div");
    arrow.className = "catCard__arrow";
    arrow.textContent = document.documentElement.dir === "rtl" ? "←" : "→";

    btn.appendChild(arrow);
    btn.appendChild(title);
    btn.appendChild(desc);

    btn.addEventListener("click", () => openCategory(item.key, true));
    grid.appendChild(btn);
  }
}

function renderDetail(lang) {
  const t = getContent(lang);
  const key = _currentCategoryKey;
  const body = $("detailBody");
  if (!body) return;

  if (!key || !t.sections[key]) {
    body.innerHTML = "";
    return;
  }

  const s = t.sections[key];
  safeSetText("detailTitle", s.title);
  safeSetText("detailHint", s.hint || "");

  body.innerHTML = "";

  if (s.cards && Array.isArray(s.cards)) {
    body.appendChild(renderRulesList(s.cards));
  }

  if (s.warning) {
    body.appendChild(renderWarning(s.warning));
  }

  if (s.generalCard) {
    body.appendChild(renderRulesList([s.generalCard]));
  }

  if (s.table) {
    body.appendChild(renderTable(s.table));
  }

  if (s.list) {
    body.appendChild(renderList(s.list));
  }

  if (s.zones) {
    body.appendChild(renderZones(s.zones));
  }
}

function renderRulesList(items) {
  const wrap = document.createElement("div");
  wrap.className = "rulesList";

  for (const it of items) {
    const row = document.createElement("div");
    row.className = "ruleItem";

    const head = document.createElement("div");
    head.className = "ruleItem__head";

    const title = document.createElement("div");
    title.className = "ruleItem__title";
    title.textContent = it.title;

    const badge = document.createElement("span");
    badge.className = `badge ${badgeClassFromPenalty(it.penalty)}`;
    badge.textContent = it.penalty;

    head.appendChild(title);
    head.appendChild(badge);

    const desc = document.createElement("div");
    desc.className = "ruleItem__desc";
    desc.textContent = it.desc || "";

    row.appendChild(head);
    if (it.desc) row.appendChild(desc);

    wrap.appendChild(row);
  }

  return wrap;
}

function render(lang) {
  renderShell(lang);

  const hasApp = Boolean($("appRoot"));
  if (!hasApp) return;

  renderCategories(lang);

  if (_currentCategoryKey) {
    setView("detail");
    renderDetail(lang);
  } else {
    setView("list");
  }
}

function retryLoad(lang, opts) {
  const effective = lang === "ar" ? "ar" : "en";
  setHidden("loadRetryBtn", true);

  if (opts?.fresh) {
    delete _contentByLang[effective];
  }

  loadContent(effective, { cache: opts?.fresh ? "reload" : "default" }).then((t) => {
    setHidden("loadRetryBtn", false);
    if (!t) {
      showLoadError(effective);
      return;
    }
    hideLoadError();
    render(effective);
  });
}

function getLangFromUrl() {
  try {
    const u = new URL(window.location.href);
    const raw = (u.searchParams.get("lang") || "").toLowerCase();
    if (raw === "ar") return "ar";
    if (raw === "en") return "en";
    return null;
  } catch {
    return null;
  }
}

function setLangQueryParam(lang) {
  try {
    const u = new URL(window.location.href);
    u.searchParams.set("lang", lang);
    history.replaceState(null, "", u.toString());
  } catch {
    // ignore
  }
}

function renderWarning(w) {
  const box = document.createElement("div");
  box.className = "warning";

  const t = document.createElement("p");
  t.className = "warning__title";
  t.textContent = w.title;

  const d = document.createElement("p");
  d.className = "warning__desc";
  d.textContent = w.desc;

  box.appendChild(t);
  box.appendChild(d);
  return box;
}

function renderTable(table) {
  const wrap = document.createElement("div");
  wrap.className = "tableWrap";

  const el = document.createElement("table");
  el.className = "table";

  const thead = document.createElement("thead");
  const trh = document.createElement("tr");
  for (const h of table.headers) {
    const th = document.createElement("th");
    th.textContent = h;
    trh.appendChild(th);
  }
  thead.appendChild(trh);
  el.appendChild(thead);

  const tbody = document.createElement("tbody");
  for (const row of table.rows) {
    const tr = document.createElement("tr");
    for (const cell of row) {
      const td = document.createElement("td");
      td.textContent = cell;
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  el.appendChild(tbody);

  wrap.appendChild(el);
  return wrap;
}

function renderList(items) {
  const ul = document.createElement("ul");
  ul.className = "list";

  for (const it of items) {
    const li = document.createElement("li");
    li.className = "list__item";

    const raw = String(it ?? "");
    if (raw.includes("\n")) {
      const [first, ...rest] = raw.split("\n");
      const title = document.createElement("div");
      title.textContent = first.trim();

      const desc = document.createElement("div");
      const descText = rest.join("\n").trim();
      if (descText) {
        desc.style.whiteSpace = "pre-line";
        if (_currentCategoryKey === "common") {
          desc.textContent = descText
            .split("\n")
            .map((line) => `• ${line}`)
            .join("\n");
        } else {
          desc.textContent = descText;
        }
      } else {
        desc.textContent = "";
      }

      li.appendChild(title);
      if (desc.textContent) li.appendChild(desc);
    } else {
      li.textContent = raw;
    }
    ul.appendChild(li);
  }

  return ul;
}

function renderZones(zones) {
  const grid = document.createElement("div");
  grid.className = "safeZones";

  for (const z of zones) {
    const el = document.createElement("div");
    el.className = "safeZone";

    if (z.img) {
      const img = document.createElement("img");
      img.className = "safeZone__img";
      img.src = z.img;
      img.alt = z.name;
      img.loading = "lazy";
      el.appendChild(img);
    }

    const name = document.createElement("div");
    name.className = "safeZone__name";
    name.textContent = z.name;

    const note = document.createElement("div");
    note.className = "safeZone__note";
    note.textContent = z.note;

    el.appendChild(name);
    el.appendChild(note);
    grid.appendChild(el);
  }

  return grid;
}

function init() {
  const saved = localStorage.getItem(LS_LANG_KEY);
  const urlLang = getLangFromUrl();
  const lang = urlLang || (saved === "ar" ? "ar" : "en");

  localStorage.setItem(LS_LANG_KEY, lang);
  setLangQueryParam(lang);

  setHidden("loadError", true);
  setHidden("appRoot", true);

  loadContent(lang, { cache: "default" }).then((t) => {
    if (!t) {
      showLoadError(lang);
      return;
    }
    hideLoadError();
    render(lang);
  });

  setOverlayOpen(false);

  const tocToggle = $("tocToggle");
  const tocClose = $("tocClose");
  const overlay = $("tocOverlay");
  _overlayPanelEl = overlay ? overlay.querySelector(".tocOverlay__panel") : null;

  if (tocToggle) {
    tocToggle.addEventListener("click", () => {
      const isOpen = overlay && overlay.dataset.open === "true";
      setOverlayOpen(!isOpen);
    });
  }

  if (tocClose) {
    tocClose.addEventListener("click", () => setOverlayOpen(false));
  }

  if (overlay) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) setOverlayOpen(false);
    });
  }

  document.addEventListener("keydown", handleOverlayKeydown);

  const langEn = $("langEn");
  const langAr = $("langAr");
  if (langEn) {
    langEn.addEventListener("click", () => {
      localStorage.setItem(LS_LANG_KEY, "en");
      setLangQueryParam("en");
      retryLoad("en");
    });
  }

  if (langAr) {
    langAr.addEventListener("click", () => {
      localStorage.setItem(LS_LANG_KEY, "ar");
      setLangQueryParam("ar");
      retryLoad("ar");
    });
  }

  const retryBtn = $("loadRetryBtn");
  if (retryBtn) {
    retryBtn.addEventListener("click", () => retryLoad(_currentLang, { fresh: true }));
  }

  const backBtn = $("backBtn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      closeCategory();
      render(_currentLang);
    });
  }

  const nextBtn = $("nextCatBtn");
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (!_currentCategoryKey) return;
      const nextKey = getNextCategoryKey(_currentLang, _currentCategoryKey);
      if (!nextKey) return;
      openCategory(nextKey, true);
      renderCategories(_currentLang);
    });
  }

  window.addEventListener("hashchange", () => {
    if (!$("appRoot")) return;
    const raw = window.location.hash.replace(/^#/, "");
    if (!raw) {
      closeCategory();
      render(_currentLang);
      return;
    }

    const key = String(raw).toLowerCase();
    const t = getContent(_currentLang);
    if (!t) return;
    const valid = Object.keys(t.sections).find((k) => slugify(k) === key);
    if (valid) {
      openCategory(valid, false);
    }
  });

  const initialHash = window.location.hash.replace(/^#/, "");
  if (initialHash && $("appRoot")) {
    const key = String(initialHash).toLowerCase();
    const t = getContent(_currentLang);
    if (!t) return;
    const valid = Object.keys(t.sections).find((k) => slugify(k) === key);
    if (valid) {
      openCategory(valid, false);
    }
  }
}

init();
