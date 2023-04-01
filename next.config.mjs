// @ts-check

import nextPwa from "next-pwa";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const withPWA = nextPwa({
  dest: "public",
});

/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
!process.env.SKIP_ENV_VALIDATION && (await import("./src/env.mjs"));

// https://nextjs.org/docs/advanced-features/security-headers
const contentSecurityPolicy = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' *.youtube.com *.twitter.com vitals.vercel-insights.com giscus.app *.vercel.app;
    child-src *.youtube.com *.google.com *.twitter.com vitals.vercel-insights.com giscus.app *.vercel.app;
    style-src 'self' 'unsafe-inline' *.googleapis.com;
    img-src * blob: data:;
    media-src 'none';
    connect-src *;
    font-src 'self';
`;

const securityHeaders = [
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
  {
    key: "Content-Security-Policy",
    value: contentSecurityPolicy.replace(/\n/g, ""),
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy
  {
    key: "Referrer-Policy",
    value: "origin-when-cross-origin",
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-DNS-Prefetch-Control
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Feature-Policy
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

/** @type {import("next").NextConfig} */
const config = {
  swcMinify: true,
  reactStrictMode: true,
  // pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  productionBrowserSourceMaps: false,

  experimental: {
    // browsersListForSwc: true,
    esmExternals: false,
    legacyBrowsers: false,
    swcTraceProfiling: true,
    // swcMinifyDebugOptions: {
    //   compress: {
    //     defaults: true,
    //     side_effects: false,
    //   },
    // },
    // images: {
    //   allowFutureImage: true,
    // },
  },

  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 130, 200, 256, 384],
    path: "/_next/image",
    loader: "default",
    disableStaticImages: false,
    minimumCacheTTL: 60,
    domains: [
      // 99.co assets
      "pic2.99.co",
      "99.co",
    ],
  },

  // distDir: 'build',
  eslint: {
    dirs: ["src"],
  },

  headers: async () => [
    {
      source: "/(.*)",
      headers: securityHeaders,
    },
  ],

  redirects: async () => {
    return [
      {
        source: "/docs/presentation",
        destination:
          "https://www.canva.com/design/DAFeTrBXh6Q/On91DWmK4KlDv-rdMO9Oyg/view?utm_content=DAFeTrBXh6Q&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink",
        permanent: true,
      },
    ];
  },

  // SVGR
  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: [
        {
          loader: "@svgr/webpack",
          options: {
            typescript: true,
            icon: true,
          },
        },
      ],
    });
    return config;
  },

  /**
   * If you have the "experimental: { appDir: true }" setting enabled, then you
   * must comment the below `i18n` config out.
   *
   * @see https://github.com/vercel/next.js/issues/41980
   */
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
};

const appConfig = withPWA(config);
export default appConfig;
