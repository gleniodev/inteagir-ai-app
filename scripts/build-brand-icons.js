import sharp from "sharp";
import { fileURLToPath } from "node:url";
import path from "node:path";

const publicDir = fileURLToPath(new URL("../public/", import.meta.url));
const source = path.join(publicDir, "symbol-inteagir.webp");
for (const [filename, size, background] of [
  ["icon-192.png", 192, { r: 0, g: 0, b: 0, alpha: 0 }],
  ["icon-512.png", 512, { r: 0, g: 0, b: 0, alpha: 0 }],
  ["favicon-32.png", 32, { r: 0, g: 0, b: 0, alpha: 0 }],
  ["favicon-16.png", 16, { r: 0, g: 0, b: 0, alpha: 0 }],
  ["apple-touch-icon.png", 180, "white"],
]) {
  let image = sharp(source).resize(size, size, { fit: "contain", background });
  if (filename === "apple-touch-icon.png")
    image = image.flatten({ background: "white" });
  await image.png().toFile(path.join(publicDir, filename));
}
console.log(
  "Ícones exportados do símbolo oficial: PWA 192/512, favicon 16/32 e Apple 180.",
);
