import { ProtectedAwaitable } from "../core/awaitable.js";

export class Delay extends ProtectedAwaitable
{
    public creationTime;
    protected timeout;
    constructor(protected msDelay: number) { 
        super();
        this.creationTime = Date.now();
        this.timeout = setTimeout(this.resolve.bind(this), msDelay);
    };

    static for(msDelay: number)
    {
        return new Delay(msDelay);
    }

    static until(time: Date | number)
    {
        if(time instanceof Date)
            return new Delay(time.getTime() - Date.now());
        else 
            return new Delay(time - Date.now());
    }

    get duration()
    {
        return this.msDelay;
    }

    get msElapsed()
    {
        return Date.now() - this.creationTime;
    }

    get msRemaining()
    {
        return this.creationTime + this.msDelay - Date.now();
    }

    get endTime()
    {
        return this.creationTime + this.msDelay;
    }

    abort()
    {
        clearTimeout(this.timeout);
        this.reject();
    }
}

export class AdjustableDelay extends Delay
{
    set duration(msDelay: number)
    {
        this.msDelay = msDelay;
        clearTimeout(this.timeout)
        this.timeout = setTimeout(this.resolve, Math.max(this.creationTime+msDelay - Date.now(), 0));
    }

    set endTime(msUnixEpochEnd: number)
    {
        this.msDelay = msUnixEpochEnd - this.creationTime;
        clearTimeout(this.timeout)
        this.timeout = setTimeout(this.resolve, Math.max(msUnixEpochEnd - Date.now(), 0));
    }

    reset()
    {
        clearTimeout(this.timeout);
        setTimeout(this.resolve, this.msDelay);
    }
}