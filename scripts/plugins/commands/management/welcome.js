import { CX } from "../../../API/CX";
import { Databases } from "../../../API/handlers/databases";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('welcome')
    .setDescription('Setup a welcome screen to ur server')
    .setCategory('management')
    .setAdmin(true)
    .firstArguments(['message', 'remove'], true)
    .addDynamicArgument('remove', [], 'remove')
    .addAnyArgument('message', [], 1),
    executes(ctx) {
        ctx.executeArgument('message', (sender, val) => {
            Databases.server.write('welcomeMessage', val);
            sender.response.send('Your message has been successfully setup');
        });
        ctx.executeArgument('remove', (sender) => {
            if (!Databases.server.has('welcomeMessage')) return sender.response.error('There isnt a welcome screen setup');
            Databases.server.delete('welcomeMessage');
            sender.response.send('Removed the welcome screen successfully');
        });
    }
})