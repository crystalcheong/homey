if (!self.define) {
  let e,
    s = {};
  const a = (a, c) => (
    (a = new URL(a + ".js", c).href),
    s[a] ||
      new Promise((s) => {
        if ("document" in self) {
          const e = document.createElement("script");
          (e.src = a), (e.onload = s), document.head.appendChild(e);
        } else (e = a), importScripts(a), s();
      }).then(() => {
        let e = s[a];
        if (!e) throw new Error(`Module ${a} didn’t register its module`);
        return e;
      })
  );
  self.define = (c, n) => {
    const i =
      e ||
      ("document" in self ? document.currentScript.src : "") ||
      location.href;
    if (s[i]) return;
    let t = {};
    const r = (e) => a(e, i),
      o = { module: { uri: i }, exports: t, require: r };
    s[i] = Promise.all(c.map((e) => o[e] || r(e))).then((e) => (n(...e), t));
  };
}
define(["./workbox-7028bf80"], function (e) {
  "use strict";
  importScripts(),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        {
          url: "/_next/static/chunks/373-487e9ee299bd2442.js",
          revision: "487e9ee299bd2442",
        },
        {
          url: "/_next/static/chunks/519-da85b38a13e77187.js",
          revision: "da85b38a13e77187",
        },
        {
          url: "/_next/static/chunks/729-e4bf44237b85da32.js",
          revision: "e4bf44237b85da32",
        },
        {
          url: "/_next/static/chunks/742-889de82050a98e33.js",
          revision: "889de82050a98e33",
        },
        {
          url: "/_next/static/chunks/936-99068c8c94003ad8.js",
          revision: "99068c8c94003ad8",
        },
        {
          url: "/_next/static/chunks/960-7b37de1cbaf8c997.js",
          revision: "7b37de1cbaf8c997",
        },
        {
          url: "/_next/static/chunks/97df4bbd-c94c2faeba69618f.js",
          revision: "c94c2faeba69618f",
        },
        {
          url: "/_next/static/chunks/9a560ba9-16953236c6f15857.js",
          revision: "16953236c6f15857",
        },
        {
          url: "/_next/static/chunks/ce6b0542-38656c1e070491d4.js",
          revision: "38656c1e070491d4",
        },
        {
          url: "/_next/static/chunks/framework-ac88a2a245aea9ab.js",
          revision: "ac88a2a245aea9ab",
        },
        {
          url: "/_next/static/chunks/main-c0f98c8ca43e360d.js",
          revision: "c0f98c8ca43e360d",
        },
        {
          url: "/_next/static/chunks/pages/404-eeee8e1305b7169c.js",
          revision: "eeee8e1305b7169c",
        },
        {
          url: "/_next/static/chunks/pages/500-2b6e24724391ea86.js",
          revision: "2b6e24724391ea86",
        },
        {
          url: "/_next/static/chunks/pages/_app-6d6c3bdfccf96b1e.js",
          revision: "6d6c3bdfccf96b1e",
        },
        {
          url: "/_next/static/chunks/pages/_error-27e5eb670b52f7cf.js",
          revision: "27e5eb670b52f7cf",
        },
        {
          url: "/_next/static/chunks/pages/account/%5Bauth%5D-84c360d5a2144dba.js",
          revision: "84c360d5a2144dba",
        },
        {
          url: "/_next/static/chunks/pages/account/%5Bauth%5D/forgot-password-0565af3290c9909b.js",
          revision: "0565af3290c9909b",
        },
        {
          url: "/_next/static/chunks/pages/account/%5Bauth%5D/reset-password-ca437a68f21f4496.js",
          revision: "ca437a68f21f4496",
        },
        {
          url: "/_next/static/chunks/pages/account/posted-5ea622c7fad71bdd.js",
          revision: "5ea622c7fad71bdd",
        },
        {
          url: "/_next/static/chunks/pages/account/saved-b67f603c2a4d18b6.js",
          revision: "b67f603c2a4d18b6",
        },
        {
          url: "/_next/static/chunks/pages/account/update-9f2103a0e7e4bba0.js",
          revision: "9f2103a0e7e4bba0",
        },
        {
          url: "/_next/static/chunks/pages/explore/neighbourhoods-41763dc4cee278a3.js",
          revision: "41763dc4cee278a3",
        },
        {
          url: "/_next/static/chunks/pages/explore/neighbourhoods/%5Bname%5D-e149c9623235d9ec.js",
          revision: "e149c9623235d9ec",
        },
        {
          url: "/_next/static/chunks/pages/explore/new-launches-692442c5f17b6f29.js",
          revision: "692442c5f17b6f29",
        },
        {
          url: "/_next/static/chunks/pages/index-5ed36a409358e333.js",
          revision: "5ed36a409358e333",
        },
        {
          url: "/_next/static/chunks/pages/info/%5Btype%5D-cc28022fa2a5a170.js",
          revision: "cc28022fa2a5a170",
        },
        {
          url: "/_next/static/chunks/pages/property/%5Btype%5D-1064c50b2d97d8e6.js",
          revision: "1064c50b2d97d8e6",
        },
        {
          url: "/_next/static/chunks/pages/property/%5Btype%5D/%5Bid%5D-8c9f5940321e219d.js",
          revision: "8c9f5940321e219d",
        },
        {
          url: "/_next/static/chunks/polyfills-c67a75d1b6f99dc8.js",
          revision: "837c0df77fd5009c9e46d446188ecfd0",
        },
        {
          url: "/_next/static/chunks/webpack-0b5d8249fb15f5f3.js",
          revision: "0b5d8249fb15f5f3",
        },
        {
          url: "/_next/static/css/bf24df8490d15cc8.css",
          revision: "bf24df8490d15cc8",
        },
        {
          url: "/_next/static/re-5HLYeCVaERHQFOspsb/_buildManifest.js",
          revision: "4fbe83060fa4bcede701cabeb8c6e27b",
        },
        {
          url: "/_next/static/re-5HLYeCVaERHQFOspsb/_ssgManifest.js",
          revision: "b6652df95db52feb4daf4eca35380933",
        },
        {
          url: "/assets/brand/homey.svg",
          revision: "11dd4a3774af96edb1305517d08f901f",
        },
        {
          url: "/assets/brand/ninetyNineCo.svg",
          revision: "2ba84b9d2373a661d2e497f30ee71227",
        },
        {
          url: "/assets/brand/vercel.svg",
          revision: "c7d8efd08fe7e7a36a602b096e779a38",
        },
        {
          url: "/assets/favicon/android-chrome-192x192.png",
          revision: "dc4a09cd8bdd748ac93703552ccf2c46",
        },
        {
          url: "/assets/favicon/android-chrome-512x512.png",
          revision: "5b5f67705d37e68b2a914599e70e454a",
        },
        {
          url: "/assets/favicon/apple-touch-icon.png",
          revision: "23c102925ce0bd07eb6003462f729629",
        },
        {
          url: "/assets/favicon/favicon-16x16.png",
          revision: "c5882ec56a710b0cb704e3310f731c3a",
        },
        {
          url: "/assets/favicon/favicon-32x32.png",
          revision: "040565a50e5cb3729d1f5b5537db6f5e",
        },
        {
          url: "/assets/favicon/favicon.ico",
          revision: "c8f5209d44358eb434bdaaf2bb7f83a4",
        },
        {
          url: "/assets/favicon/maskable_icon_x128.png",
          revision: "40b20d7a7a07d63ecf0af901c85c49d2",
        },
        {
          url: "/assets/favicon/maskable_icon_x192.png",
          revision: "7785b279e40784af559afb89310d091e",
        },
        {
          url: "/assets/favicon/maskable_icon_x384.png",
          revision: "b44d7b77faf7c3adc97543d481c794c1",
        },
        {
          url: "/assets/favicon/maskable_icon_x48.png",
          revision: "96e6820ae2eb46387281ef044e508590",
        },
        {
          url: "/assets/favicon/maskable_icon_x512.png",
          revision: "00ee97e07784db2e2e33096477f5468c",
        },
        {
          url: "/assets/favicon/maskable_icon_x72.png",
          revision: "41bf818702cc2a48862f9f607176debe",
        },
        {
          url: "/assets/favicon/maskable_icon_x96.png",
          revision: "1e5703a1e4e83b53c5c4d5773289b0c0",
        },
        {
          url: "/assets/images/empty-listing.svg",
          revision: "de8c28959e8793a1635b134f41b8772e",
        },
        {
          url: "/assets/images/empty-notifications.svg",
          revision: "7c7bf76021256d49b4b15d66e369329e",
        },
        {
          url: "/assets/images/empty-saved.svg",
          revision: "7ca0587d96593cdaa7f4c849a508c98b",
        },
        {
          url: "/assets/images/empty-search.svg",
          revision: "7d85b6cd0a6749dfe1d03f52885f6389",
        },
        {
          url: "/assets/images/error-client.svg",
          revision: "ccbefb6fd993e588f643cd7ec0a072ef",
        },
        {
          url: "/assets/images/error-server.svg",
          revision: "3eb3206f7934f03ece406b4759f1ffbc",
        },
        {
          url: "/assets/images/new-tab.png",
          revision: "b2001de5c7ebe41cf372e676d09014f4",
        },
        {
          url: "/fonts/AvertaStd/AvertaStd-Bold.woff2",
          revision: "dbc188b8a4eb27a9708d8d2a0a7ff94b",
        },
        {
          url: "/fonts/AvertaStd/AvertaStd-BoldItalic.woff2",
          revision: "efb48ab7a6f4bb37a5181663cd673579",
        },
        {
          url: "/fonts/AvertaStd/AvertaStd-Regular.woff2",
          revision: "57a14ea78837b84a380f7f3422c2d91c",
        },
        {
          url: "/fonts/AvertaStd/AvertaStd-RegularItalic.woff2",
          revision: "84046b8a51fd829cc4d85af265d75185",
        },
        {
          url: "/fonts/AvertaStd/AvertaStd-Semibold.woff2",
          revision: "67398f65c4bbdf7f57f1d5c6247ba115",
        },
        {
          url: "/fonts/AvertaStd/AvertaStd-SemiboldItalic.woff2",
          revision: "d7b72dcaf64d8d5c10286afbb0b54c61",
        },
        {
          url: "/fonts/Inter/Inter.woff2",
          revision: "812b3dd29751112389e93387c4f7dd0a",
        },
        {
          url: "/site.webmanifest",
          revision: "96ade80fe04cd22ca80aa734978692aa",
        },
      ],
      { ignoreURLParametersMatching: [] }
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      "/",
      new e.NetworkFirst({
        cacheName: "start-url",
        plugins: [
          {
            cacheWillUpdate: async ({
              request: e,
              response: s,
              event: a,
              state: c,
            }) =>
              s && "opaqueredirect" === s.type
                ? new Response(s.body, {
                    status: 200,
                    statusText: "OK",
                    headers: s.headers,
                  })
                : s,
          },
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      new e.CacheFirst({
        cacheName: "google-fonts-webfonts",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      new e.StaleWhileRevalidate({
        cacheName: "google-fonts-stylesheets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-font-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-image-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\/_next\/image\?url=.+$/i,
      new e.StaleWhileRevalidate({
        cacheName: "next-image",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:mp3|wav|ogg)$/i,
      new e.CacheFirst({
        cacheName: "static-audio-assets",
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:mp4)$/i,
      new e.CacheFirst({
        cacheName: "static-video-assets",
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:js)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-js-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:css|less)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-style-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\/_next\/data\/.+\/.+\.json$/i,
      new e.StaleWhileRevalidate({
        cacheName: "next-data",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:json|xml|csv)$/i,
      new e.NetworkFirst({
        cacheName: "static-data-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      ({ url: e }) => {
        if (!(self.origin === e.origin)) return !1;
        const s = e.pathname;
        return !s.startsWith("/api/auth/") && !!s.startsWith("/api/");
      },
      new e.NetworkFirst({
        cacheName: "apis",
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      ({ url: e }) => {
        if (!(self.origin === e.origin)) return !1;
        return !e.pathname.startsWith("/api/");
      },
      new e.NetworkFirst({
        cacheName: "others",
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      ({ url: e }) => !(self.origin === e.origin),
      new e.NetworkFirst({
        cacheName: "cross-origin",
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 3600 }),
        ],
      }),
      "GET"
    );
});
