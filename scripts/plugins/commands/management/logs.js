import { CX } from "../../../API/CX";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('logs')
    .setDescription('Provides you with logs that have been made')
    .setCategory('management')
    .setPermissions({ admin: true, mod: true }),
    executes(ctx) {
        ctx.execute((sender) => {
            sender.response.send('Close the chat within 10 secondes');
            new CX.messageForm()
            .setTitle('§4All logs that have been made:')
            .setButton2('§aClose')
            .setButton1('§cClear')
            .setBody(CX.log.logs.join('\n'))
            .force(sender, (res) => {
                if (res.selection == 0) {
                    CX.log.logs = [];
                    sender.response.send('Cleared all logs that have been made');
                }
            }, 220);
        });
    }
})