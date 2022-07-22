// ==UserScript==
// @name Block YouTube Ads in Safari on iPhone/iPad
// @name:ru Заблокируйте рекламу на YouTube в Safari на iPhone/iPad
// @namespace    adguard
// @version      0.0.3
// @description This is a very simple userscript that blocks YouTube ads on iPhone/iPad.
// @description:ru Это простой юзерскрипт, который блокирует рекламу на YouTube на iPhone/iPad.
// @homepageURL  https://adguard.com/
// @author       AdGuard
// @match        *://*/*
// @run-at       document-start
// ==/UserScript==

(() => {
  // src/run-block-youtube.js
  function runBlockYoutube() {
    const locales = {
      en: {
        logo: "with&nbsp;AdGuard",
        alreadyExecuted: "The shortcut has already been executed.",
        wrongDomain: "This shortcut is supposed to be launched only on YouTube.",
        success: "YouTube is now ad-free! Please note that you need to run this shortcut again if you reload the page."
      },
      ru: {
        logo: "с&nbsp;AdGuard",
        alreadyExecuted: "Быстрая команда уже выполнена.",
        wrongDomain: "Эта быстрая команда предназначена для использования только на YouTube.",
        success: "Теперь YouTube без рекламы! Важно: при перезагрузке страницы вам нужно будет заново запустить команду."
      },
      es: {
        logo: "con&nbsp;AdGuard",
        alreadyExecuted: "El atajo ya ha sido ejecutado.",
        wrongDomain: "Se supone que este atajo se lanza sólo en YouTube.",
        success: "¡YouTube está ahora libre de anuncios! Ten en cuenta que tienes que volver a ejecutar este atajo si recargas la página."
      },
      de: {
        logo: "mit&nbsp;AdGuard",
        alreadyExecuted: "Der Kurzbefehl wurde bereits ausgeführt.",
        wrongDomain: "Dieser Kurzbefehl soll nur auf YouTube gestartet werden.",
        success: "YouTube ist jetzt werbefrei! Bitte beachten Sie, dass Sie diesen Kurzbefehl erneut ausführen müssen, wenn Sie die Seite neu laden."
      },
      fr: {
        logo: "avec&nbsp;AdGuard",
        alreadyExecuted: "Le raccourci a déjà été exécuté.",
        wrongDomain: "Ce raccourci est censé d’être lancé uniquement sur YouTube.",
        success: "YouTube est maintenant libre de pub ! Veuillez noter qu’il faudra rééxecuter le raccourci si vous rechargez la page."
      },
      it: {
        logo: "con&nbsp;AdGuard",
        alreadyExecuted: "Il comando è già stato eseguito.",
        wrongDomain: "Questa scorciatoia dovrebbe essere lanciata solo su YouTube.",
        success: "YouTube è ora libero da pubblicità! Si prega di notare che è necessario eseguire nuovamente questa scorciatoia se ricarichi la pagina."
      },
      "zh-cn": {
        logo: "使用&nbsp;AdGuard",
        alreadyExecuted: "快捷指令已在运行",
        wrongDomain: "快捷指令只能在 YouTube 上被启动。",
        success: "现在您的 YouTube 没有广告！请注意，若您重新加载页面，您需要再次启动快捷指令。"
      },
      "zh-tw": {
        logo: "偕同&nbsp;AdGuard",
        alreadyExecuted: "此捷徑已被執行。",
        wrongDomain: "此捷徑應該只於 YouTube 上被啟動。",
        success: "現在 YouTube 為無廣告的！請注意，若您重新載入該頁面，您需要再次執行此捷徑。"
      },
      ko: {
        logo: "AdGuard&nbsp;사용",
        alreadyExecuted: "단축어가 이미 실행되었습니다.",
        wrongDomain: "이 단축어는 YouTube에서만 사용 가능합니다.",
        success: "이제 광고없이 YouTube를 시청할 수 있습니다. 페이지를 새로고침 할 경우, 이 단축어를 다시 실행해야 합니다."
      },
      ja: {
        logo: "AdGuard作動中",
        alreadyExecuted: "ショートカットは既に実行されています。",
        wrongDomain: "※このショートカットは、YouTubeでのみ適用されることを想定しています。",
        success: "YouTubeが広告なしになりました！※YouTubeページを再読み込みした場合は、このショートカットを再度実行する必要がありますのでご注意ください。"
      },
      uk: {
        logo: "з&nbsp;AdGuard",
        alreadyExecuted: "Ця швидка команда вже виконується.",
        wrongDomain: "Цю швидку команду слід запускати лише на YouTube.",
        success: "Тепер YouTube без реклами! Проте після перезавантаження сторінки необхідно знову запустити цю швидку команду."
      }
    };
    const getMessage = (key) => {
      try {
        let locale = locales[navigator.language.toLowerCase()];
        if (!locale) {
          const lang = navigator.language.split("-")[0];
          locale = locales[lang];
        }
        if (!locale) {
          locale = locales.en;
        }
        return locale[key];
      } catch (ex) {
        return locales.en[key];
      }
    };
    if (document.getElementById("block-youtube-ads-logo")) {
      return {
        success: false,
        status: "alreadyExecuted",
        message: getMessage("alreadyExecuted")
      };
    }
    const allowedHostnames = [
      "www.youtube.com",
      "m.youtube.com",
      "music.youtube.com",
      "www.youtube-nocookie.com"
    ];
    if (!allowedHostnames.includes(window.location.hostname)) {
      return {
        success: false,
        status: "wrongDomain",
        message: getMessage("wrongDomain")
      };
    }
    const pageScript = () => {
      const LOGO_ID = "block-youtube-ads-logo";
      const hiddenCSS = {
        "www.youtube.com": [
          "#__ffYoutube1",
          "#__ffYoutube2",
          "#__ffYoutube3",
          "#__ffYoutube4",
          "#feed-pyv-container",
          "#feedmodule-PRO",
          "#homepage-chrome-side-promo",
          "#merch-shelf",
          "#offer-module",
          '#pla-shelf > ytd-pla-shelf-renderer[class="style-scope ytd-watch"]',
          "#pla-shelf",
          "#premium-yva",
          "#promo-info",
          "#promo-list",
          "#promotion-shelf",
          "#related > ytd-watch-next-secondary-results-renderer > #items > ytd-compact-promoted-video-renderer.ytd-watch-next-secondary-results-renderer",
          "#search-pva",
          "#shelf-pyv-container",
          "#video-masthead",
          "#watch-branded-actions",
          "#watch-buy-urls",
          "#watch-channel-brand-div",
          "#watch7-branded-banner",
          "#YtKevlarVisibilityIdentifier",
          "#YtSparklesVisibilityIdentifier",
          ".carousel-offer-url-container",
          ".companion-ad-container",
          ".GoogleActiveViewElement",
          '.list-view[style="margin: 7px 0pt;"]',
          ".promoted-sparkles-text-search-root-container",
          ".promoted-videos",
          ".searchView.list-view",
          ".sparkles-light-cta",
          ".watch-extra-info-column",
          ".watch-extra-info-right",
          ".ytd-carousel-ad-renderer",
          ".ytd-compact-promoted-video-renderer",
          ".ytd-companion-slot-renderer",
          ".ytd-merch-shelf-renderer",
          ".ytd-player-legacy-desktop-watch-ads-renderer",
          ".ytd-promoted-sparkles-text-search-renderer",
          ".ytd-promoted-video-renderer",
          ".ytd-search-pyv-renderer",
          ".ytd-video-masthead-ad-v3-renderer",
          ".ytp-ad-action-interstitial-background-container",
          ".ytp-ad-action-interstitial-slot",
          ".ytp-ad-image-overlay",
          ".ytp-ad-overlay-container",
          ".ytp-ad-progress",
          ".ytp-ad-progress-list",
          '[class*="ytd-display-ad-"]',
          '[layout*="display-ad-"]',
          'a[href^="http://www.youtube.com/cthru?"]',
          'a[href^="https://www.youtube.com/cthru?"]',
          "ytd-action-companion-ad-renderer",
          "ytd-banner-promo-renderer",
          "ytd-compact-promoted-video-renderer",
          "ytd-companion-slot-renderer",
          "ytd-display-ad-renderer",
          "ytd-promoted-sparkles-text-search-renderer",
          "ytd-promoted-sparkles-web-renderer",
          "ytd-search-pyv-renderer",
          "ytd-single-option-survey-renderer",
          "ytd-video-masthead-ad-advertiser-info-renderer",
          "ytd-video-masthead-ad-v3-renderer",
          "YTM-PROMOTED-VIDEO-RENDERER"
        ],
        "m.youtube.com": [
          ".companion-ad-container",
          ".ytp-ad-action-interstitial",
          '.ytp-cued-thumbnail-overlay > div[style*="/sddefault.jpg"]',
          `a[href^="/watch?v="][onclick^="return koya.onEvent(arguments[0]||window.event,'"]:not([role]):not([class]):not([id])`,
          `a[onclick*='"ping_url":"http://www.google.com/aclk?']`,
          "ytm-companion-ad-renderer",
          "ytm-companion-slot",
          "ytm-promoted-sparkles-text-search-renderer",
          "ytm-promoted-sparkles-web-renderer",
          "ytm-promoted-video-renderer"
        ]
      };
      const hideElements = (hostname) => {
        const selectors = hiddenCSS[hostname];
        if (!selectors) {
          return;
        }
        const rule = `${selectors.join(", ")} { display: none!important; }`;
        const style = document.createElement("style");
        style.innerHTML = rule;
        document.head.appendChild(style);
      };
      const observeDomChanges = (callback) => {
        const domMutationObserver = new MutationObserver((mutations) => {
          callback(mutations);
        });
        domMutationObserver.observe(document.documentElement, {
          childList: true,
          subtree: true
        });
      };
      const hideDynamicAds = () => {
        const elements = document.querySelectorAll("#contents > ytd-rich-item-renderer ytd-display-ad-renderer");
        if (elements.length === 0) {
          return;
        }
        elements.forEach((el) => {
          if (el.parentNode && el.parentNode.parentNode) {
            const parent = el.parentNode.parentNode;
            if (parent.localName === "ytd-rich-item-renderer") {
              parent.style.display = "none";
            }
          }
        });
      };
      const autoSkipAds = () => {
        if (document.querySelector(".ad-showing")) {
          const video = document.querySelector("video");
          if (video && video.duration) {
            video.currentTime = video.duration;
            setTimeout(() => {
              const skipBtn = document.querySelector("button.ytp-ad-skip-button");
              if (skipBtn) {
                skipBtn.click();
              }
            }, 100);
          }
        }
      };
      const overrideObject = (obj, propertyName, overrideValue) => {
        if (!obj) {
          return false;
        }
        let overriden = false;
        for (const key in obj) {
          if (obj.hasOwnProperty(key) && key === propertyName) {
            obj[key] = overrideValue;
            overriden = true;
          } else if (obj.hasOwnProperty(key) && typeof obj[key] === "object") {
            if (overrideObject(obj[key], propertyName, overrideValue)) {
              overriden = true;
            }
          }
        }
        if (overriden) {
          console.log(`found: ${propertyName}`);
        }
        return overriden;
      };
      const jsonOverride = (propertyName, overrideValue) => {
        const nativeJSONParse = JSON.parse;
        JSON.parse = (...args) => {
          const obj = nativeJSONParse.apply(this, args);
          overrideObject(obj, propertyName, overrideValue);
          return obj;
        };
        const nativeResponseJson = Response.prototype.json;
        Response.prototype.json = new Proxy(nativeResponseJson, {
          apply(...args) {
            const promise = Reflect.apply(args);
            return new Promise((resolve, reject) => {
              promise.then((data) => {
                overrideObject(data, propertyName, overrideValue);
                resolve(data);
              }).catch((error) => reject(error));
            });
          }
        });
      };
      const addAdGuardLogoStyle = () => {
        const id = "block-youtube-ads-logo-style";
        if (document.getElementById(id)) {
          return;
        }
        const style = document.createElement("style");
        style.innerHTML = `[data-mode="watch"] #${LOGO_ID} { color: #fff; }
[data-mode="searching"] #${LOGO_ID}, [data-mode="search"] #${LOGO_ID} { display: none; }
#${LOGO_ID} { white-space: nowrap; }
.mobile-topbar-header-sign-in-button { display: none; }
.ytmusic-nav-bar#left-content #${LOGO_ID} { display: block; }`;
        document.head.appendChild(style);
      };
      const addAdGuardLogo = () => {
        if (document.getElementById(LOGO_ID)) {
          return;
        }
        const logo = document.createElement("span");
        logo.innerHTML = "__logo_text__";
        logo.setAttribute("id", LOGO_ID);
        if (window.location.hostname === "m.youtube.com") {
          const btn = document.querySelector("header.mobile-topbar-header > button");
          if (btn) {
            btn.parentNode.insertBefore(logo, btn.nextSibling);
            addAdGuardLogoStyle();
          }
        } else if (window.location.hostname === "www.youtube.com") {
          const code = document.getElementById("country-code");
          if (code) {
            code.innerHTML = "";
            code.appendChild(logo);
            addAdGuardLogoStyle();
          }
        } else if (window.location.hostname === "music.youtube.com") {
          const el = document.querySelector(".ytmusic-nav-bar#left-content");
          if (el) {
            el.appendChild(logo);
            addAdGuardLogoStyle();
          }
        } else if (window.location.hostname === "www.youtube-nocookie.com") {
          const code = document.querySelector("#yt-masthead #logo-container .content-region");
          if (code) {
            code.innerHTML = "";
            code.appendChild(logo);
            addAdGuardLogoStyle();
          }
        }
      };
      jsonOverride("adPlacements", []);
      jsonOverride("playerAds", []);
      hideElements(window.location.hostname);
      addAdGuardLogo();
      hideDynamicAds();
      autoSkipAds();
      observeDomChanges(() => {
        addAdGuardLogo();
        hideDynamicAds();
        autoSkipAds();
      });
    };
    const script = document.createElement("script");
    const scriptText = pageScript.toString().replace("__logo_text__", getMessage("logo"));
    script.innerHTML = `(${scriptText})();`;
    document.head.appendChild(script);
    document.head.removeChild(script);
    return {
      success: true,
      status: "success",
      message: getMessage("success")
    };
  }

  // src/userscript.js
  var userscript = () => {
    runBlockYoutube();
  };
  userscript();
})();
