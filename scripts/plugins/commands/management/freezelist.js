import { world } from '@minecraft/server';
import { CX } from '../../../API/CX';

CX.Build(CX.BuildTypes['@command'], {
    data: new CX.command()
    .setName('freezelist')
    .setDescription('Provides you a list of frozen players')
    .setCategory('management')
    .setAdmin(true),
    executes(ctx) {
        ctx.execute((sender) => {
            let theText = "§cFreezed Players:\n";
            for (const player of world.getPlayers({ tags: ["freeze"] })) theText += `${player.name}\n`;
            sender.response.send(theText, true, false);
        });
    }
})