import jsPDF from 'jspdf';

const turkishToAscii = (text: string): string => {
  const charMap: { [key: string]: string } = {
    'ç': 'c', 'Ç': 'C',
    'ğ': 'g', 'Ğ': 'G',
    'ı': 'i', 'İ': 'I',
    'ö': 'o', 'Ö': 'O',
    'ş': 's', 'Ş': 'S',
    'ü': 'u', 'Ü': 'U'
  };

  return text.replace(/[çÇğĞıİöÖşŞüÜ]/g, char => charMap[char] || char);
};

type PdfContent = {
  title: string;
  description: string;
}[];

export const generatePdf = (title: string, gpt4Content: PdfContent, gptMiniContent: PdfContent) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const contentWidth = pageWidth - 40; // 20mm margins on each side
  let y = 20;

  // Helper function to add text with proper line breaks
  const addText = (text: string, fontSize: number, isBold: boolean = false) => {
    pdf.setFontSize(fontSize);
    pdf.setFont("helvetica", isBold ? "bold" : "normal");
    
    const lines = pdf.splitTextToSize(turkishToAscii(text), contentWidth);
    lines.forEach(line => {
      if (y > pdf.internal.pageSize.getHeight() - 20) {
        pdf.addPage();
        y = 20;
      }
      pdf.text(line, 20, y);
      y += fontSize * 0.5;
    });
    y += 5;
  };

  // Add main title
  addText(`Icerik Fikirleri: ${title}`, 16, true);
  y += 10;

  // Add GPT-4 content
  addText("GPT-4 Onerileri:", 14, true);
  y += 5;
  gpt4Content.forEach((item, index) => {
    addText(`${index + 1}. ${item.title}`, 12, true);
    addText(item.description, 10);
    y += 5;
  });

  y += 10;

  // Add GPT-Mini content
  addText("GPT-Mini Onerileri:", 14, true);
  y += 5;
  gptMiniContent.forEach((item, index) => {
    addText(`${index + 1}. ${item.title}`, 12, true);
    addText(item.description, 10);
    y += 5;
  });

  return pdf;
};
