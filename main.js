const { Highrise, Events } = require('highrise.sdk.dev');

// --- config ---
const token = 'f9b4d0c89c4914bcb7048f75500995c62bd4347890f29bd12f4cd589d3205480';
const room = '6894ded8f50d604630b5b42d';

/** кто может: кик / бан / войс / невойс */
const ADMIN_USERNAMES = new Set([
    'sasha_pshonko',
    'potap_ogryz',
]);

const DEFAULT_BAN_SECONDS = 3200;
const MOD_HELP = 'кик @nick | бан @nick [сек] | разбан @nick | войс @nick | невойс @nick | включитьвойс | войсстат';

const bot = new Highrise({
    Events: [Events.Messages, Events.DirectMessages],
});

function isAdmin(user) {
    return ADMIN_USERNAMES.has(String(user.username || '').toLowerCase());
}

/** "кик @Nick Name" → { action, username } */
function parseUserAction(input) {
    const trimmed = String(input || '').trim();
    const [actionRaw, ...rest] = trimmed.split(/\s+/);
    if (!actionRaw || rest.length === 0) return null;

    const action = actionRaw.toLowerCase();
    const username = rest.join(' ').replace(/^@/, '').trim();
    if (!username) return null;

    return { action, username };
}

async function findPlayerId(username) {
    const players = await bot.room.players.get();
    if (!players?.length) return null;

    const needle = username.toLowerCase();
    const hit = players.find(([user]) => user.username.toLowerCase() === needle);
    return hit?.[0]?.id ?? null;
}

async function getVoiceSeconds() {
    try {
        return await bot.room.voice.get.seconds();
    } catch {
        return 0;
    }
}

async function enableRoomVoice() {
    const before = await getVoiceSeconds();
    if (before > 0) {
        return { text: `voice уже активен (${before}с)`, silent: false };
    }

    const result = await bot.wallet.voice.buy('bot_wallet_priority', 1);
    const after = await getVoiceSeconds();

    if (result === 'success' || after > 0) {
        return { text: `voice включён (${after}с)`, silent: false };
    }
    if (result === 'only_token_bought') {
        return { text: 'токен куплен, но в комнату не применился — нет прав?', silent: false };
    }
    if (result === 'insufficient_funds') {
        return { text: 'не хватает gold на voice', silent: false };
    }
    return { text: `voice buy: ${result ?? '?'}`, silent: false };
}

async function runModAction(action, targetId, extraSeconds) {
    switch (action) {
        case 'кик':
            await bot.player.kick(targetId);
            return { text: `@${targetId}: кикнут`, silent: true };

        case 'бан': {
            const seconds = extraSeconds > 0 ? extraSeconds : DEFAULT_BAN_SECONDS;
            await bot.player.ban(targetId, seconds);
            return { text: `забанен на ${seconds}с`, silent: true };
        }

        case 'разбан':
            await bot.player.unban(targetId);
            return { text: 'разбанен', silent: true };

        case 'войс':
            await bot.player.voice.add(targetId);
            return { text: 'добавлен в voice', silent: true };

        case 'невойс':
            await bot.player.voice.remove(targetId);
            return { text: 'убран из voice', silent: true };

        default:
            return null;
    }
}

async function handleModMessage(sender, rawMessage, reply) {
    if (!isAdmin(sender)) return false;

    const msg = rawMessage.trim().toLowerCase();

    if (msg === 'мод') {
        await reply(MOD_HELP);
        return true;
    }

    if (msg === 'включитьвойс' || msg === 'войсон') {
        try {
            const res = await enableRoomVoice();
            await reply(res.text);
        } catch (err) {
            console.error('[voice] enable:', err?.message || err);
            await reply(`ошибка voice: ${err?.message || err}`);
        }
        return true;
    }

    if (msg === 'войсстат') {
        const sec = await getVoiceSeconds();
        await reply(sec > 0 ? `voice активен: ${sec}с` : 'voice выключен');
        return true;
    }

    const parsed = parseUserAction(rawMessage);
    if (!parsed) return false;

    const { action, username } = parsed;
    let extraSeconds = 0;
    let targetName = username;

    if (action === 'бан') {
        const parts = username.split(/\s+/);
        const maybeSec = Number(parts.at(-1));
        if (parts.length > 1 && Number.isFinite(maybeSec) && maybeSec > 0) {
            extraSeconds = maybeSec;
            parts.pop();
        }
        targetName = parts.join(' ');
    }

    const targetId = await findPlayerId(targetName);
    if (!targetId) {
        await reply(`@${targetName} не в комнате`);
        return true;
    }

    try {
        const result = await runModAction(action, targetId, extraSeconds);
        if (!result) return false;
        if (!result.silent) {
            await reply(`@${targetName}: ${result.text}`);
        }
    } catch (err) {
        console.error(`[mod] ${action} ${targetName}:`, err?.message || err);
        await reply(`ошибка: ${action} @${targetName}`);
    }

    return true;
}

bot.on('ready', (session) => {
    const botId = session?.user_id ?? bot.info.user.id;
    const roomName = session?.room_info?.room_name ?? room;
    console.log(`[bot] online id=${botId}, room=${roomName} (${room})`);
});

// в общий чат — ответ в чат (не шепот); кик/бан без спама
bot.on('chatCreate', async (user, message) => {
    console.log(`[chat] ${user.username}: ${message}`);
    await handleModMessage(user, message, (text) => bot.message.send(text));
});

// в личку боту — ответ шепотом
bot.on('whisperCreate', async (user, message) => {
    console.log(`[whisper] ${user.username}: ${message}`);
    await handleModMessage(user, message, (text) => bot.whisper.send(user.id, text));
});

bot.login(token, room);
