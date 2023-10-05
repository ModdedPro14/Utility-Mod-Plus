import { GameMode, system, world } from "@minecraft/server";
import { Area } from "../../API/handlers/protect";
import { CX } from "../../API/CX";
import { Databases } from "../../API/handlers/databases";
import config from "../../config/main";

CX.Build(CX.BuildTypes["@event"], {
    data: 'BlockPlace',
    executes(interaction, data) {
        if (interaction.permission.hasPermission('admin') && interaction.gamemode.getGamemode() == 'creative')
            return;
        const chunk = [~~((data.block.location.x + 1) / 16), ~~((data.block.location.z + 1) / 16)];
        if (!Databases.claims.has(`${chunk[0]}_${chunk[1]}`))
            return;
        if (CX.factions.isInFaction(interaction) && CX.factions.getPlayersFaction(interaction) == Databases.claims.read(`${chunk[0]}_${chunk[1]}`).faction)
            return;
        interaction.response.error(`You need to be in the faction ${Databases.claims.read(`${chunk[0]}_${chunk[1]}`).faction}§r§c§l to be able to place blocks here`);
        data.cancel = true
    }
});
CX.Build(CX.BuildTypes["@event"], {
    data: 'BlockPlace',
    executes(interaction, data) {
        const area = Area.as(interaction, [data.block.location.x, data.block.location.z]);
        if (area.isInArea) {
            if (interaction.permission.hasPermission('admin'))
                return;
            data.interaction.response.error('You cannot place blocks here');
            data.cancel = true
        }
    }
});

const log = new Map()

CX.Build(CX.BuildTypes["@event"], {
    data: 'AfterBlockPlace',
    executes(interaction, data) {
        if (!config.AntiCheat.scaffold) return
        if (interaction.hasTag(config.adminTag) || !world.getPlayers({ excludeGameModes: [GameMode.creative], name: interaction.name }).length) return;
        const currentTime = Date.now();
        const playerAction = log.get(`${interaction.id}-checkBlocks`) || [];
        const timeThreshold = currentTime - 500;
        playerAction.push({ type: 'blocks', time: currentTime, position: data.block.location });
        const updatedActions = playerAction.filter(action => action.time >= timeThreshold);
        log.set(`${interaction.id}-checkBlocks`, updatedActions);
        if (updatedActions.length < 5) return;
        const [lastAction] = updatedActions;
        const timeDifference = currentTime - lastAction.time;
        const distance = Math.sqrt((data.block.location.x - lastAction.position.x) ** 2 + (data.block.location.y - lastAction.position.y) ** 2 + (data.block.location.z - lastAction.position.z) ** 2);
        const blocksPlacedPerSecond = updatedActions.length / (timeDifference / 500);
        const averageDistance = distance / updatedActions.length;
        if (blocksPlacedPerSecond >= 5 && averageDistance < 1) {
            data.block.setType('air')
            new CX.log({
                reason: 'Scaffold',
                translate: 'AntiCheat',
                from: interaction.name,
                warn: true
            })
            interaction.applyDamage(10);
        }
    }
})