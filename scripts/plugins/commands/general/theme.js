import { CX } from "../../../API/CX";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('theme')
    .setDescription('Set the color of your name or chat')
    .setCategory('general')
    .setAdmin(true)
    .firstArguments(['setcolor'], true)
    .addDynamicArgument('setcolor', 'setcolor', 'player')
    .addPlayerArgument('player', true, 'name/chat')
    .addAnyArgument('name/chat', 1, {}, 'color')
    .addDynamicArgument('color', ['darkRed', 'red', 'orange', 'yellow', 'darkYellow', 'darkGreen', 'green', 'blue', 'lightBlue', 'aquaBlue', 'purple', 'magenta', 'pink', 'black', 'rainbow', 'default']),
    executes(ctx) {
        ctx.executeArgument('player', (sender, player, args) => {
            if (!['name', 'chat'].includes(args[0])) return sender.response.error('The last agument must be either name or chat');
            if (args[0] == 'name') {
                if (args[1] == 'default') {
                    player.removeTag(`ncolor:${player.chat.getColor('name')}`);
                    sender.response.send(`Added the default name color to the player ${player.name}`);
                    player.response.send(`${sender.name} has added to you the default name color`);
                } else {
                    if (player.chat.hasColor('name')) {
                        player.removeTag(`ncolor:${player.chat.getColor('name')}`);
                        player.addTag(`ncolor:${args[1]}`);
                        sender.response.send(`Added the name color ${args[1]} to the player ${player.name}`);
                        player.response.send(`${sender.name} has added to you a ${args[1]} name color`);
                    } else {
                        player.addTag(`ncolor:${args[1]}`);
                        sender.response.send(`Added the chat color ${args[1]} to the player ${player.name}`);
                        player.response.send(`${sender.name} has added to you a ${args[1]} chat color`);
                    }
                }
            }
            else {
                if (args[1] == 'default') {
                    player.removeTag(`ccolor:${player.chat.getColor('chat')}`);
                    sender.response.send(`Added the default chat color to the player ${player.name}`);
                    player.response.send(`${sender.name} has added to you the default chat color`);
                } else {
                    if (player.chat.hasColor('chat')) {
                        player.removeTag(`ccolor:${player.chat.getColor('chat')}`);
                        player.addTag(`ccolor:${args[1]}`);
                        sender.response.send(`Added the chat color ${args[1]} to the player ${player.name}`);
                        player.response.send(`${sender.name} has added to you a ${args[1]} chat color`);
                    } else {
                        player.addTag(`ccolor:${args[1]}`);
                        sender.response.send(`Added the chat color ${args[1]} to the player ${player.name}`);
                        player.response.send(`${sender.name} has added to you a ${args[1]} chat color`);
                    }
                }
            }
        });
    }
});
