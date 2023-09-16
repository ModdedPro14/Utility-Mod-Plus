import { CX } from "../../../API/CX";
import { Databases } from "../../../API/handlers/databases";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('homelist')
    .setDescription('Provides you with a list of your homes')
    .setCategory('miscellaneous'),
    executes(ctx) {
        ctx.execute((sender) => {
            const homes = [];
            for (const home of Databases.homes.values()) if (home.creator == sender.name) homes.push(home);
            if (homes.length == 0) return sender.response.error('You dont have any homes set yet');
            sender.response.send(`§c----------------\nHomes:\n${homes.sort().map((h) => `§6${h.name} §e- §6${h.location.x.toFixed(1)}§c, §6${h.location.y.toFixed(1)}§c, §6${h.location.z.toFixed(1)}§e - §6${h.dimension.replace('minecraft:', '')}`).join('\n')}\n§c----------------`, true, false);
        });
    }
})