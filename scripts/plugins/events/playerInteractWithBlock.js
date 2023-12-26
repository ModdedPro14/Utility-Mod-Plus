import { system } from "@minecraft/server";
import { CX } from "../../API/CX";
import { Databases } from "../../API/handlers/databases";

CX.Build(CX.BuildTypes["@event"], {
    data: 'PlayerInteractWithBlock',
    executes(data) {
        if (data.interaction.permission.hasPermission('admin') && data.interaction.gamemode.getGamemode() == 'creative')
            return;
        const chunk = [~~((data.block.location.x + 1) / 16), ~~((data.block.location.z + 1) / 16)];
        if (!Databases.claims.has(`${chunk[0]}_${chunk[1]}`))
            return;
        if (CX.factions.isInFaction(data.interaction) && CX.factions.getPlayersFaction(data.interaction) == Databases.claims.read(`${chunk[0]}_${chunk[1]}`).faction)
            return;
        system.run(() => {
            data.interaction.response.error(`You need to be in the faction ${Databases.claims.read(`${chunk[0]}_${chunk[1]}`).faction}§r§c§l to be able to interact with blocks here`);
        })
        data.cancel = true
    }
})