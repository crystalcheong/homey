/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl:
    `https://${process.env.VERCEL_URL}` ||
    `http://localhost:${process.env.PORT ?? 3000}`,
  generateRobotsTxt: true,
};
