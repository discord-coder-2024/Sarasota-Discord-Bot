const { Client, GatewayIntentBits, Partials, EmbedBuilder, ActivityType } = require("discord.js");
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

  client.user.setPresence({
    activities: [{ name: "Protecting Sarasota", type: ActivityType.Custom }],
    status: "online"
  });

  const totalMembers = client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0);
  const rounded = Math.floor(totalMembers / 100) * 100;
  client.user.setActivity(`Over ${rounded} members`, { type: ActivityType.Watching });
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const content = message.content.toLowerCase();
  const triggers = ["hi", "hey", "hello", "hiya"];

  if (triggers.some((word) => content.includes(word))) {
    try {
      await message.react("🙋‍♂️");
    } catch (err) {
      console.error(err);
    }
  }

  if (message.content.startsWith("!ping")) {
    return message.channel.send(`🏓 Pong! Bot Latency is ${Date.now() - message.createdTimestamp}ms`);
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

          if (fetchedMessage.embeds.length) {
            const embed = fetchedMessage.embeds[0];

            let highestRole = "No Role";
            if (message.member) {
              const scrpRoles = message.member.roles.cache
                .filter(r => r.name.startsWith("𝐒𝐂𝐑𝐏 •"))
                .sort((a, b) => b.position - a.position);
              if (scrpRoles.size > 0) highestRole = scrpRoles.first().name;
            }

            if (highestRole === "No Role") {
              return message.reply(`✅ Message sent to ${user.username}`);
            }

            await user.send({ embeds: [embed] });
            return message.reply(`✅ Message sent to ${user.username}`);
          } else if (fetchedMessage.content) {
            dmMessage = fetchedMessage.content;
          } else {
            dmMessage = "[Message has no content]";
          }
        } catch {
          dmMessage = "[Could not fetch message from link]";
        }
      }

      let highestRole = "No Role";
      if (message.member) {
        const scrpRoles = message.member.roles.cache
          .filter(r => r.name.startsWith("𝐒𝐂𝐑𝐏 •"))
          .sort((a, b) => b.position - a.position);
        if (scrpRoles.size > 0) highestRole = scrpRoles.first().name;
      }

      if (highestRole === "No Role") {
        return message.reply(`✅ Message sent to ${user.username}`);
      }

      const textDM = `<:SarasotaCity:1395103692319101143> | **\`Official\` Message from __Sarasota City Roleplay__:**\n${dmMessage}\n<:SarasotaCity:1395103692319101143> | **${highestRole}**`;

      await user.send(textDM);
      await message.reply(`✅ Message sent to ${user.username}`);
    } catch (err) {
      console.error(err);
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



