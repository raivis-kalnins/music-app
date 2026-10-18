/* Localised footer independent of the Music 63 app renderer. No tracking or external requests. */
(() => {
  'use strict';
  const footer = document.getElementById('dp-cross-promo');
  if (!footer) return;
  const strings = {
    en: {
      eyebrow: 'DIGITALPULSE · WEB & APP DEVELOPMENT',
      headline: 'Have an idea for a website or an app?',
      description: 'We build fast, beautiful websites, WordPress and WooCommerce solutions, custom web apps and practical AI integrations.',
      webDesign: 'Web design', webApps: 'Web apps', aiSolutions: 'AI solutions',
      cta: "Let's build something", portfolio: 'Explore DigitalPulse',
      otherApps: 'Explore our other apps', credit: 'Developed by',
      nav: 'Explore other applications', promo: 'DigitalPulse and other applications', services: 'Development services'
    },
    lv: {
      eyebrow: 'DIGITALPULSE · MĀJASLAPU UN LIETOTŅU IZSTRĀDE',
      headline: 'Vajadzīga mājaslapa vai jauna lietotne?',
      description: 'Veidojam ātras un skaistas mājaslapas, WordPress un WooCommerce risinājumus, tīmekļa lietotnes un praktiskus mākslīgā intelekta risinājumus.',
      webDesign: 'Mājaslapu dizains', webApps: 'Tīmekļa lietotnes', aiSolutions: 'MI risinājumi',
      cta: 'Īstenosim tavu ideju', portfolio: 'Apskati DigitalPulse',
      otherApps: 'Apskati arī citas mūsu lietotnes', credit: 'Izstrādāja',
      nav: 'Citas lietotnes', promo: 'DigitalPulse un citas lietotnes', services: 'Izstrādes pakalpojumi'
    },
    de: {
      eyebrow: 'DIGITALPULSE · WEB- & APP-ENTWICKLUNG',
      headline: 'Eine Idee für eine Website oder App?',
      description: 'Wir entwickeln schnelle, attraktive Websites, WordPress- und WooCommerce-Lösungen, individuelle Web-Apps und praktische KI-Integrationen.',
      webDesign: 'Webdesign', webApps: 'Web-Apps', aiSolutions: 'KI-Lösungen',
      cta: 'Gemeinsam etwas schaffen', portfolio: 'DigitalPulse entdecken',
      otherApps: 'Weitere Apps entdecken', credit: 'Entwickelt von',
      nav: 'Weitere Anwendungen', promo: 'DigitalPulse und weitere Anwendungen', services: 'Entwicklungsleistungen'
    },
    es: {
      eyebrow: 'DIGITALPULSE · DESARROLLO WEB Y DE APPS',
      headline: '¿Tienes una idea para una web o una app?',
      description: 'Creamos sitios web rápidos y atractivos, soluciones WordPress y WooCommerce, aplicaciones web a medida e integraciones prácticas de IA.',
      webDesign: 'Diseño web', webApps: 'Apps web', aiSolutions: 'Soluciones de IA',
      cta: 'Creemos algo juntos', portfolio: 'Descubre DigitalPulse',
      otherApps: 'Descubre nuestras otras apps', credit: 'Desarrollado por',
      nav: 'Explorar otras aplicaciones', promo: 'DigitalPulse y otras aplicaciones', services: 'Servicios de desarrollo'
    },
    fr: {
      eyebrow: 'DIGITALPULSE · CRÉATION WEB ET APPLICATIONS',
      headline: 'Une idée de site web ou d’application ?',
      description: 'Nous créons des sites rapides et élégants, des solutions WordPress et WooCommerce, des applications web sur mesure et des intégrations IA utiles.',
      webDesign: 'Design web', webApps: 'Applications web', aiSolutions: 'Solutions IA',
      cta: 'Créons ensemble', portfolio: 'Découvrir DigitalPulse',
      otherApps: 'Découvrir nos autres applis', credit: 'Développé par',
      nav: 'Autres applications', promo: 'DigitalPulse et autres applications', services: 'Services de développement'
    },
    pl: {
      eyebrow: 'DIGITALPULSE · STRONY I APLIKACJE',
      headline: 'Masz pomysł na stronę lub aplikację?',
      description: 'Tworzymy szybkie i piękne strony internetowe, rozwiązania WordPress i WooCommerce, aplikacje webowe oraz praktyczne integracje AI.',
      webDesign: 'Projektowanie stron', webApps: 'Aplikacje webowe', aiSolutions: 'Rozwiązania AI',
      cta: 'Zbudujmy coś razem', portfolio: 'Poznaj DigitalPulse',
      otherApps: 'Poznaj nasze inne aplikacje', credit: 'Stworzone przez',
      nav: 'Inne aplikacje', promo: 'DigitalPulse i inne aplikacje', services: 'Usługi programistyczne'
    },
    ru: {
      eyebrow: 'DIGITALPULSE · СОЗДАНИЕ САЙТОВ И ПРИЛОЖЕНИЙ',
      headline: 'Есть идея для сайта или приложения?',
      description: 'Мы создаём быстрые и красивые сайты, решения на WordPress и WooCommerce, веб-приложения и полезные интеграции ИИ.',
      webDesign: 'Веб-дизайн', webApps: 'Веб-приложения', aiSolutions: 'Решения с ИИ',
      cta: 'Давайте создадим вместе', portfolio: 'Посмотреть DigitalPulse',
      otherApps: 'Другие наши приложения', credit: 'Разработано',
      nav: 'Другие приложения', promo: 'DigitalPulse и другие приложения', services: 'Услуги разработки'
    },
    uk: {
      eyebrow: 'DIGITALPULSE · РОЗРОБКА САЙТІВ І ЗАСТОСУНКІВ',
      headline: 'Є ідея для сайту або застосунку?',
      description: 'Створюємо швидкі та красиві сайти, рішення WordPress і WooCommerce, вебзастосунки та практичні інтеграції ШІ.',
      webDesign: 'Вебдизайн', webApps: 'Вебзастосунки', aiSolutions: 'Рішення з ШІ',
      cta: 'Створімо щось разом', portfolio: 'Переглянути DigitalPulse',
      otherApps: 'Інші наші застосунки', credit: 'Розроблено',
      nav: 'Інші застосунки', promo: 'DigitalPulse та інші застосунки', services: 'Послуги розробки'
    },
    lt: {
      eyebrow: 'DIGITALPULSE · SVETAINIŲ IR PROGRAMĖLIŲ KŪRIMAS',
      headline: 'Turite svetainės ar programėlės idėją?',
      description: 'Kuriame greitas ir gražias svetaines, WordPress ir WooCommerce sprendimus, internetines programėles ir naudingas DI integracijas.',
      webDesign: 'Interneto dizainas', webApps: 'Interneto programėlės', aiSolutions: 'DI sprendimai',
      cta: 'Kurkime kartu', portfolio: 'Atraskite DigitalPulse',
      otherApps: 'Kitos mūsų programėlės', credit: 'Sukūrė',
      nav: 'Kitos programėlės', promo: 'DigitalPulse ir kitos programėlės', services: 'Kūrimo paslaugos'
    },
    et: {
      eyebrow: 'DIGITALPULSE · VEEBI JA RAKENDUSTE ARENDUS',
      headline: 'Kas teil on veebilehe või rakenduse idee?',
      description: 'Loome kiireid ja ilusaid veebilehti, WordPressi ja WooCommerce’i lahendusi, veebirakendusi ning praktilisi tehisintellekti integratsioone.',
      webDesign: 'Veebidisain', webApps: 'Veebirakendused', aiSolutions: 'AI-lahendused',
      cta: 'Loome midagi koos', portfolio: 'Avasta DigitalPulse',
      otherApps: 'Avasta meie teised rakendused', credit: 'Arendaja',
      nav: 'Muud rakendused', promo: 'DigitalPulse ja muud rakendused', services: 'Arendusteenused'
    },
    sv: {
      eyebrow: 'DIGITALPULSE · WEBB- OCH APPUTVECKLING',
      headline: 'Har du en idé för en webbplats eller app?',
      description: 'Vi bygger snabba och snygga webbplatser, WordPress- och WooCommerce-lösningar, skräddarsydda webbappar och praktiska AI-integrationer.',
      webDesign: 'Webbdesign', webApps: 'Webbappar', aiSolutions: 'AI-lösningar',
      cta: 'Låt oss bygga något', portfolio: 'Upptäck DigitalPulse',
      otherApps: 'Utforska våra andra appar', credit: 'Utvecklad av',
      nav: 'Andra appar', promo: 'DigitalPulse och andra appar', services: 'Utvecklingstjänster'
    },
    no: {
      eyebrow: 'DIGITALPULSE · NETT- OG APPUTVIKLING',
      headline: 'Har du en idé til en nettside eller app?',
      description: 'Vi lager raske og flotte nettsider, WordPress- og WooCommerce-løsninger, skreddersydde nettapper og praktiske KI-integrasjoner.',
      webDesign: 'Webdesign', webApps: 'Nettapper', aiSolutions: 'KI-løsninger',
      cta: 'La oss skape noe', portfolio: 'Utforsk DigitalPulse',
      otherApps: 'Utforsk våre andre apper', credit: 'Utviklet av',
      nav: 'Andre apper', promo: 'DigitalPulse og andre apper', services: 'Utviklingstjenester'
    },
    da: {
      eyebrow: 'DIGITALPULSE · WEB- OG APPUDVIKLING',
      headline: 'Har du en idé til en hjemmeside eller app?',
      description: 'Vi udvikler hurtige og flotte hjemmesider, WordPress- og WooCommerce-løsninger, skræddersyede webapps og praktiske AI-integrationer.',
      webDesign: 'Webdesign', webApps: 'Webapps', aiSolutions: 'AI-løsninger',
      cta: 'Lad os skabe noget', portfolio: 'Udforsk DigitalPulse',
      otherApps: 'Udforsk vores andre apps', credit: 'Udviklet af',
      nav: 'Andre apps', promo: 'DigitalPulse og andre apps', services: 'Udviklingsydelser'
    },
    fi: {
      eyebrow: 'DIGITALPULSE · VERKKO- JA SOVELLUSKEHITYS',
      headline: 'Onko sinulla verkkosivun tai sovelluksen idea?',
      description: 'Rakennamme nopeita ja näyttäviä verkkosivuja, WordPress- ja WooCommerce-ratkaisuja, räätälöityjä verkkosovelluksia sekä käytännöllisiä tekoälyintegraatioita.',
      webDesign: 'Verkkosuunnittelu', webApps: 'Verkkosovellukset', aiSolutions: 'Tekoälyratkaisut',
      cta: 'Rakennetaan yhdessä', portfolio: 'Tutustu DigitalPulseen',
      otherApps: 'Tutustu muihin sovelluksiimme', credit: 'Kehittäjä',
      nav: 'Muut sovellukset', promo: 'DigitalPulse ja muut sovellukset', services: 'Kehityspalvelut'
    },
    is: {
      eyebrow: 'DIGITALPULSE · VEFSÍÐU- OG FORRITAÞRÓUN',
      headline: 'Ertu með hugmynd að vefsíðu eða forriti?',
      description: 'Við smíðum hraðar og fallegar vefsíður, WordPress- og WooCommerce-lausnir, sérsniðin vefforrit og nytsamlegar gervigreindartengingar.',
      webDesign: 'Vefhönnun', webApps: 'Vefforrit', aiSolutions: 'Gervigreindarlausnir',
      cta: 'Byggjum eitthvað saman', portfolio: 'Skoða DigitalPulse',
      otherApps: 'Skoða önnur forrit okkar', credit: 'Þróað af',
      nav: 'Önnur forrit', promo: 'DigitalPulse og önnur forrit', services: 'Þróunarþjónusta'
    }
  };
  let activeLanguage = '';
  const supported = Object.prototype.hasOwnProperty;

  function preferredLanguage() {
    const selector = document.querySelector('#loginLanguage, #sidebarLanguage, #topLanguage, #settingsLanguage');
    if (selector && supported.call(strings, selector.value)) return selector.value;
    try {
      const saved = JSON.parse(localStorage.getItem('music63-app-prefs-v2') || '{}');
      if (saved && supported.call(strings, saved.language)) return saved.language;
    } catch (_) { /* Storage may be blocked. */ }
    const pageLanguage = document.documentElement.lang;
    return supported.call(strings, pageLanguage) ? pageLanguage : 'en';
  }

  function setFooterLanguage(lang) {
    const key = supported.call(strings, lang) ? lang : 'en';
    if (activeLanguage === key) return;
    const copy = { ...strings.en, ...strings[key] };
    footer.querySelectorAll('[data-dp-text]').forEach(el => {
      const text = copy[el.getAttribute('data-dp-text')];
      if (text) el.textContent = text;
    });
    footer.setAttribute('aria-label', copy.promo);
    footer.querySelector('.dp-app-links')?.setAttribute('aria-label', copy.nav);
    footer.querySelector('.dp-service-tags')?.setAttribute('aria-label', copy.services);
    footer.lang = key;
    activeLanguage = key;
  }

  document.addEventListener('change', event => {
    if (event.target.matches?.('#loginLanguage, #sidebarLanguage, #topLanguage, #settingsLanguage')) {
      setFooterLanguage(event.target.value);
    }
  }, true);
  new MutationObserver(() => setFooterLanguage(preferredLanguage()))
    .observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  window.addEventListener('pageshow', () => setFooterLanguage(preferredLanguage()));
  setFooterLanguage(preferredLanguage());
})();
