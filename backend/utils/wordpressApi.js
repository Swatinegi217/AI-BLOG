const axios = require("axios");

const publishToWordPress = async ({ title, markdown }) => {
  const { WP_USER, WP_APP_PASS, WP_SITE } = process.env;
  const auth = Buffer.from(`${WP_USER}:${WP_APP_PASS}`).toString("base64");

  console.log("🧾 Sending to WordPress:", {
    title,
    contentSnippet: markdown?.slice(0, 100),
    authHeader: auth.slice(0, 10) + "...", // partial to hide full creds
  });

  try {
    const response = await axios.post(`${WP_SITE}/wp-json/wp/v2/posts`, {
      title,
      content: markdown,
      status: "publish",
    }, {
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
    });

    return response.data.link;
  } catch (err) {
    console.error("❌ Error publishing to WordPress:");
    if (err.response) {
      console.error("Status:", err.response.status);
      console.error("Data:", err.response.data);
    } else {
      console.error(err.message);
    }
    throw err;
  }
};

module.exports = { publishToWordPress };
