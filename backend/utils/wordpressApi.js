const axios = require("axios");
const { marked } = require("marked");

const publishToWordPress = async ({ title, markdown, image }) => {
  const auth = Buffer.from(`${process.env.WP_USER}:${process.env.WP_APP_PASS}`).toString("base64");

  const htmlContent = marked.parse(markdown);
  const contentWithImage = image ? `<img src="${image}" alt="Blog image" /><br/>${htmlContent}` : htmlContent;

  console.log("🧾 Sending to WordPress:", {
    title,
    contentSnippet: contentWithImage.slice(0, 200),
    authHeader: auth.slice(0, 10) + "...",
  });

  const response = await axios.post(
    `${process.env.WP_SITE}/wp-json/wp/v2/posts`,
    {
      title,
      content: contentWithImage,
      status: "publish"
    },
    {
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json"
      }
    }
  );

  return response.data.link;
};

module.exports = { publishToWordPress };
