import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

const assetsRoot = path.resolve(process.cwd(), "public/assets");

async function optimizeFile(filePath, maxWidth, quality = 75) {
  try {
    const ext = path.extname(filePath).toLowerCase();
    const isPng = ext === ".png";
    const tempPath = filePath + ".tmp";

    // 1. Resize and compress original file
    let pipeline = sharp(filePath);
    const metadata = await pipeline.metadata();
    
    if (metadata.width > maxWidth) {
      pipeline = pipeline.resize({ width: maxWidth });
    }

    if (isPng) {
      await pipeline.png({ quality }).toFile(tempPath);
    } else {
      await pipeline.jpeg({ quality, progressive: true }).toFile(tempPath);
    }

    // Replace original
    await fs.unlink(filePath);
    await fs.rename(tempPath, filePath);
    console.log(`Optimized original: ${path.relative(assetsRoot, filePath)}`);

    // 2. Generate webp copy
    const webpPath = filePath.replace(/\.(png|jpe?g)$/i, ".webp");
    let webpPipeline = sharp(filePath);
    await webpPipeline.webp({ quality }).toFile(webpPath);
    console.log(`Generated WebP: ${path.relative(assetsRoot, webpPath)}`);

  } catch (err) {
    console.error(`Error optimizing ${filePath}:`, err.message);
  }
}

async function run() {
  console.log("Optimizing heavy static assets...");

  // Background images
  await optimizeFile(path.join(assetsRoot, "loginimage.jpg"), 800, 75);
  await optimizeFile(path.join(assetsRoot, "restaurant/bg.jpg"), 1920, 75);
  await optimizeFile(path.join(assetsRoot, "review.jpg"), 1200, 75);

  // Large Fallback / Placeholder PNGs
  await optimizeFile(path.join(assetsRoot, "agent.png"), 300, 75);
  await optimizeFile(path.join(assetsRoot, "customer.png"), 300, 75);
  await optimizeFile(path.join(assetsRoot, "restaurant.png"), 300, 75);
  await optimizeFile(path.join(assetsRoot, "defaultprofile.png"), 300, 75);

  // Category images
  const categoriesDir = path.join(assetsRoot, "categories");
  try {
    const files = await fs.readdir(categoriesDir);
    for (const file of files) {
      if (/\.(png|jpe?g)$/i.test(file)) {
        await optimizeFile(path.join(categoriesDir, file), 400, 75);
      }
    }
  } catch (err) {
    console.error("Error reading categories directory:", err.message);
  }

  console.log("Image optimization complete.");
}

run();
