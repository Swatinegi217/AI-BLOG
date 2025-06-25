const axios = require("axios");

const publishToDevto = async ({ title, markdown, tags }) => {
  const response = await axios.post("https://dev.to/api/articles", {
    article: {
      title,
      published: true,
      body_markdown: markdown,
      tags
    }
  }, {
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.DEVTO_API_KEY
    }
  });

  return response.data.url; // Return published URL
};

module.exports = { publishToDevto };
