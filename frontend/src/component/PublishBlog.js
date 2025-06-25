// components/PublishBlog.js
export const publishToDevto = async ({
  data,
  editedContent,
  imageURL,
  setIsPublishing,
}) => {
  const extractTitle = (markdown) => {
    const match = markdown.match(/^#\s*(.+)/m);
    return match ? match[1].trim() : "Untitled Post";
  };

  setIsPublishing(true); // Start loading state

  try {
    const title = extractTitle(data);
    const cleanedContent = (editedContent || data)
      .split('\n')
      .filter(line =>
        !line.toLowerCase().startsWith('**meta description') &&
        !line.toLowerCase().startsWith('**keywords') &&
        !line.toLowerCase().startsWith('**slug')
      )
      .join('\n');

  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/devto/publish`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    title,
    markdown: cleanedContent,
    tags: ["ai", "blog", "seo"],
    image: imageURL
  })
});



    const result = await res.json();
    alert("Published successfully: " + result.url);
  } catch (err) {
    alert("Failed to publish: " + err.message);
  }

  setIsPublishing(false); // End loading state
};
