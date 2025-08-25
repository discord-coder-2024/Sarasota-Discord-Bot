import { Client, GatewayIntentBits, Partials } from "discord.js";
import express from "express";
import dotenv from "dotenv";

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const triggers = ["hi", "hey", "hello", "hiya"];
  const content = message.content.toLowerCase();

  if (triggers.some((word) => content.includes(word))) {
    try {
      await message.react("🙋‍♂️");
    } catch (err) {
      console.error("❌ Could not react:", err);
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
