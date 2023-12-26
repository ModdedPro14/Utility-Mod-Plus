import { CX } from "../../../API/CX";
import { Commands } from "../../../API/handlers/command";
import { Databases } from "../../../API/handlers/databases";
import { open } from "./gui";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('command')
    .setDescription('Create and manage custom commands')
    .setCategory('management')
    .setPermissions({ admin: true })
    .setAliases(['cmd'])
    .firstArguments(['create', 'delete'], true)
    .addDynamicArgument('create', [], 'create')
    .addDynamicArgument('delete', [], 'delete', 'command')
    .addAnyArgument('command', [{ name: 'delete', type: 'dyn'}], 1),
    executes(ctx) {
        ctx.executeArgument('create', (sender) => {
            sender.response.send('Close the chat within 10 secondes');
            new CX.modalForm()
            .setTitle('Command Creator')
            .addTextField('The name of the command: ', 'mehehe')
            .addTextField('The description of the command: ', 'Weird goofy cmd')
            .addTextField('The category of the command: ', 'goofy')
            .addToggle('Admin', false)
            .addTextField('Command:\n- opengui:guiname (opens a custom gui only do without any commands) ', 'say im goofy or opengui:gui')
            .force(sender, (res) => {
                if (res.canceled) return;
                if (Databases.customCmds.has(res.formValues[0]) || Commands.registeredCommands.find(c => c.name === res.formValues[0] || c.aliases.includes(res.formValues[0]))) return sender.response.error('That command already exists');
                if (!res.formValues[0]) return sender.response.error('The command must have a name');
                if (!res.formValues[4]) return sender.response.error('The command must have a command to run');
                if (res.formValues[0].match(/[\S]+/g)?.[1]) return sender.response.error('The command name cannot have spaces');
                CX.Build(CX.BuildTypes["@command"], {
                    data: new CX.command()
                    .setName(res.formValues[0])
                    .setDescription(res.formValues[1] ? res.formValues[1] : 'No description')
                    .setCategory(res.formValues[2] ? res.formValues[2] : 'uncategorized')
                    .setAdmin(res.formValues[3])
                    .setDevelopers([sender.name]),
                    executes(ctx) {
                        ctx.execute((sender) => {
                            if (res.formValues[4].startsWith('opengui:')) { 
                                open(Databases.guis.read(res.formValues[4].split('opengui:')[1]), sender)
                                sender.response.send('Close the chat within 10 secondes')
                            } else sender.runCommandAsync(res.formValues[4]);
                        });
                    }
                });
                Databases.customCmds.write(res.formValues[0], {
                    description: res.formValues[1] ? res.formValues[1] : 'No description',
                    category: res.formValues[2] ? res.formValues[2] : 'uncategorized',
                    admin: res.formValues[3],
                    developer: sender.name,
                    command: res.formValues[4]
                });
                sender.response.send(`Successfully created the command: ${res.formValues[0]}`);
            }, 220);
        });
        ctx.executeArgument('delete', (sender, _, args) => {
            if (!Databases.customCmds.has(args[0])) return sender.response.error('That command dosent exist');
            Commands.registeredCommands.splice(Commands.registeredCommands.indexOf(Commands.registeredCommands.find(c => c.name == args[0])), Commands.registeredCommands.indexOf(Commands.registeredCommands.find(c => c.name == args[0])));
            Databases.customCmds.delete(args[0]);
            sender.response.send(`Successfully deleted the command ${args[0]}`);
        });
    }
})