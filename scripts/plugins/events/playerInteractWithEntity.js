import { Player, system } from "@minecraft/server";
import { CX } from "../../API/CX";
import { Databases } from "../../API/handlers/databases";

CX.Build(CX.BuildTypes["@event"], {
    data: 'PlayerInteractWithEntity',
    executes(data) {
        if (!(data.interacted instanceof Player)) return
        if (!data.interaction.permission.hasPermission('admin')) return
        system.run(() => {
            if (data.interacted.permission.hasPermission('admin')) return data.interaction.response.error('You cannot manage an admin')
            new CX.actionForm()
            .setTitle(`Manage ${data.interacted.name}`)
            .setBody('Chosse an option:')
            .addButton('Ban')
            .addButton('Mute')
            .addButton('Kick')
            .addButton('Freeze')
            .addButton('Warn')
            .show(data.interaction, (res) => {
                if (res.canceled) return
                if (res.selection == 0) {
                    new CX.modalForm()
                    .setTitle('Ban')
                    .addTextField('Ban reason:', 'No reason', 'No reason')
                    .show(data.interaction, (result) => {
                        if (result.canceled) return
                        if (Databases.bans.has(data.interacted.name)) return data.interaction.response.error(`§6${data.interacted.name} §cis already banned`);
                        Databases.bans.write(data.interacted.name, {
                            name: data.interacted.name,
                            date: new Date().toLocaleString(),
                            reason: result.formValues[0] ?? 'No reason',
                            by: data.interaction.name
                        });
                        data.interaction.response.send(`You have banned the player ${data.interacted.name} §cReason: ${result.formValues[0] ?? 'No reason'}`);
                    })                
                } else if (res.selection == 1) {
                    new CX.modalForm()
                    .setTitle('Mute')
                    .addTextField('Mute reason:', 'No reason', 'No reason')
                    .show(data.interaction, (result) => {
                        if (result.canceled) return
                        if (data.interacted.chat.muted) return data.interaction.response.error(`§6${data.interacted.name} §cis already muted`);
                        data.interaction.response.send(`§cYou have muted:\n§cPlayer: §6${data.interacted.name}\n§cReason: §6${result.formValues[0] ?? 'No reason'}`, true, false);
                        data.interacted.response.send(`§cYou have been muted:\n§cBy: §6${data.interaction.name}\n§cReason: §6${result.formValues[0] ?? 'No reason'}`, true, false);
                        data.interacted.chat.mute();
                    })
                } else if (res.selection == 2) {
                    new CX.modalForm()
                    .setTitle('Kick')
                    .addTextField('Kick reason:', 'No reason', 'No reason')
                    .show(data.interaction, (result) => {
                        if (result.canceled) return
                        data.interacted.runCommandAsync(`kick "${data.interacted.name}" "${result.formValues[0] ?? "No reason"}"`)
                        data.interaction.response.send(`You have kicked ${data.interacted.name}`)
                    })
                } else if (res.selection == 3) {
                    if (data.interacted.management.freezed) return data.interaction.response.error(`§6${data.interacted.name} §cis already freezed`);
                    data.interacted.management.freeze();
                    data.interacted.response.send(`You have been freezed by:§6 ${data.interaction.name}`);
                    data.interaction.response.send(`Player: §6${data.interacted.name}§c has been freezed`);
                } else if (res.selection == 4) {
                    new CX.modalForm()
                    .setTitle('Warn')
                    .addTextField('Warn reason:', 'No reason', 'No reason')
                    .show(data.interaction, (result) => {
                        if (result.canceled) return
                        data.interaction.response.send(`§cYou have warned:\nPlayer: ${data.interacted.name}\n§cReason: ${result.formValues[0] ?? 'No reason'}`, true, false);
                        data.interacted.response.send(`§cYou have been warned:\nBy: ${data.interaction.name}\n§cReason: ${result.formValues[0] ?? 'No reason'}`, true, false);
                    })
                }
            })
        })
    }
})