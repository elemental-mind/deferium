import assert from "assert";

import { ExtensiblePromise, NameMappedExtensiblePromise, ProtectedExtensiblePromise } from "./core.js";

const mapping = {resolve: "send", isResolved: "isSent", result: "message", reject: "withdraw", isRejected: "withdrawn", rejection: "withdrawalReason"} as const;

const DefaultCustomPromise = ExtensiblePromise;
const Signal_CustomNamePromise = NameMappedExtensiblePromise(
    (resultType: string, rejectionType: string) => 
    ({resolve: "send", isResolved: "isSent", result: "message", reject: "withdraw", isRejected: "withdrawn", rejection: "withdrawalReason"} as const)
);

function NoOp() { }

class TypeTests
{
    BaseShouldDisplayMembers()
    {
        class BaseExtensible extends ExtensiblePromise
        {
            constructor()
            {
                super();
                this.resolve();
            }
        }

        let instance = new BaseExtensible();
        instance.resolve();
    }

    BaseShouldRenameAndDisplayRenamedMembers()
    {
        class RenamedBaseExtensible extends NameMappedExtensiblePromise((resolve: void, reject: void) => mapping)
        {
            constructor()
            {
                super();
                this.send();
                //@ts-expect-error
                this.resolve();
            }
        }

        let instance = new RenamedBaseExtensible();
        instance.send();
        //@ts-expect-error
        this.resolve();
    }

    ProtectedShouldHideMembers()
    {
        class ProtectedExtensible extends ProtectedExtensiblePromise
        {
            constructor()
            {
                super();
                this.resolve();
            }
        }

        let instance = new ProtectedExtensible();
        //@ts-expect-error
        instance.resolve();
    }
}

export class DefaultTests
{
    promise = new DefaultCustomPromise();

    ShouldHaveResolveRejectFunctions()
    {
        this.promise.reject()
        assert.equal(typeof this.promise.resolve, "function");
        assert.equal(typeof this.promise.reject, "function");
    }

    async ShouldResolve()
    {
        let resolved = false;
        this.promise.then(() => resolved = true).catch(() => { throw new Error(); });
        this.promise.resolve();
        await this.promise;

        assert.ok(resolved);
    }

    async ShouldReject()
    {
        let rejected = false;
        this.promise.then(() => { throw new Error(); }).catch(() => rejected = true);
        this.promise.reject();
        await this.promise;

        assert.ok(rejected);
    }
}

export class CustomizedPromiseTests
{
    signal = new Signal_CustomNamePromise();

    ShouldHaveCustomNamedFunctions()
    {
        assert.equal(typeof this.signal.send, "function");
        assert.equal(typeof this.signal.withdraw, "function");
    }

    ShouldHaveCustomNamedStatus()
    {
        let something = new Promise<string>(resolve => setTimeout(() => resolve, 100));
        assert.equal(this.signal.isSent, false);
        assert.equal(this.signal.withdrawn, false);
    }

    async ShouldResolve()
    {
        
        let resolved = false;
        this.signal.then(() => resolved = true).catch(() => { throw new Error(); });
        this.signal.send("Success");
        await this.signal;

        assert.ok(resolved);
    }

    async ShouldHaveCustomNamedResultProperty()
    {
        this.signal.send("Success");
        await this.signal;
    }

    async ShouldReject()
    {
        
        this.signal.then()
        let rejected = false;
        this.signal.then(() => { throw new Error(); }).catch(() => rejected = true);
        this.signal.withdraw("Error");
        await this.signal;
        assert.ok(rejected);
    }

    async ShouldHaveCustomNamedRejectionProperty()
    {
        this.signal.then()
    }
}
