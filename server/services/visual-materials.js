import { readFile, realpath, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { GenerationError } from "./hermes-text.js";

export const isVisualMaterial = (m) =>
  ["image/png", "image/jpeg", "image/webp"].includes(m.mime);

// Somente arquivos de upload controlados, nunca URLs/caminhos sugeridos pela IA.
export async function prepareVisualMaterials({
  materials,
  uploadsDir,
  assuntoId,
}) {
  const selected = materials.filter(
    (m) => isVisualMaterial(m) && (!m.assuntoId || m.assuntoId === assuntoId),
  );
  if (!selected.length) return [];
  if (selected.length > 8)
    throw new GenerationError(
      `Há ${selected.length} imagens vinculadas a este assunto. O limite é de 8 imagens por assunto. Divida os anexos entre os assuntos antes de gerar.`,
    );
  let root;
  try {
    root = await realpath(uploadsDir);
  } catch {
    throw new GenerationError(
      "Os anexos de imagem não estão disponíveis no servidor. Reenvie os arquivos antes de gerar a aula.",
    );
  }
  const images = [];
  let total = 0;
  for (const [index, m] of selected.entries()) {
    try {
      if (!/^[a-f0-9-]{36}\.(png|jpg|webp)$/.test(m.arquivo)) throw new Error();
      const filename = await realpath(path.join(root, m.arquivo));
      const relative = path.relative(root, filename);
      if (relative.startsWith("..") || path.isAbsolute(relative))
        throw new Error();
      const info = await stat(filename);
      if (!info.isFile() || info.size > 5 * 1024 * 1024) throw new Error();
      const original = await readFile(filename);
      const image = sharp(original, {
        limitInputPixels: 20000000,
        animated: false,
      });
      const meta = await image.metadata();
      if (
        !(
          { png: "image/png", jpeg: "image/jpeg", webp: "image/webp" }[
            meta.format
          ] === m.mime
        ) ||
        meta.pages > 1
      )
        throw new Error();
      // JPEG/WebP já comprimidos não devem inflar para PNG. Validar todos
      // os pixels antes de reutilizar bytes; orientar/redimensionar se preciso.
      let bytes;
      let mime = m.mime;
      const unchanged =
        meta.width <= 4096 &&
        meta.height <= 4096 &&
        !meta.exif &&
        !meta.iptc &&
        !meta.xmp &&
        (!meta.orientation || meta.orientation === 1);
      if (unchanged) {
        await image.clone().raw().toBuffer();
        bytes = original;
      } else {
        const prepared = image.rotate().resize({
          width: 4096,
          height: 4096,
          fit: "inside",
          withoutEnlargement: true,
        });
        if (m.mime === "image/jpeg")
          bytes = await prepared
            .jpeg({ quality: 92, chromaSubsampling: "4:4:4" })
            .toBuffer();
        else if (m.mime === "image/webp")
          bytes = await prepared.webp({ quality: 92 }).toBuffer();
        else bytes = await prepared.png().toBuffer();
      }
      if (mime === "image/png" && bytes.length > 4 * 1024 * 1024) {
        bytes = await sharp(bytes)
          .flatten({ background: "white" })
          .jpeg({ quality: 90 })
          .toBuffer();
        mime = "image/jpeg";
      }
      total += bytes.length;
      images.push({
        materialId: m.id,
        mime,
        dataURL: `data:${mime};base64,${bytes.toString("base64")}`,
      });
    } catch {
      throw new GenerationError(
        `Não foi possível preparar os anexos de imagem: o anexo ${index + 1} está ausente, inválido ou não pode ser lido. Reenvie esse arquivo antes de gerar a aula.`,
      );
    }
  }
  if (total > 6 * 1024 * 1024)
    throw new GenerationError(
      `Os ${images.length} anexos de imagem ocupam ${(total / 1024 / 1024).toFixed(1)} MB após preparação. O limite de envio à IA é 6 MB por assunto. Reduza o tamanho das imagens ou distribua-as entre os assuntos.`,
    );
  return images;
}
