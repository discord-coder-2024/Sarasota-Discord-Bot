const { Client, GatewayIntentBits } = require("discord.js");
require("dotenv").config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

const sentDMs = new Map(); // Store user DM messages by ID

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
            const sentMessage = await user.send(dmMessage);
            sentDMs.set(sentMessage.id, sentMessage); // store sent message
            message.reply(`✅ Message sent to ${user.tag} (ID: ${sentMessage.id})`);
        } catch (error) {
            console.error(error);
            message.reply("❌ Could not send the DM. Make sure the ID is correct and the user allows DMs.");
        }
    }

    if (command === "!dm-edit") {
        const msgId = args.shift();
        const newMessage = args.join(" ");

        if (!msgId || !newMessage) {
            return message.reply("Usage: `!dm-edit <msg-id> <new-message>`");
        }

        const originalMessage = sentDMs.get(msgId);
        if (!originalMessage) {
            return message.reply("❌ Could not find a sent DM with that ID.");
        }

        try {
            await originalMessage.edit(newMessage);
            message.reply(`✅ DM edited successfully (ID: ${msgId})`);
        } catch (error) {
            console.error(error);
            message.reply("❌ Failed to edit the DM.");
        }
    }
});

client.login(process.env.token);

