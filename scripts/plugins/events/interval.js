import { system, world, EquipmentSlot, GameMode } from "@minecraft/server";
import { Area } from "../../API/handlers/protect";
import config, { playerRequests } from "../../config/main";
import { Databases } from "../../API/handlers/databases";
import { CX } from "../../API/CX";
import { open } from "../commands/management/gui";
import { Database } from "../../API/database/DB";

Databases.customCmds.forEach((k, v) => {
    CX.Build(CX.BuildTypes["@command"], {
        data: new CX.command()
        .setName(k)
        .setDescription(v.description)
        .setCategory(v.category)
        .setPermissions({ admin: v.admin })
        .setDevelopers([v.developer]),
        executes(ctx) {
            ctx.execute((sender) => {
                if (v.command.startsWith('opengui:')) {
                    open(Databases.guis.read(v.command.split('opengui:')[1]), sender)
                    sender.response.send('Close the chat within 10 secondes')
                } else sender.runCommandAsync(v.command);
            });
        }
    });
});
world.getDimension('overworld').runCommandAsync('gamerule sendcommandfeedback false');
world.getDimension('overworld').runCommandAsync('gamerule commandblockoutput false');
if (!world.scoreboard.getObjective(config.currency))world.scoreboard.addObjective(config.currency, `§c§l${config.currency}`);
if (!world.scoreboard.getObjective('pearlTimer')) world.scoreboard.addObjective('pearlTimer', '');
if (!world.scoreboard.getObjective('inCombat')) world.scoreboard.addObjective('inCombat', '');
if (!world.scoreboard.getObjective('sents')) world.scoreboard.addObjective('sents', '');
if (!world.scoreboard.getObjective('kills')) world.scoreboard.addObjective('kills', '');

system.runInterval(() => {
    if (config.itemNamesDisplay)
        for (const entity of world.getDimension('overworld').getEntities({ type: 'item' }))
            entity.nameTag = `§6${entity.getComponent("item").itemStack.amount}x§r ${CX.item.getItemName(entity.getComponent("item").itemStack)}`;
});
system.runInterval(() => {
    world.getAllPlayers().forEach((player) => {
        player.runCommandAsync('scoreboard players add @s money 0');
        player.runCommandAsync('scoreboard players add @s pearlTimer 0');
        const health = player.getComponent("health");
        const ranks = (plr) => `§r§8[§r${CX.player.getRanks(plr)}§r§8] `;
        player.nameTag = `${config.ranks ? ranks(player) : ''}§r${player.getTags().find(tag => tag.startsWith('nickname:'))?.replace('nickname:', '') ?? CX.player.hasColor(player, 'name') ? CX.player.colorize(player.getTags().find(tag => tag.startsWith('nickname:'))?.replace('nickname:', '') ?? player.name, CX.player.getColor(player, 'name')) : player.name}\n§4❤${Math.round(health.currentValue) / 2}`;
    });
});
system.runInterval(() => {
    world.getAllPlayers().forEach(player => {
        if (!player.hasTag(config.adminTag) && config.AntiCheat.illegalEnchantments) {
            const container = player.getComponent("inventory").container;
            for (let i = 0; i < container.size; i++) {
                const item = container.getItem(i);
                if (!item) continue;
                const enchants = item.getComponent('enchantable')?.getEnchantments()
                if (!enchants) return
                for (const enchant of enchants) {
                    if (enchant.type.maxLevel >= enchant.level) continue
                    item.removeEnchantment(enchant.type)
                    new CX.log({
                        from: player.name,
                        translate: 'AntiCheat',
                        reason: 'illegal enchantments',
                        warn: true
                    });
                    break;
                }
            }
        }
    });
});
system.runInterval(() => {
    Array.from(world.getDimension('overworld').getEntities({ type: 'mod:ft', tags: ['ftlb'] })).forEach((entity) => {
        const objective = entity.getTags().find(t => t.startsWith('ft:')).replace('ft:', ''), db = new Database(`LB:${objective}`)
        if (!objective || !world.scoreboard.getObjective(objective)) entity.nameTag = `§c§lObjective: ${objective} has no records`;
        let leaderboard = []
        world.getAllPlayers().forEach(p => {
            db.write(p.id, { plr: { name: (CX.player.hasColor(p, 'name') ? CX.player.colorize(p.name, CX.player.getColor(p, 'name')) : p.name) }, score: CX.scoreboard.get(p, objective)})
        });
        leaderboard = db.values().sort((a, b) => b.score - a.score).map((s, i) => `§b#${++i} §c${s.plr.name} §r§e${!s.score ? 0 : CX.extra.parseNumber(s.score)}§r`)
        if (!leaderboard.length) return;
        leaderboard = leaderboard.slice(0, parseInt(entity?.getTags().find(t => t.startsWith('ftl:')).replace('ftl:', '')));
        leaderboard.unshift(entity?.getTags().find(t => t.startsWith('fth:')).replace('fth:', ''));
        entity.nameTag = leaderboard.join('\n')
    });
}, 20);
system.runInterval(() => {
    playerRequests.forEach((r, index) => {
        if (Date.now() < r.expires)
            return;
        playerRequests.splice(index);
        r.sender?.response.error(`The TPA request you sent to §6${r.target?.name}§c has expired`);
        r.target?.response.error(`§6${r.sender?.name}'s§c TPA request has expired`);
    });
});
system.runInterval(() => {
    world.getAllPlayers().forEach((player) => {
        if (CX.factions.isInFaction(player) && !Databases.factions.has(CX.factions.getPlayersFaction(player))) {
            player.removeTag(`faction-${CX.factions.getPlayersFaction(player)}`);
        }
        if (player.hasTag('inCombat') && CX.scoreboard.get(player, 'inCombat') == 0) {
            player.removeTag('inCombat');
            player.onScreenDisplay.setActionBar('§aYou are no longer in combat');
        }
        const area = Area.as(player, [player.location.x, player.location.z]);
        if (area.isInArea) {
            if (area.permissions.pvp) return
            if (player.hasTag(config.adminTag))
                return;
            player.addEffect('weakness', 1, { showParticles: false, amplifier: 255 });
            player.addEffect('regeneration', 1, { showParticles: false, amplifier: 255 });
            player.addEffect('resistance', 1, { showParticles: false, amplifier: 255 });
            player.addEffect('fire_resistance', 1, { showParticles: false, amplifier: 255 });
        }
        const chunk = CX.factions.getChunk(player);
        if (!player.hasTag('inClaim') && CX.factions.isChunkClaimed(`${chunk[0]}_${chunk[1]}`)) {
            CX.player.send(player, `You have entered ${CX.factions.getClaimOwner(`${chunk[0]}_${chunk[1]}`)}'s §r§cfaction`, false, false);
            player.addTag('inClaim');
        }
        if (player.hasTag('inClaim') && !CX.factions.isChunkClaimed(`${chunk[0]}_${chunk[1]}`)) {
            CX.player.send(player, `You have entered the wild`, false, false);
            player.removeTag('inClaim');
        }
    });
});
system.runInterval(() => {
    world.getAllPlayers().forEach(plr => {
        if (Databases.auctionClaims.has(plr.id)) {
            CX.scoreboard.add(plr, config.currency, Databases.auctionClaims.read(plr.id));
            Databases.auctionClaims.delete(plr.id);
        }
        if (CX.scoreboard.get(plr, 'pearlTimer') >= 1) CX.scoreboard.remove(plr, 'pearlTimer', 1);
        if (CX.scoreboard.get(plr, 'inCombat') >= 1) CX.scoreboard.remove(plr, 'inCombat', 1);
        if (CX.scoreboard.get(plr, 'sents') >= 1) CX.scoreboard.remove(plr, 'sents', 1);
        if (Databases.bans.has(plr.name)) {
            const Data = Databases.bans.read(plr.name);
            plr.runCommandAsync(`kick "${plr.name}" §cYou have been banned from the server By: ${Data.by} Reason: ${Data.reason} At: ${Data.date}`);
        }
    });
}, 20);
system.runInterval(() => {
    const tools = ['sword', 'pickaxe', 'shovel', 'hoe', 'axe'];
    Databases.enchantments.forEach((_, info) => {
        if (info.event == 'System') {
            world.getPlayers().forEach(plr => {
                const equipment = plr.getComponent('equipment_inventory');
                if (tools.includes(info.equpiedOn)) {
                    const inv = plr.getComponent('inventory').container;
                    for (let i = 1; i < info.maxLevel + 1; i++) {
                        if (!inv.getItem(plr.selectedSlot))
                            return;
                        const lore = `${inv.getItem(plr.selectedSlot).getLore()}`.trim().split(/\s+/g);
                        if (lore.includes(CX.enchantment.getTierColor(info.tier) + info.name) && lore[lore.indexOf(CX.enchantment.getTierColor(info.tier) + info.name) + 1] == CX.extra.convertToRoman(i) && inv.getItem(plr.selectedSlot).typeId.endsWith(info.equpiedOn)) {
                            try {
                                plr.runCommandAsync(info.command.replaceAll('$level', i - 1));
                            }
                            catch { }
                        }
                    }
                }
                else {
                    if (!equipment.getEquipment(EquipmentSlot[info.equpiedOn]))
                        return;
                    for (let i = 1; i < info.maxLevel + 1; i++) {
                        const lore = `${equipment.getEquipment(EquipmentSlot[info.equpiedOn]).getLore()}`.trim().split(/\s+/g);
                        if (lore.includes(CX.enchantment.getTierColor(info.tier) + info.name) && lore[lore.indexOf(CX.enchantment.getTierColor(info.tier) + info.name) + 1] == CX.extra.convertToRoman(i)) {
                            try {
                                plr.runCommandAsync(info.command.replaceAll('$level', i - 1));
                            }
                            catch { }
                        }
                    }
                }
            });
        }
    });
});

const locations = [];

system.runInterval(() => {
    world.getPlayers({ excludeTags: [config.adminTag], excludeGameModes: [GameMode.creative, GameMode.spectator] }).forEach(player => {
        if (player.isFlying) {
            new CX.log({
                reason: 'Fly Hacks',
                from: player.name
            })
            player.applyDamage(10)
        }
        if (!locations.find(l => l.id === player.id)) return locations.push({ id: player.id, location: player.location, dim: player.dimension.id });
        const saved = locations.find(l => l.id === player.id);
        locations.splice(locations.indexOf(saved), 1);
        locations.push({ id: player.id, location: player.location, dim: player.dimension.id });
        if (player.isGliding || player.getEffect("speed")) return
        const speed = Math.sqrt(player.getVelocity().x ** 2 + player.getVelocity().z ** 2) * 20 * 60 * 60 / 1609.34;  
        if (speed > 150) {
            if (!player.dimension.getBlock(player.location) || !world.getDimension(saved.dim).getBlock(saved.location)) return
            new CX.log({
                reason: 'Speed Hacks/Teleport Hacks',
                from: player.name
            })
            locations.splice(locations.indexOf(locations.find(l => l.id === player.id), 1));
            locations.push({ id: player.id, location: saved.location, dim: saved.dim });
            player.teleport(saved.location, { dimension: world.getDimension(saved.dim) });
        }
    });
});

system.runInterval(() => {
    world.getAllPlayers().forEach(player => {
        if (config.login && !player.hasTag('logged')) {
            player.addEffect('weakness', 2, { amplifier: 255, showParticles: false })
            player.addEffect('mining_fatigue', 2, { amplifier: 255, showParticles: false })
            player.addEffect('darkness', 2, { amplifier: 10, showParticles: false })
            player.addEffect('resistance', 2, { amplifier: 255, showParticles: false })
            player.addEffect('regeneration', 2, { amplifier: 255, showParticles: false })
            player.addEffect('absorption', 2, { amplifier: 255, showParticles: false })
            player.addEffect('fire_resistance', 2, { amplifier: 255, showParticles: false })
        }
        for (const e of player.dimension.getEntities()) if (e.hasTag('slapper')) {
            e.addEffect('resistance', 255, { amplifier: 255, showParticles: false })
            e.addEffect('health_boost', 255, { amplifier: 255, showParticles: false })
            e.addEffect('regeneration', 255, { amplifier: 255, showParticles: false })
            e.addEffect('absorption', 255, { amplifier: 255, showParticles: false })
            e.addEffect('instant_health', 255, { amplifier: 255, showParticles: false })
            e.addEffect('fire_resistance', 255, { amplifier: 255, showParticles: false })
            e.addEffect('weakness', 255, { amplifier: 255, showParticles: false })
            try {
                e.triggerEvent('minecraft:stop_exploding')
            } catch {}
            e.runCommandAsync(`tp @s ~0 ~0 ~0`)
        }
    }) 
})                                                 