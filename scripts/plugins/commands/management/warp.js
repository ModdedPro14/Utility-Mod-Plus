import { world } from "@minecraft/server";
import { CX } from "../../../API/CX";
import config from "../../../config/main";
import { Databases } from "../../../API/handlers/databases";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('warp')
    .setDescription('Create warps for your server')
    .setCategory('management')
    .firstArguments(['create', 'name', 'delete', 'list'], true)
    .addDynamicArgument('create', 'create', 'warp')
    .addDynamicArgument('delete', 'delete', 'warpname')
    .addDynamicArgument('list', 'list')
    .addAnyArgument('warp', 1, null)
    .addAnyArgument('warpname', 1)
    .addAnyArgument('name', 1),
    executes(ctx) {
        ctx.executeArgument('name', (sender, val) => {
            if (!Databases.warps.has(val)) return sender.response.error('That warp dosent exist');
            if (sender.management.jailed) return sender.response.error('You cant use this command while your jailed');
            sender.teleport(Databases.warps.read(val).location, { dimension: world.getDimension(Databases.warps.read(val).dimension) });
            sender.response.send(`You have been teleported to the warp: ${val}`);
        });
        ctx.executeArgument('create', (sender, _, args) => {
            if (!sender.permission.hasPermission('admin')) return sender.response.error('You dont have permission to use this argument');
            if (Databases.warps.has(args[0]?.split(' ').map(v => v[0].toUpperCase() + v.slice(1).toLowerCase()).join(" ")[0].toLowerCase().replaceAll(' ', '') + args[0]?.split(' ').map(v => v[0].toUpperCase() + v.slice(1).toLowerCase()).join(" ").slice(1).replaceAll(' ', ''))) return sender.response.error('That warp already exists');
            Databases.warps.write(args[0]?.split(' ').map(v => v[0].toUpperCase() + v.slice(1).toLowerCase()).join(" ")[0].toLowerCase().replaceAll(' ', '') + args[0]?.split(' ').map(v => v[0].toUpperCase() + v.slice(1).toLowerCase()).join(" ").slice(1).replaceAll(' ', ''), {
                location: { x: sender.location.x, y: sender.location.y, z: sender.location.z },
                warp: args[0]?.split(' ').map(v => v[0].toUpperCase() + v.slice(1).toLowerCase()).join(" ")[0].toLowerCase().replaceAll(' ', '') + args[0]?.split(' ').map(v => v[0].toUpperCase() + v.slice(1).toLowerCase()).join(" ").slice(1).replaceAll(' ', ''),
                dimension: sender.dimension.id
            });
            sender.response.send(`Successfully created a warp at your location with the name: ${args[0]?.split(' ').map(v => v[0].toUpperCase() + v.slice(1).toLowerCase()).join(" ")[0].toLowerCase().replaceAll(' ', '') + args[0].split(' ').map(v => v[0].toUpperCase() + v.slice(1).toLowerCase()).join(" ").slice(1).replaceAll(' ', '')}`);
        });
        ctx.executeArgument('delete', (sender, _, args) => {
            if (!sender.permission.hasPermission('admin')) return sender.response.error('You dont have permission to use this argument');
            if (!Databases.warps.has(args[0])) return sender.response.error('That warp dosent exist');
            Databases.warps.delete(args[0]);
            sender.response.send(`Successfully deleted the warp: ${args[0]}`);
        });
        ctx.executeArgument('list', (sender) => {
            const warps = []
            for (const warp of Databases.warps.values()) warps.push(warp)
            if (!warps.length) return sender.response.error('There are no warps in this server')
            sender.response.send(`§c----------------\nAll warps:\n${warps.map(w => w.warp).join('\n')}\n§c----------------`, true, false);
        });
    }
})