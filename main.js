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

async function runModAction(action, targetId, extraSeconds) {
    switch (action) {
        case 'кик':
            await bot.player.kick(targetId);
            return 'кикнут';

        case 'бан': {
            const seconds = extraSeconds > 0 ? extraSeconds : DEFAULT_BAN_SECONDS;
            await bot.player.ban(targetId, seconds);
            return `забанен на ${seconds}с`;
        }

        case 'разбан':
            await bot.player.unban(targetId);
            return 'разбанен';

        case 'войс':
            await bot.player.voice.add(targetId);
            return 'добавлен в voice';

        case 'невойс':
            await bot.player.voice.remove(targetId);
            return 'убран из voice';

        default:
            return null;
    }
}

async function handleModMessage(sender, rawMessage, reply) {
    if (!isAdmin(sender)) return false;

    const parsed = parseUserAction(rawMessage);
    if (!parsed) {
        if (rawMessage.trim().toLowerCase() === 'мод') {
            await reply(
                sender.id,
                'кик @nick | бан @nick [сек] | разбан @nick | войс @nick | невойс @nick',
            );
            return true;
        }
        return false;
    }

    const { action, username } = parsed;
    let extraSeconds = 0;

    if (action === 'бан') {
        const parts = username.split(/\s+/);
        const maybeSec = Number(parts.at(-1));
        if (parts.length > 1 && Number.isFinite(maybeSec) && maybeSec > 0) {
            extraSeconds = maybeSec;
            parts.pop();
        }
        parsed.username = parts.join(' ');
    }

    const targetId = await findPlayerId(parsed.username);
    if (!targetId) {
        await reply(sender.id, `@${parsed.username} не в комнате`);
        return true;
    }

    try {
        const result = await runModAction(action, targetId, extraSeconds);
        if (!result) return false;
        await reply(sender.id, `@${parsed.username}: ${result}`);
    } catch (err) {
        console.error(`[mod] ${action} ${parsed.username}:`, err?.message || err);
        await reply(sender.id, `ошибка: ${action} @${parsed.username}`);
    }

    return true;
}

bot.on('ready', (session) => {
    const botId = session?.user_id ?? bot.info.user.id;
    const roomName = session?.room_info?.room_name ?? room;
    console.log(`[bot] online id=${botId}, room=${roomName} (${room})`);
});

bot.on('chatCreate', async (user, message) => {
    console.log(`[chat] ${user.username}: ${message}`);
    await handleModMessage(user, message, (id, text) => bot.whisper.send(id, text));
});

bot.on('whisperCreate', async (user, message) => {
    console.log(`[dm] ${user.username}: ${message}`);
    await handleModMessage(user, message, (id, text) => bot.whisper.send(id, text));
});

bot.login(token, room);
