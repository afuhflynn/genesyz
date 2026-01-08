const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const SOURCE_ICON = "public/images/logo/source-icon.png";
const SOURCE_FULL = "public/images/logo/source-full.png";
const OUT_DIR = "public/images/logo";

async function generate() {
  console.log("Generating assets...");

  // Ensure output directory exists
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  // 1. Primary Header Logo (400x160 max)
  await sharp(SOURCE_FULL)
    .resize(400, 160, { fit: "inside" })
    .toFile(path.join(OUT_DIR, "logo-header.png"));
  console.log("Generated logo-header.png");

  // 2. Sticky Header Logo (Icon only, 120x40 max)
  await sharp(SOURCE_ICON)
    .resize(120, 40, { fit: "inside" })
    .toFile(path.join(OUT_DIR, "logo-sticky.png"));
  console.log("Generated logo-sticky.png");

  // 3. Footer Logo (Grayscale, 180x70 max)
  await sharp(SOURCE_FULL)
    .resize(180, 70, { fit: "inside" })
    .grayscale()
    .toFile(path.join(OUT_DIR, "logo-footer.png"));
  console.log("Generated logo-footer.png");

  // 4. OG Image (1200x630, centered)
  const fullLogo = await sharp(SOURCE_FULL).resize(600, null).toBuffer();
  await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([{ input: fullLogo, gravity: "center" }])
    .toFile("public/og-image.png");
  console.log("Generated og-image.png");

  // 5. App Icon (512x512)
  await sharp(SOURCE_ICON)
    .resize(512, 512, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .toFile("public/icon.png");
  console.log("Generated icon.png");

  // 6. Favicons
  await sharp(SOURCE_ICON)
    .resize(180, 180, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .toFile("public/apple-touch-icon.png");
  console.log("Generated apple-touch-icon.png");

  await sharp(SOURCE_ICON)
    .resize(32, 32, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .toFile("public/favicon-32x32.png");
  console.log("Generated favicon-32x32.png");

  await sharp(SOURCE_ICON)
    .resize(16, 16, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .toFile("public/favicon-16x16.png");
  console.log("Generated favicon-16x16.png");

  await sharp(SOURCE_ICON)
    .resize(192, 192, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .toFile("public/android-chrome-192x192.png");
  console.log("Generated android-chrome-192x192.png");

  await sharp(SOURCE_ICON)
    .resize(512, 512, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .toFile("public/android-chrome-512x512.png");
  console.log("Generated android-chrome-512x512.png");

  // 7. Email Logo (150x50)
  await sharp(SOURCE_FULL)
    .resize(150, 50, { fit: "inside" })
    .toFile(path.join(OUT_DIR, "logo-email.png"));
  console.log("Generated logo-email.png");

  // Generate favicon.ico (using 32x32 png as source, simple rename/copy for now as sharp doesn't write .ico directly easily without plugins, but browsers support png favicons. I'll just copy 32x32 to favicon.ico for legacy)
  // Actually, sharp can't write .ico. I'll just use the pngs and update layout.tsx.
  // But for legacy, I'll copy the 32x32 png to favicon.ico (it works in many contexts, though technically invalid format, often accepted).
  // Better: Just rely on the pngs in layout.tsx.
}

generate().catch(console.error);
