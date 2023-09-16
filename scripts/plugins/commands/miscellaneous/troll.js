import { CX } from "../../../API/CX";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('troll')
    .setDescription('Troll someone')
    .setCategory('miscellaneous')
    .setAdmin(true)
    .firstArguments(['player'], false)
    .addPlayerArgument('player', true, ['creeper', 'explode', 'cave', 'hurt', 'fire', 'fly', 'enderman', 'slownessScreen'], { self: true })
    .addDynamicArgument('creeper', 'creeper')
    .addDynamicArgument('explode', 'explode')
    .addDynamicArgument('cave', 'cave')
    .addDynamicArgument('hurt', 'hurt')
    .addDynamicArgument('fire', 'fire')
    .addDynamicArgument('fly', 'fly')
    .addDynamicArgument('enderman', 'enderman')
    .addDynamicArgument('slownessScreen', 'slownessScreen'),
    executes(ctx) {
        ctx.execute((sender, args) => !args.length && sender.response.error('Avalible trolls: creeper/explode/cave/hurt/fire/fly/enderman/slownessScreen'));
        ctx.executeArgument('player', (sender, player, args) => {
            if (args[0] == 'creeper') {
                player.playSound('random.fuse');
                sender.response.send(`Trolled the player §6${player.name} §cwith creeper sound`);
            } else if (args[0] == 'explode') {
                player.playSound('random.explode');
                sender.response.send(`Trolled the player §6${player.name} §cwith explode sound`);
            } else if (args[0] == 'cave') {
                player.playSound('ambient.cave');
                sender.response.send(`Trolled the player §6${player.name} §cwith cave sound`);
            } else if (args[0] == 'hurt') {
                player.applyDamage(1);
                sender.response.send(`Trolled the player §6${player.name} §cwith random hurt`);
            } else if (args[0] == 'fire') {
                player.setOnFire(2);
                player.response.send(`Trolled the player §6${player.name} §cwith fire`);
            } else if (args[0] == 'fly') {
                player.addEffect('levitation', 50, { amplifier: 15, showParticles: false });
                sender.response.send(`Trolled the player §6${player.name} §cwith levitation effect`);
            } else if (args[0] == 'enderman') {
                player.playSound('mob.endermen.stare');
                sender.response.send(`Trolled the player §6${player.name} §cwith enderman sound`);
            } else if (args[0] == 'slownessScreen') {
                player.addEffect('slowness', 50, { amplifier: 255, showParticles: false });
                sender.response.send(`Trolled the player §6${player.name} §cwith slowness screen`);
            }
        });
    }
})