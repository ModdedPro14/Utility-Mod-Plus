import { system } from "@minecraft/server";
import { CX } from "../../API/CX";
import { Databases } from "../../API/handlers/databases";
import { open } from "../commands/management/gui";
import config from "../../config/main";
CX.Build(CX.BuildTypes["@event"], {
    data: 'ItemUse',
    executes(data) {
        if (!config.enderPearlT) return
        const pearlD = 10;
        const interaction = data.interaction;
        if (interaction.permission.hasPermission('admin'))
            return;
        if (data.itemStack.typeId == 'minecraft:ender_pearl') {
            const score = interaction.score.getScore('pearlTimer');
            if (score !== 0) {
                interaction.response.send(`§cYou still have ${score} seconds before you can use an ender pearl again`, false, false);
                data.cancel = true;
            }
            else if (score == 0) {
                interaction.score.setScore('pearlTimer', pearlD);
            }
        }
    }
});

CX.Build(CX.BuildTypes["@event"], {
    data: 'ItemUse',
    executes(data) {
        Databases.guis.forEach((key, val) => {
            system.run(() => {
                if (val.item == data.itemStack.typeId) open(Databases.guis.read(key), data.interaction)
            })
        })
    }
})