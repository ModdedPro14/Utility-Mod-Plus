import { CX } from "../../API/CX";
import { VAILD_BLOCK_TAGS, IMPOSSIBLE_BREAKS } from "./extras/blockBreak/moderation";
import { PlayerLog } from "./extras/blockBreak/PlayerLog";
import config from "../../config/main";
import { Area } from "../../API/handlers/protect";
import { Capitator } from "../../API/handlers/capitator";
import { Databases } from "../../API/handlers/databases";
import { system } from "@minecraft/server";

const log = new PlayerLog();
const IMPOSSIBLE_BREAK_TIME = 70;
CX.Build(CX.BuildTypes['@event'], {
    data: 'BlockBreak',
    executes(interaction, data) {
        if (!config.AntiCheat.nuker)
            return;
        if (interaction.permission.hasPermission('admin'))
            return;
        if (data.block.getTags().some((tag) => VAILD_BLOCK_TAGS.includes(tag)))
            return;
        const old = log.get(interaction);
        log.set(interaction, Date.now());
        if (!old)
            return;
        if (IMPOSSIBLE_BREAKS.includes(data.block.typeId))
            return;
        if (old < Date.now() - IMPOSSIBLE_BREAK_TIME)
            return;
        data.cancel = true
        new CX.log({
            from: interaction.name,
            translate: 'AntiCheat',
            reason: 'nuker',
            warn: false
        });
        system.run(() => {
            interaction.kill()
        })
    }
});
CX.Build(CX.BuildTypes["@event"], {
    data: 'BlockBreak',
    executes(interaction, data) {
        if (interaction.permission.hasPermission('admin') && interaction.gamemode.getGamemode() == 'creative')
            return;
        const chunk = [~~((data.block.location.x + 1) / 16), ~~((data.block.location.z + 1) / 16)];
        if (!Databases.claims.has(`${chunk[0]}_${chunk[1]}`))
            return;
        if (CX.factions.isInFaction(interaction) && CX.factions.getPlayersFaction(interaction) == Databases.claims.read(`${chunk[0]}_${chunk[1]}`).faction)
            return;
        interaction.response.error(`You need to be in the faction ${Databases.claims.read(`${chunk[0]}_${chunk[1]}`).faction}§r§c§l to be able to break blocks here`);
        data.cancel = true
    }
});
CX.Build(CX.BuildTypes["@event"], {
    data: 'BlockBreak',
    executes(interaction, data) {
        const area = Area.as(interaction, [data.block.location.x, data.block.location.z]);
        if (area.isInArea) {
            if (area.permissions.break) return
            if (interaction.permission.hasPermission('admin'))
                return;
            system.run(() => {
                interaction.response.error('You cannot break blocks here');
            })
            data.cancel = true
        }
    }
});
CX.Build(CX.BuildTypes["@event"], {
    data: 'AfterBlockBreak',
    executes(_, data) {
        if (config.treeCapitator && data.itemStackBeforeBreak?.typeId.endsWith('axe') && (data.brokenBlockPermutation.hasTag("log") || (data.brokenBlockPermutation.type.id.includes("_log") && !data.brokenBlockPermutation.type.id.includes("stripped_")))) new Capitator(data.dimension, data.block.location, "log");
        if (config.veinMiner && data.itemStackBeforeBreak?.typeId.endsWith('pickaxe') && data.brokenBlockPermutation.type.id.includes("_ore")) new Capitator(data.dimension, data.block.location, "ore");
    }
});
