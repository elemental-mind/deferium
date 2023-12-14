import type { CustomPromiseSym , IBasePromise, IPromise, IProtectedPromise, ResolveFunction, RejectFunction, ConfigurationMap, INameMappedPromise} from "./core.types.js";

export class ExtensiblePromise<SuccessType = void, FailureType = void> implements IBasePromise<SuccessType, FailureType>, IPromise<SuccessType, FailureType>
{
    //We don't need this symbol. It's only needed for type identification purposes for framework typing.
    declare [CustomPromiseSym]: undefined;

    protected capturedResolve;
    protected capturedReject;

    public isResolved = false;
    public result?: SuccessType;
    public isRejected = false;
    public rejection?: FailureType;
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

    reject(error: FailureType)
    {
        this.isRejected = true;
        this.rejection = error;
        this.capturedReject(error);
    }
}

export const ProtectedExtensiblePromise = ExtensiblePromise as unknown as new <SuccessType = void, FailureType = void>() => IBasePromise<SuccessType, FailureType> & IProtectedPromise<SuccessType, FailureType>;

export function NameMappedExtensiblePromise
    <Config extends ConfigurationMap<any, any>>
    (constNameMap: Config)
{
    //We cast these to const so that the JS engine can optimize the class expression and potentially eliminate the scope for this fucntion
    const resolveName = constNameMap.resolve;
    const resolvedName = constNameMap.isResolved;
    const resultName = constNameMap.result;
    const rejectName = constNameMap.reject;
    const rejectedName = constNameMap.isRejected;
    const rejectionName = constNameMap.rejection;

    return class extends ExtensiblePromise
    {
        constructor()
        {
            super();
            (this as any)[resolveName] = this.resolve;
            (this as any)[rejectName] = this.reject;
            (this as any)[resolvedName!] = false;
            (this as any)[rejectedName!] = false;
        }

        resolve(value: any)
        {
            this.isResolved = (this as any)[resolvedName!] = true;
            this.result = (this as any)[resultName!] = value;
            this.capturedResolve(value);
        }

        reject(error: any)
        {
            this.isRejected = (this as any)[rejectedName!] = true;
            this.rejection = (this as any)[rejectionName!] = error;
            this.capturedReject(error);
        }
    } as unknown as new <SuccessType = void, FailureType = void>() => IBasePromise<SuccessType, FailureType> & INameMappedPromise<SuccessType, FailureType, Config>;
}