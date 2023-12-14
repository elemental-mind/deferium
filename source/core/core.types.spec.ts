import { ExtensiblePromise, ProtectedExtensiblePromise, NameMappedExtensiblePromise } from "./promises.js";

const mapping = {resolve: "send", isResolved: "isSent", result: "message", reject: "withdraw", isRejected: "withdrawn", rejection: "withdrawalReason"} as const;


/**
 * This class is solely for testing type support. It should not generate any TS errors.
 */
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
        class RenamedBaseExtensible extends NameMappedExtensiblePromise(mapping)
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

    BaseSupportsGenerics()
    {
        class GenericRenamedPromise<S, F> extends NameMappedExtensiblePromise(mapping)<S, F>
        {
            success()
            {
                const success = {} as S;
                this.send(success);
            }

            failure()
            {
                const failure = {} as F;
                this.withdraw(failure);
            }
        }
    }

    RenamedSupportsGenerics()
    {
        class GenericRenamedPromise<S, F> extends NameMappedExtensiblePromise(mapping)<S, F>
        {
            success()
            {
                const success = {} as S;
                this.send(success);
            }

            failure()
            {
                const failure = {} as F;
                this.withdraw(failure);
            }
        }
    }
}