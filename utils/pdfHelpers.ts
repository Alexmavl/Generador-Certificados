import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import JSZip from 'jszip';
import { DraggableElement, ExcelData } from '../types';

// Helper to convert HEX color to RGB 0-1
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255,
      }
    : { r: 0, g: 0, b: 0 };
};

const getStandardFont = (family: string = 'Helvetica', style: string = 'Normal') => {
  const map: Record<string, Record<string, any>> = {
    'Helvetica': {
      'Normal': StandardFonts.Helvetica,
      'Bold': StandardFonts.HelveticaBold,
      'Italic': StandardFonts.HelveticaOblique,
      'BoldItalic': StandardFonts.HelveticaBoldOblique,
    },
    'Times-Roman': {
      'Normal': StandardFonts.TimesRoman,
      'Bold': StandardFonts.TimesRomanBold,
      'Italic': StandardFonts.TimesRomanItalic,
      'BoldItalic': StandardFonts.TimesRomanBoldItalic,
    },
    'Courier': {
      'Normal': StandardFonts.Courier,
      'Bold': StandardFonts.CourierBold,
      'Italic': StandardFonts.CourierOblique,
      'BoldItalic': StandardFonts.CourierBoldOblique,
    }
  };

  return map[family]?.[style] || StandardFonts.Helvetica;
};

export const generateCertificates = async (
  pdfTemplate: File,
  data: ExcelData[],
  elements: DraggableElement[],
  onProgress: (percent: number) => void
): Promise<Blob> => {
  const zip = new JSZip();
  const pdfBytes = await pdfTemplate.arrayBuffer();

  // Pre-load images
  const imageCache: Record<string, Uint8Array> = {};
  for (const el of elements) {
    if (el.type === 'IMAGE' && el.content instanceof File) {
      imageCache[el.id] = new Uint8Array(await el.content.arrayBuffer());
    }
  }

  // Pre-load fonts required
  // We'll just load them on demand per doc or preload all used? 
  // Loading per doc is safer for now to ensure we have the fresh doc context
  
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();

    // Cache font embeddings for this doc instance
    const fontCache: Record<string, any> = {};
    const getFont = async (family: string, style: string) => {
        const key = `${family}-${style}`;
        if (!fontCache[key]) {
            fontCache[key] = await pdfDoc.embedFont(getStandardFont(family, style));
        }
        return fontCache[key];
    };

    for (const el of elements) {
      const x = (el.x / 100) * width;
      const y = height - (el.y / 100) * height;

      if (el.type === 'TEXT') {
        const textValue = el.valueKey ? String(row[el.valueKey] || '') : (el.content as string || '');
        const textSize = el.fontSize || 12;
        const color = hexToRgb(el.color || '#000000');
        const font = await getFont(el.fontFamily || 'Helvetica', el.fontStyle || 'Normal');
        
        // Approximate centering logic (drag point is center)
        const textWidth = font.widthOfTextAtSize(textValue, textSize);
        const centeredX = x - (textWidth / 2);

        firstPage.drawText(textValue, {
          x: centeredX,
          y: y,
          size: textSize,
          font: font,
          color: rgb(color.r, color.g, color.b),
        });
      } else if (el.type === 'IMAGE' && imageCache[el.id]) {
        const imgBytes = imageCache[el.id];
        let embeddedImage;
        try {
            embeddedImage = await pdfDoc.embedPng(imgBytes);
        } catch (e) {
            try {
                embeddedImage = await pdfDoc.embedJpg(imgBytes);
            } catch (e2) {
                console.error("Failed to embed image", el.label);
                continue;
            }
        }

        const imgDims = embeddedImage.scale(1);
        const imgWidth = el.width ? (el.width / 100) * width : 100;
        const imgHeight = el.height ? (el.height / 100) * height : (imgWidth / imgDims.width) * imgDims.height;

        firstPage.drawImage(embeddedImage, {
          x: x - (imgWidth / 2), 
          y: y - (imgHeight / 2),
          width: imgWidth,
          height: imgHeight,
        });
      }
    }

    const pdfOut = await pdfDoc.save();
    const fileName = row['Name'] || row['Nombre'] || row['name'] || `certificate_${i + 1}`;
    zip.file(`${fileName}.pdf`, pdfOut);

    onProgress(((i + 1) / data.length) * 100);
  }

  return await zip.generateAsync({ type: 'blob' });
};