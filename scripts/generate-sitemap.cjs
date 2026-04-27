/**
 * Injects all spoke locs (from scripts/micro-routes.cjs) into sitemap.xml between AUTO markers.
 * Run: node scripts/generate-sitemap.cjs
 * (Build runs this after generate-micro-pages so sitemap and HTML stay in sync.)
 */
"use strict";
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const { getSitemapSpokeUrls } = require("./micro-routes.cjs");
const smf = path.join(root, "sitemap.xml");
const today = new Date().toISOString().slice(0, 10);

function main() {
  const urls = getSitemapSpokeUrls();

  let block = "";
  urls.forEach((u) => {
    block += `  <url>
    <loc>${u}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.75</priority>
  </url>
`;
  });

  let sm = fs.readFileSync(smf, "utf8");
  const re = /  <!-- AUTO:generated-spokes[\s\S]*?  <!-- END:generated-spokes -->/;
  const replacement = `  <!-- AUTO:generated-spokes — replaced by scripts/generate-sitemap.cjs -->
${block}  <!-- END:generated-spokes -->`;

  if (re.test(sm)) {
    sm = sm.replace(re, replacement);
  } else {
    sm = sm.replace("</urlset>", replacement + "\n</urlset>");
  }
  fs.writeFileSync(smf, sm, "utf8");
  console.log("sitemap.xml updated with " + urls.length + " generated URLs");
}

if (require.main === module) {
  main();
}
module.exports = { main };
