import { ItemTypes } from "@minecraft/server";
import { CX } from "../../../API/CX";
import { Databases } from "../../../API/handlers/databases";

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('gui')
    .setDescription('Create or manage custom guis')
    .setCategory('management')
    .setAdmin(true)
    .firstArguments(['create', 'delete', 'open', 'edit'], true)
    .addDynamicArgument('create', [], 'create')
    .addDynamicArgument('delete', [], 'delete', 'name')
    .addDynamicArgument('edit', [], 'edit', 'name')
    .addDynamicArgument('open', [], 'open', 'name')
    .addAnyArgument('name', [{ name: '<delete | edit | open>', type: 'dyn'}], 1),
    executes(ctx) {
        ctx.executeArgument('create', (sender) => {
            sender.response.send('Close the chat within 10 secondes')
            new CX.modalForm()
            .setTitle('Create a gui')
            .addDropDown('Select the gui type:', ['actionForm'])
            .force(sender, (res) => {
                if (res.formValues[0] == 'actionForm') {
                    new CX.modalForm()
                    .setTitle('Create an action form')
                    .addTextField('Title:', 'something')
                    .addTextField('Body (optional):', 'some gui')
                    .addTextField('Item to open (optional):', 'minecraft:diamond')
                    .addTextField('Base command (optional):', 'say wow')
                    .show(sender, (result) => {
                        if (Databases.guis.has(result.formValues[0])) return sender.response.error('A gui with that name already exists')
                        if (!result.formValues[0]) return sender.response.error('The form must have a title')
                        if (result.formValues[2] && !ItemTypes.get(result.formValues[2])) return sender.response.error('The item u entered isnt valid')
                        Databases.guis.write(result.formValues[0], {
                            type: 'actionForm',
                            title: result.formValues[0],
                            body: result.formValues[1] ?? undefined,
                            item: result.formValues[2] ?? undefined,
                            cmd: result.formValues[3] ?? undefined,
                            buttons: []
                        })
                        sender.response.send(`Gui successfully created with the name: ${result.formValues[0]}`)
                    })
                } 
            }, 220)
        })
        ctx.executeArgument('open', (sender, _, args) => {
            if (!Databases.guis.has(args[0])) return sender.response.error('That gui dosent exist')
            sender.response.send('Close the chat within 10 secondes')
            open(Databases.guis.read(args[0]), sender)
        })
        ctx.executeArgument('edit', (sender, _, args) => {
            if (!Databases.guis.has(args[0])) return sender.response.error('That gui dosent exist')
            sender.response.send('Close the chat within 10 secondes')
            const gui = Databases.guis.read(args[0])
            if (gui.type == 'actionForm') {
                new CX.actionForm()
                .setTitle(`Edit a gui`)
                .setBody(`Editing: ${args[0]}`)
                .addButton('Edit info')
                .addButton('Add button')
                .addButton('Edit button')
                .addButton('Remove button')
                .force(sender, (res) => {
                    if (res.canceled) return
                    if (res.selection == 0) {
                        new CX.modalForm()
                        .setTitle(`Edit info: ${args[0]}`)
                        .addTextField('Title:', gui.title, gui.title)
                        .addTextField('Body (optional):', gui.body ?? 'some gui', gui.body ?? undefined)
                        .addTextField('Item to open (optional):', gui.item ?? 'minecraft:diamond', gui.item ?? undefined)
                        .addTextField('Base command (optional):', gui.command ?? 'say wow', gui.command ?? undefined)
                        .show(sender, (result) => {
                            if (!result.formValues[0]) return sender.response.error('The form must have a title')
                            if (Databases.guis.has(result.formValues[0]) && result.formValues[0] !== gui.title) return sender.response.error('Theres already a gui created with that title')
                            sender.response.send(`Successfully edited the gui ${gui.title}`)
                            Databases.guis.write(result.formValues[0], {
                                type: 'actionForm',
                                title: result.formValues[0],
                                body: result.formValues[1] ?? undefined,
                                item: result.formValues[2] ?? undefined,
                                cmd: result.formValues[3] ?? undefined,
                                buttons: gui.buttons ?? []
                            })
                            if (result.formValues[0] !== gui.title) Databases.guis.delete(gui.title)
                        })
                    } else if (res.selection == 1) {
                        new CX.modalForm()
                        .setTitle('Add a button')
                        .addTextField('The name of the button:', 'some btn')
                        .addTextField('The icon of the button (optional):', 'textures/items/barrier.png')
                        .addTextField('Command:\n- opengui:guiname (opens a custom gui only do without any commands)', 'opengui:gui, say hi')
                        .show(sender, (result) => {
                            if (!result.formValues[0] || !result.formValues[2]) return sender.response.error('You must fill all the information')
                            const buttons = gui.buttons
                            buttons.push({ name: result.formValues[0], icon: result.formValues[1] ?? undefined, command: result.formValues[2] })
                            Databases.guis.write(gui.title, Object.assign(gui, { buttons: buttons }))
                            sender.response.send(`Successfully added the button: ${result.formValues[0]}`)
                        })
                    } else if (res.selection == 2) {
                        if (!gui.buttons.length) return sender.response.error('There were no buttons to edit')
                        new CX.modalForm()
                        .setTitle('Edit button')
                        .addDropDown('Select a button to edit:', gui.buttons.map(g => g.name))
                        .show(sender, (result) => {
                            if (result.canceled) return
                            const selection = gui.buttons[result.formValues[0]], index = result.formValues[0]
                            new CX.modalForm()
                            .setTitle(`Edit button: ${selection.name}`)
                            .addTextField('The name of the button:', selection.name ?? 'some btn', selection.name)
                            .addTextField('The icon of the button (optional):', selection.icon ?? 'textures/items/barrier.png', selection.icon ?? undefined)
                            .addTextField('Command:\n- opengui:guiname (opens a custom gui only do without any commands)', selection.command ?? 'opengui:gui or say hi', selection.command ?? undefined)
                            .show(sender, (ress) => {
                                if (ress.canceled) return
                                if (!ress.formValues[0]) return sender.response.error('You must fill all the information')
                                const buttons = gui.buttons
                                sender.response.send(`Successfully edited the button: ${selection.name}`)
                                buttons[index] = { name: ress.formValues[0], icon: ress.formValues[1] ?? undefined, command: ress.formValues[2] }
                                Databases.guis.write(gui.title, Object.assign(gui, { buttons: buttons }))
                            })
                        })
                    } else if (res.selection == 3) {
                        if (!gui.buttons.length) return sender.response.error('There were no buttons to remove')
                        new CX.modalForm()
                        .setTitle('Remove button')
                        .addDropDown('Select a button to remove:', gui.buttons.map(g => g.name))
                        .show(sender, (result) => {
                            if (result.canceled) return
                            const selection = gui.buttons[result.formValues[0]], buttons = gui.buttons
                            sender.response.send(`Successfully removed the button: ${selection.name}`)
                            delete buttons[result.formValues[0]]
                            Databases.guis.write(gui.title, Object.assign(gui, { buttons: buttons }))
                        })
                    }
                })
            }
        })
        ctx.executeArgument('delete', (sender, _, args) => {
            if (!Databases.guis.has(args[0])) return sender.response.error('That gui dosent exist')
            Databases.guis.delete(args[0])
            sender.response.send(`Successfully deleted the gui ${args[0]}`)
        })
    }
})
export const open = (gui, sender) => {
    if (!gui) return
    if (gui.type == 'actionForm') {
        const form = new CX.actionForm()
        .setTitle(gui.title)
        .setBody(gui.body ?? '')
        if (!gui.buttons.length) return sender.response.error('The gui must contain atleast 1 button to show u can use !gui edit <gui>, to add a button')
        gui.buttons.forEach((btn) => {
            form.addButton(btn.name, btn.icon)
        })
        form.force(sender, (res) => {
            if (res.canceled) return
            if (gui.cmd) sender.runCommandAsync(gui.cmd)
            const selection = gui.buttons[res.selection]
            if (selection.command.startsWith('opengui:')) open(Databases.guis.read(selection.command.split('opengui:')[1]), sender)
            else sender.runCommandAsync(selection.command)
        }, 220)
    }
}