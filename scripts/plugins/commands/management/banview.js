import { CX } from "../../../API/CX";
import { Databases } from "../../../API/handlers/databases";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('banview')
    .setDescription('Provides you with info abut a banned player')
    .setCategory('management')
    .setAdmin(true)
    .firstArguments(['player'], true)
    .addAnyArgument('player', [], 1),
    executes(ctx) {
        ctx.executeArgument('player', (sender, player) => {
            if (!Databases.bans.has(player)) return sender.response.error('You must type a players name that is banned');
            const data = Databases.bans.read(player);
            let text = '\n';
            text += `§cName: ${data.name} \n§r§cBanned by: ${data.by} \n§r§cBanned at: ${data.date} \n§r§cReason: ${data.reason}`;
            sender.response.send(`§cViewing the banned player §6${player}§r§c:${text}`, true, false);
        });
    }
})