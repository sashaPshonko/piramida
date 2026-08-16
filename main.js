const { Highrise, Events } = require('highrise.sdk.dev');
const { generateRid } = require('highrise.sdk.dev/src/utils/Rid');

// --- config ---
const token = 'f9b4d0c89c4914bcb7048f75500995c62bd4347890f29bd12f4cd589d3205480';
const room = '6894ded8f50d604630b5b42d';

/** кто может: кик / бан / войс / невойс */
const ADMIN_USERNAMES = new Set([
    'sasha_pshonko',
    'potap_ogryz',
]);

const DEFAULT_BAN_SECONDS = 3200;
const MOD_HELP = 'кик @nick | бан @nick [сек] | разбан @nick | войс @nick | невойс @nick | включитьвойс | войсстат | бал';

const MOD_ACTIONS = new Set(['кик', 'бан', 'разбан', 'войс', 'невойс']);

const bot = new Highrise({
    Events: [Events.Messages, Events.DirectMessages],
});

/** SDK SendPayloadAndGetResponse ловит любой Error без rid — шлём сами */
function apiRequest(payload, responseType) {
    return new Promise((resolve, reject) => {
        const rid = generateRid();

        const cleanup = () => {
            bot.ws.removeEventListener('message', errorHandler);
            bot.ws.removeEventListener('message', messageHandler);
        };

        const errorHandler = (event) => {
            let data;
            try {
                data = JSON.parse(event.data);
            } catch {
                return;
            }
            if (data._type !== 'Error' || data.rid !== rid) return;
            cleanup();
            reject(Object.assign(new Error(data.message || 'API error'), { raw: data }));
        };

        const messageHandler = (event) => {
            let data;
            try {
                data = JSON.parse(event.data);
            } catch {
                return;
            }
            if (data._type !== responseType || data.rid !== rid) return;
            cleanup();
            resolve(data);
        };

        bot.ws.addEventListener('message', errorHandler);
        bot.ws.addEventListener('message', messageHandler);
        bot.ws.send(JSON.stringify({ ...payload, rid }));
    });
}

function isAdmin(user) {
    return ADMIN_USERNAMES.has(String(user.username || '').toLowerCase());
}

/** "кик @Nick" → { action, username } — ник только с @ */
function parseUserAction(input) {
    const trimmed = String(input || '').trim();
    const [actionRaw, ...rest] = trimmed.split(/\s+/);
    if (!actionRaw || rest.length === 0) return null;

    const action = actionRaw.toLowerCase();
    if (!MOD_ACTIONS.has(action)) return null;

    if (!rest[0]?.startsWith('@')) return null;

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

async function getWalletBalance() {
    const data = await apiRequest({ _type: 'GetWalletRequest' }, 'GetWalletResponse');
    const map = {};
    for (const item of data.content || []) {
        map[item.type] = item.amount;
    }
    return map;
}

function formatBalance(wallet) {
    const gold = wallet.gold ?? 0;
    const voice = wallet.room_voice_tokens ?? 0;
    const boost = wallet.room_boost_tokens ?? 0;
    return `gold: ${gold} | voice: ${voice} | boost: ${boost}`;
}

async function getVoiceStatus() {
    try {
        const data = await apiRequest(
            { _type: 'CheckVoiceChatRequest' },
            'CheckVoiceChatResponse',
        );
        return { ok: true, seconds: Number(data.seconds_left) || 0 };
    } catch (err) {
        const msg = String(err.message || '');
        if (msg.toLowerCase().includes('not voice enabled')) {
            return { ok: false, reason: 'room_disabled' };
        }
        return { ok: false, reason: 'error', message: msg };
    }
}

async function buyVoiceTime() {
    const data = await apiRequest(
        { _type: 'BuyVoiceTimeRequest', payment_method: 'bot_wallet_only' },
        'BuyVoiceTimeResponse',
    );
    return data.result;
}

async function enableRoomVoice() {
    const status = await getVoiceStatus();

    if (status.ok && status.seconds > 0) {
        return { text: `voice уже активен (${status.seconds}с)`, silent: false };
    }

    if (status.reason === 'room_disabled') {
        return {
            text: 'voice не включён в настройках комнаты — включи в приложении, потом снова включитьвойс',
            silent: false,
        };
    }

    const result = await buyVoiceTime();
    const after = await getVoiceStatus();

    if (result === 'success' || (after.ok && after.seconds > 0)) {
        return { text: `voice включён (${after.seconds ?? '?'}с)`, silent: false };
    }
    if (result === 'only_token_bought') {
        return { text: 'токен куплен, но в комнату не применился — нет прав?', silent: false };
    }
    if (result === 'insufficient_funds') {
        return { text: 'не хватает gold на кошельке бота для voice', silent: false };
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
    if (!msg) return false;

    if (msg === 'мод') {
        await reply(MOD_HELP);
        return true;
    }

    if (msg === 'включитьвойс' || msg === 'войсон') {
        try {
            const res = await enableRoomVoice();
            await reply(res.text);
        } catch (err) {
            console.error('[voice] enable:', err?.message || err, err?.raw || '');
            await reply(`ошибка voice: ${err?.message || err}`);
        }
        return true;
    }

    if (msg === 'войсстат') {
        const status = await getVoiceStatus();
        if (status.ok) {
            await reply(status.seconds > 0 ? `voice активен: ${status.seconds}с` : 'voice выключен (0с)');
        } else if (status.reason === 'room_disabled') {
            await reply('voice не включён в настройках комнаты');
        } else {
            await reply(`voice статус: ${status.message || 'ошибка'}`);
        }
        return true;
    }

    if (msg === 'бал') {
        try {
            const wallet = await getWalletBalance();
            await reply(formatBalance(wallet));
        } catch (err) {
            console.error('[wallet]:', err?.message || err);
            await reply(`ошибка баланса: ${err?.message || err}`);
        }
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

bot.on('chatCreate', (user, message) => {
    console.log(`[chat] ${user.username}: ${message}`);
});

bot.on('whisperCreate', async (user, message) => {
    console.log(`[whisper] ${user.username}: ${message}`);
    await handleModMessage(user, message, (text) => bot.whisper.send(user.id, text));
});

bot.login(token, room);
