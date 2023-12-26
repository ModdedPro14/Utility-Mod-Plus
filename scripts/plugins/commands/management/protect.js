import { CX } from "../../../API/CX";
import { Databases } from "../../../API/handlers/databases";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('protect')
    .setDescription('Protect a land or an area')
    .setCategory('management')
    .setPermissions({ admin: true })
    .firstArguments(['create', 'set', 'delete', 'list', 'permission'], true)
    .addDynamicArgument('create', [], 'create', 'name')
    .addDynamicArgument('set', [], 'set', 'area')
    .addDynamicArgument('delete', [], 'delete', 'name')
    .addDynamicArgument('list', [], 'list')
    .addDynamicArgument('permission', [], 'permission', 'areaName')
    .addAnyArgument('name', [{ name: '<create | delete>', type: 'dyn'}], 1)
    .addAnyArgument('area', [], 1, null, ['pos1', 'pos2'])
    .addAnyArgument('areaName', [], 1, null, ['pvp', 'build', 'break'])
    .addDynamicArgument('pos1', [{ name: 'set', type: 'dyn'}, { name: 'area', type: 'any'}], 'pos1')
    .addDynamicArgument('pos2', [{ name: 'set', type: 'dyn'}, { name: 'area', type: 'any'}], 'pos2')
    .addDynamicArgument('pvp', [{ name: 'permission', type: 'dyn' }, { name: 'area', type: 'any' }], 'pvp')
    .addDynamicArgument('build', [{ name: 'permission', type: 'dyn' }, { name: 'area', type: 'any' }], 'build')
    .addDynamicArgument('break', [{ name: 'permission', type: 'dyn' }, { name: 'area', type: 'any' }], 'break'),
    executes(ctx) {
        ctx.executeArgument('create', (sender, _, args) => {
            if (Databases.areas.has(args[0])) return sender.response.error('That area name already exists');
            Databases.areas.write(args[0], {
                dimension: undefined,
                pos1: undefined,
                pos2: undefined,
                permissions: {
                    pvp: false,
                    build: false,
                    break: false
                }
            });
            sender.response.send(`Created an area with the name ${args[0]}`);
        });
        ctx.executeArgument('set', (sender, _, args) => {
            if (!Databases.areas.has(args[0])) return sender.response.error('That area name dosent exist');
            if (args[1] == 'pos1') {
                if (Databases.areas.read(args[0]).pos1) return sender.response.error('Pos1 is already set to this area name');
                Databases.areas.write(args[0], {
                    dimension: sender.dimension.id,
                    pos1: { x: Math.floor(sender.location.x), z: Math.floor(sender.location.z) },
                    pos2: Databases.areas.read(args[0]).pos2 ? Databases.areas.read(args[0]).pos2 : undefined,
                    permissions: Databases.areas.read(args[0])?.permissions
                });
                sender.response.send(`Successfully set pos1 to ${args[0]}`);
            }
            else if (args[1] == 'pos2') {
                if (Databases.areas.read(args[0]).pos2) return sender.response.error('Pos2 is already set to this area name');
                Databases.areas.write(args[0], {
                    dimension: sender.dimension.id,
                    pos1: Databases.areas.read(args[0]).pos1 ? Databases.areas.read(args[0]).pos1 : undefined,
                    pos2: { x: Math.floor(sender.location.x), z: Math.floor(sender.location.z) },
                    permissions: Databases.areas.read(args[0])?.permissions
                });
                sender.response.send(`Successfully set pos2 to ${args[0]}`);
            }
        });
        ctx.executeArgument('delete', (sender, _, args) => {
            if (!Databases.areas.has(args[0])) return sender.response.error('That area name already dosent exist');
            Databases.areas.delete(args[0]);
            sender.response.send(`Successfully delete the area ${args[0]}`);
        });
        ctx.executeArgument('list', (sender) => {
            const areas = [];
            for (const area of Databases.areas.allKeysP()) areas.push(area);
            if (areas.length == 0) return sender.response.error('You dont have any areas set yet');
            sender.response.send(`§c----------------\nAreas:\n${areas.sort().map((a) => `§6${a}`).join('\n')}\n§c----------------`, true, false);
        });
        ctx.executeArgument('permission', (sender, _, args) => {
            if (!Databases.areas.has(args[0])) return sender.response.error('That area name dosent exist');
            Databases.areas.write(args[0], {
                dimension: Databases.areas.read(args[0])?.dimension,
                pos1: Databases.areas.read(args[0])?.pos1,
                pos2: Databases.areas.read(args[0])?.pos2,
                permissions: Object.assign(Databases.areas.read(args[0])?.permissions, {
                    [args[1]]: Databases.areas.read(args[0])?.permissions[args[1]] ? false : true,
                })
            });
            sender.response.send(`Successfully set ${args[1]} in the area ${args[0]} to ${Databases.areas.read(args[0])?.permissions[args[1]] ? true : false}`)
        })
    }
})