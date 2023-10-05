import { CX } from "../../API/CX";
import { Databases } from "../../API/handlers/databases";
import { Area } from "../../API/handlers/protect";
import config from "../../config/main";
import { system, BlockTypes } from "@minecraft/server";

CX.Build(CX.BuildTypes["@event"], {
    data: 'ItemUseOn',
    executes(data) {
        if (!data.interaction.permission.hasPermission('admin') && config.AntiCheat.cbes) {
            if (config.allCbes.includes(data.itemStack.typeId.replace('minecraft:', ''))) {
                data.cancel = true;
                const itemStack = data.itemStack;
                system.run(() => {
                    new CX.log({
                        from: data.interaction.name,
                        translate: 'AntiCheat',
                        reason: `${CX.item.getItemName(itemStack)}`,
                        warn: true
                    });
                });
                data.interaction.runCommandAsync(`clear @s ${data.itemStack.typeId}`);
            }
        }
        if (!data.interaction.permission.hasPermission('admin') && !data.interaction.permission.hasPermission('trusted') && config.AntiCheat.cbes) {
            if (config.trustedCbes.includes(data.itemStack.typeId.replace('minecraft:', ''))) {
                data.cancel = true;
                const itemStack = data.itemStack;
                system.run(() => {
                    new CX.log({
                        from: data.interaction.name,
                        translate: 'AntiCheat',
                        reason: `${CX.item.getItemName(itemStack)}`,
                        warn: true
                    });
                });
                data.interaction.runCommandAsync(`clear @s ${data.itemStack.typeId}`);
            }
        }
    }
});
CX.Build(CX.BuildTypes["@event"], {
    data: 'ItemUseOn',
    executes(data) {
        if (data.interaction.permission.hasPermission('admin') && data.interaction.gamemode.getGamemode() == 'creative')
            return;
        const block = data.interaction?.dimension?.getBlock(data.interaction.management?.viewedBlock()) ?? undefined
        const chunk = [~~((block.location.x + 1) / 16), ~~((block.location.z + 1) / 16)];
        if (!Databases.claims.has(`${chunk[0]}_${chunk[1]}`))
            return;
        if (CX.factions.isInFaction(data.interaction) && CX.factions.getPlayersFaction(data.interaction) == Databases.claims.read(`${chunk[0]}_${chunk[1]}`).faction)
            return;
        if (config.toggleAblePermissions && block.typeId.endsWith('door') || block.typeId.endsWith('button') || block.typeId === BlockTypes.get('lever').id)
            return;
        const i = data.interaction;
        data.cancel = true;
        system.run(() => {
            i.response.error(`You need to be in the faction ${Databases.claims.read(`${chunk[0]}_${chunk[1]}`).faction}§r§c§l to be able to place blocks here`);
        });
    }
});
CX.Build(CX.BuildTypes["@event"], {
    data: 'ItemUseOn',
    executes(data) {
        const area = Area.as(data.interaction, [data.block.location.x, data.block.location.z]);
        if (area.isInArea) {
            if (data.interaction.permission.hasPermission('admin'))
                return;
            data.cancel = true;
            system.run(() => {
                data.interaction.response.error('You cannot place blocks here');
            });
        }
    }
});
