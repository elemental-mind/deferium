import { AwaitableKeys, IsAwaitable, IAwaitable, IProtectedAwaitable, ResolveFunction, RejectFunction, SubscribableNames, INameMappedAwaitable, AwaitableNames } from "./core.types.js";
import { Trait } from "fusium-js";

const resolve = Symbol();
const reject = Symbol();

export class Awaitable<SuccessType = void, FailureType = void, CancelType = void> extends Trait implements IsAwaitable<SuccessType, FailureType, CancelType>, IAwaitable<SuccessType, FailureType, CancelType>
{
    //We don't need this symbol. It's only needed for type identification purposes for framework typing.
    declare [AwaitableKeys]: undefined;

    protected [resolve]: ResolveFunction<any>;
    protected [reject]: RejectFunction<any>;

    public isResolved = false;
    public result?: SuccessType;
    public isRejected = false;
    public rejection?: FailureType;
    public readonly then;
    public readonly catch;
    public readonly finally;

    constructor()
    {
        super();
        let captureResolve: ResolveFunction<any>;
        let captureCancel: RejectFunction<any>;
        const promise = new Promise<SuccessType>((resolve, reject) => { captureResolve = resolve; captureCancel = reject; });
        this[resolve] = captureResolve!;
        this[reject] = captureCancel!;
        this.then = promise.then.bind(promise);
        this.catch = promise.catch.bind(promise);
        this.finally = promise.finally.bind(promise);
    }

    resolve(value: SuccessType)
    {
        this.isResolved = true;
        this.result = value;
        this[resolve](value);
    }

    reject(error: FailureType)
    {
        this.isRejected = true;
        this.rejection = error;
        this[reject](error);
    }
}

export const ProtectedAwaitable = Awaitable as unknown as new <SuccessType = void, FailureType = void, CancelType = void>() => IsAwaitable<SuccessType, FailureType, CancelType> & IProtectedAwaitable<SuccessType, FailureType, CancelType>;

export function NameMappedAwaitable<Config extends AwaitableNames<any, any, any>>(constNameMap: Config)
{
    //We cast these to const so that the JS engine can optimize the class expression and potentially eliminate the scope for this fucntion
    const resolveName = constNameMap.resolve;
    const resolvedName = constNameMap.isResolved;
    const resultName = constNameMap.result;
    const rejectName = constNameMap.reject;
    const rejectedName = constNameMap.isRejected;
    const rejectionName = constNameMap.rejection;

    const GeneratedClass = class<SuccessType> extends Trait
    {
        constructor()
        {
            super();
            let captureResolve: ResolveFunction<any>;
            let captureCancel: RejectFunction<any>;
            const promise = new Promise<SuccessType>((resolve, reject) => { captureResolve = resolve; captureCancel = reject; });
            (this as any)[resolve] = captureResolve!;
            (this as any)[reject] = captureCancel!;
            (this as any).then = promise.then.bind(promise);
            (this as any).catch = promise.catch.bind(promise);
            (this as any).finally = promise.finally.bind(promise);
        }

        [resolveName](value: any)
        {
            (this as any)[resolvedName!] = true;
            (this as any)[resultName!] = value;
            (this as any)[resolve](value);
        }

        [rejectName](error: any)
        {
            (this as any)[rejectedName!] = true;
            (this as any)[rejectionName!] = error;
            (this as any)[reject](error);
        }
    } as unknown as new <SuccessType = void, FailureType = void, CancelType = void>() => IsAwaitable<SuccessType, FailureType, CancelType> & INameMappedAwaitable<SuccessType, FailureType, CancelType, Config>;

    GeneratedClass.prototype[AwaitableKeys] = constNameMap;
    GeneratedClass.prototype[resolvedName] = false;
    GeneratedClass.prototype[rejectedName] = false;

    return GeneratedClass;
}