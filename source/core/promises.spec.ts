import { ExtensiblePromise, NameMappedExtensiblePromise, ProtectedExtensiblePromise } from "./promises.js";
import assert from "assert";

export class ExtensiblePromiseTests
{
    promise = new ExtensiblePromise<number, number>();

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
        assert.equal(this.promise.isCancelled, false);
        assert.equal(this.promise.isRejected, false);
        assert.equal(this.promise.result, 200);
        assert.ok(resolved);
    }

    async ShouldCancelAndUpdateStatus()
    {
        let cancelled = false;
       
        try
        {
            this.promise.cancel();
            await this.promise;
        }
        catch
        {
            if(this.promise.isCancelled) cancelled = true;
        }

        assert.equal(this.promise.isResolved, false);
        assert.equal(this.promise.isCancelled, true);
        assert.equal(this.promise.isRejected, false);
        assert.equal(this.promise.cancelReason, undefined);
        assert.ok(cancelled);
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
            if(this.promise.isRejected) rejected = true;
        }

        assert.equal(this.promise.isResolved, false);
        assert.equal(this.promise.isCancelled, false);
        assert.equal(this.promise.isRejected, true);
        assert.equal(this.promise.rejection, 404);
        assert.ok(rejected);
    }
}

export class NameMappedExtensiblePromiseTests
{
    CustomizedPromise = NameMappedExtensiblePromise({ resolve: "send", isResolved: "isSent", result: "message", reject: "withdraw", isRejected: "isWithdrawn", rejection: "withdrawalReason", cancel: "abort", isCancelled: "isAborted", cancelReason: "abortReason" } as const);
    signal = new this.CustomizedPromise<string, string>();

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
        assert.equal(this.signal.isAborted, false);
        assert.equal(this.signal.isWithdrawn, false);
        assert.equal(this.signal.message, "Success");
        assert.ok(resolved);
    }

    async ShouldCancelAndUpdateStatus()
    {
        let cancelled = false;
       
        try
        {
            this.signal.abort();
            await this.signal;
        }
        catch
        {
            if(this.signal.isAborted) cancelled = true;
        }

        assert.equal(this.signal.isSent, false);
        assert.equal(this.signal.isAborted, true);
        assert.equal(this.signal.isWithdrawn, false);
        assert.equal(this.signal.abortReason, undefined);
        assert.ok(cancelled);
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
            if(this.signal.isWithdrawn) rejected = true;
        }

        assert.equal(this.signal.isSent, false);
        assert.equal(this.signal.isAborted, false);
        assert.equal(this.signal.isWithdrawn, true);
        assert.equal(this.signal.withdrawalReason, "Error");
        assert.ok(rejected);
    }
}