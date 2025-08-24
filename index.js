const { Client, GatewayIntentBits } = require("discord.js");
require("dotenv").config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.once("ready", () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    const args = message.content.trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if (command === "!dm") {
        const userId = args.shift();
        const dmMessage = args.join(" ");

        if (!userId || !dmMessage) {
            return message.reply("Usage: `!dm <userID> <message>`");
        }

        try {
            const user = await client.users.fetch(userId);
            await user.send(dmMessage);
            message.reply(`✅ Message sent to ${user.tag}`);
        } catch (error) {
            console.error(error);
            message.reply("❌ Could not send the DM. Make sure the ID is correct and the user allows DMs.");
        }
    }
});

client.login(process.env.token);
