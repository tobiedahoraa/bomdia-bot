const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const cron = require('node-cron');
const ffmpeg = require('ffmpeg-static'); 

process.env.FFMPEG_PATH = ffmpeg; 

const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
    entersState,
    VoiceConnectionStatus
} = require('@discordjs/voice');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

const TOKEN = process.env.TOKEN;
const CHANNEL_ID = '1440186148113879062';
const mensagens = [
    '🌞 Bom dia, grupo!',
    '☕ Bom dia com café e felicidade!',
    '🙏 Que todos tenham dia feliz!',
    '🌻 Bom dia cheio de luz!'
];

function getRandomMensagem() {
    return mensagens[Math.floor(Math.random() * mensagens.length)];
}

function getRandomImage() {
    const files = fs.readdirSync('./imagens');
    const randomFile = files[Math.floor(Math.random() * files.length)];
    return `./imagens/${randomFile}`;
}

function getRandomAudio() {
    const files = fs.readdirSync('./audio');
    const randomFile = files[Math.floor(Math.random() * files.length)];
    return `./audio/${randomFile}`;
}

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content === '!bomdiavoz') {
        const channel = message.member.voice.channel;

        if (!channel) {
            return message.reply('❌ Você precisa estar em um canal de voz!');
        }

        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });
        connection.on('error', console.error);

        try {
            await entersState(connection, VoiceConnectionStatus.Ready, 5000);
        } catch (error) {
            console.error('Erro ao conectar:', error);
            connection.destroy();
            return;
        }

        const player = createAudioPlayer();
        const audioPath = getRandomAudio();

        const resource = createAudioResource(audioPath, { 
            inputType: 'arbitrary',
            inlineVolume: true
        });

        player.play(resource);
        connection.subscribe(player);

        player.on(AudioPlayerStatus.Idle, () => {
            connection.destroy();
        });
    }

    if (message.content === '!bomdia') {
        const imagePath = getRandomImage();

        await message.channel.send({
            content: getRandomMensagem(),
            files: [imagePath]
        });
    }
});

client.once('clientReady', () => {
    console.log(`Bot online como ${client.user.tag}`);

    cron.schedule('0 8 * * *', async () => {
        const channel = await client.channels.fetch(CHANNEL_ID);
        const imagePath = getRandomImage();

        channel.send({
            content: getRandomMensagem(),
            files: [imagePath]
        });
    });
});

client.login(process.env.TOKEN);