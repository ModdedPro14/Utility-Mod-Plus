import { Vector, system, world } from "@minecraft/server";
import { CX } from "../CX";
import { Database } from "./DB";

export class ItemDB {
  /**
   * Creates an item database
   * @param {any} name The name of the database
   * @returns {this} IDB service manager
   */
  constructor(name) {
    this.database = new Database(name)
    this.entity = undefined
    this.name = name
    this.load()
    return this
  }
  /**
   * Loads the database
   */
  load() {
    if (world.getAllPlayers().length) {
      if (world.getDimension('overworld').getEntities({ type: 'mod:database', name: this.name }).length) world.getDimension('overworld').getEntities({ type: 'mod:database', name: this.name }).map(e => this.entity = e)
      else {
        const r = system.runInterval(() => {
          try {
            this.entity = world.getDimension('overworld').spawnEntity('mod:database', new Vector(1000000, -60, 1000000))
            this.entity.nameTag = this.name
            if (this.entity) system.clearRun(r)
          } catch {}
        })
      }
    }
    return this
  }
  /**
   * Write an item to the database
   * @param {any} item The item to write
   * @param {object} data Additonal item data
   * @returns {number} The ID of the item
   */
  writeItem(item, data = {}) {
    if (!this.entity) this.load()
    if (!item) return
    const id = CX.generateID()
    this.database.write(id, Object.assign(data, { nameTag: CX.item.getItemName(item) }))
    item.nameTag = id
    this.entity.getComponent('inventory').container.addItem(item)
    return id
  }
  /**
   * Reads an ID in the database
   * @param {number} id The ID to read
   * @returns 
   */
  readID(id) {
    if (!this.entity) this.load()
    const inv = this.entity.getComponent('inventory').container
    for (let i = 0; i < inv.size; i++) {
      if (!inv.getItem(i)) continue
      const item = inv.getItem(i)
      if (item.nameTag == id) {
        item.nameTag = this.database.read(id).nameTag
        return item
      }
    }
  }
  /**
   * Checks if an ID exists in the database
   * @param {number} id The ID to check for
   * @returns 
   */
  has(id) {
    if (this.readID(id)) return true
    return false
  }
  /**
   * Deletes an ID in the database
   * @param {number} id The ID to delete
   * @returns 
   */
  deleteID(id) {
    if (!this.has(id)) return
    const inv = this.entity.getComponent('inventory').container
    for (let i = 0; i < inv.size; i++) {
      if (!inv.getItem(i)) continue
      const item = inv.getItem(i)
      if (item.nameTag == id) {
        this.entity.getComponent('inventory').container.setItem(i)
        this.database.delete(id)
      }
    }
  }
  /**
   * Returns all the items with their IDs
   * @param {(ID, item) => void} callback Callback
   */
  forEach(callback) {
    if (!this.entity) this.load()
    try {
      const inv = this.entity.getComponent('inventory').container
      for (let i = 0; i < inv.size; i++) {
        if (!inv.getItem(i)) continue
        callback(inv.getItem(i).nameTag, this.readID(inv.getItem(i).nameTag))
      }
    } catch {}
  }
  /**
   * Returns all the item with their IDs and additonal data in an array
   * @returns {{ ID: number, item: any, data: any}[]}
   */
  allIDs() {
    const items = []
    this.forEach((id, item) => {
      items.push({ ID: id, item: item, data: this.database.read(id) })
    })
    return items
  }
  /**
   * Reads an IDs additonal data
   * @param {number} id The ID to read
   */
  readData(id) {
    if (!this.has(id)) return
    return this.database.read(id)
  }
  /**
   * Clears all the IDs in the database
   */
  clearIDs() {
    this.forEach((ID) => {
      try {
        this.deleteID(ID)
      } catch {}
    })
  }
}