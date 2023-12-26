import { CX } from "../../../API/CX";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('staffchat')
    .setDescription('Enter or leave the staff chat')
    .setCategory('management')
    .setPermissions({ admin: true, mod: true }),
    executes(ctx) {
        ctx.execute((sender) => {
            if (sender.chat.inStaffChat) {
                sender.removeTag('staffChat');
                sender.response.send('You have left the staff chat');
            } else {
                sender.addTag('staffChat');
                sender.response.send('You have joined the staff chat');
            }
        });
    }
})