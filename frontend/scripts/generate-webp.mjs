import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

const assetsRoot = path.resolve(process.cwd(), "public/assets");
const imagePattern = /\.(png|jpe?g)$/i;

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
      continue;
    }

    if (imagePattern.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

async function convert(filePath) {
  const targetPath = filePath.replace(imagePattern, ".webp");

  await sharp(filePath)
    .webp({ quality: 82 })
    .toFile(targetPath);

  console.log(`Created ${path.relative(assetsRoot, targetPath)}`);
}

const files = await walk(assetsRoot);

for (const filePath of files) {
  await convert(filePath);
}

console.log(`Converted ${files.length} image(s) to webp.`);