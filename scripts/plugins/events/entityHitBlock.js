import { Player, system } from "@minecraft/server";
import { Area } from "../../API/handlers/protect";
import { CX } from "../../API/CX";
import { Databases } from "../../API/handlers/databases";
CX.Build(CX.BuildTypes["@event"], {
    data: 'EntityHitBlock',
    executes(data) {
        if (!data.hitBlock || !data.damagingEntity instanceof Player)
            return;
        const player = CX.player.convert(data.damagingEntity);
        if (player.gamemode.getGamemode() == 'creative' && player.permission.hasPermission('admin'))
            return;
        const chunk = [~~((data.hitBlock.location.x + 1) / 16), ~~((data.hitBlock.location.z + 1) / 16)];
        if (!Databases.claims.has(`${chunk[0]}_${chunk[1]}`))
            return;
        if (CX.factions.isInFaction(player) && CX.factions.getPlayersFaction(player) == Databases.claims.read(`${chunk[0]}_${chunk[1]}`).faction)
            return;
        player.response.error(`You need to be in the faction ${CX.factions.claims.read(`${chunk[0]}_${chunk[1]}`).faction}§r§c§l to be able to break blocks here`);
        player.runCommandAsync('gamemode a').then(() => {
            system.runTimeout(() => {
                player.runCommandAsync('gamemode s');
            }, 60);
        });
    }
});
CX.Build(CX.BuildTypes["@event"], {
    data: 'EntityHitBlock',
    executes(data) {
        if (!data.hitBlock || !data.damagingEntity instanceof Player)
            return;
        const player = CX.player.convert(data.damagingEntity);
        const area = Area.as(player, [data.hitBlock.location.x, data.hitBlock.location.z]);
        if (area.isInArea) {
            if (area.permissions.break) return
            if (player.permission.hasPermission('admin'))
                return;
            player.response.error('You cannot break blocks here');
            player.runCommandAsync('gamemode a').then(() => {
                system.runTimeout(() => {
                    player.runCommandAsync('gamemode s');
                }, 60);
            });
        }
    }
});
