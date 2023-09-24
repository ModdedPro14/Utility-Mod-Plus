import { world } from "@minecraft/server";
import { CX } from "../../../API/CX";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('leaderboard')
    .setDescription('A better way of showing scoreboard objectives')
    .setCategory('miscellaneous')
    .setAliases(['lb'])
    .setAdmin(true)
    .firstArguments(['create', 'delete'], true)
    .addDynamicArgument('create', [], 'create', 'objective')
    .addDynamicArgument('delete', [], 'delete')
    .addAnyArgument('objective', [], 1, null, 'length')
    .addNumberArgument('length', ['create', 'objective']),
    executes(ctx) {
        ctx.executeArgument('create', (sender, _, args) => {
            sender.runCommandAsync(`scoreboard objectives add "${args[0]}" dummy`);
            const objective = args[0], length = args[1];
            const rabbit = world.afterEvents.entitySpawn.subscribe(({ entity }) => {
                entity.addTag('ftlb');
                entity.addTag(`ft:${objective}`);
                entity.addTag(`ftl:${length ? length : 10}`);
                let dashes;
                for (let i = 0; i < `${objective.toUpperCase()}§r§e LEADERBOARD§r`.length; i++) {
                    const colors = ['§6', '§e'];
                    let txt = '', index = 0, text = new Array(i).join('-').replace(/§./g, '');
                    for (let i = 0; i < text.length; i++) {
                        txt += `${colors[index]}${text[i]}`;
                        index + 1 >= colors.length ? index = 0 : index++;
                    }
                    dashes = txt;
                }
                entity.addTag(`fth:§6§l${objective.toUpperCase()}§r§e LEADERBOARD§r\n${dashes}`);
                world.afterEvents.entitySpawn.unsubscribe(rabbit);
            });
            sender.dimension.spawnEntity('mod:ft', sender.management.Location());
            sender.response.send(`Successfully created a leaderboard displaying the objective "§6${objective}§r§e".§r`);
        });
        ctx.executeArgument('delete', (sender) => {
            let entity = Array.from(sender.dimension.getEntities({ type: 'mod:ft', tags: ['ftlb'], maxDistance: 2, location: sender.management.Location() }))[0];
            if (!entity) return sender.response.error('Unable to locate a leaderboard within the radius of 2 blocks');
            const obj = entity.getTags().find(tag => tag.startsWith('ft:')).replace('ft:', '');
            sender.response.send(`Successfully removed a nearby leaderboard displaying the objective ${obj}`);
            entity.runCommandAsync('kill @s');
        });
    }
})