import assert from "assert";
import { Cycle } from "./cycle.js";
import {Sequential} from "unitium"

@Sequential
export class CycleTests
{
    ShouldCreatePendingCycle()
    {
        const cycle = Cycle.pending(1000);
        assert.equal(cycle.isPending, true);
        cycle.destroy();
    }

    ShouldCreateRunningCycle()
    {
        const cycle = Cycle.running(1000);
        assert.equal(cycle.isRunning, true);
        cycle.destroy();
    }

    ShouldStartPendingCycle()
    {
        const cycle = Cycle.pending(1000);
        cycle.start();
        assert.equal(cycle.isRunning, true);
        cycle.destroy();
    }

    ShouldThrowWhenStartingRunningCycle()
    {
        const cycle = Cycle.running(1000);
        assert.throws(() =>
        {
            cycle.start();
        });
        cycle.destroy();
    }

    async ShouldEmitTicksWhenRunning()
    {
        const cycle = Cycle.running(100);
        let ticks = 0;
        cycle.onTick.subscribe(() => ticks++);
        await new Promise(resolve => setTimeout(resolve, 350));
        cycle.stop();
        cycle.destroy();
        assert.equal(ticks, 3);
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

        assert.equal(cycle.period, 500);

        cycle.destroy();
    }

    ShouldGetCycleTimes()
    {
        const now = Date.now();
        const cycle = Cycle.running(1000);

        assert(cycle.lastCycleStart! - now < 10);
        assert(cycle.nextCycleStart! >= now + 1000);

        cycle.destroy();
    }

    async ShouldGetCycleDurations()
    {
        const cycle = Cycle.running(500);

        await new Promise(resolve => setTimeout(resolve, 300));

        assert(cycle.msSinceLastCycleStart! >= 290);
        assert(cycle.msSinceLastCycleStart! <= 310);
        assert(cycle.msBeforeNextCycleStart! >= 190);
        assert(cycle.msBeforeNextCycleStart! <= 210);

        cycle.destroy();
    }
}
