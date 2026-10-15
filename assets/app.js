(function () {
  "use strict";

  var ROUTES = {
    home: "tpl-home",
    "api-docs": "tpl-api-docs",
    privacy: "tpl-privacy",
    terms: "tpl-terms",
    contact: "tpl-contact",
    "get-api-key": "tpl-get-api-key"
  };

  var PATH_TO_ROUTE = {
    "/": "home",
    "/documentation": "api-docs",
    "/privacy": "privacy",
    "/terms": "terms",
    "/contact": "contact",
    "/dashboard": "get-api-key"
  };

  var NAV_LABEL = {
    Home: "home",
    "API Docs": "api-docs",
    Privacy: "privacy",
    Terms: "terms",
    Contact: "contact"
  };

  var MOBILE_LABEL = {
    Home: "home",
    Docs: "api-docs",
    API: "get-api-key",
    Email: "get-api-key",
    SMS: "get-api-key",
    Logs: "get-api-key",
    Settings: "get-api-key"
  };

  var SIDEBAR_ANCHOR = {
    "Quickstart Guide": "quickstart",
    Authentication: "authentication",
    "Multi-Action Email Templates": "multi-action-templates",
    "Twilio SMS OTP Gateway": "twilio-sms-gateway",
    "Email Template & {{otp}}": "templates",
    "1. Send Email OTP": "send-otp",
    "2. Send Phone/SMS OTP": "send-sms-otp",
    "3. Verify OTP Endpoint": "verify-otp",
    "Android (Java / HTTP)": "android-java",
    "Android (Kotlin / Retrofit)": "android-kotlin",
    "JavaScript / Fetch (Web)": "javascript-web",
    "cURL / Shell": "curl",
    Python: "python",
    "Flutter / Dart": "flutter",
    "Error Codes": "errors",
    "Rate Limits & Security": "rate-limits"
  };

  var PAGE_TITLE = {
    home: "Stranger OTP - Simple & Fast Email & Phone (SMS) OTP Verification API",
    "api-docs": "API Documentation - Stranger OTP",
    privacy: "Privacy Policy - Stranger OTP",
    terms: "Terms of Service - Stranger OTP",
    contact: "Contact & Help Center - Stranger OTP",
    "get-api-key": "Developer Portal - Stranger OTP"
  };

  var HERO_SNIPPETS = {
    curl: {
      file: "send-otp.sh",
      lang: "bash",
      code: 'curl -X POST "https://strangerotp.ai.studio/api/send-otp" \\\n  -H "Authorization: Bearer stranger_live_YOUR_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d \'{"email": "user@example.com"}\''
    },
    node: {
      file: "send-otp.js",
      lang: "javascript",
      code: 'const response = await fetch("https://strangerotp.ai.studio/api/send-otp", {\n  method: "POST",\n  headers: {\n    "Authorization": "Bearer stranger_live_YOUR_API_KEY",\n    "Content-Type": "application/json",\n  },\n  body: JSON.stringify({ email: "user@example.com", action_type: "signup" }),\n});\n\nconst data = await response.json();\nconsole.log(data.request_id);'
    },
    python: {
      file: "send_otp.py",
      lang: "python",
      code: 'import requests\n\nres = requests.post(\n    "https://strangerotp.ai.studio/api/send-otp",\n    headers={"Authorization": "Bearer stranger_live_YOUR_API_KEY"},\n    json={"email": "user@example.com", "action_type": "signup"},\n)\nprint(res.json())'
    },
    flutter: {
      file: "otp_service.dart",
      lang: "dart",
      code: 'final res = await http.post(\n  Uri.parse(\'https://strangerotp.ai.studio/api/send-otp\'),\n  headers: {\n    \'Authorization\': \'Bearer stranger_live_YOUR_API_KEY\',\n    \'Content-Type\': \'application/json\',\n  },\n  body: jsonEncode({\'email\': email, \'action_type\': \'signup\'}),\n);'
    }
  };

  var view = document.getElementById("view");
  var footer = document.querySelector("footer");
  var currentRoute = "home";
  var spyObserver = null;

  function navBase(btn) {
    var hasIcon = !!btn.querySelector("svg");
    return (
      "px-3 py-1.5 rounded-xl transition-all duration-200 whitespace-nowrap cursor-pointer" +
      (hasIcon ? " flex items-center gap-1.5" : "")
    );
  }

  function setNavActive(route) {
    document.querySelectorAll("header nav button").forEach(function (btn) {
      var label = btn.textContent.trim();
      var target = NAV_LABEL[label];
      if (!target) return;
      if (target === route) {
        btn.className = navBase(btn) + " text-sky-400 font-semibold bg-sky-500/10 border border-sky-500/20 shadow-sm";
      } else {
        btn.className = navBase(btn) + " text-slate-300 hover:text-white hover:bg-slate-800/60";
      }
    });
  }

  function setMobileActive(route) {
    var bar = document.querySelector('[aria-label="Mobile Navigation Bar"]');
    if (!bar) return;
    bar.querySelectorAll("button").forEach(function (btn) {
      var label = btn.getAttribute("aria-label");
      var target = MOBILE_LABEL[label];
      var icon = btn.querySelector("svg");
      if (target === route) {
        btn.className = "flex flex-col items-center justify-center py-1 px-1.5 sm:px-2 rounded-xl transition-all duration-200 min-h-[44px] cursor-pointer flex-1 text-sky-400 font-bold bg-sky-500/15 border border-sky-500/30 shadow-sm";
        if (icon) icon.setAttribute("class", "w-4.5 h-4.5 mb-0.5 transition-transform text-sky-400 scale-110 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]");
      } else {
        btn.className = "flex flex-col items-center justify-center py-1 px-1.5 sm:px-2 rounded-xl transition-all duration-200 min-h-[44px] cursor-pointer flex-1 text-slate-400 hover:text-slate-200 active:bg-slate-800/50";
        if (icon) icon.setAttribute("class", "w-4.5 h-4.5 mb-0.5 transition-transform text-slate-400");
      }
    });
  }

  function findCode(btn) {
    var el = btn;
    for (var i = 0; i < 8 && el; i++) {
      el = el.parentElement;
      if (el && el.querySelector("pre code")) return el.querySelector("pre code");
    }
    return null;
  }

  function flash(btn, text) {
    var original = btn.innerHTML;
    btn.innerHTML = text;
    btn.disabled = true;
    setTimeout(function () {
      btn.innerHTML = original;
      btn.disabled = false;
    }, 1200);
  }

  function wireCopy(root) {
    root.querySelectorAll("button").forEach(function (btn) {
      if (btn.dataset.copyWired) return;
      if (btn.textContent.trim() !== "Copy") return;
      btn.dataset.copyWired = "1";
      btn.addEventListener("click", function () {
        var code = findCode(btn);
        var text = code ? code.textContent : "";
        if (navigator.clipboard && text) {
          try { navigator.clipboard.writeText(text).catch(function () {}); } catch (e) {}
        }
        flash(btn, "Copied!");
      });
    });
  }

  function wireTabs(root) {
    var buttons = root.querySelectorAll("button").length ? root.querySelectorAll("button") : [];
    var tabButtons = [];
    buttons.forEach(function (b) {
      var t = b.textContent.trim();
      if (t === "curl" || t === "node" || t === "python" || t === "flutter") tabButtons.push(b);
    });
    if (tabButtons.length < 2) return;

    var group = [];
    tabButtons.forEach(function (b) {
      if (!b.dataset.tabWired) {
        b.dataset.tabWired = "1";
        b.addEventListener("click", function () {
          activate(tabButtons, b);
          applySnippet(root, b.textContent.trim());
        });
      }
      group.push(b);
    });
    activate(group, group[0]);
    applySnippet(root, group[0].textContent.trim());
  }

  function activate(group, active) {
    group.forEach(function (b) {
      if (b === active) {
        b.className = "btn-elastic px-2.5 sm:px-3 py-1 rounded-lg font-mono text-[11px] transition-all cursor-pointer whitespace-nowrap bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30 shadow-sm";
      } else {
        b.className = "btn-elastic px-2.5 sm:px-3 py-1 rounded-lg font-mono text-[11px] transition-all cursor-pointer whitespace-nowrap text-slate-400 hover:text-white";
      }
    });
  }

  function applySnippet(root, tab) {
    var s = HERO_SNIPPETS[tab];
    if (!s) return;
    var code = root.querySelector("pre code");
    if (code) code.textContent = s.code;
    var fileLabel = root.querySelector(".font-mono.text-slate-400");
    if (fileLabel && /\.(sh|js|py|dart)$/.test(fileLabel.textContent.trim())) {
      fileLabel.textContent = s.file;
    }
    var langTags = root.querySelectorAll("span.uppercase");
    langTags.forEach(function (t) {
      t.textContent = s.lang;
    });
  }

  function wireSidebar(root, route) {
    if (route !== "api-docs") return;
    var aside = root.querySelector("aside");
    if (!aside) return;
    aside.querySelectorAll("button").forEach(function (btn) {
      var label = btn.textContent.trim();
      var id = SIDEBAR_ANCHOR[label];
      if (!id) return;
      btn.addEventListener("click", function () {
        var target = root.querySelector("#" + id);
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
    attachScrollSpy(root, aside);
  }

  function attachScrollSpy(root, aside) {
    if (spyObserver) spyObserver.disconnect();
    var sections = root.querySelectorAll("section[id]");
    if (!sections.length) return;
    spyObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = entry.target.id;
          aside.querySelectorAll("button").forEach(function (btn) {
            var match = SIDEBAR_ANCHOR[btn.textContent.trim()] === id;
            var icon = btn.querySelector("svg");
            if (match) {
              btn.className = "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left bg-sky-500/15 text-sky-400 font-semibold border border-sky-500/30 shadow-sm";
            } else {
              btn.className = "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left text-slate-400 hover:text-slate-200 hover:bg-slate-800/40";
            }
            if (icon) icon.classList.toggle("text-sky-400", match);
          });
        });
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );
    sections.forEach(function (s) { spyObserver.observe(s); });
  }

  function wireContentActions(root) {
    root.querySelectorAll("button, a").forEach(function (el) {
      if (el.dataset.actWired) return;
      var text = el.textContent.trim();
      if (text === "Get Started / API Keys") {
        el.dataset.actWired = "1";
        el.addEventListener("click", function () { navigate("get-api-key"); });
      } else if (text === "View API Docs") {
        el.dataset.actWired = "1";
        el.addEventListener("click", function () { navigate("api-docs"); });
      }
    });
  }

  function navigate(route, anchor) {
    if (!ROUTES[route]) route = "home";
    var tpl = document.getElementById(ROUTES[route]);
    if (!tpl) route = "home", (tpl = document.getElementById(ROUTES.home));

    if (spyObserver) { spyObserver.disconnect(); spyObserver = null; }

    view.innerHTML = "";
    view.appendChild(tpl.content.cloneNode(true));

    currentRoute = route;
    document.title = PAGE_TITLE[route] || PAGE_TITLE.home;
    setNavActive(route);
    setMobileActive(route);
    if (footer) footer.style.display = route === "get-api-key" ? "none" : "";

    wireCopy(view);
    wireTabs(view);
    wireSidebar(view, route);
    wireContentActions(view);

    if (anchor) {
      var target = view.querySelector("#" + anchor);
      if (target) {
        setTimeout(function () { target.scrollIntoView({ behavior: "smooth", block: "start" }); }, 60);
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function wireStatic() {
    document.querySelectorAll("header nav button").forEach(function (btn) {
      var target = NAV_LABEL[btn.textContent.trim()];
      if (target) btn.addEventListener("click", function () { navigate(target); });
    });

    document.querySelectorAll("header button").forEach(function (btn) {
      if (btn.textContent.trim().indexOf("Get API Key") !== -1) {
        btn.addEventListener("click", function () { navigate("get-api-key"); });
      }
    });

    var brand = document.querySelector("header .group");
    if (brand) {
      brand.style.cursor = "pointer";
      brand.addEventListener("click", function () { navigate("home"); });
    }

    document.querySelectorAll("footer a[href^='/']").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        var href = a.getAttribute("href");
        var parts = href.split("#");
        var path = parts[0];
        var hash = parts[1];
        var route = PATH_TO_ROUTE[path] || "home";
        navigate(route, hash);
      });
    });

    var bar = document.querySelector('[aria-label="Mobile Navigation Bar"]');
    if (bar) {
      bar.querySelectorAll("button").forEach(function (btn) {
        var target = MOBILE_LABEL[btn.getAttribute("aria-label")];
        if (target) btn.addEventListener("click", function () { navigate(target); });
      });
    }
  }

  function wireMobileMenu() {
    var toggle = document.querySelector("header button[aria-label='Toggle Navigation Menu']");
    var nav = document.querySelector("header nav");
    if (!toggle || !nav) return;
    var panel = document.createElement("div");
    panel.className = "md:hidden hidden border-t border-slate-800/80 bg-[#070b12]/98 backdrop-blur-xl";
    panel.innerHTML = nav.innerHTML;
    nav.parentElement.parentElement.parentElement.appendChild(panel);
    panel.querySelectorAll("button").forEach(function (btn) {
      var target = NAV_LABEL[btn.textContent.trim()];
      if (target) btn.addEventListener("click", function () {
        navigate(target);
        panel.classList.add("hidden");
      });
    });
    toggle.addEventListener("click", function () { panel.classList.toggle("hidden"); });
  }

  function boot() {
    wireStatic();
    wireMobileMenu();
    navigate("home");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
