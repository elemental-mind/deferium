import assert from "assert";
import { Cycle } from "./cycle.js";
import { Sequential } from "unitium";

@Sequential
export class CycleTests
{
    ShouldCreatePendingCycle()
    {
        const cycle = Cycle.pending(1000);
        try
        {
            assert.equal(cycle.isPending, true);
        }
        finally
        {
            cycle.destroy();
        }
    }

    ShouldCreateRunningCycle()
    {
        const cycle = Cycle.running(1000);
        try
        {
            assert.equal(cycle.isRunning, true);
        }
        finally
        {
            cycle.destroy();
        }
    }

    ShouldStartPendingCycle()
    {
        const cycle = Cycle.pending(1000);
        try
        {
            cycle.start();
            assert.equal(cycle.isRunning, true);
        }
        finally
        {
            cycle.destroy();
        }
    }

    ShouldThrowWhenStartingRunningCycle()
    {
        const cycle = Cycle.running(1000);
        try
        {
            assert.throws(() =>
            {
                cycle.start();
            });
        }
        finally
        {
            cycle.destroy();
        }
    }

    async ShouldEmitTicksWhenRunning()
    {
        const cycle = Cycle.running(100);
        let ticks = 0;
        try
        {
            cycle.onTick.subscribe(() => ticks++);
            await new Promise(resolve => setTimeout(resolve, 350));
            assert.equal(ticks, 3);
            cycle.stop();
        }
        finally
        {
            cycle.destroy();
        }
    }

    async ShouldBeAsyncIterable()
    {
        const cycle = Cycle.pending(100);
        const count = this.#consumeAsync(cycle);

        cycle.start();
        await new Promise(resolve => setTimeout(resolve, 350));
        cycle.stop();
        cycle.destroy();
        const ticks = await count;
        assert.equal(ticks, 3);
    }

    async #consumeAsync(cycle: Cycle)
    {
        let ticks = 0;
        for await (const tick of cycle) ticks++;
        return ticks;
    }

    ShouldGetCorrectPeriod()
    {
        const cycle = Cycle.pending(500);

        try
        {
            assert.equal(cycle.period, 500);
        }
        finally
        {
            cycle.destroy();
        }
    }

    ShouldGetCycleTimes()
    {
        const now = Date.now();
        const cycle = Cycle.running(1000);

        try
        {
            assert(cycle.lastCycleStart! - now < 10);
            assert(cycle.nextCycleStart! >= now + 1000);
        }
        finally
        {
            cycle.destroy();
        }
    }

    async ShouldGetCycleDurations()
    {
        const cycle = Cycle.running(500);

        try
        {
            await new Promise(resolve => setTimeout(resolve, 300));

            assert(cycle.msSinceLastCycleStart! >= 270);
            assert(cycle.msSinceLastCycleStart! <= 330);
            assert(cycle.msBeforeNextCycleStart! >= 170);
            assert(cycle.msBeforeNextCycleStart! <= 230);
        }
        finally
        {
            cycle.destroy();
        }
    }
}