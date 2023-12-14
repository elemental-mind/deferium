import type { CustomPromiseSym, IBasePromise, IPromise, IProtectedPromise, ResolveFunction, RejectFunction, ConfigurationMap, INameMappedPromise } from "./core.types.js";
import { EventEmitter } from "./events.js";

export class ExtensiblePromise<SuccessType = void, FailureType = void, CancelType = void> implements IBasePromise<SuccessType, FailureType, CancelType>, IPromise<SuccessType, FailureType, CancelType>
{
    //We don't need this symbol. It's only needed for type identification purposes for framework typing.
    declare [CustomPromiseSym]: undefined;

    protected capturedResolve;
    protected capturedReject;

    public isResolved = false;
    public result?: SuccessType;
    public isRejected = false;
    public rejection?: FailureType;
    public isCancelled = false;
    public cancelReason?: CancelType;
    public readonly then;
    public readonly catch;
    public readonly finally;

    constructor()
    {
        let captureResolve: ResolveFunction<any>;
        let captureCancel: RejectFunction<any>;
        const promise = new Promise<SuccessType>((resolve, reject) => { captureResolve = resolve; captureCancel = reject; });
        this.capturedResolve = captureResolve!;
        this.capturedReject = captureCancel!;
        this.then = promise.then.bind(promise);
        this.catch = promise.catch.bind(promise);
        this.finally = promise.finally.bind(promise);
    }

    resolve(value: SuccessType)
    {
        this.isResolved = true;
        this.result = value;
        this.capturedResolve(value);
    }

    cancel(cancelReason: CancelType)
    {
        this.isCancelled = true;
        this.cancelReason = cancelReason;
        this.capturedReject(cancelReason);
    }

    reject(error: FailureType)
    {
        this.isRejected = true;
        this.rejection = error;
        this.capturedReject(error);
    }
}

export const ProtectedExtensiblePromise = ExtensiblePromise as unknown as new <SuccessType = void, FailureType = void, CancelType = void>() => IBasePromise<SuccessType, FailureType, CancelType> & IProtectedPromise<SuccessType, FailureType, CancelType>;

export class SubscribablePromise extends ExtensiblePromise
{
    onResolve = new EventEmitter();
    onCancel = new EventEmitter();
    onReject = new EventEmitter();
}

export function NameMappedExtensiblePromise
    <Config extends ConfigurationMap<any, any, any>>
    (constNameMap: Config)
{
    //We cast these to const so that the JS engine can optimize the class expression and potentially eliminate the scope for this fucntion
    const resolveName = constNameMap.resolve;
    const resolvedName = constNameMap.isResolved;
    const resultName = constNameMap.result;
    const rejectName = constNameMap.reject;
    const rejectedName = constNameMap.isRejected;
    const rejectionName = constNameMap.rejection;
    const cancelName = constNameMap.cancel;
    const cancelledName = constNameMap.isCancelled;
    const canellationName = constNameMap.cancelReason;

    const GeneratedClass = class extends ExtensiblePromise
    {
        resolve(value: any)
        {
            this.isResolved = (this as any)[resolvedName!] = true;
            this.result = (this as any)[resultName!] = value;
            this.capturedResolve(value);
        }

        cancel(cancelReason: any)
        {
            this.isCancelled = (this as any)[cancelledName!] = true;
            this.cancelReason = (this as any)[canellationName!] = cancelReason;
            this.capturedReject(cancelReason);
        }

        reject(error: any)
        {
            this.isRejected = (this as any)[rejectedName!] = true;
            this.rejection = (this as any)[rejectionName!] = error;
            this.capturedReject(error);
        }
    } as unknown as new <SuccessType = void, FailureType = void, CancelType = void>() => IBasePromise<SuccessType, FailureType, CancelType> & INameMappedPromise<SuccessType, FailureType, CancelType, Config>;

    GeneratedClass.prototype[resolveName] = GeneratedClass.prototype.resolve;
    GeneratedClass.prototype[cancelName] = GeneratedClass.prototype.cancel;
    GeneratedClass.prototype[rejectName] = GeneratedClass.prototype.reject;
    GeneratedClass.prototype[resolvedName] = false;
    GeneratedClass.prototype[cancelledName] = false;
    GeneratedClass.prototype[rejectedName] = false;

    return GeneratedClass;
}