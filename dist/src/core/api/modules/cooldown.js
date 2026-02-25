"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ODIncrementalTimeoutCooldown = exports.ODTimeoutCooldown = exports.ODIncrementalCounterCooldown = exports.ODCounterCooldown = exports.ODCooldown = exports.ODCooldownData = exports.ODCooldownManager = void 0;
///////////////////////////////////////
//COOLDOWN MODULE
///////////////////////////////////////
const base_1 = require("./base");
/**## ODCooldownManager `class`
 * This is an Open Ticket cooldown manager.
 *
 * It is responsible for managing all cooldowns in Open Ticket. An example of this is the ticket creation cooldown.
 *
 * There are many types of cooldowns available, but you can also create your own!
 */
class ODCooldownManager extends base_1.ODManager {
    constructor(debug) {
        super(debug, "cooldown");
    }
    /**Initiate all cooldowns in this manager. */
    async init() {
        for (const cooldown of this.getAll()) {
            await cooldown.init();
        }
    }
}
exports.ODCooldownManager = ODCooldownManager;
/**## ODCooldownData `class`
 * This is Open Ticket cooldown data.
 *
 * It contains the instance of an active cooldown (e.g. for a user). It is handled by the cooldown itself.
 */
class ODCooldownData extends base_1.ODManagerData {
    /**Is this cooldown active? */
    active;
    /**Additional data of this cooldown instance. (different for each cooldown type) */
    data;
    constructor(id, active, data) {
        super(id);
        this.active = active;
        this.data = data;
    }
}
exports.ODCooldownData = ODCooldownData;
/**## ODCooldown `class`
 * This is an Open Ticket cooldown.
 *
 * It doesn't do anything on it's own, but it provides the methods that are used to interact with a cooldown.
 * This class can be extended from to create a working cooldown.
 *
 * There are also premade cooldowns available in the bot!
 */
class ODCooldown extends base_1.ODManagerData {
    data = new base_1.ODManager();
    /**Is this cooldown already initialized? */
    ready = false;
    constructor(id) {
        super(id);
    }
    /**Check this id and start cooldown when it exeeds the limit! Returns `true` when on cooldown! */
    use(id) {
        throw new base_1.ODSystemError("Tried to use an unimplemented ODCooldown!");
    }
    /**Check this id without starting or updating the cooldown. Returns `true` when on cooldown! */
    check(id) {
        throw new base_1.ODSystemError("Tried to use an unimplemented ODCooldown!");
    }
    /**Remove the cooldown for an id when available.*/
    delete(id) {
        throw new base_1.ODSystemError("Tried to use an unimplemented ODCooldown!");
    }
    /**Initialize the internal systems of this cooldown. */
    async init() {
        throw new base_1.ODSystemError("Tried to use an unimplemented ODCooldown!");
    }
}
exports.ODCooldown = ODCooldown;
/**## ODCounterCooldown `class`
 * This is an Open Ticket counter cooldown.
 *
 * It is is a cooldown based on a counter. When the number exceeds the limit, the cooldown is activated.
 * The number will automatically be decreased with a set amount & interval.
 */
class ODCounterCooldown extends ODCooldown {
    /**The cooldown will activate when exceeding this limit. */
    activeLimit;
    /**The cooldown will deactivate when below this limit. */
    cancelLimit;
    /**The amount to increase the counter with everytime the cooldown is triggered/updated. */
    increment;
    /**The amount to decrease the counter over time. */
    decrement;
    /**The interval between decrements in milliseconds. */
    invervalMs;
    constructor(id, activeLimit, cancelLimit, increment, decrement, intervalMs) {
        super(id);
        this.activeLimit = activeLimit;
        this.cancelLimit = cancelLimit;
        this.increment = increment;
        this.decrement = decrement;
        this.invervalMs = intervalMs;
    }
    use(id) {
        const cooldown = this.data.get(id);
        if (cooldown) {
            //cooldown for this id already exists
            if (cooldown.active) {
                return true;
            }
            else if (cooldown.data.value < this.activeLimit) {
                cooldown.data.value = cooldown.data.value + this.increment;
                return false;
            }
            else {
                cooldown.active = true;
                return false;
            }
        }
        else {
            //cooldown for this id doesn't exist
            this.data.add(new ODCooldownData(id, (this.increment >= this.activeLimit), {
                value: this.increment
            }));
            return false;
        }
    }
    check(id) {
        const cooldown = this.data.get(id);
        if (cooldown) {
            //cooldown for this id already exists
            return cooldown.active;
        }
        else
            return false;
    }
    delete(id) {
        this.data.remove(id);
    }
    async init() {
        if (this.ready)
            return;
        setInterval(async () => {
            await this.data.loopAll((cooldown) => {
                cooldown.data.value = cooldown.data.value - this.decrement;
                if (cooldown.data.value <= this.cancelLimit) {
                    cooldown.active = false;
                }
                if (cooldown.data.value <= 0) {
                    this.data.remove(cooldown.id);
                }
            });
        }, this.invervalMs);
        this.ready = true;
    }
}
exports.ODCounterCooldown = ODCounterCooldown;
/**## ODIncrementalCounterCooldown `class`
 * This is an Open Ticket incremental counter cooldown.
 *
 * It is is a cooldown based on an incremental counter. It is exactly the same as the normal counter,
 * with the only difference being that it still increments when the limit is already exeeded.
 */
class ODIncrementalCounterCooldown extends ODCooldown {
    /**The cooldown will activate when exceeding this limit. */
    activeLimit;
    /**The cooldown will deactivate when below this limit. */
    cancelLimit;
    /**The amount to increase the counter with everytime the cooldown is triggered/updated. */
    increment;
    /**The amount to decrease the counter over time. */
    decrement;
    /**The interval between decrements in milliseconds. */
    invervalMs;
    constructor(id, activeLimit, cancelLimit, increment, decrement, intervalMs) {
        super(id);
        this.activeLimit = activeLimit;
        this.cancelLimit = cancelLimit;
        this.increment = increment;
        this.decrement = decrement;
        this.invervalMs = intervalMs;
    }
    use(id) {
        const cooldown = this.data.get(id);
        if (cooldown) {
            //cooldown for this id already exists
            if (cooldown.active) {
                cooldown.data.value = cooldown.data.value + this.increment;
                return true;
            }
            else if (cooldown.data.value < this.activeLimit) {
                cooldown.data.value = cooldown.data.value + this.increment;
                return false;
            }
            else {
                cooldown.active = true;
                return false;
            }
        }
        else {
            //cooldown for this id doesn't exist
            this.data.add(new ODCooldownData(id, (this.increment >= this.activeLimit), {
                value: this.increment
            }));
            return false;
        }
    }
    check(id) {
        const cooldown = this.data.get(id);
        if (cooldown) {
            //cooldown for this id already exists
            return cooldown.active;
        }
        else
            return false;
    }
    delete(id) {
        this.data.remove(id);
    }
    async init() {
        if (this.ready)
            return;
        setInterval(async () => {
            await this.data.loopAll((cooldown) => {
                cooldown.data.value = cooldown.data.value - this.decrement;
                if (cooldown.data.value <= this.cancelLimit) {
                    cooldown.active = false;
                }
                if (cooldown.data.value <= 0) {
                    this.data.remove(cooldown.id);
                }
            });
        }, this.invervalMs);
        this.ready = true;
    }
}
exports.ODIncrementalCounterCooldown = ODIncrementalCounterCooldown;
/**## ODTimeoutCooldown `class`
 * This is an Open Ticket timeout cooldown.
 *
 * It is a cooldown based on a timer. When triggered/updated, the cooldown is activated for the set amount of time.
 * After the timer has timed out, the cooldown will be deleted.
 */
class ODTimeoutCooldown extends ODCooldown {
    /**The amount of milliseconds before the cooldown times-out */
    timeoutMs;
    constructor(id, timeoutMs) {
        super(id);
        this.timeoutMs = timeoutMs;
    }
    use(id) {
        const cooldown = this.data.get(id);
        if (cooldown) {
            //cooldown for this id already exists
            if ((new Date().getTime() - cooldown.data.date) > this.timeoutMs) {
                this.data.remove(id);
                return false;
            }
            else {
                return true;
            }
        }
        else {
            //cooldown for this id doesn't exist
            this.data.add(new ODCooldownData(id, true, {
                date: new Date().getTime()
            }));
            return false;
        }
    }
    check(id) {
        const cooldown = this.data.get(id);
        if (cooldown) {
            //cooldown for this id already exists
            return true;
        }
        else
            return false;
    }
    delete(id) {
        this.data.remove(id);
    }
    /**Get the remaining amount of milliseconds before the timeout stops. */
    remaining(id) {
        const cooldown = this.data.get(id);
        if (!cooldown)
            return null;
        const rawResult = this.timeoutMs - (new Date().getTime() - cooldown.data.date);
        return (rawResult > 0) ? rawResult : 0;
    }
    async init() {
        if (this.ready)
            return;
        this.ready = true;
    }
}
exports.ODTimeoutCooldown = ODTimeoutCooldown;
/**## ODIncrementalTimeoutCooldown `class`
 * This is an Open Ticket incremental timeout cooldown.
 *
 * It is is a cooldown based on an incremental timer. It is exactly the same as the normal timer,
 * with the only difference being that it adds additional time when triggered/updated while the cooldown is already active.
 */
class ODIncrementalTimeoutCooldown extends ODCooldown {
    /**The amount of milliseconds before the cooldown times-out */
    timeoutMs;
    /**The amount of milliseconds to add when triggered/updated while the cooldown is already active. */
    incrementMs;
    constructor(id, timeoutMs, incrementMs) {
        super(id);
        this.timeoutMs = timeoutMs;
        this.incrementMs = incrementMs;
    }
    use(id) {
        const cooldown = this.data.get(id);
        if (cooldown) {
            //cooldown for this id already exists
            if ((new Date().getTime() - cooldown.data.date) > this.timeoutMs) {
                this.data.remove(id);
                return false;
            }
            else {
                cooldown.data.date = cooldown.data.date + this.incrementMs;
                return true;
            }
        }
        else {
            //cooldown for this id doesn't exist
            this.data.add(new ODCooldownData(id, true, {
                date: new Date().getTime()
            }));
            return false;
        }
    }
    check(id) {
        const cooldown = this.data.get(id);
        if (cooldown) {
            //cooldown for this id already exists
            return true;
        }
        else
            return false;
    }
    delete(id) {
        this.data.remove(id);
    }
    /**Get the remaining amount of milliseconds before the timeout stops. */
    remaining(id) {
        const cooldown = this.data.get(id);
        if (!cooldown)
            return null;
        const rawResult = this.timeoutMs - (new Date().getTime() - cooldown.data.date);
        return (rawResult > 0) ? rawResult : 0;
    }
    async init() {
        if (this.ready)
            return;
        this.ready = true;
    }
}
exports.ODIncrementalTimeoutCooldown = ODIncrementalTimeoutCooldown;
