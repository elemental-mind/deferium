import { Awaitable, NameMappedAwaitable } from "./awaitable.js";
import assert from "assert";

export class AwaitableTests
{
    promise = new Awaitable<number, number>();

    ShouldHaveResolveRejectFunctions()
    {
        assert.equal(typeof this.promise.resolve, "function");
        assert.equal(typeof this.promise.reject, "function");
    }

    async ShouldResolveAndUpdateStatus()
    {
        let resolved = false;
        this.promise.then(() => resolved = true);
        this.promise.resolve(200);
        await this.promise;

        assert.equal(this.promise.isResolved, true);
        assert.equal(this.promise.isRejected, false);
        assert.equal(this.promise.result, 200);
        assert.ok(resolved);
    }

    async ShouldRejectAndUpdateStatus()
    {
        let rejected = false;
       
        try
        {
            this.promise.reject(404);
            await this.promise;
        }
        catch
        {
            rejected = true;
        }

        assert.equal(this.promise.isResolved, false);
        assert.equal(this.promise.isRejected, true);
        assert.equal(this.promise.rejection, 404);
        assert.ok(rejected);
    }
}

const CustomAwaitable = NameMappedAwaitable({ resolve: "send", isResolved: "isSent", result: "message", reject: "withdraw", isRejected: "isWithdrawn", rejection: "withdrawalReason"} as const);

export class NameMappedAwaitableTests
{
    signal = new CustomAwaitable<string, string>();

    ShouldHaveCustomNamedFunctions()
    {
        assert.equal(typeof this.signal.send, "function");
        assert.equal(typeof this.signal.withdraw, "function");
    }

    ShouldHaveCustomNamedStatus()
    {
        assert.equal(this.signal.isSent, false);
        assert.equal(this.signal.isWithdrawn, false);
    }

    async ShouldResolve()
    {
        let resolved = false;
        this.signal.then(() => resolved = true).catch(() => { throw new Error(); });
        this.signal.send("Success");
        await this.signal;

        assert.equal(this.signal.isSent, true);
        assert.equal(this.signal.isWithdrawn, false);
        assert.equal(this.signal.message, "Success");
        assert.ok(resolved);
    }

    async ShouldRejectAndUpdateStatus()
    {
        let rejected = false;
               
        try
        {
            this.signal.withdraw("Error");
            await this.signal;
        }
        catch
        {
            rejected = true;
        }

        assert.equal(this.signal.isSent, false);
        assert.equal(this.signal.isWithdrawn, true);
        assert.equal(this.signal.withdrawalReason, "Error");
        assert.ok(rejected);
    }
}