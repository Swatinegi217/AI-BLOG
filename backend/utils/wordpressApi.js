const axios = require("axios");
const { marked } = require("marked");
require("dotenv").config();

// ✅ define the function properly
const publishToWordPress = async ({ title, markdown, image }) => {
  const htmlContent = image
    ? `<img src="${image}" /><br/>` + marked(markdown)
    : marked(markdown);

  try {
    const response = await axios.post(
      `${process.env.WP_SITE}/wp-json/wp/v2/posts`,
      {
        title,
        content: htmlContent,
        status: "publish",
      },
      {
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(
              `${process.env.WP_USER}:${process.env.WP_APP_PASS.replace(/\s+/g, "")}`
            ).toString("base64"),
        },
      }
    );

    return response.data.link;
  } catch (error) {
    console.error("❌ WordPress publish error:", error.response?.data || error.message);
    return null;
  }
};

// ✅ export it after definition
module.exports = { publishToWordPress };
