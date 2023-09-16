import { world, Player as PLR, GameMode } from "@minecraft/server";
import config, { playerRequests } from "../../config/main.js";
import { CX } from "../CX.js";
class Player {
    /**
     * Player service manager
     * @param {any} author The author of the service 
     */
    constructor(author) {
        this.author = author;
    }
    /**
     * Converts a normal Minecraft player to MOD's advanced methodes for the player
     * @param {PLR | string} player The player you want to convert
     */
    convert(player) {
        const plr = player instanceof PLR ? player : world.getAllPlayers().find(p => p?.name.toLowerCase() === player?.toLowerCase());
        if (!plr)
            return;
        return Object.assign(player, {
            event:{
                /**
                 * Clears the velocity of the player
                 * @returns 
                 */
                clearVelocity: () => this.clearVelocity(plr),
                /**
                 * Applies knockback to the player that s been hit 
                 * @returns 
                 */
                applyKnockback: () => this.applyKnockback(plr),
                  },
            response: {
                /**
                 * Send a message to the player
                 * @param {any} message The message
                 * @param {boolean} sound The sound
                 * @param {boolean} author The message author
                 * @returns 
                 */
                send: (message, sound = true, author = true) => this.send(plr, message, sound, author),
                /**
                 * Sends an error message to the player
                 * @param {any} error The error to send
                 * @param {boolean} sound The sound
                 * @param {boolean} author The message author
                 * @returns 
                 */
                error: (error, sound = true, author = true) => this.error(plr, error, sound, author),
            },
            permission: {
                /**
                 * Checks if the player has a permission
                 * @param {any} permission The permission to check for
                 * @returns 
                 */
                hasPermission: (permission) => this.hasPermission(plr, permission),
                /**
                 * Removes a permission from the player
                 * @param {any} permission The permission to remove
                 * @returns 
                 */
                removePermission: (permission) => this.removePermission(plr, permission),
                /**
                 * Adds a permission to the player
                 * @param {any} permission The permission to add
                 * @returns 
                 */
                addPermission: (permission) => this.addPermission(plr, permission)
            },
            gamemode: {
                /**
                 * Get the players gamemode
                 * @returns 
                 */
                getGamemode: () => this.getGamemode(plr),
                /**
                 * Sets the players gamemode
                 * @param {any} gamemode The gamemode to set the player too
                 * @returns 
                 */
                setGamemode: (gamemode) => this.setGamemode(plr, gamemode),
                /**
                 * Checks if the player is vanished
                 * @returns 
                 */
                vanished: () => this.vanished(plr)
            },
            chat: {
                /**
                 * Mutes the player
                 * @returns 
                 */
                mute: () => this.mute(plr),
                /**
                 * Unmutes the player
                 * @returns 
                 */
                unMute: () => this.unmute(plr),
                /** 
                 * Checks if the player is muted
                */
                muted: this.muted(plr),
                /** 
                 * Checks if the player is in staff chat
                */
                inStaffChat: this.inStaffChat(plr),
                /**
                 * Gets the nickname tag
                 */
                getNicknameTag: this.getNicknameTag(plr),
                /**
                 * Gets the players nickname
                 */
                getNickname: this.getNickname(plr),
                /**
                 * Checks if the player has ranks
                 */
                hasRanks: this.hasRanks(plr),
                /**
                 * Get the players ranks
                 */
                getRanks: this.getRanks(plr),
                /**
                 * Gets all the ranks without brackets
                 */
                getAllRanks: this.getAllRanks(plr),
                /**
                 * Gets the ranks without joining the brackets
                 */
                getPlainRanks: this.getPlainRanks(plr),
                /**
                 * Gets a color
                 * @param {any} filter The filter for the color (chat or name)
                 * @returns 
                 */
                getColor: (filter) => this.getColor(plr, filter),
                /**
                 * Checks if the player has a color
                 * @param {any} filter The filter for the color (chat or name)
                 * @returns 
                 */
                hasColor: (filter) => this.hasColor(plr, filter),
                /**
                 * Colors a text
                 * @param {any} txt The text to colorize
                 * @param {any} color The color to set the text too
                 * @returns 
                 */
                colorize: (txt, color) => this.colorize(txt, color)
            },
            management: {
                /**
                 * Freezes the player
                 * @returns 
                 */
                freeze: () => this.freeze(plr),
                /**
                 * Unfreezes the player
                 * @returns 
                 */
                unfreeze: () => this.unFreeze(plr),
                /**
                 * Jails the player
                 * @returns 
                 */
                jail: () => this.jail(plr),
                /**
                 * Unjails the player
                 * @returns 
                 */
                unjail: () => this.unjail(plr),
                /**
                 * Checks if the player is freezed
                 */
                freezed: this.freezed(plr),
                /**
                 * Checks if the player is jailed
                 */
                jailed: this.jailed(plr),
                /**
                 * Returns the exact player location
                 * @returns 
                 */
                Location: () => { return { x: plr.location.x, y: plr.location.y, z: plr.location.z }; },
                /**
                 * Gets the block that the player is looking at
                 * @param {any} getBlock If not block returns this block
                 * @returns 
                 */
                viewedBlock: (getBlock) => this.viewedBlock(plr, getBlock)
            },
            score: {
                /**
                 * Gets a score from an objective
                 * @param {any} objective The objective to get the score from
                 * @returns 
                 */
                getScore: (objective) => CX.scoreboard.get(plr, objective),
                /**
                 * Sets a score to an objective
                 * @param {any} objective The objective to set the score too
                 * @param {number} value The value
                 * @returns 
                 */
                setScore: (objective, value) => CX.scoreboard.set(plr, objective, value),
                /**
                 * Adds a score to an objective
                 * @param {any} objective The objective to add the score too
                 * @param {number} value The value
                 * @returns 
                 */
                addScore: (objective, value) => CX.scoreboard.add(plr, objective, value),
                /**
                 * Resets the players objective
                 * @param {any} objective The objective to reset
                 * @returns 
                 */
                resetSore: (objective) => CX.scoreboard.reset(plr, objective),
                /**
                 * Removes a score from an objective
                 * @param {any} objective The objective to remove the score from
                 * @param {number} value The value
                 * @returns 
                 */
                removeScore: (objective, value) => CX.scoreboard.remove(plr, objective, value)
            }
        });
    }
    send(player, message, sound = true, author = true) {
        if (author)
            player.sendMessage(`§l§6${this.author} §e>> §c${message}`);
        else
            player.sendMessage(`§c${message}`);
        if (sound)
            player.playSound('random.toast', { pitch: 0.4, volume: 1, location: { x: player.location.x, y: player.location.y + 1, z: player.location.z } });
    }
    error(player, error, sound = true, author = true) {
        if (author)
            player.sendMessage(`§l§6${this.author} §4Error §e>> §c${error}`);
        else
            player.sendMessage(`§l§4Error §e>> §c${error}`);
        if (sound)
            player.playSound('random.glass', { pitch: 0.7, volume: 1, location: { x: player.location.x, y: player.location.y + 1, z: player.location.z } });
    }
    hasPermission(plr, permission) {
        if (permission == 'admin')
            return Boolean(plr.hasTag(config.adminTag));
        else if (permission == 'trusted')
            return Boolean(plr.hasTag(config.trustTag));
        else
            return undefined;
    }
    removePermission(plr, permission) {
        if (permission == 'admin')
            plr.removeTag(config.adminTag);
        else if (permission == 'trusted')
            plr.removeTag(config.trustTag);
        else
            return undefined;
    }
    addPermission(plr, permission) {
        if (permission == 'admin')
            plr.addTag(config.adminTag);
        else if (permission == 'trusted')
            plr.addTag(config.trustTag);
        else
            return undefined;
    }
    getGamemode(plr) {
        return Object.values(GameMode).find(m => Array.from(plr.dimension.getEntities({ name: plr.name, gameMode: m, type: 'minecraft:player' }))[0]);
    }
    setGamemode(plr, gamemode) {
        if (gamemode == 'vanish') {
            this.vanish(plr);
        }
        else if (gamemode == 'unvanish') {
            this.unvanish(plr);
        }
        else {
            plr.runCommandAsync(`gamemode ${gamemode} @s`);
        }
    }
    freezed(player) {
        return Boolean(player.hasTag('freeze'));
    }
    freeze(player) {
        player.runCommandAsync(`inputpermission set "${player.name}" movement disabled`);
        player.addTag('freeze');
    }
    unFreeze(player) {
        player.runCommandAsync(`inputpermission set "${player.name}" movement enabled`);
        player.removeTag('freeze');
    }
    muted(player) {
        return Boolean(player.hasTag('mute'));
    }
    jailed(player) {
        return Boolean(player.hasTag('jailed'));
    }
    jail(player) {
        const location = CX.server.read('jail').location;
        player.teleport(location, { dimension: world.getDimension(CX.server.read('jail').dimension) });
        player.setSpawnPoint({ dimension: world.getDimension(CX.server.read('jail').dimension), x: location.x, y: location.y, z: location.z });
        player.runCommandAsync('gamemode a @s');
        player.addTag('jailed');
        player.runCommandAsync('clear @s ender_pearl');
        player.runCommandAsync('clear @s chorus_fruit');
    }
    unjail(player) {
        const location = CX.server.read('spawn').location;
        player.teleport(location, { dimension: world.getDimension(CX.server.read('spawn').dimension), x: location.x, y: location.y, z: location.z });
        player.setSpawnPoint({ dimension: world.getDimension(CX.server.read('spawn').dimension), x: location.x, y: location.y, z: location.z });
        player.removeTag('jailed');
    }
    inStaffChat(player) {
        return Boolean(player.hasTag('staffChat'));
    }
    vanished(player) {
        return Boolean(player.hasTag('vanish'));
    }
    unvanish(player) {
        player.removeEffect('invisibility');
        player.response.send('You are no longer in vanish mode');
        player.removeTag('vanish');
    }
    vanish(player) {
        player.runCommandAsync(`effect @s invisibility 9999999 255 true`);
        player.response.send('You are now in vanish mode');
        player.addTag('vanish');
    }
    mute(player) {
        return player.addTag('mute');
    }
    unmute(player) {
        return player.removeTag('mute');
    }
    setAdmin(player) {
        return player.addTag(config.adminTag);
    }
    removeAdmin(player) {
        return player.removeTag(config.adminTag);
    }
    getNicknameTag(player) {
        return player.getTags().find(tag => tag.startsWith('nickname:'));
    }
    getNickname(player) {
        return player.getTags().find(tag => tag.startsWith('nickname:'))?.replace('nickname:', '');
    }
    getRanks(player) {
        const ranks = player.getTags().filter((v) => v.startsWith('rank:'))
        if (ranks.length === 0) return [config.defaultRank]
        return ranks.map((r) => r.slice(5)).join("§r§8][§r")
    }
    hasRanks(player) {
        return Boolean(player.getTags()?.find(tag => tag.startsWith('rank:')));
    }
    getAllRanks(player) {
        return player.getTags()?.filter(tag => tag.startsWith('rank:'));
    }
    getPlainRanks(player) {
        const ranks = player.getTags().filter((v) => v.startsWith('rank:'))
        if (ranks.length === 0) return [config.defaultRank]
        return ranks.map((r) => r.slice(5))
    }
    trusted(player) {
        return Boolean(player?.hasTag(config.trustTag));
    }
    offline(name, player) {
        const plr = player instanceof String ? Array.from(world.getPlayers()).find(p => p.name.toLowerCase() === player?.toLowerCase() || p.name.toLowerCase() === name.toLowerCase()) : player;
        return {
            name: name,
            player: this.convert(player ?? name),
            send: (message, sound = true) => {
                plr.sendMessage(`§l§6${this.author} §e>> §c${message}`);
                if (sound)
                    plr.playSound('random.toast', { pitch: 0.4, volume: 1, location: { x: player.location.x, y: player.location.y + 1, z: player.location.z } });
            },
            error: (error, sound = true) => {
                plr.sendMessage(`§l§6${this.author} §4Error §e>> §c${error}`);
                if (sound)
                    plr.playSound('random.glass', { pitch: 0.7, volume: 1, location: { x: player.location.x, y: player.location.y + 1, z: player.location.z } });
            }
        };
    }
    viewedBlock(player, getBlock) {
        const block = player?.getBlockFromViewDirection({ includeLiquidBlocks: true, maxDistance: 300 })?.block;
        return getBlock ? block : { x: block?.location?.x, y: block?.location?.y, z: block?.location?.z };
    }
    getColor(plr, filter) {
        if (filter == 'name') {
            const ncolor = plr.getTags().map((v) => {
                if (!v.startsWith('ncolor:'))
                    return null;
                return v.substring('ncolor:'.length);
            }).filter((x) => x);
            return ncolor.length == 0 ? 'default' : ncolor;
        }
        else if (filter == 'chat') {
            const ccolor = plr.getTags().map((v) => {
                if (!v.startsWith('ccolor:'))
                    return null;
                return v.substring('ccolor:'.length);
            }).filter((x) => x);
            return ccolor.length == 0 ? 'default' : ccolor;
        }
        else
            return 'default';
    }
    colorize(txt, color) {
        if (color == 'darkRed')
            return `§4${txt}`;
        else if (color == 'red')
            return `§c${txt}`;
        else if (color == 'orange')
            return `§6${txt}`;
        else if (color == 'yellow')
            return `§e${txt}`;
        else if (color == 'darkYellow')
            return `§g${txt}`;
        else if (color == 'darkGreen')
            return `§2${txt}`;
        else if (color == 'green')
            return `§a${txt}`;
        else if (color == 'lightBlue')
            return `§b${txt}`;
        else if (color == 'blue')
            return `§1${txt}`;
        else if (color == 'lightBlue')
            return `§b${txt}`;
        else if (color == 'aquaBlue')
            return `§3${txt}`;
        else if (color == 'purple')
            return `§9${txt}`;
        else if (color == 'magenta')
            return `§5${txt}`;
        else if (color == 'pink')
            return `§d${txt}`;
        else if (color == 'black')
            return `§0${txt}`;
        else if (color == 'rainbow') {
            const rainbowColors = ['§4', '§c', '§6', '§e', '§g', '§2', '§a', '§b', '§3', '§9', '§5', '§d'];
            let msg = '', index = 0, text = txt.replace(/§./g, '');
            for (let i = 0; i < text.length; i++) {
                msg += `${rainbowColors[index]}${text[i]}`;
                index + 1 >= rainbowColors.length ? index = 0 : index++;
            }
            return msg;
        }
        else
            return txt;
    }
    hasColor(plr, filter) {
        if (filter == 'name') {
            if (plr.getTags()?.find(v => v.startsWith('ncolor:')))
                return true;
            else
                return false;
        }
        else if (filter == 'chat') {
            if (plr.getTags()?.find(v => v.startsWith('ccolor:')))
                return true;
            else
                return false;
        }
    }
    hasTpaRequest(sender, target) {
        return playerRequests.some(r => r.sender?.id === sender?.id && r.target?.id === target?.id);
    }
}
const player = new Player('UM+');
export default player;
