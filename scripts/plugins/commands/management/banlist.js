import { CX } from "../../../API/CX";
import { Databases } from "../../../API/handlers/databases";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('banlist')
    .setDescription('Provides you a list of banned players')
    .setCategory('management')
    .setPermissions({ admin: true, mod: true }),
    executes(ctx) {
        ctx.execute((sender) => {
            const bans = []
            for (const ban of Databases.bans.values()) bans.push(ban)
            if (!bans.length) return sender.response.error('There are no banned players');
            sender.response.send(`§c----------------\nBanned players:\n${bans.map(b => b.name).join('\n')}\n§c----------------`, true, false);
        });
    }
})
