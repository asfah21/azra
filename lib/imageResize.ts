// --- imageResize.ts ---
import sharp from "sharp";

type Encoded = { buffer: Buffer; contentType: "image/jpeg" | "image/webp" };

export async function compressImageToUnder(
  input: Buffer,
  targetBytes = 300 * 1024,
): Promise<Encoded> {
  const meta = await sharp(input).metadata();
  const hasAlpha = Boolean(meta.hasAlpha);
  // Mulai dari parameter "wajar"
  let width = Math.min(1280, meta.width ?? 1280);
  let quality = 82;

  let best: Encoded | null = null;

  // Batas bawah supaya kualitas tetap OK
  const minWidth = 640;
  const minQuality = 40;

  // Fungsi encode sekali percobaan
  const encodeOnce = async (w: number, q: number): Promise<Encoded> => {
    if (hasAlpha) {
      const buf = await sharp(input)
        .resize({
          width: w,
          height: w,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({
          quality: q,
          alphaQuality: 80, // transparansi tetap halus
          effort: 4,
        })
        .toBuffer();

      return { buffer: buf, contentType: "image/webp" };
    } else {
      const buf = await sharp(input)
        .resize({
          width: w,
          height: w,
          fit: "inside",
          withoutEnlargement: true,
        })
        .jpeg({
          quality: q,
          mozjpeg: true,
          chromaSubsampling: "4:2:0",
          progressive: true,
          force: true,
        })
        .toBuffer();

      return { buffer: buf, contentType: "image/jpeg" };
    }
  };

  // Turunkan kualitas dulu, lalu resolusi kalau perlu
  while (true) {
    // Coba beberapa quality step untuk lebar saat ini
    let q = quality;

    while (q >= minQuality) {
      const out = await encodeOnce(width, q);

      // simpan best attempt untuk jaga-jaga
      if (!best || out.buffer.length < best.buffer.length) best = out;

      if (out.buffer.length <= targetBytes) return out;
      q -= 8;
    }

    // Kalau sudah di quality minimum, kecilkan lebar dan ulangi
    if (width <= minWidth) break;
    width = Math.max(minWidth, Math.floor(width * 0.85));
  }

  // Jika tidak berhasil sampai target, kembalikan yang terkecil
  // (praktiknya hampir selalu tembus ≤300 KB sebelum batas)
  return best!;
}
