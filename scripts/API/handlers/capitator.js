import { ItemStack } from "@minecraft/server";
class Capitator {
    constructor(dimension, cord, type) {
        return this.removeBlocks(dimension, [cord], [cord], type);
    }
    removeBlocks(dimension, cordArray, horizontalCordArray, type) {
        let blocks = [], cords = [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [-1, 1], [1, -1]];
        cordArray.forEach(cord => {
            cords.forEach(check => {
                const newBlockLocation = {
                    x: cord.x + check[0],
                    y: cord.y,
                    z: cord.z + check[1]
                };
                if (blocks.some(loc => (loc.x == newBlockLocation.x && loc.y == newBlockLocation.y && loc.z == newBlockLocation.z))) return;
                if (dimension.getBlock(newBlockLocation).hasTag(`${type}`) || dimension.getBlock(newBlockLocation).type.id.includes(`_${type}`)) blocks.push(newBlockLocation);
            });
        });
        for (let i = 0; i < blocks.length; i++) {
            const newBlock = dimension.getBlock(blocks[i]);
            if (newBlock.type.id.endsWith('_ore')) {
                let item;
                if (newBlock.type.id.replace('_ore', '').replace('deepslate_', '').replace('lit_', '') == 'minecraft:lapis') item = 'minecraft:lapis_lazuli';
                else if (newBlock.type.id.replace('_ore', '').replace('deepslate_', '').replace('lit_', '') == 'minecraft:iron' || newBlock.type.id.replace('_ore', '').replace('deepslate_', '').replace('lit_', '') == 'minecraft:gold' || newBlock.type.id.replace('_ore', '').replace('deepslate_', '').replace('lit_', '') == 'minecraft:copper') item = 'minecraft:raw_' + newBlock.type.id.replace('_ore', '').replace('deepslate_', '').replace('lit_', '').split('minecraft:')[1];
                else item = newBlock.type.id.replace('_ore', '').replace('deepslate_', '').replace('lit_', '');
                dimension.spawnItem(new ItemStack(item), blocks[i]);
                newBlock.setType('air');
            } else {
                dimension.spawnItem(new ItemStack(newBlock.type.id), blocks[i]);
                newBlock.setType('air')
            }
        }
        if (horizontalCordArray.length == 0 && blocks.length == 0) return;
        else if (blocks.length == 0) return this.horizontal(dimension, horizontalCordArray, type);
        else return this.removeBlocks(dimension, blocks, horizontalCordArray.concat(blocks), type);
    }
    horizontal(dimension, horizontalCordArray, type) {
        for (let i = 0; i < horizontalCordArray.length; i++) horizontalCordArray[i].y += 1;
        return this.removeBlocks(dimension, horizontalCordArray, [], type);
    }
}
export { Capitator };