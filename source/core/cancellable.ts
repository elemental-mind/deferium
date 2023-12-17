import { Trait } from "fusium-js";
import { ICancellable } from "./core.types.js";

export class Cancellable<T> extends Trait implements ICancellable<T>
{
    declare isCancelled: boolean;
    public cancelReason?: T;

    cancel(cancelReason: T)
    {
        this.isCancelled = true;
        this.cancelReason = cancelReason;
    }
}

Cancellable.prototype.isCancelled = false;