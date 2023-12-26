import { CX } from "../../../API/CX";
import { Databases } from "../../../API/handlers/databases";
import config from "../../../config/main";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('login')
    .setDescription('Login into your account')
    .setCategory('general')
    .firstArguments(['password'], true)
    .addAnyArgument('password', [], 1),
    executes(ctx) {
        ctx.executeArgument('password', (sender, val) => {
            if (!config.login) return sender.response.error('Login/register isnt enabled in this server')
            if (sender.hasTag('logged')) return sender.response.error('Your already logged in')
            if (!Databases.registrations.has(sender.id)) return sender.response.error('You must register before logging in')
            const data = Databases.registrations.read(sender.id)
            if (val !== data.password) return sender.response.error('Incorrect password')
            sender.management.unfreeze()
            sender.addTag('logged')
            sender.response.send('Successfully logged in')
        })
    }
})