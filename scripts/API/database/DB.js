import { world, ScoreboardObjective, ScoreboardIdentityType, ScoreboardIdentity, system, Entity } from "@minecraft/server";

const { scoreboard } = world, { FakePlayer } = ScoreboardIdentityType;
const databases = new Map();
const split = "\n_`Split`_\n";

function endTickCall(callback) {
    system.run(() => system.run(() => system.run(callback)));
}
export const DatabaseSavingModes = {
    OneTimeSave: "OneTimeSave",
    EndTickSave: "EndTickSave",
    TickInterval: "TickInterval"
}
const ChangeAction = {
    Change: 0,
    Remove: 1
}
function run(thisClass, key, value, action) {
    if (thisClass._source_.has(key)) thisClass._scoreboard_.removeParticipant(thisClass._source_.get(key));
    if (action === ChangeAction.Remove) thisClass._source_.delete(key);
    else {
        thisClass._source_.set(key, value);
        thisClass._scoreboard_.setScore(value, 0);
    }
}
const SavingModes = {
    [DatabaseSavingModes.OneTimeSave](thisClass, key, value, action) {
        run(thisClass, key, value, action);
    },
    /**@param {ScoreboardDatabaseManager} thisClass */
    [DatabaseSavingModes.EndTickSave](thisClass, key, value, action) {
        if (!thisClass.hasChanges) {
            endTickCall(() => {
                for (const [k, { action, value }] of thisClass._changes_.entries()) {
                    run(thisClass, k, value, action);
                }
                thisClass._changes_.clear();
                thisClass.hasChanges = false;
            });
        }
        thisClass.hasChanges = true;
        thisClass._changes_.set(key, { action, value });
    },
    /**@param {ScoreboardDatabaseManager} thisClass */
    [DatabaseSavingModes.TickInterval](thisClass, key, value, action) {
        thisClass.hasChanges = true;
        thisClass._changes_.set(key, { action, value });
    }
}
/**@extends {Map<string,any>}*/
class ScoreboardDatabaseManager extends Map {
    /**@private */
    _loaded_ = false;
    /**@private */
    _saveMode_;
    /**@private */
    hasChanges = false;
    /**@private */
    _loadingPromise_;
    /**@readonly */
    get maxLength() { return 30e3; }
    /**@private @type {ScoreboardObjective}*/
    _scoreboard_;
    /**@protected @type {Map<string,string|ScoreboardIdentity|Entity>} */
    _source_;
    /**@protected @readonly @type {{stringify:(data: any)=>string,parse:(data: string): any}} */
    get _parser_() { return JSON; }
    get savingMode() { return this._saveMode_; }
    /**@protected */
    constructor(objective, saveMode = DatabaseSavingModes.EndTickSave, interval = 5) {
        super();
        this._saveMode_ = saveMode;
        this._nameId_ = objective;
        this.interval = interval ?? 5;
        if (!objective) throw new RangeError("Firt parameter si not valid: " + objective);
        if (typeof objective !== "string" && !objective instanceof ScoreboardObjective) throw new RangeError("Firt parameter si not valid: " + objective);
        this._scoreboard_ = typeof objective === "string" ? (scoreboard.getObjective(objective) ?? scoreboard.addObjective(objective, objective)) : objective;
        if (databases.has(this.id)) return databases.get(this.id);
        this._nameId_ = this.id;
        this._source_ = new Map();
        this._changes_ = new Map();
        if (this._saveMode_ === DatabaseSavingModes.TickInterval) {
            system.runInterval(() => {
                if (this.hasChanges) {
                    endTickCall(() => {
                        for (const [k, { action, value }] of this._changes_.entries()) run(this, k, value, action);
                        this._changes_.clear();
                        this.hasChanges = false;
                    })
                }
            }, this.interval);
        }
        databases.set(this.id, this);
    }
    load() {
        if (this._loaded_) return this;
        for (const participant of this._scoreboard_.getParticipants()) {
            const { displayName, type } = participant;
            if (type !== FakePlayer) continue;
            const [name, data] = displayName.split(split);
            this._source_.set(name, participant);
            super.set(name, this._parser_.parse(data));
        }
        this._loaded_ = true;
        return this;
    }
    loadAsync() {
        if (this._loaded_) return this._loadingPromise_ ?? Promise.resolve(this);
        const promise = (async () => {
            for (const participant of this._scoreboard_.getParticipants()) {
                const { displayName, type } = participant;
                if (type !== FakePlayer) continue;
                const [name, data] = displayName.split(split);
                this._source_.set(name, participant);
                super.set(name, this._parser_.parse(data));
            }
            this._loaded_ = true;
            return this;
        })();
        this._loadingPromise_ = promise;
        return promise;
    }
    /**@inheritdoc */
    set(key, value) {
        if (!this._loaded_) throw new ReferenceError("Database is not loaded");
        const newValue = `${key}${split}${this._parser_.stringify(value)}`;
        if (newValue.length > this.maxLength) throw new RangeError("Value is too large for one property");
        super.set(key, value);
        this._onChange_(key, newValue, ChangeAction.Change);
        return this;
    }
    /**@inheritdoc */
    delete(key) {
        if (!this._loaded_) throw new ReferenceError("Database is not loaded");
        this._onChange_(key, null, ChangeAction.Remove);
        return super.delete(key);
    }
    /**@inheritdoc */
    clear() {
        if (!this._loaded_) throw new ReferenceError("Database is not loaded");
        for (const [key, value] of this.entries()) this.delete(key, value);
    }
    /**@inheritdoc */
    forEach(callback) {
        if (!this._loaded_) throw new ReferenceError("Database is not loaded");
        for (const [key, value] of this.entries()) {
            callback(key, value)
        }
    }
    /**@inheritdoc */
    keys() {
        if (!this._loaded_) throw new ReferenceError("Database is not loaded");
        let keys = []
        for (const [key, value] of this.entries()) keys.push(key)
        return keys;
    }
    /**@inheritdoc */
    values() {
        if (!this._loaded_) throw new ReferenceError("Database is not loaded");
        let values = []
        for (const [key, value] of this.entries()) values.push(value)
        return values;
    }
    get length() {
        return this.entries().size
    }
    /**@private */
    _onChange_(key, value, action) {
        if (!this._loaded_) throw new ReferenceError("Database is not loaded");
        SavingModes[this._saveMode_](this, key, value, action);
    }
    /**@readonly @returns {ScoreboardObjective} */
    get objective() { return this._scoreboard_; }
    /**@readonly @returns {string} */
    get id() { return this._scoreboard_.id; }
    /**@readonly @returns {boolean} */
    get loaded() { return this._loaded_; }
    /**@readonly @returns {DefualtJsonType} */
    get type() { return "DefualtJsonType"; }
    get loadingAwaiter() { return this._loadingPromise_ ?? this.loadAsync(); }
    rebuild() {
        if (this.objective?.isValid()) return;
        const newScores = scoreboard.addObjective(this._nameId_, this._nameId_);
        this._scoreboard_ = newScores;
        this._source_ = new Map();
        for (const [k, v] of this.entries()) {
            const data = `${k}${split}${this._parser_.stringify(v)}`;
            newScores.setScore(data, 0);
            this._source_.set(k, data);
        }
        return this;
    }
    async rebuildAsyc() {
        if (this.objective?.isValid()) return;
        const newScores = scoreboard.addObjective(this._nameId_, this._nameId_);
        this._scoreboard_ = newScores;
        this._source_ = new Map();
        for (const [k, v] of this.entries()) {
            const data = `${k}${split}${this._parser_.stringify(v)}`;
            newScores.setScore(data, 0);
            this._source_.set(k, data);
            await null;
        }
        return this;
    }
}
export class JsonDatabase extends ScoreboardDatabaseManager {
    get type() { return "JsonType"; }
}

export class Database {
    /**
     * Creates a database
     * @param {any} name The name of the database
     * @returns {this} DB service manager
     */
    constructor(name) {
        this.Database = new JsonDatabase(name).load()
    }
    /**
     * Gets the length of the database
     * @returns {number}
     */
    get length() {
        return this.Database.length
    }
    /**
     * Reads a key 
     * @param {string} key The key to read
     * @returns {any | undefined}
     */
    read(key) {
        return this.Database.get(key)
    }
    /**
     * Write data from Database
     * @param {string} key 
     * @param {any} value 
     */
    write(key, value) {
        return this.Database.set(key, value)
    }
    /**
     * Check data from Database
     * @param {string} key 
     * @returns {boolean}
     */
    has(key) {
        return this.Database.has(key)
    }

    /**
     * Delete data from Database
     * @param {string} key 
     */
    delete(key) {
        return this.Database.delete(key)
    }

    /**
     * Clear all data from Database
     */
    clear() {
        return this.Database.clear()
    }

    /**
     * Get an array of all keys in the database
     * @returns {string[]} An array of all keys in the database
     */
    keys() {
        return this.Database.keys();
    }
    /**
     * Get an array of all values in the database
     * @returns {any[]} An array of all values in the database
     */
    values() {
        return this.Database.values();
    }

    /**
     * Loop through all keys and values of the Database
     * @param {(key: string, value: any) => void} callback Code to run per loop
     */
    forEach(callback) {
        this.Database.forEach(callback)
    }
}