import { CX } from "../../../API/CX";
import { Databases } from "../../../API/handlers/databases";
import config from "../../../config/main";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('register')
    .setDescription('Register your account')
    .setCategory('general')
    .firstArguments(['password'], true)
    .addAnyArgument('password', [], 1, null, 'confirmPassword')
    .addAnyArgument('confirmPassword', [{ name: 'password', type: 'any' }], 1),
    executes(ctx) {
        ctx.executeArgument('password', (sender, val, args) => {
            if (!config.login) return sender.response.error('Login/register isnt enabled in this server')
            if (sender.hasTag('logged')) return sender.response.error('Your already logged in')
            if (Databases.registrations.has(sender.id)) return sender.response.error('Your already registerd')
            if (val !== args[0]) return sender.response.error('The password does not match the confirmed password')
            Databases.registrations.write(sender.id, {
                password: val
            })
            sender.response.send(`Successfully registerd, use ${config.prefix}login <password> to login`)
        })
    }
})