import { Databases } from "../API/handlers/databases";

export const config = {
    adminTag: !Databases.settings.has('adminTag') ? Databases.settings.write('adminTag', 'skummeh') && Databases.settings.read('adminTag') : Databases.settings.read('adminTag'),
    modTag: !Databases.settings.has('modTag') ? Databases.settings.write('modTag', 'mod') && Databases.settings.read('modTag') : Databases.settings.read('modTag'),
    trustTag: !Databases.settings.has('trustTag') ? Databases.settings.write('trustTag', 'trusted') && Databases.settings.read('trustTag') : Databases.settings.read('trustTag'),
    defaultRank: !Databases.settings.has('defaultRank') ? Databases.settings.write('defaultRank', '§6Member') && Databases.settings.read('defaultRank') : Databases.settings.read('defaultRank'),
    prefix: !Databases.settings.has('prefix') ? Databases.settings.write('prefix', '!') && Databases.settings.read('prefix') : Databases.settings.read('prefix'),
    version: "S2 U7",
    discord: "https://discord.gg/U8P5NhKs2d",
    youtube: "https://www.youtube.com/@MP09234",
    omlet: "moddedpro234",
    chatStyle: !Databases.settings.has('chatStyle') ? Databases.settings.write('chatStyle', '$team $ranks $name $time §l§6>>§r $msg') && Databases.settings.read('chatStyle') : Databases.settings.read('chatStyle'),
    ranks: !Databases.settings.has('ranks') ? Databases.settings.write('ranks', true) && Databases.settings.read('ranks') : Databases.settings.read('ranks'),
    currency: !Databases.settings.has('currency') ? Databases.settings.write('currency', 'money') && Databases.settings.read('currency') : Databases.settings.read('currency'),
    spawnRaduis: !Databases.settings.has('spawnRaduis') ? Databases.settings.write('spawnRaduis', 200) && Databases.settings.read('spawnRaduis') : Databases.settings.read('spawnRaduis'),
    toggleAblePermissions: !Databases.settings.has('toggleAblePermissions') ? Databases.settings.write('toggleAblePermissions', true) && Databases.settings.read('toggleAblePermissions') : Databases.settings.read('toggleAblePermissions'),
    claimCost: !Databases.settings.has('claimCost') ? Databases.settings.write('claimCost', 10000) && Databases.settings.read('claimCost') : Databases.settings.read('claimCost'),
    itemNamesDisplay: !Databases.settings.has('itemNamesDisplay') ? Databases.settings.write('itemNamesDisplay', true) && Databases.settings.read('itemNamesDisplay') : Databases.settings.read('itemNamesDisplay'),
    damageIndicators: !Databases.settings.has('damageIndicators') ? Databases.settings.write('damageIndicators', true) && Databases.settings.read('damageIndicators') : Databases.settings.read('damageIndicators'),
    claims: !Databases.settings.has('claims') ? Databases.settings.write('claims', true) && Databases.settings.read('claims') : Databases.settings.read('claims'),
    treeCapitator: !Databases.settings.has('treeCapitator') ? Databases.settings.write('treeCapitator', true) && Databases.settings.read('treeCapitator') : Databases.settings.read('treeCapitator'),
    veinMiner: !Databases.settings.has('veinMiner') ? Databases.settings.write('veinMiner', true) && Databases.settings.read('veinMiner') : Databases.settings.read('veinMiner'),
    betting: !Databases.settings.has('betting') ? Databases.settings.write('betting', true) && Databases.settings.read('betting') : Databases.settings.read('betting'),
    maxAuctions: !Databases.settings.has('maxAuctions') ? Databases.settings.write('maxAuctions', 3) && Databases.settings.read('maxAuctions') : Databases.settings.read('maxAuctions'),
    enderPearlT: !Databases.settings.has('enderPearlT') ? Databases.settings.write('enderPearlT', true) && Databases.settings.read('enderPearlT') : Databases.settings.read('enderPearlT'),
    vaultCost: !Databases.settings.has('vaultCost') ? Databases.settings.write('vaultCost', 50000) && Databases.settings.read('vaultCost') : Databases.settings.read('vaultCost'),
    vaultMaxPages: !Databases.settings.has('vaultMaxPages') ? Databases.settings.write('vaultMaxPages', 5) && Databases.settings.read('vaultMaxPages') : Databases.settings.read('vaultMaxPages'),
    factionHomes: !Databases.settings.has('factionHomes') ? Databases.settings.write('factionHomes', true) && Databases.settings.read('factionHomes') : Databases.settings.read('factionHomes'),
    login: !Databases.settings.has('login') ? Databases.settings.write('login', false) && Databases.settings.read('login') : Databases.settings.read('login'),
    tpToSpawnOnSpawn: !Databases.settings.has('tpToSpawnOnSpawn') ? Databases.settings.write('tpToSpawnOnSpawn', false) && Databases.settings.read('tpToSpawnOnSpawn') : Databases.settings.read('tpToSpawnOnSpawn'),
    chatFilteredWords: [
        "fuck",
        "ass",
        "cum",
        "shit",
        "dick",
        "cock",
        "penis",
        "damn",
        "fuckwit",
        "tits",
        "boobs",
        "cunt",
        "motherfucker",
        "fucker",
        "suck",
        "piss",
        "pussy",
        "bitch",
        "asshole",
        "bastard",
        "idiot",
        "crap",
        "dickhead",
        "sex",
        "anus",
        "arsehole",
        "arse",
        "butt",
        "nigga",
        "nigger",
        "fucking",
        "prick",
        "badass",
        "badie",
    ],
    AntiCheat: {
        cbes: !Databases.settings.has('cbes') ? Databases.settings.write('cbes', true) && Databases.settings.read('cbes') : Databases.settings.read('cbes'),
        nuker: !Databases.settings.has('nuker') ? Databases.settings.write('nuker', true) && Databases.settings.read('nuker') : Databases.settings.read('nuker'),
        illegalEnchantments: !Databases.settings.has('illegalEnchantments') ? Databases.settings.write('illegalEnchantments', true) && Databases.settings.read('illegalEnchantments') : Databases.settings.read('illegalEnchantments'),
        AAC: !Databases.settings.has('AAC') ? Databases.settings.write('AAC', true) && Databases.settings.read('AAC') : Databases.settings.read('AAC'),
        AKA: !Databases.settings.has('AKA') ? Databases.settings.write('AKA', true) && Databases.settings.read('AKA') : Databases.settings.read('AKA'),
        speed: !Databases.settings.has('speed') ? Databases.settings.write('speed', true) && Databases.settings.read('speed') : Databases.settings.read('speed'),
        fly: !Databases.settings.has('fly') ? Databases.settings.write('fly', true) && Databases.settings.read('fly') : Databases.settings.read('fly'),
        scaffold: !Databases.settings.has('scaffold') ? Databases.settings.write('scaffold', true) && Databases.settings.read('scaffold') : Databases.settings.read('scaffold')
    },
    plugins: {
        commands: {
            general: {
                help: true,
                admins: true,
                theme: true,
                broadcast: true,
                clear: true,
                clearlag: true,
                emojilist: true,
                info: true,
                list: true,
                ping: true,
                prefix: true,
                slap: true,
                spawn: true,
                faction: true,
                pay: true,
                balance: true,
                auctionhouse: true,
                bounty: true,
                shop: true,
                sell: true,
                vault: true,
                login: true,
                register: true,
                mail: true
            },
            gamemodes: {
                gma: true,
                gmc: true,
                gms: true,
                gmsp: true
            },
            management: {
                ban: true,
                banlist: true,
                banview: true,
                logs: true,
                ecwipe: true,
                freeze: true,
                freezelist: true,
                invsee: true,
                jail: true,
                jaillist: true,
                money: true,
                mute: true,
                mutelist: true,
                op: true,
                removejail: true,
                removespawn: true,
                setjail: true,
                setspawn: true,
                staffchat: true,
                unban: true,
                unfreeze: true,
                unjail: true,
                unmute: true,
                warn: true,
                settings: true,
                welcome: true,
                warp: true,
                protect: true,
                text: true,
                command: true,
                gui: true,
                slapper: true,
                crates: true,
                report: true,
                reports: true
            },
            miscellaneous: {
                drunk: true,
                dupe: true,
                feed: true,
                heal: true,
                i: true,
                jump: true,
                kit: true,
                lore: true,
                name: true,
                nickname: true,
                ranks: true,
                repair: true,
                resetnickname: true,
                smite: true,
                speed: true,
                tpa: true,
                troll: true,
                vanish: true,
                enchantment: true,
                leaderboard: true,
                setHome: true,
                home: true,
                delhome: true,
                homelist: true,
                bet: true,
                balancetop: true,
                nightvision: true
            }
        },
        events: {
            blockPlace: true,
            beforeChat: true,
            interval: true,
            playerSpawn: true,
            itemUse: true,
            entityHurt: true,
            projectileHit: true,
            itemUseOn: true,
            blockBreak: true,
            entityHitEntity: true,
            entityHitBlock: true,
            dataDrivenEntityTriggerEvent: true,
            playerInteractWithEntity: true,
            playerInteractWithBlock: true
        }
    },
    allCbes: !Databases.settings.has('allCbes') ? Databases.settings.write('allCbes', [
        "moving_block",
        "movingBlock",
        "movingblock",
        "tallgrass",
        "lava",
        "flowing_lava"
    ]) && Databases.settings.read('allCbes') : Databases.settings.read('allCbes'),
    trustedCbes: !Databases.settings.has('trustedCbes') ? Databases.settings.write('trustedCbes', [
        "beehive",
        "bee_nest",
        "command_block",
        "barrier",
        "allow",
        "structure_block",
        "structure_void",
        "deny",
        "repeating_command_block",
        "chain_command_block",
        "command_block_minecart",
        "border",
        "border_block",
        "beenest",
        "tnt",
        "end_crystal",
        "respawn_anchor",
        "bedrock",
    ]) && Databases.settings.read('trustedCbes') : Databases.settings.read('trustedCbes'),
    emojis: {
        ':smiley:': '',
        ':grimacing:': '',
        ':grin:': '',
        ':joy:': '',
        ':smile:': '',
        ':sweat_smile:': '',
        ':laughing:': '',
        ':innocent:': '',
        ':wink:': '',
        ':blush:': '',
        ':slight_smile:': '',
        ':upside_down:': '',
        ':relaxed:': '',
        ':yum:': '',
        ':relieved:': '',
        ':heart_eyes:': '',
        ':kissing_heart:': '',
        ':kissing:': '',
        ':kissing_smiling_eyes:': '',
        ':kissing_closed_eyes:': '',
        ':stuck_out_tongue_winking_eye:': '',
        ':stuck_out_tongue_closed_eyes:': '',
        ':stuck_out_tongue:': '',
        ':money_mouth:': '',
        ':sunglasses:': '',
        ':smirk:': '',
        ':no_mouth:': '',
        ':neutral_face:': '',
        ':expressionless:': '',
        ':unamused:': '',
        ':rolling_eyes:': '',
        ':flushed:': '',
        ':disappointed:': '',
        ':worried:': '',
        ':angry:': '',
        ':rage:': '',
        ':pensive:': '',
        ':confused:': '',
        ':slight_frown:': '',
        ':frowning2:': ''
    }
};
export const bounties = [], playerRequests = []
export default config;
