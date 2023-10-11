import { CX } from "../../../API/CX";
import { ItemDB } from "../../../API/database/IDB";

const crates = new ItemDB('crates')

CX.Build(CX.BuildTypes["@command"], {
    data: new CX.command()
    .setName('crates')
    .setDescription('Crates system command')
    .setAdmin(true)
    .setCategory('management')
    .firstArguments(['create', 'addReward', 'remove'], true)
    .addDynamicArgument('create', [], 'create')
    .addDynamicArgument('addReward', [], ['reward', 'add', 'addReward'])
    .addDynamicArgument('remove', [], 'remove'),
    executes(ctx) {
        ctx.executeArgument('create', (sender) => {
            sender.response.send('Close the chat within 10 secondes')
            new CX.modalForm()
            .setTitle(`Create Crate`)
            .addTextField('The name of the crate:', `§l§bLegendary Crate§r`)
            .addTextField('The sub-name of the crate:', ``, `§r§7[Use Key to Open]`)
            .addDropDown('The skin of the crate:', ["Ender Chest", "Normal Chest", "Custom Crate"]) 
            .addDropDown('The animation of the crate:', ["Quick", "Vortex", "Showcase"]) 
            .addDropDown('The halo particle of the crate:', ["No Halo", "Flame", "Blue Flame", "Happy Green", "Snow", "Enchant Characters"])
            .force(sender, (res) => {
                if (res.canceled) return
                if (!res.formValues[0]) return sender.response.error('The crate must have a name')
                const entity = sender.dimension.spawnEntity('mod:crate', sender.location)
                entity.nameTag = `${res.formValues[0]}§r\n${res.formValues[1]}`
                entity.addTag(`ID:${CX.generateID()}`)
                entity.addTag(`name:${res.formValues[0]}§r\n${res.formValues[1]}`)
                if (res.formValues[2] == 0) entity.triggerEvent('mod:skin0')
                else if (res.formValues[2] == 1) entity.triggerEvent('mod:skin1')
                else entity.triggerEvent('mod:skin2')
                if (res.formValues[3] == 0) entity.triggerEvent('mod:animation0')
                else if (res.formValues[3] == 1) entity.triggerEvent('mod:animation1')
                else entity.triggerEvent('mod:animation2')
                if (res.formValues[4] == 0) entity.triggerEvent('mod:halo0')
                else if (res.formValues[4] == 1) entity.triggerEvent('mod:halo1')
                else if (res.formValues[4] == 2) entity.triggerEvent('mod:halo2')
                else if (res.formValues[4] == 3) entity.triggerEvent('mod:halo3')
                else if (res.formValues[4] == 4) entity.triggerEvent('mod:halo4')
                else entity.triggerEvent('mod:halo5')
                new CX.actionForm()
                .setTitle(`${res.formValues[0]} Key`)
                .setBody("Choose a key for this crate:")
                .addButton('Key1', "textures/keys/1")
                .addButton('Key2', "textures/keys/2")
                .addButton('Key3', "textures/keys/3")
                .addButton('Key4', "textures/keys/4")
                .addButton('Key5', "textures/keys/5")
                .addButton('Key6', "textures/keys/6")
                .addButton('Key7', "textures/keys/7")
                .addButton('Key8', "textures/keys/8")
                .addButton('Key9', "textures/keys/9")
                .addButton('Key10', "textures/keys/10")
                .show(sender, (result) => {
                    if (result.canceled) return entity.kill()
                    entity.runCommandAsync(`tag @s add key${result.selection + 1}`)
                    entity.triggerEvent(`mod:interact`);
                })
            }, 220)
        })
        ctx.executeArgument('addReward', (sender) => {
            let entity = Array.from(sender.dimension.getEntities({ type: 'mod:crate', maxDistance: 2, location: sender.management.Location() }))[0];
            if (!entity) return sender.response.error('Unable to locate a crate within the radius of 2 blocks');
            if (crates.allIDs().filter(i => i.data.id == entity.getTags().find(tag => tag.startsWith('ID:')).substring('ID:'.length)).length >= 54) return sender.response.error('The crates has the max amount of rewards that it can hold')
            sender.response.send('Close the chat within 10 secondes')
            new CX.modalForm()
            .setTitle(`Add Item to ${entity.nameTag}`)
            .addTextField('The chance of the item: §c(Dont use %% at the end)', '1')
            .force(sender, (res) => {
                if (res.canceled) return
                const inv = sender.getComponent('inventory').container
                if (!inv.getItem(sender.selectedSlot)) return sender.response.error('You must hold the item that you want to add to the crate')
                if (isNaN(res.formValues[0])) return sender.response.error('The chance must be a number')
                crates.writeItem(inv.getItem(sender.selectedSlot), {
                    chance: res.formValues[0],
                    id: entity.getTags().find(tag => tag.startsWith('ID:')).substring('ID:'.length)
                })
                sender.response.send('Successfully added an item')
            })
        })
        ctx.executeArgument('remove', (sender) => {
            let entity = Array.from(sender.dimension.getEntities({ type: 'mod:crate', maxDistance: 2, location: sender.management.Location() }))[0];
            if (!entity) return sender.response.error('Unable to locate a crate within the radius of 2 blocks');
            entity.triggerEvent('mod:despawn')
            crates.allIDs().filter(i => i.data.id == entity.getTags().find(tag => tag.startsWith('ID:')).substring('ID:'.length)).forEach((item) => {
                crates.deleteID(item.ID)
            })
            sender.response.send('Successfully removed a nearby crate')
        })
    }
})