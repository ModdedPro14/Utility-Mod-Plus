// import config from "./config/main.js";
import { world } from "@minecraft/server";
// import { CX } from "./API/CX.js";

// CX.Build(CX.BuildTypes["@event"], {
//     data: 'WorldInitialize',
//     executes() {
//         world.getDimension('overworld').runCommandAsync(`tickingarea add circle 1000000 -60 1000000 4 "db" true`);
//     }
// });

const startPlugins = () => {
    const date = Date.now();
    // Object.keys(config.plugins.commands).forEach(category => Object.keys(config.plugins.commands[category]).forEach(cmd => config.plugins.commands[category][cmd] && import(`./plugins/commandss/${category}/${cmd}.js`).catch((err) => console.warn(`Failed to import command: ${cmd} from ${category}, ${err} ${err.stack}`))));
    // Object.keys(config.plugins.events).forEach(event => config.plugins.events[event] && import(`./plugins/events/${event}`).catch((err) => console.warn(`Failed to import event: ${event}, ${err} ${err.stack}`)));
    return Object.assign(startPlugins, {
        log() {
            return console.warn(`Plugins have been loaded successfully in ${Date.now() - date}MS`);
        }
    });
};
startPlugins().log();

//_________________ Events _________________
import "./plugins/events/beforeChat.js"
// import "./plugins/events/blockBreak.js"
// import "./plugins/events/blockPlace.js"
// import "./plugins/events/dataDrivenEntityTriggerEvent.js"
// import "./plugins/events/entityHitBlock.js"
// import "./plugins/events/entityHitEntity.js"
// import "./plugins/events/entityHurt.js"
// import "./plugins/events/interval.js"
// import "./plugins/events/itemUse.js"
// import "./plugins/events/itemUseOn.js"
// import "./plugins/events/playerInteractWithBlock.js"
// import "./plugins/events/playerInteractWithEntity.js"
// import "./plugins/events/playerSpawn.js"
// import "./plugins/events/projectileHit.js"

//_________________ Commands _________________

//Gamemodes
// import "./plugins/commands/gamemodes/gma.js"
// import "./plugins/commands/gamemodes/gmc.js"
// import "./plugins/commands/gamemodes/gms.js"
// import "./plugins/commands/gamemodes/gmsp.js"
//General
// import "./plugins/commands/general/admins.js"
// import "./plugins/commands/general/auctionhouse.js"
// import "./plugins/commands/general/balance.js"
// import "./plugins/commands/general/bounty.js"
// import "./plugins/commands/general/broadcast.js"
// import "./plugins/commands/general/clear.js"
// import "./plugins/commands/general/clearlag.js"
// import "./plugins/commands/general/emojilist.js"
// import "./plugins/commands/general/faction.js"
import "./plugins/commands/general/help.js"
import "./plugins/commands/general/auctionhouse.js"
// import "./plugins/commands/general/info.js"
// import "./plugins/commands/general/list.js"
// import "./plugins/commands/general/login.js"
// import "./plugins/commands/general/mail.js"
// import "./plugins/commands/general/pay.js"
// import "./plugins/commands/general/ping.js"
// import "./plugins/commands/general/prefix.js"
// import "./plugins/commands/general/register.js"
// import "./plugins/commands/general/sell.js"
// import "./plugins/commands/general/shop.js"
// import "./plugins/commands/general/slap.js"
// import "./plugins/commands/general/spawn.js"
// import "./plugins/commands/general/theme.js"
// import "./plugins/commands/general/vault.js"
//Management
// import "./plugins/commands/management/ban.js"
// import "./plugins/commands/management/banlist.js"
// import "./plugins/commands/management/banview.js"
// import "./plugins/commands/management/command.js"
// import "./plugins/commands/management/crates.js"
// import "./plugins/commands/management/ecwipe.js"
// import "./plugins/commands/management/freeze.js"
// import "./plugins/commands/management/freezelist.js"
// import "./plugins/commands/management/gui.js"
// import "./plugins/commands/management/invsee.js"
// import "./plugins/commands/management/jail.js"
// import "./plugins/commands/management/jaillist.js"
// import "./plugins/commands/management/logs.js"
// import "./plugins/commands/management/money.js"
// import "./plugins/commands/management/mute.js"
// import "./plugins/commands/management/mutelist.js"
// import "./plugins/commands/management/op.js"
// import "./plugins/commands/management/protect.js"
// import "./plugins/commands/management/removejail.js"
// import "./plugins/commands/management/removespawn.js"
// import "./plugins/commands/management/report.js"
// import "./plugins/commands/management/reports.js"
// import "./plugins/commands/management/setjail.js"
// import "./plugins/commands/management/setspawn.js"
// import "./plugins/commands/management/settings.js"
// import "./plugins/commands/management/slapper.js"
// import "./plugins/commands/management/staffchat.js"
// import "./plugins/commands/management/text.js"
// import "./plugins/commands/management/unban.js"
// import "./plugins/commands/management/unfreeze.js"
// import "./plugins/commands/management/unjail.js"
// import "./plugins/commands/management/unmute.js"
// import "./plugins/commands/management/warn.js"
// import "./plugins/commands/management/warp.js"
// import "./plugins/commands/management/welcome.js"
//Miscellaneous
// import "./plugins/commands/miscellaneous/balancetop.js"
// import "./plugins/commands/miscellaneous/bet.js"
// import "./plugins/commands/miscellaneous/delhome.js"
// import "./plugins/commands/miscellaneous/drunk.js"
// import "./plugins/commands/miscellaneous/dupe.js"
// import "./plugins/commands/miscellaneous/enchantment.js"
// import "./plugins/commands/miscellaneous/feed.js"
// import "./plugins/commands/miscellaneous/heal.js"
// import "./plugins/commands/miscellaneous/home.js"
// import "./plugins/commands/miscellaneous/homelist.js"
// import "./plugins/commands/miscellaneous/i.js"
// import "./plugins/commands/miscellaneous/jump.js"
// import "./plugins/commands/miscellaneous/kit.js"
// import "./plugins/commands/miscellaneous/leaderboard.js"
// import "./plugins/commands/miscellaneous/lore.js"
// import "./plugins/commands/miscellaneous/name.js"
// import "./plugins/commands/miscellaneous/nickname.js"
// import "./plugins/commands/miscellaneous/nightvision.js"
// import "./plugins/commands/miscellaneous/ranks.js"
// import "./plugins/commands/miscellaneous/repair.js"
// import "./plugins/commands/miscellaneous/resetnickname.js"
// import "./plugins/commands/miscellaneous/setHome.js"
// import "./plugins/commands/miscellaneous/smite.js"
// import "./plugins/commands/miscellaneous/speed.js"
// import "./plugins/commands/miscellaneous/tpa.js"
// import "./plugins/commands/miscellaneous/troll.js"
// import "./plugins/commands/miscellaneous/vanish.js"