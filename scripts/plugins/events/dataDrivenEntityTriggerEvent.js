import { CX } from "../../API/CX"
import { system, world } from "@minecraft/server"
import { ItemDB } from "../../API/database/IDB"

const crates = new ItemDB('crates')

CX.Build(CX.BuildTypes["@event"], {
  data: 'DataDrivenEntityTriggerEvent',
  executes(data) {
    const entity = data.entity, event = data.id
    system.run(() => {
      if (entity.typeId == 'mod:crate') {
        if (event == 'mod:event2') {
          entity.runCommandAsync(`replaceitem entity @s slot.weapon.offhand 0 air`)
          entity.runCommandAsync(`replaceitem entity @s slot.weapon.mainhand 0 air`)
          const playername = getTag(entity, `opener:`)
          entity.removeTag(`opener:${playername}`)
          entity.nameTag = ""
          giveReward(getTag(entity, `ID:`), entity, playername)
        }
        if (event == 'mod:notkey') world.getPlayers({ tags: ['notkey']}).forEach((plr) => plr.removeTag(`notkey`))
        if (event == 'mod:event1' && entity.getComponent(`variant`).value == 2) {
          entity.triggerEvent(`mod:showcasename`)
          showcaseAnim(entity, getTag(entity, `ID:`))
        }
        if (event == 'mod:event2.5') entity.nameTag = ""
        if (event == 'mod:event3' && !entity.hasTag("hasitem") && !entity.hasTag("idle")) {
          entity.nameTag = getTag(entity, `name:`)
          let cur = 0
          system.run(function run() {
            if (cur < 4) {
              cur++
              system.run(run)
            } else if (entity) {
              entity.triggerEvent(`mod:refresh`)
              entity.addTag(`idle`)
            }
          })
        }
        if (event == 'mod:openevent') {
          entity.nameTag = ""
          system.runTimeout(() => {
            for (let player of world.getPlayers({ tags: ['opener'] })) {
              entity.addTag(`opener:${player.name}`)
              player.runCommandAsync(`tag @s remove opener`)
              const inv = player.getComponent('inventory').container, key = getTag(entity, 'key')
              for (let i = 0; i < inv.size; i++) {
                const item = inv.getItem(i)
                if (!item) continue;
                if (item.typeId == `mod:key${key}`) {
                  if (item.amount == 1) return inv.setItem(i)
                  else item.amount -= item.amount
                  inv.setItem(i, item)
                }
              }
              break
            }
          }, 1)
        }
      }
    })
  }
})
const showcaseItems = (reward, total) => {
  let choose = [], lastItem = null;
  const shuffleArray = (array) => {
    let currentIndex = array.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
  }
  if (reward.length === 1) {
    for (let i = 0; i < total; i++) choose.push(reward[0]);
    return choose;
  }
  while (choose.length < total) {
    let shuffled = shuffleArray(reward);
    for (let item of shuffled) {
      if (choose.length >= total) break;
      if (item !== lastItem) {
        choose.push(item);
        lastItem = item;
      } else {
        let alternate = reward.filter((x) => x !== item);
        choose.push(alternate[0]);
        lastItem = alternate[0];
      }
    }
  }
  return choose;
}
const shuffle = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
const showcaseAnim = (entity, set) => {
  const items = crates.allIDs().filter(i => i.data.id == set)
  let chosearr = showcaseItems(items, 30), totalnumber = chosearr.length, initialDelay = 2, delay = initialDelay, count = 0, number = 0
  system.run(function run() {
    if (count < delay) count++
    else if (count = delay) {
      count = 0
      number++
      let num = number - 1
      entity.runCommandAsync(`replaceitem entity @s slot.weapon.mainhand 0 ${chosearr[num].item.typeId} 1`)
      entity.nameTag = `${CX.item.getItemName(chosearr[num].item)}`
      entity.runCommandAsync(`playsound note.banjo @a ~~~`)
      num = 0
      let remaining = totalnumber - number
      if (remaining >= totalnumber * 2 / 3) delay = initialDelay
      else if (remaining >= totalnumber / 3) delay = initialDelay * 1.5
      else delay = initialDelay * 3
    }
    if (number >= totalnumber) return
    system.run(run)
  })
}
const giveReward = (rollRewards, crateSource, playername) => {
  const items = crates.allIDs().filter(i => i.data.id == rollRewards)
  rollRewards = shuffle(items);
  let totalWeight = 0
  for (let reward of rollRewards) totalWeight += Number(reward.data.chance)
  let randomWeight = Math.floor(Math.random() * totalWeight) + 1;
  for (let reward of rollRewards) {
    if (randomWeight <= Number(reward.data.chance) && randomWeight > 0) {
      let percentChance = (Math.round((1000 * (Number(reward.data.chance) / totalWeight)))) / 10
      const crateInv = crateSource.getComponent("inventory").container
      crateInv.setItem(0, reward.item)
      crateSource.runCommandAsync(`replaceitem entity @s slot.weapon.mainhand 0 ${reward.item.typeId} ${reward.item.amount}`)
      let itemStack = crateInv.getItem(0)
      crateInv.setItem(0, itemStack)
      let i = crateInv.getItem(0)
      crateSource.nameTag = `§6${reward.item.amount}§rx §e${CX.item.getItemName(reward.item)}§r`
      crateSource.runCommandAsync(`particle minecraft:totem_particle ~~1.2~`)
      crateInv.setItem(0, i)
      let r = system.runTimeout(() => {
        crateSource.runCommandAsync(`playsound random.pop2 @a ~~1.5~`)
        crateSource.runCommandAsync(`particle minecraft:dragon_destroy_block ~~1.5~`)
        crateSource.runCommandAsync(`replaceitem entity @s slot.inventory 0 air`)
        crateSource.triggerEvent(`mod:event2.5`);
        system.clearRun(z)
      }, 12000)
      let z = system.runInterval(() => {
        for (let player of world.getPlayers({ name: playername })) {
          player.getComponent('inventory')?.container.addItem(i)
          CX.player.convert(player).response.send(`Congratulations!, You got §6${reward.item.amount}§rx §e${CX.item.getItemName(reward.item)}§r§c§l Chance: ${percentChance}%%`)
          system.runTimeout(() => {
            crateSource.runCommandAsync(`playsound random.pop2 @a ~~1.5~`)
            crateSource.runCommandAsync(`particle minecraft:dragon_destroy_block ~~1.5~`)
            crateSource.runCommandAsync(`replaceitem entity @s slot.inventory 0 air`)
            crateSource.triggerEvent(`mod:event2.5`);
          }, 70)
          system.clearRun(z)
          system.clearRun(r)
        }
      }, 10)
    }
    randomWeight -= reward.data.chance
  }
}
const getTag = (ent, prefix) => ent.getTags().find(tag => tag.startsWith(prefix)).substring(prefix.length)