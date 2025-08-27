const { Client, GatewayIntentBits, Partials, ActivityType } = require("discord.js");
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

// -------------- READY EVENT --------------
client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  const totalMembers = client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0);
  const rounded = Math.floor(totalMembers / 5) * 5;

  client.user.setPresence({
    activities: [
      { name: "Protecting Sarasota", type: ActivityType.Playing },
      { name: `Over ${rounded} members`, type: ActivityType.Watching }
    ],
    status: "online"
  });
});

// -------------- MESSAGE CREATE --------------
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // ----------- ANTI-PING -----------
  const blockedPings = ["@everyone", "@here"];
  const seniorHighId = "1410356670785392681"; // Senior High Ranking
  const highId = "1410356691442073661"; // High Ranking
  const gamerId = "933875949672472586";
  const vanityId = "927273982024118353";

  if (
    blockedPings.some(p => message.content.includes(p)) ||
    message.mentions.roles.has(seniorHighId) ||
    message.mentions.roles.has(highId) ||
    message.mentions.users.has(gamerId) ||
    message.mentions.users.has(vanityId)
  ) {
    try {
      await message.delete();

      if (message.mentions.users.has(gamerId)) {
        await message.channel.send(
          "⚠️ Don't ping **`Gamer`**."
        );
      } else if (message.mentions.users.has(vanityId)) {
        await message.channel.send(
          "⚠️ Vanity is probably nerding out on ER:LC trolling. Please do not disturb so he can continue making awesome videos!"
        );
      } else if (message.mentions.roles.has(seniorHighId)) {
        await message.channel.send(
          "⚠️ Please do not ping **`Senior High Ranking`** members."
        );
      } else if (message.mentions.roles.has(highId)) {
        await message.channel.send(
          "⚠️ Please do not ping **`High Ranking`** members, as they are probably shift-grinding to get promoted (or give Gamer and Vanity tips on how to.. yk... better)."
        );
      } else {
        await message.channel.send(
          `⚠️ ${message.author}, you are not allowed to use mass pings!`
        );
      }
    } catch (err) {
      console.error("Failed to handle ping:", err);
    }
    return;
  }

  // ----------- GREETING REACTIONS -----------
  const content = message.content.toLowerCase();
  const triggers = ["hi", "hey", "hello", "hiya"];
  if (triggers.some(word => content.includes(word))) {
    try {
      await message.react("🙋‍♂️");
    } catch (err) {
      console.error(err);
    }
  }

  // ----------- !PING COMMAND -----------
  if (message.content.startsWith("!ping")) {
    return message.channel.send(`🏓 Pong! Bot Latency is ${Date.now() - message.createdTimestamp}ms`);
  }

  // ----------- !DM COMMAND -----------
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
              await user.send({ embeds: [embed] });
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

      const textDM = highestRole === "No Role"
        ? dmMessage
        : `<:SarasotaCity:1395103692319101143> | **\`Official\` Message from __Sarasota City Roleplay__:**\n${dmMessage}\n<:SarasotaCity:1395103692319101143> | **${highestRole}**`;

      await user.send(textDM);
      await message.reply(`✅ Message sent to ${user.username}`);
    } catch (err) {
      console.error(err);
      await message.reply("⚠️ Could not send the DM.");
    }
  }
});

// -------------- EXPRESS KEEP-ALIVE --------------
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => res.send("✅ Bot is alive!"));
app.listen(PORT, () => console.log(`🌐 Keep-alive server running on port ${PORT}`));

const url = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
setInterval(() => {
  fetch(url)
    .then(() => console.log("🔄 Self-ping sent"))
    .catch((err) => console.error("⚠️ Self-ping failed:", err));
}, 25 * 1000);

// -------------- LOGIN --------------
client.login(process.env.token);




