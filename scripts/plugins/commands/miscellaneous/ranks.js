import { CX } from "../../../API/CX";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('rank')
    .setDescription('Manage a players ranks')
    .setCategory('miscellaneous')
    .setPermissions({ admin: true })
    .firstArguments(['player'], true)
    .addPlayerArgument('player', [], true, ['add', 'remove', 'removeAll'])
    .addDynamicArgument('add', [], 'add', 'rank')
    .addDynamicArgument('remove', [], 'remove', 'rank')
    .addDynamicArgument('removeAll', [{ name: 'player', type: 'player'}], 'removeAll', null)
    .addAnyArgument('rank', [{ name: 'player', type: 'player'}, { name: '<add | remove>', type: 'dyn'}], 1),
    executes(ctx) {
        ctx.executeArgument('player', (sender, player, args) => {
            if (args[0] == 'add') {
                if (player.hasTag(`rank:${args[1]}`)) return sender.response.error(`§6${player.name} §calready has that rank`);
                sender.response.send(`You have added the rank §6${args[1]}§c to §6${player.name}`);
                player.response.send(`Player: §6${sender.name}§c added to you the rank §6${args[1]}`);
                player.addTag(`rank:${args[1]}`);
            } else if (args[0] == 'remove') {
                if (!player.hasTag(`rank:${args[1]}`)) return sender.response.error('You must provide a rank that the player has');
                sender.response.send(`You have removed the rank §6${args[1]}§c from §6${player.name}`);
                player.response.send(`Player: §6${sender.name}§c removed from you the rank §6${args[1]}`);
                player.removeTag(`rank:${args[1]}`);
            } else if (args[0] == 'removeAll') {
                if (!player.chat.hasRanks) return sender.response.error(`§6${player.name} §cdosent have any ranks to remove`);
                for (const ranks of player.chat.getAllRanks) {
                    if (!ranks) continue;
                    player.removeTag(ranks);
                }
                sender.response.send(`Removed all the ranks from the player §6${player.name}`);
                player.response.send(`§6${sender.name} §cremoved from you all of the ranks`);
            }
        });
    }
})