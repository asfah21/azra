import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';

// Definisikan tipe untuk entry dari ZIP file
type ZipEntry = {
    entryName: string;
    getData: () => Buffer;
};

export async function GET() {
    const fontsDirectory = path.join(process.cwd(), 'public', 'fonts');
    const files = fs.readdirSync(fontsDirectory);

    const fonts = files
        .filter((file) => path.extname(file) === '.zip')
        .map((file) => {
            const filePath = path.join(fontsDirectory, file);
            const zip = new AdmZip(filePath);

            // Tambahkan tipe untuk entry di sini
            const firstFontEntry = zip.getEntries().find((entry: ZipEntry) => entry.entryName.match(/\.(ttf|otf)$/));

            if (firstFontEntry) {
                const fileBuffer = zip.readFile(firstFontEntry);
                if (fileBuffer) {
                    const base64Content = fileBuffer.toString('base64');
                    const mimeType = firstFontEntry.entryName.endsWith('.ttf') ? 'font/ttf' : 'font/otf';
                    const fileUrl = `data:${mimeType};base64,${base64Content}`;

                    // Format nama font
                    let fontName = path.basename(firstFontEntry.entryName, path.extname(firstFontEntry.entryName))
                        .replace(/personal[\s-_]*use[\s-_]*only/gi, '')
                        .replace(/\bregular\b/gi, '')
                        .replace(/[-_]/g, ' ')
                        .replace(/([a-z])([A-Z])/g, '$1 $2')
                        .trim()
                        .replace(/\b(\w)/g, (match) => match.toUpperCase())
                        .replace(/\s{2,}/g, ' ');

                    return {
                        name: path.basename(file, '.zip'),
                        variants: [{ name: fontName, file: fileUrl }],
                    };
                }
            }
            return null;
        })
        .filter(Boolean);

    return NextResponse.json({ fonts });
}