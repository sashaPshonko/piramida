const { Highrise, Events, Facing, Emotes, GoldBars, Reactions } = require("highrise.sdk.dev");
// const { GoldBars } = require("highrise.sdk");
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

const token = "f9b4d0c89c4914bcb7048f75500995c62bd4347890f29bd12f4cd589d3205480";
const room = "6894ded8f50d604630b5b42d";
const ownerID = "https://high.rs/room?id=68529363d23340447bc0b10c&invite_id=6878f0cda2765ebef404143f"
//https://high.rs/room?id=689317d9a548bc0b2f8c8e0c&invite_id=68931c068b70ad12b05d5853
//https://high.rs/room?id=6894ded8f50d604630b5b42d&invite_id=6894e052792a83d4a326501f
const userCord = new Map
const userEmote = new Map

const razdacha = {
    isRunning: false,
}

const emotes = [
    { name: "Zombie", id: "idle_zombie", duration: 28.754937, is_free: false },
    { name: "Relaxed", id: "idle_layingdown2", duration: 21.546653, is_free: false },
    { name: "Attentive", id: "idle_layingdown", duration: 24.585168, is_free: false },
    { name: "Sleepy", id: "idle-sleep", duration: 22.620446, is_free: false },
    { name: "Pouty Face", id: "idle-sad", duration: 24.377214, is_free: false },
    { name: "Posh", id: "idle-posh", duration: 21.851256, is_free: false },
    { name: "Sleepy", id: "idle-loop-tired", duration: 21.959007, is_free: false },
    { name: "Tap Loop", id: "idle-loop-tapdance", duration: 6.261593, is_free: false },
    { name: "Sit", id: "idle-loop-sitfloor", duration: 22.321055, is_free: true },
    { name: "Shy", id: "idle-loop-shy", duration: 16.47449, is_free: false },
    { name: "Bummed", id: "idle-loop-sad", duration: 6.052999, is_free: false },
    { name: "Chillin'", id: "idle-loop-happy", duration: 18.798322, is_free: false },
    { name: "Annoyed", id: "idle-loop-annoyed", duration: 17.058522, is_free: false },
    { name: "Aerobics", id: "idle-loop-aerobics", duration: 8.507535, is_free: false },
    { name: "Ponder", id: "idle-lookup", duration: 22.339865, is_free: false },
    { name: "Hero Pose", id: "idle-hero", duration: 21.877099, is_free: false },
    { name: "Relaxing", id: "idle-floorsleeping2", duration: 16, is_free: false },
    { name: "Cozy Nap", id: "idle-floorsleeping", duration: 13, is_free: false },
    { name: "Enthused", id: "idle-enthusiastic", duration: 15.941537, is_free: true },
    { name: "Feel The Beat", id: "idle-dance-headbobbing", duration: 25.367458, is_free: false },
    { name: "Irritated", id: "idle-angry", duration: 25.427848, is_free: false },
    { name: "Yes", id: "emote-yes", duration: 2.565001, is_free: true },
    { name: "I Believe I Can Fly", id: "emote-wings", duration: 13.134487, is_free: false },
    { name: "The Wave", id: "emote-wave", duration: 2.690873, is_free: true },
    { name: "Tired", id: "emote-tired", duration: 4.61063, is_free: true },
    { name: "Think", id: "emote-think", duration: 3.691104, is_free: false },
    { name: "Theatrical", id: "emote-theatrical", duration: 8.591869, is_free: false },
    { name: "Tap Dance", id: "emote-tapdance", duration: 11.057294, is_free: false },
    { name: "Super Run", id: "emote-superrun", duration: 6.273226, is_free: false },
    { name: "Super Punch", id: "emote-superpunch", duration: 3.751054, is_free: false },
    { name: "Sumo Fight", id: "emote-sumo", duration: 10.868834, is_free: false },
    { name: "Thumb Suck", id: "emote-suckthumb", duration: 4.185944, is_free: false },
    { name: "Splits Drop", id: "emote-splitsdrop", duration: 4.46931, is_free: false },
    { name: "Snowball Fight!", id: "emote-snowball", duration: 5.230467, is_free: true },
    { name: "Snow Angel", id: "emote-snowangel", duration: 6.218627, is_free: true },
    { name: "Shy", id: "emote-shy", duration: 4.477567, is_free: true },
    { name: "Secret Handshake", id: "emote-secrethandshake", duration: 3.879024, is_free: false },
    { name: "Sad", id: "emote-sad", duration: 5.411073, is_free: true },
    { name: "Rope Pull", id: "emote-ropepull", duration: 8.769656, is_free: false },
    { name: "Roll", id: "emote-roll", duration: 3.560517, is_free: false },
    { name: "ROFL!", id: "emote-rofl", duration: 6.314731, is_free: false },
    { name: "Robot", id: "emote-robot", duration: 7.607362, is_free: false },
    { name: "Rainbow", id: "emote-rainbow", duration: 2.813373, is_free: false },
    { name: "Proposing", id: "emote-proposing", duration: 4.27888, is_free: false },
    { name: "Peekaboo!", id: "emote-peekaboo", duration: 3.629867, is_free: false },
    { name: "Peace", id: "emote-peace", duration: 5.755004, is_free: false },
    { name: "Panic", id: "emote-panic", duration: 2.850966, is_free: false },
    { name: "No", id: "emote-no", duration: 2.703034, is_free: true },
    { name: "Ninja Run", id: "emote-ninjarun", duration: 4.754721, is_free: false },
    { name: "Night Fever", id: "emote-nightfever", duration: 5.488424, is_free: false },
    { name: "Monster Fail", id: "emote-monster_fail", duration: 4.632708, is_free: false },
    { name: "Model", id: "emote-model", duration: 6.490173, is_free: true },
    { name: "Level Up!", id: "emote-levelup", duration: 6.0545, is_free: false },
    { name: "Amused", id: "emote-laughing2", duration: 5.056641, is_free: false },
    { name: "Laugh", id: "emote-laughing", duration: 2.69161, is_free: true },
    { name: "Kiss", id: "emote-kiss", duration: 2.387175, is_free: true },
    { name: "Super Kick", id: "emote-kicking", duration: 4.867992, is_free: false },
    { name: "Jump", id: "emote-jumpb", duration: 3.584234, is_free: false },
    { name: "Judo Chop", id: "emote-judochop", duration: 2.427442, is_free: false },
    { name: "Imaginary Jetpack", id: "emote-jetpack", duration: 16.759457, is_free: false },
    { name: "Hug Yourself", id: "emote-hugyourself", duration: 4.992751, is_free: false },
    { name: "Sweating", id: "emote-hot", duration: 4.353037, is_free: true },
    { name: "Hello", id: "emote-hello", duration: 2.734844, is_free: true },
    { name: "Harlem Shake", id: "emote-harlemshake", duration: 13.558597, is_free: false },
    { name: "Happy", id: "emote-happy", duration: 3.483462, is_free: false },
    { name: "Handstand", id: "emote-handstand", duration: 4.015678, is_free: false },
    { name: "Greedy Emote", id: "emote-greedy", duration: 4.639828, is_free: true },
    { name: "Moonwalk", id: "emote-gordonshuffle", duration: 8.052307, is_free: false },
    { name: "Ghost Float", id: "emote-ghost-idle", duration: 18.5, is_free: false },
    { name: "Gangnam Style", id: "emote-gangnam", duration: 7.275486, is_free: false },
    { name: "Faint", id: "emote-fainting", duration: 18.423499, is_free: false },
    { name: "Clumsy", id: "emote-fail2", duration: 6.475972, is_free: false },
    { name: "Fall", id: "emote-fail1", duration: 5.617942, is_free: false },
    { name: "Face Palm", id: "emote-exasperatedb", duration: 2.722748, is_free: true },
    { name: "Exasperated", id: "emote-exasperated", duration: 2.367483, is_free: false },
    { name: "Elbow Bump", id: "emote-elbowbump", duration: 3.799768, is_free: false },
    { name: "Disco", id: "emote-disco", duration: 5.366973, is_free: false },
    { name: "Blast Off", id: "emote-disappear", duration: 6.195985, is_free: false },
    { name: "Faint Drop", id: "emote-deathdrop", duration: 3.762728, is_free: false },
    { name: "Collapse", id: "emote-death2", duration: 4.855549, is_free: false },
    { name: "Revival", id: "emote-death", duration: 6.615967, is_free: false },
    { name: "Dab", id: "emote-dab", duration: 2.717871, is_free: false },
    { name: "Curtsy", id: "emote-curtsy", duration: 2.425714, is_free: true },
    { name: "Confusion", id: "emote-confused", duration: 8.578827, is_free: true },
    { name: "Cold", id: "emote-cold", duration: 3.664348, is_free: false },
    { name: "Charging", id: "emote-charging", duration: 8.025079, is_free: true },
    { name: "Bunny Hop", id: "emote-bunnyhop", duration: 12.380685, is_free: false },
    { name: "Bow", id: "emote-bow", duration: 3.344036, is_free: true },
    { name: "Boo", id: "emote-boo", duration: 4.501502, is_free: false },
    { name: "Home Run!", id: "emote-baseball", duration: 7.254841, is_free: false },
    { name: "Falling Apart", id: "emote-apart", duration: 4.809542, is_free: false },
    { name: "Thumbs Up", id: "emoji-thumbsup", duration: 2.702369, is_free: true },
    { name: "Point", id: "emoji-there", duration: 2.059095, is_free: false },
    { name: "Sneeze", id: "emoji-sneeze", duration: 2.996694, is_free: false },
    { name: "Smirk", id: "emoji-smirking", duration: 4.823158, is_free: false },
    { name: "Sick", id: "emoji-sick", duration: 5.070367, is_free: false },
    { name: "Gasp", id: "emoji-scared", duration: 3.008487, is_free: false },
    { name: "Punch", id: "emoji-punch", duration: 1.755783, is_free: false },
    { name: "Pray", id: "emoji-pray", duration: 4.503179, is_free: false },
    { name: "Stinky", id: "emoji-poop", duration: 4.795735, is_free: false },
    { name: "Naughty", id: "emoji-naughty", duration: 4.277602, is_free: false },
    { name: "Mind Blown", id: "emoji-mind-blown", duration: 2.397167, is_free: false },
    { name: "Lying", id: "emoji-lying", duration: 6.313748, is_free: false },
    { name: "Levitate", id: "emoji-halo", duration: 5.837754, is_free: false },
    { name: "Fireball Lunge", id: "emoji-hadoken", duration: 2.723709, is_free: false },
    { name: "Give Up", id: "emoji-give-up", duration: 5.407888, is_free: false },
    { name: "Tummy Ache", id: "emoji-gagging", duration: 5.500202, is_free: true },
    { name: "Stunned", id: "emoji-dizzy", duration: 4.053049, is_free: false },
    { name: "Sob", id: "emoji-crying", duration: 3.696499, is_free: false },
    { name: "Clap", id: "emoji-clapping", duration: 2.161757, is_free: false },
    { name: "Raise The Roof", id: "emoji-celebrate", duration: 3.412258, is_free: true },
    { name: "Arrogance", id: "emoji-arrogance", duration: 6.869441, is_free: false },
    { name: "Angry", id: "emoji-angry", duration: 5.760023, is_free: true },
    { name: "Vogue Hands", id: "dance-voguehands", duration: 9.150634, is_free: false },
    { name: "Savage Dance", id: "dance-tiktok8", duration: 10.938702, is_free: true },
    { name: "Don't Start Now", id: "dance-tiktok2", duration: 10.392353, is_free: true },
    { name: "Smoothwalk", id: "dance-smoothwalk", duration: 6.690023, is_free: false },
    { name: "Ring on It", id: "dance-singleladies", duration: 21.191372, is_free: false },
    { name: "Let's Go Shopping", id: "dance-shoppingcart", duration: 4.316035, is_free: true },
    { name: "Russian Dance", id: "dance-russian", duration: 10.252905, is_free: true },
    { name: "Penny's Dance", id: "dance-pennywise", duration: 0.6, is_free: true },
    { name: "Orange Juice Dance", id: "dance-orangejustice", duration: 5.65, is_free: false },
    { name: "Rock Out", id: "dance-metal", duration: 15.076377, is_free: false },
    { name: "Macarena", id: "dance-macarena", duration: 12.214141, is_free: true },
    { name: "Hands in the Air", id: "dance-handsup", duration: 22.283413, is_free: false },
    { name: "Duck Walk", id: "dance-duckwalk", duration: 11.748784, is_free: false },
    { name: "K-Pop Dance", id: "dance-blackpink", duration: 7.150958, is_free: true },
    { name: "Push Ups", id: "dance-aerobics", duration: 8.796402, is_free: false },
    { name: "Hyped", id: "emote-hyped", duration: 7.492423, is_free: true },
    { name: "Jinglebell", id: "dance-jinglebell", duration: 11, is_free: true },
    { name: "Nervous", id: "idle-nervous", duration: 21.714221, is_free: true },
    { name: "Toilet", id: "idle-toilet", duration: 32.174447, is_free: true },
    { name: "Attention", id: "emote-attention", duration: 4.401206, is_free: false },
    { name: "Astronaut", id: "emote-astronaut", duration: 13.791175, is_free: true },
    { name: "Dance Zombie", id: "dance-zombie", duration: 12.922772, is_free: true },
    { name: "Ghost", id: "emoji-ghost", duration: 3.472759, is_free: false },
    { name: "Heart Eyes", id: "emote-hearteyes", duration: 4.034386, is_free: true },
    { name: "Swordfight", id: "emote-swordfight", duration: 5.914365, is_free: true },
    { name: "TimeJump", id: "emote-timejump", duration: 4.007305, is_free: true },
    { name: "Snake", id: "emote-snake", duration: 5.262578, is_free: true },
    { name: "Heart Fingers", id: "emote-heartfingers", duration: 4.001974, is_free: true },
    { name: "Heart Shape", id: "emote-heartshape", duration: 6.232394, is_free: false },
    { name: "Hug", id: "emote-hug", duration: 2.5, is_free: false },
    { name: "Eyeroll", id: "emoji-eyeroll", duration: 3.020264, is_free: false },
    { name: "Embarrassed", id: "emote-embarrassed", duration: 7.414283, is_free: false },
    { name: "Float", id: "emote-float", duration: 8.995302, is_free: true },
    { name: "Telekinesis", id: "emote-telekinesis", duration: 10.492032, is_free: true },
    { name: "Sexy dance", id: "dance-sexy", duration: 12.30883, is_free: false },
    { name: "Puppet", id: "emote-puppet", duration: 16.325823, is_free: false },
    { name: "Fighter idle", id: "idle-fighter", duration: 17.19123, is_free: false },
    { name: "Penguin dance", id: "dance-pinguin", duration: 11.58291, is_free: true },
    { name: "Creepy puppet", id: "dance-creepypuppet", duration: 6.416121, is_free: true },
    { name: "Sleigh", id: "emote-sleigh", duration: 11.333165, is_free: true },
    { name: "Maniac", id: "emote-maniac", duration: 4.906886, is_free: true },
    { name: "Energy Ball", id: "emote-energyball", duration: 7.575354, is_free: true },
    { name: "Singing", id: "idle_singing", duration: 10.260182, is_free: true },
    { name: "Frog", id: "emote-frog", duration: 14.55257, is_free: true },
    { name: "Cute", id: "emote-cute", duration: 6.170464, is_free: true },
    { name: "TikTok Dance 9", id: "dance-tiktok9", duration: 11.892918, is_free: true },
    { name: "Weird Dance", id: "dance-weird", duration: 21.556237, is_free: true },
    { name: "TikTok Dance 10", id: "dance-tiktok10", duration: 8.225648, is_free: true },
    { name: "Pose 7", id: "emote-pose7", duration: 4.655283, is_free: true },
    { name: "Pose 8", id: "emote-pose8", duration: 4.808806, is_free: true },
    { name: "Casual Dance", id: "idle-dance-casual", duration: 9.079756, is_free: true },
    { name: "Pose 1", id: "emote-pose1", duration: 2.825795, is_free: true },
    { name: "Pose 3", id: "emote-pose3", duration: 5.10562, is_free: true },
    { name: "Pose 5", id: "emote-pose5", duration: 4.621532, is_free: true },
    { name: "Cutey", id: "emote-cutey", duration: 3.26032, is_free: true },
    { name: "Punk Guitar", id: "emote-punkguitar", duration: 9.365807, is_free: true },
    { name: "Zombie Run", id: "emote-zombierun", duration: 9.182984, is_free: false },
    { name: "Fashionista", id: "emote-fashionista", duration: 5.606485, is_free: true },
    { name: "Gravity", id: "emote-gravity", duration: 8.955966, is_free: true },
    { name: "Ice Cream Dance", id: "dance-icecream", duration: 14.769573, is_free: true },
    { name: "Wrong Dance", id: "dance-wrong", duration: 12.422389, is_free: true },
    { name: "UwU", id: "idle-uwu", duration: 24.761968, is_free: true },
    { name: "TikTok Dance 4", id: "idle-dance-tiktok4", duration: 15.500708, is_free: true },
    { name: "Advanced Shy", id: "emote-shy2", duration: 4.989278, is_free: true },
    { name: "Anime Dance", id: "dance-anime", duration: 8.46671, is_free: true },
    { name: "Kawaii", id: "dance-kawai", duration: 10.290789, is_free: true },
    { name: "Scritchy", id: "idle-wild", duration: 26.422824, is_free: true },
    { name: "Ice Skating", id: "emote-iceskating", duration: 7.299156, is_free: true },
    { name: "SurpriseBig", id: "emote-pose6", duration: 5.375124, is_free: true },
    { name: "Celebration Step", id: "emote-celebrationstep", duration: 3.353703, is_free: true },
    { name: "Creepycute", id: "emote-creepycute", duration: 7.902453, is_free: true },
    { name: "Frustrated", id: "emote-frustrated", duration: 5.584622, is_free: false },
    { name: "Pose 10", id: "emote-pose10", duration: 3.989871, is_free: true },
    { name: "Relaxed", id: "sit-relaxed", duration: 29.889858, is_free: false },
    { name: "Laid Back", id: "sit-open", duration: 25, is_free: false },
    { name: "Slap", id: "emote-slap", duration: 2.724945, is_free: false },
    { name: "Boxer", id: "emote-boxer", duration: 5.555702, is_free: true },
    { name: "Head Blowup", id: "emote-headblowup", duration: 11.667537, is_free: true },
    { name: "Tiktok7", id: "idle-dance-tiktok7", duration: 12.956484, is_free: false },
    { name: "Shrink", id: "emote-shrink", duration: 8.738784, is_free: false },
    { name: "Ditzy Pose", id: "emote-pose9", duration: 4.583117, is_free: true },
    { name: "Teleporting", id: "emote-teleporting", duration: 11.7676, is_free: true },
    { name: "Touch", id: "dance-touch", duration: 11.7, is_free: true },
    { name: "Air Guitar", id: "idle-guitar", duration: 13.229398, is_free: true },
    { name: "This Is For You", id: "emote-gift", duration: 5.8, is_free: true },
    { name: "Push it", id: "dance-employee", duration: 8, is_free: true },
    { name: "Sweet Smooch", id: "emote-kissing", duration: 6, is_free: false },
    { name: "Wop Dance", id: "dance-tiktok11", duration: 11, is_free: true },
    { name: "Cute Salute", id: "emote-cutesalute", duration: 3, is_free: true },
    { name: "At Attention", id: "emote-salute", duration: 3, is_free: true },
    { name: "At Adaion", id: "dance-hipshake", duration: 12, is_free: true },
];

function findEmoteIndexById(id) {
    return emotes.findIndex(emote => emote.id === id);
}

const emoteWords = [
    {
        names: [
            'relax', 'relaxing', 'релакс', 'релаксинг'
        ],
        id: 'idle-floorsleeping2',
        index: findEmoteIndexById('idle-floorsleeping2'),
        duration: 16
    },
    {
        names: [
            'гост', 'ghost', 'ghostfloat', 'ghost float'
        ],
        id: 'emote-ghost-idle',
        index: findEmoteIndexById('emote-ghost-idle'),
        duration: 18.5
    },
    {
        names: [
            'smooch', 'sweetsmooch', 'kiss', 'кисс'
        ],
        id: "emote-kissing",
        index: findEmoteIndexById("emote-kissing"),
        duration: 6
    },
    {
        names: [
            'cozy', 'cozy nap', 'cozynap', 'кози'
        ],
        id: "idle-floorsleeping",
        index: findEmoteIndexById("idle-floorsleeping"),
        duration: 13
    },
    {
        names: [
            'orange', 'orange juice', 'orange juice dance', 'orangejuice', 'orangejuicedance', 'оранж'
        ],
        id: "dance-orangejustice",
        index: findEmoteIndexById("dance-orangejustice"),
        duration: 5.65
    },
    {
        names: [
            'laid', 'laidback', 'laid back', 'лэйд', 'лайд', 'лэид', 'лаид', 'лайд', 'лэйдбэк', 'лайдбэк', 'лэидбэк', 'лаидбэк', 'лайдбэк', 'лэйдбек', 'лайдбек', 'лэидбек', 'лаидбек', 'лайдбек'
        ],
        id: "sit-open",
        index: findEmoteIndexById("sit-open"),
        duration: 25
    },
    {
        names: [
            'хипшейк', 'хип шейк', 'hipshake', 'hip shake'
        ],
        id: "dance-hipshake",
        index: findEmoteIndexById("dance-hipshake"),
        duration: 12
    },
    {
        names: [
            'hug', 'хаг', 'обнять'
        ],
        id: "emote-hug",
        index: findEmoteIndexById("emote-hug"),
        duration: 2.5
    },
]

const bot = new Highrise({
    Events: [Events.Messages, Events.Movements, Events.Leaves, Events.DirectMessages, Events.Joins, Events.Tips],
});

async function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}
function getRandomDelayInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

setInterval(async () => {
    for (const [userID, emoteData] of userEmote) {
        const duration = emotes[emoteData.id].duration
        if ((Date.now() - emoteData.time) / 1000 >= emotes[emoteData.id].duration && !emoteData.sync) {
            userEmote.set(userID, { id: emoteData.id, time: Date.now() })
            await bot.player.emote(userID, emotes[emoteData.id].id)
                .catch(e => userEmote.delete(userID))
        }
    }
}, 0);
function getRandomDollarEmojis() {
  const dollarEmojis = ['💵', '💲', '💰', '🤑', '💸']; // Разные эмодзи "доллара"
  const randomCount = Math.floor(Math.random() * 5) + 1; // От 1 до 5
  let result = '';

  for (let i = 0; i < randomCount; i++) {
    const randomEmoji = dollarEmojis[Math.floor(Math.random() * dollarEmojis.length)];
    result += randomEmoji;
  }

  return result;
}

// setInterval(async () => {

//  if (razdacha.isRunning) return
//         const players = await bot.room.players.get().catch(console.error);
//         const playerIDs = players.map(item => item[0].id);
//         if (playerIDs.length < 20) return
//         for (const id of playerIDs) {
//             if (id === '6835fa9c903951782e5c18e4') continue
//             try {
//                 await bot.player.react(id, Reactions.Clap).catch(e => console.error(e));
//             } catch (error) {
//                 console.error(error)
//             }
//         }
//         bot.message.send(`\nWhoever drops 10g after the word START will receive 20g}`).catch(console.error);
//         bot.message.send(`\nПервый, кто скинет 10г после слова START - получит 20г}`).catch(console.error);
//         await delay(getRandomDelayInRange(5000, 8000))
//         razdacha.isRunning = true
//         await bot.message.send(`\nSTART`).catch(console.error);
// }, 30000)

bot.on("ready", async () => {
    bot.move.walk(10, 3, 0, Facing.FrontLeft)
    //   await bot.player.tip('67a2b617a337e1b57da53360', 5);
})

bot.on("playerTip", async (sender, receiver, tip) => {
    if (tip.amount !== 10 || receiver.id !== '6835fa9c903951782e5c18e4' || !razdacha.isRunning) return
    razdacha.isRunning = false
    await delay(2000)
    await bot.message.send(`\n@${sender.username} got 20g`).catch(console.error);
    await bot.player.tip(sender.id, 10)
    await bot.player.tip(sender.id, 10)
})
//привет! это конкурс, где можно выиграть gold. нужно успеть первому закинуть боту по его команде 10г, чтобы получить 30г
bot.on('playerJoin', async (user) => {
    await bot.whisper.send(user.id, `\n@${user.username}, hi! this is a contest where you can win gold. you need to be the first to give the bot 10g on its command to get 20g`).catch(console.error);
    await bot.whisper.send(user.id, `\n@${user.username}, привет! это конкурс, где можно выиграть gold. нужно успеть первому закинуть боту по его команде 10г, чтобы получить 20г`).catch(console.error);
    await bot.player.react(user.id, Reactions.Heart).catch(e => console.error(e));
    await bot.player.voice.add(user.id).catch(e => console.error(e));
});

function getRandomElement(array) {
  if (!Array.isArray(array) || array.length === 0) {
    throw new Error("Input must be a non-empty array");
  }
  
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

bot.on("whisperCreate", async (user, message) => {
const msg = message.toLowerCase();

    console.log(`${user.username}: ${msg}`)
    if (msg === '0') {
        userEmote.delete(user.id)
        return
    }

    if (user.id !== "67f8078652db7b9f7a0e68fb" && user.id !== "67a2b617a337e1b57da53360") return
    if (msg === 'баланс' || msg === 'бал') {
        const balance = await bot.wallet.gold.get().catch(console.error)
        bot.whisper.send(user.id, `баланс - ${balance}`).catch(e => console.error(e));
        return
    }
    if (msg === 'старт') {
        if (razdacha.isRunning) return
        razdacha.isRunning = true
        const players = await bot.room.players.get().catch(console.error);
        const playerIDs = players.map(item => item[0].id);
        const totalPlayers = playerIDs.length;
        for (const id of playerIDs) {
            if (id === '6835fa9c903951782e5c18e4') continue
            try {
                await bot.player.react(id, Reactions.Clap).catch(e => console.error(e));
            } catch (error) {
                console.error(error)
            }
        }
        bot.message.send(`\nWhoever drops 10g after the word ✅START✅ will receive 20g`).catch(console.error);
        bot.message.send(`\nПервый, кто скинет 10г после слова ✅START✅ - получит 20г`).catch(console.error);
        await delay(getRandomDelayInRange(5000, 8000))
        if (Math.random() < 0.5) {
            const words = ['✅STRAT✅', "✅STSRT✅", "✅STYRT✅", "✅SPART✅", "✅STUPID✅"]
            const word = getRandomElement(words)
            await bot.message.send(`\n${word}`).catch(console.error);
            await delay(getRandomDelayInRange(5000, 8000))
            if (Math.random() < 0.5) {
                const words = ['✅STRAT✅', "✅STSRT✅", "✅STYRT✅", "✅SPART✅", "✅STUPID✅"]
                const word = getRandomElement(words)
                await bot.message.send(`\n${word}`).catch(console.error);
                await delay(getRandomDelayInRange(5000, 8000))
            }
        }
        await bot.message.send(`\n✅START✅`).catch(console.error);
    }

          const price = extractNumberFromString(msg)
  if (price !== 0) {
    try {
        const balance = await bot.wallet.gold.get().catch(console.error);
        console.log('Current balance:', balance);
        
        if (!balance) {
            console.error('Failed to get balance');
            return;
        }

        const players = await bot.room.players.get().catch(console.error);
        if (!players || !players.length) {
            console.error('No players found');
            return;
        }

        const playerIDs = players.map(item => item[0].id);
        const totalPlayers = playerIDs.length;

        // Проверка баланса и отправка чаевых
        let barType, requiredAmount;
        
        switch(price) {
            case 1:
                barType = GoldBars.BAR_1;
                requiredAmount = totalPlayers * 2;
                break;
            case 5:
                barType = GoldBars.BAR_5;
                requiredAmount = totalPlayers * 6;
                break;
            case 10:
                barType = GoldBars.BAR_10;
                requiredAmount = totalPlayers * 11;
                break;
            default:
                console.error('Invalid price value');
                return;
        }

        if (balance < requiredAmount) {
            await bot.message.send(`Не хватает золота! Баланс: ${balance}, требуется: ${requiredAmount}`).catch(console.error);
            return;
        }

        // Отправка чаевых всем игрокам
let successCount = 0;
let failedCount = 0;

for (const id of playerIDs) {
        if (user.id === "67f8078652db7b9f7a0e68fb" || user.id === "67a2b617a337e1b57da53360" || user.id === bot.info.user.id) continue
    try {
        await bot.player.tip(id, barType);
        console.log(`Sent tip to ${id}`);
        successCount++;
    } catch (error) {
        console.error(`Failed to tip player ${id}:`, error);
        failedCount++;
    }
}

    } catch (error) {
        console.error('Error in tipping process:', error);
    }
}

 const usData = parseUserAction(message)
    if (usData) {
        const players = await bot.room.players.get().catch(console.error);
        if (!players) return
        const partner = players.find(player => player[0].username === usData.username)
        if (!partner) {
            return
        }
        const id = partner[0].id
        switch(usData.action) {
            case 'кик':
                await bot.player.kick(id).catch(e => console.error(e));
            case 'бан':
                await bot.player.ban(id, 3200).catch(e => console.error(e));
            case 'модер':
                await bot.player.moderator.add(id).catch(e => console.error(e));
            case 'диз':
                await bot.player.designer.add(id).catch(e => console.error(e));
            case 'немодер':
                await bot.player.moderator.remove(id).catch(e => console.error(e));
            case 'недиз':
                await bot.player.designer.remove(id).catch(e => console.error(e));
            case 'войс':
                await bot.player.voice.add(id).catch(e => console.error(e));
            case 'невойс':
                await bot.player.voice.remove(user.id).catch(e => console.error(e));

        }
        return
    }



});

function parseUserAction(inputString) {
    // Удаляем пробелы в начале и конце, затем разбиваем по пробелам
    const trimmedInput = inputString.trim();
    const [action, ...rest] = trimmedInput.split(/\s+/);
    
    if (!action || rest.length === 0) {
        return null
    }

    // Объединяем остаток, удаляем @ и пробелы в имени пользователя
    const username = rest.join(' ').replace(/^@/, '').trim();

    return { action, username };
}

bot.on("chatCreate", async (user, message) => {
    const msg = message.toLowerCase();

    console.log(`${user.username}: ${msg}`)
    if (msg === '0') {
        userEmote.delete(user.id)
        return
    }//67f8078652db7b9f7a0e68fb
    // if (msg === 'ой') {
    //     await bot.player.tip('67f8078652db7b9f7a0e68fb', 50)
    // }


    // Удаляем восклицательный знак (если он есть) для поиска
    const foundEmote = emoteWords.find(emote =>
        emote.names.some(name =>
            name.toLowerCase() === msg.toLowerCase()
        )
    );

    // Если нашли - возвращаем id, duration и флаг восклицательного знака
    if (foundEmote) {
        await bot.player.emote(user.id, foundEmote.id)
            .catch(e => console.error('Ошибка воспроизведения эмоции:', e))
            .then(() => userEmote.set(user.id, { id: foundEmote.index, time: Date.now() }))
        return
    }
    if (/^\s*\d+\s*$/.test(msg)) {
        const index = parseInt(msg) - 1;
        if (!isNaN(index) && index >= 0 && index < emotes.length) {
            await bot.player.emote(user.id, emotes[index].id)
                .catch(e => console.error('Ошибка воспроизведения эмоции:', e))
                .then(() => userEmote.set(user.id, { id: index, time: Date.now() }))
        }
        return
    }
    if (user.id !== "67f8078652db7b9f7a0e68fb" && user.id !== "67a2b617a337e1b57da53360") return
    if (msg === 'баланс' || msg === 'бал') {
        const balance = await bot.wallet.gold.get().catch(console.error)
        bot.message.send(`баланс - ${balance}`).catch(console.error);
        return
    }
    if (msg === 'старт') {
        if (razdacha.isRunning) return
        razdacha.isRunning = true
        const players = await bot.room.players.get().catch(console.error);
        const playerIDs = players.map(item => item[0].id);
        const totalPlayers = playerIDs.length;
        for (const id of playerIDs) {
            if (id === '6835fa9c903951782e5c18e4') continue
            try {
                await bot.player.react(id, Reactions.Clap).catch(e => console.error(e));
            } catch (error) {
                console.error(error)
            }
        }
        bot.message.send(`\nWhoever drops 10g after the word ✅START✅ will receive 20g`).catch(console.error);
        bot.message.send(`\nПервый, кто скинет 10г после слова ✅START✅ - получит 20г`).catch(console.error);
        await delay(getRandomDelayInRange(5000, 8000))
        if (Math.random() < 0.5) {
            const words = ['✅STRAT✅', "✅STSRT✅", "✅STYRT✅", "✅SPART✅", "✅STUPID✅"]
            const word = getRandomElement(words)
            await bot.message.send(`\n${word}`).catch(console.error);
            await delay(getRandomDelayInRange(5000, 8000))
            if (Math.random() < 0.5) {
                const words = ['✅STRAT✅', "✅STSRT✅", "✅STYRT✅", "✅SPART✅", "✅STUPID✅"]
                const word = getRandomElement(words)
                await bot.message.send(`\n${word}`).catch(console.error);
                await delay(getRandomDelayInRange(5000, 8000))
            }
        }
        await bot.message.send(`\n✅START✅`).catch(console.error);
    }

          const price = extractNumberFromString(msg)
  if (price !== 0) {
    try {
        const balance = await bot.wallet.gold.get().catch(console.error);
        console.log('Current balance:', balance);
        
        if (!balance) {
            console.error('Failed to get balance');
            return;
        }

        const players = await bot.room.players.get().catch(console.error);
        if (!players || !players.length) {
            console.error('No players found');
            return;
        }

        const playerIDs = players.map(item => item[0].id);
        const totalPlayers = playerIDs.length;

        // Проверка баланса и отправка чаевых
        let barType, requiredAmount;
        
        switch(price) {
            case 1:
                barType = GoldBars.BAR_1;
                requiredAmount = totalPlayers * 2;
                break;
            case 5:
                barType = GoldBars.BAR_5;
                requiredAmount = totalPlayers * 6;
                break;
            case 10:
                barType = GoldBars.BAR_10;
                requiredAmount = totalPlayers * 11;
                break;
            default:
                console.error('Invalid price value');
                return;
        }

        if (balance < requiredAmount) {
            await bot.message.send(`Не хватает золота! Баланс: ${balance}, требуется: ${requiredAmount}`).catch(console.error);
            return;
        }

        // Отправка чаевых всем игрокам
let successCount = 0;
let failedCount = 0;

for (const id of playerIDs) {
        if (user.id === "67f8078652db7b9f7a0e68fb" || user.id === "67a2b617a337e1b57da53360" || user.id === bot.info.user.id) continue
    try {
        await bot.player.tip(id, barType);
        console.log(`Sent tip to ${id}`);
        successCount++;
    } catch (error) {
        console.error(`Failed to tip player ${id}:`, error);
        failedCount++;
    }
}

    } catch (error) {
        console.error('Error in tipping process:', error);
    }
}

    const usData = parseUserAction(message)
    if (usData) {
        console.log(1)
        const players = await bot.room.players.get().catch(console.error);
        if (!players) return
        const partner = players.find(player => player[0].username === usData.username)
        if (!partner) {
            return
        }
        const id = partner[0].id
        switch(usData.action) {
            case 'кик':
                bot.player.kick(id).catch(e => console.error(e));
            case 'бан':
                bot.player.ban(id, 3200).catch(e => console.error(e));
        }
        return
    }

})

function extractNumberFromString(inputString) {
    try {
        // Проверяем что это строка и не пустая
        if (typeof inputString !== 'string' || inputString.trim() === '') return 0;

        // Строгая проверка формата "тип 123"
        const match = inputString.match(/^тип\s(\d+)$/);
        if (!match) return 0;

        // Парсим число
        const number = parseInt(match[1], 10);
        return isNaN(number) ? 0 : number;

    } catch {
        return 0;
    }
}

// bot.on("playerMove", async (user, position) => {
//   // console.log(position.x, position.y, position.z)

//   if (position.entity_id) {
//     userCord.set(user.id, position)
//     return
//   }

//   if (userCord.has(user.id)) {
//     const pos = userCord.get(user.id)
//     const distance = getDistance(pos.x, pos.z, position.x, position.z)
//     if (Math.abs(pos.y - position.y) > 5 || distance > 10) {
//       await tp(bot, user.id, position.x, position.y, position.z)
//     }
//   } else {
//     await tp(bot, user.id, position.x, position.y, position.z)
//   }
//   userCord.set(user.id, position)

// });

async function tp(bot, id, x, y, z) {
    userCord.set(id, { x: x, y: y, z: z })
    await bot.player.teleport(id, x, y, z, Facing.FrontLeft).catch(console.error);
}

function getDistance(x1, z1, x2, z2) {
    const dx = x2 - x1;
    const dz = z2 - z1;
    return Math.sqrt(dx * dx + dz * dz);
}


bot.login(token, room);