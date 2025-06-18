import html2pdf from 'html2pdf.js';
import { Document, Packer, Paragraph } from 'docx';
import { saveAs } from 'file-saver';

export const downloadBlog = async ({ content, title, format }) => {
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

    html2pdf()
      .from(element)
      .set({
        margin: 0.5,
        filename: `${title.slice(0, 10) || 'blog'}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      })
      .save();
  } else {
    // Clean markdown content
    let cleaned = content
      .split('\n')
      .filter(line =>
        !line.toLowerCase().startsWith('meta description') &&
        !line.toLowerCase().startsWith('keywords') &&
        !line.toLowerCase().startsWith('slug') &&
        !line.startsWith('#')
      )
      .join('\n');

    const lines = cleaned.split('\n').filter(line => line.trim() !== '');

    const doc = new Document({
      sections: [{
        children: lines.map(line => {
          const isHeading =
            line === "Introduction" ||
            line === "Conclusion" ||
            line.includes(':') ||
            line.length < 60;
          return new Paragraph({
            children: [{ text: line, bold: isHeading }]
          });
        })
      }]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${title.slice(0, 10) || 'blog'}.docx`);
  }
};
