import html2pdf from 'html2pdf.js';
import { Document, Packer, Paragraph, Media } from 'docx';
import { saveAs } from 'file-saver';

export const downloadBlog = async ({ content, title, format, image }) => {
  if (!content || content.trim() === '') {
    alert('No blog content to download!');
    return;
  }

  if (format === 'pdf') {
    const element = document.getElementById("markdown-content");
    if (!element) {
      alert("Cannot find blog content to download as PDF.");
      return;
    }

  if (format === 'pdf') {
  const element = document.getElementById("markdown-content");
  if (!element) {
    alert("Cannot find blog content to download as PDF.");
    return;
  }

  html2pdf()
    .from(element)
    .set({
      margin: 0.5,
      filename: `${title.slice(0, 10) || 'blog'}.pdf`,
      html2canvas: {
        scale: 2,
        useCORS: true,      // ✅ Make sure images from external URLs are allowed
        allowTaint: false,
      },
      jsPDF: {
        unit: 'in',
        format: 'letter',
        orientation: 'portrait',
      },
    })
    .save();
}

  } else {
    // Clean content
    const cleaned = content
      .split('\n')
      .filter(line =>
        !line.toLowerCase().startsWith('meta description') &&
        !line.toLowerCase().startsWith('keywords') &&
        !line.toLowerCase().startsWith('slug')
      )
      .join('\n');

    const lines = cleaned.split('\n').filter(line => line.trim() !== '');

    const doc = new Document();
    const children = [];

    // Add text lines as paragraphs
    lines.forEach((line, index) => {
      const isHeading =
        line === "Introduction" ||
        line === "Conclusion" ||
        line.includes(':') ||
        line.length < 60;

      const paragraph = new Paragraph({
        children: [{ text: line, bold: isHeading }]
      });

      children.push(paragraph);
    });

// Insert image after "Introduction"
if (image) {
  try {
    const response = await fetch(image);
    const blob = await response.blob();
    const imageBuffer = await blob.arrayBuffer();

    const imageDoc = Media.addImage(doc, imageBuffer, 500, 300);
    const imageParagraph = new Paragraph(imageDoc);

    // Simple fallback: insert after first or second paragraph
    const insertIndex = lines.findIndex(l => l.trim().toLowerCase() === 'introduction');
    const safeIndex = insertIndex >= 0 ? insertIndex + 1 : 2;

    children.splice(safeIndex, 0, imageParagraph);
  } catch (err) {
    console.warn("❌ Failed to load image for DOCX download:", err.message);
  }
}

    doc.addSection({ children });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${title.slice(0, 10) || 'blog'}.docx`);
  }
};
