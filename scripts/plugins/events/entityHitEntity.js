import { CX } from "../../API/CX";
import { Player, EquipmentSlot } from "@minecraft/server";
import { Databases } from "../../API/handlers/databases";
import config from "../../config/main";
CX.Build(CX.BuildTypes["@event"], {
    data: 'EntityHitEntity',
    executes(data) {
        if (data.damagingEntity instanceof Player && data.hitEntity instanceof Player) {
            if (CX.player.convert(data.damagingEntity).score.getScore('inCombat') < 1)
                data.damagingEntity.onScreenDisplay.setActionBar('§cYou are now in combat');
            CX.player.convert(data.damagingEntity).score.setScore('inCombat', 10);
            if (CX.player.convert(data.hitEntity).score.getScore('inCombat') < 1)
                data.hitEntity.onScreenDisplay.setActionBar('§cYou are now in combat');
            CX.player.convert(data.hitEntity).score.setScore('inCombat', 10);
            data.hitEntity.addTag('inCombat');
            data.damagingEntity.addTag('inCombat');
        }
        const tools = ['sword', 'pickaxe', 'shovel', 'hoe', 'axe'];
        Databases.enchantments.forEach((_, info) => {
            if (info.event == 'OnHit') {
                if (data.damagingEntity instanceof Player) {
                    const equipment = data.damagingEntity.getComponent('equipment_inventory');
                    if (tools.includes(info.equpiedOn)) {
                        const inv = data.damagingEntity.getComponent('inventory').container;
                        for (let i = 1; i < info.maxLevel + 1; i++) {
                            if (!inv.getItem(data.damagingEntity.selectedSlot))
                                return;
                            const lore = `${inv.getItem(data.damagingEntity.selectedSlot).getLore()}`.trim().split(/\s+/g);
                            if (lore.includes(CX.enchantment.getTierColor(info.tier) + info.name) && lore[lore.indexOf(CX.enchantment.getTierColor(info.tier) + info.name) + 1] == CX.extra.convertToRoman(i) && inv.getItem(data.damagingEntity.selectedSlot).typeId.endsWith(info.equpiedOn)) {
                                try {
                                    data.hitEntity.runCommandAsync(info.command.replaceAll('@s', data.damagingEntity.name).replaceAll('$hitEntity', '@s').replaceAll('$level', i - 1));
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
                                    data.hitEntity.runCommandAsync(info.command.replaceAll('@s', data.damagingEntity.name).replaceAll('$hitEntity', '@s').replaceAll('$level', i - 1));
                                }
                                catch { }
                            }
                        }
                    }
                }
            }
        });
    }
});

CX.Build(CX.BuildTypes["@event"], {
    data: 'EntityHitEntity',
    executes(data) {
        if (!(data.damagingEntity instanceof Player) || data.damagingEntity.hasTag(config.adminTag)) return;
        AAC(data.damagingEntity);
        if (AKA(data.damagingEntity, data.hitEntity)) {
            new CX.log({
                reason: 'Kill Aura',
                translate: 'AntiCheat',
                from: data.damagingEntity.name,
                warn: true
            })
            data.damagingEntity.kill()
        }
    }
})
const NDP = (v1, v2) => (v1.x * v2.x + v1.y * v2.y + v1.z * v2.z) / (Math.sqrt(v2.x ** 2 + v2.y ** 2 + v2.z ** 2) * Math.sqrt(v1.x ** 2 + v1.y ** 2 + v1.z ** 2));
const AKA = (attacker, target) => {
    if (attacker && target) {
        const angleInDegrees = Math.acos(NDP(attacker.getViewDirection(), ({ x: target.location.x - attacker.location.x, y: target.location.y - attacker.location.y, z: target.location.z - attacker.location.z }))) * (180 / Math.PI);
        const distance = Math.sqrt((target.location.x - attacker.location.x) ** 2 + (target.location.y - attacker.location.y) ** 2 + (target.location.z - attacker.location.z) ** 2);
        return angleInDegrees > 90 && distance >= 4;
    }
    return false;
}
const log = new Map()
const AAC = (player) => {
    const currentTime = Date.now();
    const lastData = log.get(`${player.id}-clickData`) || { lastClickTime: 0, cpsHistory: [] };
    const lastClickTime = lastData.lastClickTime;
    const cpsHistory = lastData.cpsHistory;
    if (lastClickTime && currentTime - lastClickTime > 1) {
        const timeBetweenClicks = currentTime - lastClickTime;
        const cps = 1000 / timeBetweenClicks;
        if (isFinite(cps)) {
            cpsHistory.push(cps);
            if (cpsHistory.length > 5) cpsHistory.shift();
            const CPS = cpsHistory.reduce((acc, val) => acc + val, 0) / cpsHistory.length;
            if (CPS > 20) {
                log.set(`${player.id}-clickData`, { qlastClickTime: currentTime, cpsHistory: [] });
                new CX.log({
                    reason: 'Auto Clicker',
                    translate: 'AntiCheat',
                    from: player.name,
                    warn: true
                })
                player.kill()
            }
        }
    }
    log.set(`${player.id}-clickData`, { lastClickTime: currentTime, cpsHistory });
}