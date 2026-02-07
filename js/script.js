const LS_LANG_KEY = "bh_rules_lang";

let _currentLang = "en";
let _currentCategoryKey = null;

function $(id) {
  return document.getElementById(id);
}

function safeSetText(id, value) {
  const el = $(id);
  if (!el) return;
  el.textContent = value;
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

  overlay.dataset.open = String(open);
  overlay.setAttribute("aria-hidden", String(!open));

  if (open) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
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

const CONTENT = {
  en: {
    topSubtitle: "Official Rules",
    title: "Brotherhood RP – Official Rules",
    subtitle: "Respect the RP. Create the Story.",
    desc: "By joining the server, you agree to follow all rules listed below.",
    agreeText: "",
    agreeBtn: "",
    toastTitle: "",
    toastDesc: "",
    toc: [
      { key: "core", label: "Core Roleplay Rules" },
      { key: "combat", label: "Combat & Action Rules" },
      { key: "robbery", label: "Robbery / Heist Rules" },
      { key: "gang", label: "Gang Rules" },
      { key: "safe", label: "Safe Zones" },
      { key: "death", label: "Death RP" },
      { key: "toxicity", label: "Toxicity / Respect" },
      { key: "common", label: "Common Rules" }
    ],
    sections: {
      core: {
        title: "Core Roleplay Rules",
        hint: "Click a card to expand.",
        cards: [
          {
            title: "High RP / NVL",
            penalty: "24H Ban",
            desc: "Always value your life. Don’t do unrealistic actions that break immersion. Keep roleplay serious and consistent."
          },
          {
            title: "Force RP / Meta",
            penalty: "24H Ban",
            desc: "No forcing outcomes without allowing roleplay. No using out-of-character info to affect in-character decisions."
          },
          {
            title: "Free Kill / Car Kill",
            penalty: "48H Ban",
            desc: "No killing without a valid RP reason. No running people over to finish fights or avoid consequences."
          }
        ]
      },
      combat: {
        title: "Combat & Action Rules",
        hint: "Most bans happen here.",
        cards: [
          {
            title: "Cop Bait / Interference",
            penalty: "24H Ban",
            desc: "Don’t intentionally provoke police without RP context. Don’t interfere in scenes without a valid RP reason."
          },
          {
            title: "Combat Log / ALT+F4",
            penalty: "48H Ban",
            desc: "Disconnecting to avoid RP consequences is strictly prohibited. If you crash, report it immediately."
          },
          {
            title: "Glitch / Cheat",
            penalty: "PERMA",
            desc: "Exploits, cheats, macro abuse, or bug advantages are zero tolerance."
          }
        ],
        warning: {
          title: "Warning",
          desc: "This section is enforced strictly. Record clips whenever possible."
        }
      },
      robbery: {
        title: "Robbery / Heist Rules",
        hint: "Follow schedules and limits.",
        generalCard: {
          title: "General Robbery Rules",
          penalty: "48H Ban",
          desc: "Follow staff instructions, respect hostage rules, and do not exploit mechanics."
        },
        table: {
          headers: ["Heist", "Min", "Max", "Vehicles", "Hostages", "Days"],
          rows: [
            ["Store Robbery", "2", "3", "1", "0", "All Days"],
            ["Fleeca Bank", "3", "4", "1", "1", "Tue–Fri"],
            ["Jewelry Store", "3", "4", "1", "1", "Friday"],
            ["Paleto Bank", "4", "5", "2", "2", "Saturday"],
            ["Pacific Bank", "4", "5", "2", "2", "Sunday"]
          ]
        }
      },
      gang: {
        title: "Gang Rules",
        hint: "Territory, leadership, and coordination.",
        list: [
          "Respect territory & leadership",
          "No attacking other gangs without RP reason",
          "No exploits/glitches",
          "Coordination mandatory",
          "Cooldown 20 min"
        ]
      },
      safe: {
        title: "Safe Zones",
        hint: "No provoking/criminal actions in these areas.",
        zones: [
          { name: "Hospital", note: "No criminal/provoking actions → 48H Ban", img: "./assets/hospital_sz.png" },
          { name: "Hotel", note: "No criminal/provoking actions → 48H Ban", img: "./assets/hotel_sz.png" },
          { name: "Fish", note: "No criminal/provoking actions → 48H Ban", img: "./assets/fish_sz.png" },
          { name: "Recycle", note: "No criminal/provoking actions → 48H Ban", img: "./assets/Recycle_sz.jpg" },
          { name: "Meth Lab", note: "No criminal/provoking actions → 48H Ban", img: "./assets/lab1_sz.jpg" },
          { name: "Weed Lab", note: "No criminal/provoking actions → 48H Ban", img: "./assets/lab2_sz.jpg" }
        ]
      },
      death: {
        title: "Death RP",
        hint: "Memory & scenario rules.",
        list: [
          "Don’t return to the same scenario",
          "Forget players causing death, remember context only"
        ]
      },
      toxicity: {
        title: "Toxicity / Respect",
        hint: "Keep it clean.",
        cards: [
          {
            title: "Insults (Discord or RP)",
            penalty: "24H Ban",
            desc: "No insults, harassment, or toxic behavior in or out of RP."
          },
          {
            title: "Parental insult / TRABRIB",
            penalty: "PERMA",
            desc: "Severe slurs and parental insults are zero tolerance."
          },
          {
            title: "Disrespect (players / police / EMS)",
            penalty: "24H Ban",
            desc: "Keep respect toward players and factions."
          }
        ]
      },
      common: {
        title: "Common Rules",
        hint: "General enforcement notes.",
        list: [
          "Police / EMS clothes → only if assigned",
          "Clip required if available",
          "Ignorance of law is not excuse",
          "WIPE PERSON = full character deletion"
        ]
      }
    }
  },
  ar: {
    topSubtitle: "قوانين السيرفر",
    title: "Brotherhood RP – القوانين الرسمية",
    subtitle: "احترم الرول بلاي. اصنع القصة.",
    desc: "الدخول للسيرفر يعني موافقتك على جميع القوانين أدناه.",
    agreeText: "",
    agreeBtn: "",
    toastTitle: "",
    toastDesc: "",
    toc: [
      { key: "core", label: "قوانين الرول بلاي الأساسية" },
      { key: "combat", label: "قوانين القتال والأكشن" },
      { key: "robbery", label: "قوانين السرقة / الهست" },
      { key: "gang", label: "قوانين العصابات" },
      { key: "safe", label: "المناطق الآمنة" },
      { key: "death", label: "قوانين الموت (Death RP)" },
      { key: "toxicity", label: "السمّية / الاحترام" },
      { key: "common", label: "قوانين عامة" }
    ],
    sections: {
      core: {
        title: "قوانين الرول بلاي الأساسية",
        hint: "اضغط على الكارت لعرض التفاصيل.",
        cards: [
          {
            title: "High RP / NVL",
            penalty: "24H Ban",
            desc: "قيّم حياتك دائماً. لا تقم بتصرفات غير واقعية تكسر الإندماج."
          },
          {
            title: "Force RP / Meta",
            penalty: "24H Ban",
            desc: "ممنوع فرض نتيجة بدون إعطاء فرصة للرول بلاي. ممنوع الميتا جيمينغ."
          },
          {
            title: "Free Kill / Car Kill",
            penalty: "48H Ban",
            desc: "ممنوع القتل بدون سبب رول بلاي واضح. ممنوع الدهس كحل سريع."
          }
        ]
      },
      combat: {
        title: "قوانين القتال والأكشن",
        hint: "أغلب الباندات تحصل هنا.",
        cards: [
          {
            title: "Cop Bait / Interference",
            penalty: "24H Ban",
            desc: "ممنوع استفزاز الشرطة بدون سبب رول بلاي. ممنوع التدخل بدون سبب."
          },
          {
            title: "Combat Log / ALT+F4",
            penalty: "48H Ban",
            desc: "الخروج لتفادي العواقب ممنوع. في حال كراش بلّغ فوراً."
          },
          {
            title: "Glitch / Cheat",
            penalty: "PERMA",
            desc: "استخدام قلتش/هاك/استغلال أي ثغرة = صفر تسامح."
          }
        ],
        warning: {
          title: "تنبيه",
          desc: "هذا القسم يُطبق بشكل صارم. صوّر كليب كلما أمكن."
        }
      },
      robbery: {
        title: "قوانين السرقة / الهست",
        hint: "التزم بالجدول والعدد.",
        generalCard: {
          title: "قوانين عامة للسرقات",
          penalty: "48H Ban",
          desc: "التزم بتعليمات الإدارة وقوانين الرهائن ولا تستغل الميكانيك."
        },
        table: {
          headers: ["الهست", "الحد الأدنى", "الحد الأقصى", "المركبات", "الرهائن", "الأيام"],
          rows: [
            ["Store Robbery", "2", "3", "1", "0", "كل الايام"],

            ["Fleeca Bank", "3", "4", "1", "1", "الثلاثاء–الجمعة"],
            ["Jewelry Store", "3", "4", "1", "1", "الجمعة"],
            ["Paleto Bank", "4", "5", "2", "2", "السبت"],
            ["Pacific Bank", "4", "5", "2", "2", "الأحد"]
          ]
        }
      },
      gang: {
        title: "قوانين العصابات",
        hint: "المنطقة، القيادة، والتنسيق.",
        list: [
          "احترام المنطقة والقيادة",
          "ممنوع مهاجمة عصابة بدون سبب رول بلاي",
          "ممنوع الاستغلال/الثغرات",
          "التنسيق إلزامي",
          "كولداون 20 دقيقة"
        ]
      },
      safe: {
        title: "المناطق الآمنة",
        hint: "ممنوع أي تصرف إجرامي/استفزازي.",
        zones: [
          { name: "Hospital", note: "ممنوع أفعال إجرامية/استفزاز → 48H Ban", img: "./assets/hospital_sz.png" },
          { name: "Hotel", note: "ممنوع أفعال إجرامية/استفزاز → 48H Ban", img: "./assets/hotel_sz.png" },
          { name: "منطقة الصيد", note: "ممنوع أفعال إجرامية/استفزاز → 48H Ban", img: "./assets/fish_sz.png" },
          { name: "Recycle", note: "ممنوع أفعال إجرامية/استفزاز → 48H Ban", img: "./assets/Recycle_sz.jpg" },
          { name: "مختبر الميث", note: "ممنوع أفعال إجرامية/استفزاز → 48H Ban", img: "./assets/lab1_sz.jpg" },
          { name: "مختبر الحشيش", note: "ممنوع أفعال إجرامية/استفزاز → 48H Ban", img: "./assets/lab2_sz.jpg" }
        ]
      },
      death: {
        title: "قوانين الموت (Death RP)",
        hint: "الذاكرة والرجوع للمشهد.",
        list: [
          "ممنوع الرجوع لنفس السيناريو",
          "تنسى الأشخاص المسببين للموت وتذكر السياق فقط"
        ]
      },
      toxicity: {
        title: "السمّية / الاحترام",
        hint: "احترام الجميع.",
        cards: [
          {
            title: "السب/الإهانة (ديسكورد أو RP)",
            penalty: "24H Ban",
            desc: "ممنوع الإهانة أو التحرش أو السلوك السام."
          },
          {
            title: "سبّ الوالدين / TRABRIB",
            penalty: "PERMA",
            desc: "الكلام العنصري/سب الوالدين = صفر تسامح."
          },
          {
            title: "عدم احترام (لاعبين/شرطة/إسعاف)",
            penalty: "24H Ban",
            desc: "حافظ على الاحترام داخل وخارج الرول بلاي."
          }
        ]
      },
      common: {
        title: "قوانين عامة",
        hint: "ملاحظات تطبيق القوانين.",
        list: [
          "لبس الشرطة/الإسعاف فقط عند التعيين",
          "الكليب مطلوب إذا متوفر",
          "الجهل بالقانون ليس عذراً",
          "WIPE PERSON = حذف كامل للشخصية"
        ]
      }
    }
  }
};

function renderShell(lang) {
  _currentLang = lang;
  const t = CONTENT[lang];
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
  const t = CONTENT[lang];
  const keys = t.toc.map((x) => x.key);
  const idx = keys.indexOf(currentKey);
  if (idx === -1) return keys[0] || null;
  return keys[(idx + 1) % keys.length];
}

function renderCategories(lang) {
  const t = CONTENT[lang];
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
  const t = CONTENT[lang];
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

function renderCards(cards) {
  const wrap = document.createElement("div");
  wrap.className = "cards";

  for (const c of cards) {
    const card = document.createElement("article");
    card.className = "card";
    card.dataset.open = "false";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "card__btn";
    btn.setAttribute("aria-expanded", "false");

    const title = document.createElement("div");
    title.className = "card__title";
    title.textContent = c.title;

    const meta = document.createElement("div");
    meta.className = "card__meta";

    const badge = document.createElement("span");
    badge.className = `badge ${badgeClassFromPenalty(c.penalty)}`;
    badge.textContent = c.penalty;

    meta.appendChild(badge);

    btn.appendChild(title);
    btn.appendChild(meta);

    const desc = document.createElement("div");
    desc.className = "card__desc";
    desc.textContent = c.desc || "";

    btn.addEventListener("click", () => {
      const next = card.dataset.open !== "true";
      card.dataset.open = String(next);
      btn.setAttribute("aria-expanded", String(next));
    });

    card.appendChild(btn);
    if (c.desc) card.appendChild(desc);

    wrap.appendChild(card);
  }

  return wrap;
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
    li.textContent = it;
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
  const lang = saved === "ar" ? "ar" : "en";
  render(lang);

  setOverlayOpen(false);

  const tocToggle = $("tocToggle");
  const tocClose = $("tocClose");
  const overlay = $("tocOverlay");

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

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOverlayOpen(false);
  });

  const langEn = $("langEn");
  const langAr = $("langAr");
  if (langEn) {
    langEn.addEventListener("click", () => {
      localStorage.setItem(LS_LANG_KEY, "en");
      render("en");
    });
  }

  if (langAr) {
    langAr.addEventListener("click", () => {
      localStorage.setItem(LS_LANG_KEY, "ar");
      render("ar");
    });
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
    const valid = Object.keys(CONTENT[_currentLang].sections).find((k) => slugify(k) === key);
    if (valid) {
      _currentCategoryKey = valid;
      setView("detail");
      renderDetail(_currentLang);
    }
  });

  const initialHash = window.location.hash.replace(/^#/, "");
  if (initialHash && $("appRoot")) {
    const key = String(initialHash).toLowerCase();
    const valid = Object.keys(CONTENT[_currentLang].sections).find((k) => slugify(k) === key);
    if (valid) {
      openCategory(valid, false);
    }
  }
}

init();
