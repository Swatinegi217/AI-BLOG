// backend/utils/wordpressApi.js
const axios = require("axios");

const publishToWordPress = async ({ title, markdown }) => {
  const { WP_USER, WP_APP_PASS, WP_SITE } = process.env;
  const auth = Buffer.from(`${WP_USER}:${WP_APP_PASS}`).toString("base64");

  const response = await axios.post(`${WP_SITE}/wp-json/wp/v2/posts`, {
    title,
    content: markdown,
    status: "publish",
  }, {
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json"
    }
  });

  return response.data.link;
};

module.exports = { publishToWordPress };
