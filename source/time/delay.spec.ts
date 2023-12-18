import assert from "assert";
import { Delay } from "./delay.js";

export class DelayTests
{
    ShouldConstructWithDelay()
    {
        const delay = new Delay(1000);
        assert.equal(delay.duration, 1000);
    }

    async ShouldResolveAfterDelay()
    {
        const delay = new Delay(500);
        const start = Date.now();
        await delay;

        assert.ok(Date.now() - start > 499);
    }

    async ShouldRejectIfAborted()
    {
        const delay = new Delay(1000);
        const exceptionResult = this.#captureException(delay);
        delay.abort();
        const returnValue = await exceptionResult;

        assert(returnValue !== 0);
        assert(Date.now() - delay.creationTime < 10);
    }

    async #captureException(delay: Delay)
    {
        try
        {
            await delay;
            return 0;
        }
        catch(e)
        {
            return Date.now();
        }
    }

    ShouldExposeTimingValues()
    {
        const delay = new Delay(500);
        assert(delay.msRemaining > 495);
        assert(delay.msElapsed < 5);
        assert(delay.endTime > Date.now());
    }
}
