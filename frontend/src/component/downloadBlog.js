import html2pdf from "html2pdf.js";
import { saveAs } from "file-saver";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
} from "docx";

function markdownToText(markdown) {
  return markdown
    .replace(/#+\s?/g, '') // Remove headings
    .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
    .replace(/\*(.*?)\*/g, '$1') // Italic
    .replace(/!\[(.*?)\]\((.*?)\)/g, '') // Remove images
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1') // Links
    .replace(/`{1,3}(.*?)`{1,3}/g, '$1') // Inline code
    .replace(/>\s?(.*)/g, '$1') // Blockquotes
    .replace(/[-*+]\s/g, '') // Bullet lists
    .replace(/\n{2,}/g, '\n\n'); // Normalize spacing
}

export const downloadBlog = async ({ content, title, format, image }) => {
  if (!content || content.trim() === "") {
    alert("No blog content to download!");
    return;
  }

  if (format === "pdf") {
    const element = document.getElementById("markdown-content");
    if (!element) {
      alert("Cannot find blog content to download as PDF.");
      return;
    }

    html2pdf()
      .from(element)
      .set({
        margin: 0.5,
        filename: `${title.slice(0, 10) || "blog"}.pdf`,
        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: false,
        },
        jsPDF: {
          unit: "in",
          format: "letter",
          orientation: "portrait",
        },
      })
      .save();
  } else {
    try {
      // Extract image from markdown
      const imageMatch = content.match(/!\[.*?\]\((.*?)\)/);
      const imageUrl = image || (imageMatch ? imageMatch[1] : null);


      // Convert markdown to plain text
      const plainText = markdownToText(content);
      const lines = plainText.split("\n").filter((line) => line.trim() !== "");
      const children = [];

      // Add each line as paragraph
      lines.forEach((line) => {
        const isHeading = line.length < 60;
        children.push(
          new Paragraph({
            children: [new TextRun({ text: line, bold: isHeading })],
          })
        );
      });

      // Add image if available
      if (imageUrl) {
        try {
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          const arrayBuffer = await blob.arrayBuffer();

          const imageRun = new ImageRun({
            data: arrayBuffer,
            transformation: { width: 500, height: 300 },
          });

          // Insert image after "Introduction" or at index 2
          const introIndex = lines.findIndex(line =>
            line.trim().toLowerCase().includes("introduction")
          );
          const insertAt = introIndex !== -1 ? introIndex + 1 : 2;

          children.splice(insertAt, 0, new Paragraph(imageRun));
        } catch (e) {
          console.warn("⚠️ Could not add image:", e);
        }
      }

      const doc = new Document({
        sections: [{ children }],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${title.slice(0, 10) || "blog"}.docx`);
    } catch (err) {
      console.error("❌ Failed to generate Word document:", err);
      alert("Failed to generate Word document.");
    }
  }
};
