import { FusionOf } from "fusium-js";
import { MemoryLeakable } from "../core/memoryLeakable.js";
import { AsyncStreamable, StartChunk } from "../core/streamable.js";
import { Subscribable } from "../core/subscribable.js";

declare namespace Cycle {
    
}


export class Cycle extends FusionOf(MemoryLeakable, AsyncStreamable<Date>)
{
    protected timeResource: TimeResource | null = null;
    public readonly onTick = new Subscribable<Date>();

    protected constructor(
        protected msPeriod: number
    )
    {
        //@ts-ignore
        super();
    }

    static pending(msPeriod: number)
    {
        return new Cycle(msPeriod);
    }

    static running(msPeriod: number)
    {
        const cycle = new Cycle(msPeriod);
        cycle.start();
        return cycle;
    }

    static startingFirstCycleAt(msPeriod: number, startFirstCycleAt: Date | number)
    {
        const startTime = startFirstCycleAt instanceof Date ? startFirstCycleAt.getTime() : startFirstCycleAt;
        const cycle = new Cycle(msPeriod);
        cycle.startAt(startFirstCycleAt);
        return cycle;
    }

    static endingFirstCycleAt(msPeriod: number, endFirstCycleAt: Date | number)
    {
        const endTime = endFirstCycleAt instanceof Date ? endFirstCycleAt.getTime() : endFirstCycleAt;
        const cycle = new Cycle(msPeriod);
        cycle.startAt(endTime - msPeriod);
        return cycle;
    }

    start()
    {
        if (!this.timeResource)
            this.regenerateInterval();
        else
            throw new Error("Cycle already intiated or running!");
    }

    startAt(time: Date | number)
    {
        if (!this.timeResource)
        {
            const startTime = time instanceof Date ? time.getTime() : time;
            if (startTime + this.msPeriod < Date.now()) throw new Error("First cycle end time already passed");

            if (startTime < Date.now())
                this.timeResource = new TimeResource("Timeout", setTimeout(this.handleAfterDelay, this.msPeriod - (Date.now() - startTime)), startTime + this.msPeriod);
            else
                this.timeResource = new TimeResource("Timeout", setTimeout(this.start.bind(this), startTime), startTime + this.msPeriod, undefined);
        }
        else
        {
            throw new Error("Cycle already intiated or running!");
        }

    }

    protected handleAfterDelay = () =>
    {
        this.handleTick(true);
    };

    protected handleTick = (regenerate = false) =>
    {
        this.emitTick(regenerate);
    };

    protected emitTick(regenerate = false)
    {
        const time = new Date();
        const timestamp = time.getTime();
        if (regenerate)
            this.regenerateInterval();
        else
        {
            this.timeResource!.lastStart = timestamp;
            this.timeResource!.nextExpectedTimeout = timestamp + this.msPeriod;
        }
        this.emit(time);
        this.onTick.emit(time);
    }

    protected regenerateInterval()
    {
        if (this.timeResource)
            this.timeResource.destroy();
        this.timeResource = new TimeResource("Interval", setInterval(this.handleTick, this.msPeriod), Date.now() + this.msPeriod, Date.now());
    }

    stop()
    {
        this.timeResource?.destroy();
        this.timeResource = null;
    }

    destroy()
    {
        this.close();
        this.timeResource?.destroy();
        this.timeResource = null;
        super.destroy();
    }

    get isPending()
    {
        return (this.timeResource?.lastStart === undefined && this.latestChunk instanceof StartChunk);
    }

    get isRunning()
    {
        return this.timeResource?.lastStart !== null;
    }

    get period()
    {
        return this.msPeriod;
    }

    get lastCycleStart()
    {
        return this.timeResource?.lastStart;
    }

    get nextCycleStart()
    {
        return this.timeResource?.nextExpectedTimeout;
    }

    get msSinceLastCycleStart()
    {
        const lastStart = this.lastCycleStart;
        return lastStart ? Date.now() - lastStart : undefined;
    }

    get msBeforeNextCycleStart()
    {
        const nextCycleStart = this.nextCycleStart;
        return nextCycleStart ? nextCycleStart - Date.now() : undefined;
    }
}

export class AdjustableCycle extends Cycle
{
    private nextPeriod?: number;

    setPeriod(msPeriod: number, affectedCycle: "immediate" | "next" | "reset" = "next", silent = false)
    {
        switch (affectedCycle)
        {
            case "immediate":
                this.msPeriod = msPeriod;
                if (this.timeResource && this.timeResource.lastStart !== undefined)
                {
                    if (this.lastCycleStart! + msPeriod < Date.now())
                    {
                        //If we adjusted the current cycle we would have had to yield in the past. We thus regenerate.
                        this.sync(silent);
                    }
                    else
                    {
                        const lastStart = this.timeResource.lastStart;
                        this.timeResource?.destroy();
                        this.timeResource = new TimeResource("Timeout", setTimeout(this.handleAfterDelay, lastStart + this.msPeriod - Date.now()), lastStart + this.msPeriod, lastStart);
                    }
                }
                return;
            case "reset":
                this.msPeriod = msPeriod;
                this.sync(silent);
                return;
            case "next":
                this.nextPeriod = msPeriod;
                return;
        }
    }

    sync(silent = false)
    {
        if (this.timeResource)
        {
            if (silent)
                this.regenerateInterval();
            else
                this.emitTick(true);
        }
    }

    protected handleTick = () =>
    {
        if (this.nextPeriod)
        {
            this.msPeriod = this.nextPeriod;
            this.nextPeriod = undefined;
            super.emitTick(true);
        }
        else
            super.emitTick();
    };
}

export class TimeResource extends MemoryLeakable
{
    constructor(
        public type: "Timeout" | "Interval",
        public timeReference: any,
        public nextExpectedTimeout: number,
        public lastStart: number | undefined = Date.now()
    )
    {
        super();
    }

    destroy(): void
    {
        switch (this.type)
        {
            case "Timeout": return clearTimeout(this.timeReference);
            case "Interval": return clearInterval(this.timeReference);
        }
    }
}