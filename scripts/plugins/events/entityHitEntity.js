import { CX } from "../../API/CX";
import { Player, EquipmentSlot } from "@minecraft/server";
import { Databases } from "../../API/handlers/databases";
import config, { log } from "../../config/main";
import { ItemDB } from "../../API/database/IDB";

const crates = new ItemDB('crates')

CX.Build(CX.BuildTypes["@event"], {
    data: 'EntityHitEntity',
    executes(data) {
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
        if (!(data.damagingEntity instanceof Player) && !(data.damagingEntity instanceof Player) || data.damagingEntity.hasTag(config.adminTag)) return;
        if (config.AntiCheat.AAC) {
            const arr = (log.get(data.damagingEntity) ?? [])
            arr.push(11)
            log.set(data.damagingEntity, arr)
            if (arr.length > 20) {
                new CX.log({
                    reason: 'Auto Clicker',
                    translate: 'AntiCheat',
                    from: data.damagingEntity.name,
                    warn: true
                })
                data.damagingEntity.kill()
            }
        }
        if (!config.AntiCheat.AKA) return
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
CX.Build(CX.BuildTypes["@event"], {
    data: 'EntityHitEntity',
    executes(data) {
        if (!(data.damagingEntity instanceof Player)) return
        if (!data.hitEntity.hasTag('slapper')) return
        data.hitEntity.getTags().filter(tag => tag.startsWith('cmd:')).forEach((c) => {
            data.damagingEntity.runCommandAsync(c.split(':')[1]) 
        })
    }
})

CX.Build(CX.BuildTypes["@event"], {
    data: 'EntityHitEntity',
    executes(data) {
        if (!data.damagingEntity instanceof Player) return
        const damagingEntity = CX.player.convert(data.damagingEntity)
        if (data.hitEntity.typeId !== 'mod:crate') return
        const form = new CX.chestForm('large')
        .setTitle('Crate')
        const items = crates.allIDs().filter(i => i.data.id == data.hitEntity.getTags().find(tag => tag.startsWith('ID:')).substring('ID:'.length))
        if (!items.length) return (new CX.messageForm()
        .setTitle('No rewards')
        .setBody('§cHmmm.. seems like there are no rewards in this crate')
        .setButton2('§cClose')
        .setButton1('§aOk')
        .show(damagingEntity))
        items.forEach((item, i) => {
            const data = CX.item.getItemData(item.item)
            form.addButton(i, CX.item.getItemName(item.item), [data.enchantments.length ? data.enchantments.map(e => `§7${e.id.split('_').map(v => v[0].toUpperCase() + v.slice(1).toLowerCase()).join(" ")} ${CX.extra.convertToRoman(e.level)}`).join('\n') : '', data.lore, `\n§7Chance: §6${item.data.chance}%`], data.typeId, data.amount, !data.enchantments.length ? false : true);
        })
        form.show(damagingEntity, (res) => {
            if (res.canceled) return
            const selection = items[res.selection]
            if (damagingEntity.permission.hasPermission('admin')) {
                new CX.chestForm('small')
                .setTitle(`${CX.item.getItemName(selection.item)} Reward`)
                .addButton(5, '§cCancel', ['§6Cancel'], 'textures/blocks/glass_red')
                .addButton(3, '§aRemove Reward', ['§6Do You want to remove this reward?'], 'textures/blocks/glass_lime')
                .show(damagingEntity, (result) => {
                    if (result.canceled) return
                    if (result.selection == 3) {
                        crates.deleteID(selection.ID)
                        damagingEntity.response.send('Successfully removed reward')
                    }
                })
            }
        })
    }
})