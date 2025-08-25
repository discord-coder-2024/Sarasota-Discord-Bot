const { Client, GatewayIntentBits, Partials } = require("discord.js");
const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel]
});

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const content = message.content.toLowerCase();
  const triggers = ["hi", "hey", "hello", "hiya"];

  if (triggers.some((word) => content.includes(word))) {
    try {
      await message.react("🙋‍♂️");
    } catch (err) {
      console.error("❌ Could not react:", err);
    }
  }

  if (message.content.startsWith("!dm ")) {
    const args = message.content.split(" ");
    const userId = args[1];
    let dmMessage = args.slice(2).join(" ");

    if (!userId || !dmMessage) {
      return message.reply("⚠️ Usage: `!dm {id} {message}`");
    }

    try {
      const user = await client.users.fetch(userId);

      const messageLinkRegex = /https:\/\/discord(?:app)?\.com\/channels\/(\d+)\/(\d+)\/(\d+)/;
      const match = dmMessage.match(messageLinkRegex);

      if (match) {
        const [, , channelId, messageId] = match;
        try {
          const channel = await client.channels.fetch(channelId);
          const fetchedMessage = await channel.messages.fetch(messageId);

          if (fetchedMessage.content) {
            dmMessage = fetchedMessage.content;
          } else if (fetchedMessage.embeds.length) {
            dmMessage = fetchedMessage.embeds.map(e => JSON.stringify(e)).join("\n");
          } else {
            dmMessage = "[Message has no content]";
          }
        } catch {
          dmMessage = "[Could not fetch message from link]";
        }
      }

      await user.send(`📩 **Message from ${message.author.tag}:**\n${dmMessage}`);
      await message.reply(`✅ Message sent to ${user.username}`);
    } catch (err) {
      console.error("❌ DM Error:", err);
      await message.reply("⚠️ Could not send the DM.");
    }
  }
});

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => res.send("✅ Bot is alive!"));
app.listen(PORT, () => console.log(`🌐 Keep-alive server running on port ${PORT}`));

const url = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
setInterval(() => {
  fetch(url)
    .then(() => console.log("🔄 Self-ping sent"))
    .catch((err) => console.error("⚠️ Self-ping failed:", err));
}, 5 * 60 * 1000);

client.login(process.env.token);

