const CustomPromiseSym = Symbol();
type ResolveFunction<FulfilType> = Extract<undefined, FulfilType> extends never ? (value: FulfilType | PromiseLike<FulfilType>) => void : (value?: FulfilType | PromiseLike<FulfilType>) => void;
type RejectFunction<RejectType> = Extract<undefined, RejectType> extends never ? (value: RejectType | PromiseLike<RejectType>) => void : (value?: RejectType | PromiseLike<RejectType>) => void;


abstract class IBasePromise<ResolveTpe = undefined, RejectType = any>
{
    [CustomPromiseSym]: undefined;
    then = Promise.prototype.then;
    catch = Promise.prototype.catch;
    finally = Promise.prototype.finally;
}

abstract class IPromise<ResolveType, RejectType>
{
    resolve = Promise.resolve as ResolveFunction<ResolveType>;
    isResolved = false;
    result?: ResolveType | undefined;
    reject = Promise.reject as RejectFunction<RejectType>;
    isRejected = false;
    rejection?: RejectType | undefined;
}

abstract class IProtectedPromise<ResolveType, RejectType>
{
    protected resolve = Promise.resolve as ResolveFunction<ResolveType>;
    protected isResolved = false;
    protected result?: ResolveType | undefined;
    protected reject = Promise.reject as RejectFunction<RejectType>;
    protected isRejected = false;
    protected rejection?: RejectType | undefined;
}

abstract class IPrivatePromise<ResolveType, RejectType>
{
    private resolve = Promise.resolve as ResolveFunction<ResolveType>;
    private isResolved = false;
    private result?: ResolveType | undefined;
    private reject = Promise.reject as RejectFunction<RejectType>;
    private isRejected = false;
    private rejection?: RejectType | undefined;
}

type ConfigurationMap<ResolveType, RejectType> = { [K in keyof (IPromise<ResolveType, RejectType> | IProtectedPromise<ResolveType, RejectType>)]-?: string; } | void;

export type IExtendedPromise<ResolveType, RejectType, InterfaceType extends IPromise<ResolveType, RejectType> | IProtectedPromise<ResolveType, RejectType>, Config extends ConfigurationMap<ResolveType, RejectType>> = Config extends void ? InterfaceType : ResolveMapping<ResolveType, RejectType, InterfaceType, Config>;
type ResolveMapping<ResolveType, RejectType, InterfaceType extends IPromise<ResolveType, RejectType> | IProtectedPromise<ResolveType, RejectType>, Names> = { -readonly [Prop in keyof Names as Names[Prop] extends string ? Names[Prop] : never]: Prop extends keyof InterfaceType? InterfaceType[Prop]: never;} & IPrivatePromise<ResolveType, RejectType>;

export const ExtensiblePromise = NameMappedExtensiblePromise() as new<ResolveType = void, RejectType = void>() => IBasePromise<ResolveType, RejectType> & IExtendedPromise<ResolveType, RejectType, IPromise<ResolveType, RejectType>, void>;
export const ProtectedExtensiblePromise = NameMappedExtensiblePromise() as unknown as new<ResolveType = void, RejectType = void>() => IBasePromise<ResolveType, RejectType> & IExtendedPromise<ResolveType, RejectType, IProtectedPromise<ResolveType, RejectType>, void>;

export function NameMappedExtensiblePromise
    <ResolveType = void, RejectType = void, Config extends ConfigurationMap<ResolveType, RejectType> = void>
    (mapper?: (resultType: ResolveType, rejectionType: RejectType) => Config)
{
    //We cast these to const so that the JS engine can optimize the class expression and potentially eliminate the scope for this fucntion
    const nameMap = mapper?.(undefined as any, undefined as any) as any;
    const hasNameMappings = nameMap !== undefined;
    const resolveName = nameMap?.resolve;
    const resolvedName = nameMap?.isResolved;
    const resultName = nameMap?.result;
    const rejectName = nameMap?.reject;
    const rejectedName = nameMap?.isRejected;
    const rejectionName = nameMap?.rejection;

    return class
    {
        //We don't need this symbol. It's only needed for type identification purposes for framework typing.
        declare [CustomPromiseSym]: undefined;

        private __promise__;
        private capturedResolve;
        private capturedReject;
        public isResolved = false;
        public result?: ResolveType;
        public isRejected = false;
        public rejection?: RejectType;

        constructor()
        {
            let captureResolve: ResolveFunction<ResolveType>;
            let captureCancel: ResolveFunction<RejectType>;
            //@ts-expect-error
            this.__promise__ = new Promise<FulfilType>((resolve, reject) => { captureResolve = resolve; captureCancel = reject; });
            this.capturedResolve = captureResolve!;
            this.capturedReject = captureCancel!;
            if (hasNameMappings)
            {
                (this as any)[resolveName!] = captureResolve!;
                (this as any)[resolvedName!] = false;
                (this as any)[rejectName!] = captureCancel!;
                (this as any)[rejectedName!] = false;
            }
        }

        resolve(value: ResolveType)
        {
            this.isResolved = true;
            this.result = value;
            if (nameMap)
            {
                (this as any)[resolvedName!] = true;
                (this as any)[resultName!] = value;
            }
            this.capturedResolve(value);
        }

        reject(error: RejectType)
        {
            this.isRejected = true;
            this.rejection = error;
            if (nameMap)
            {
                (this as any)[rejectedName!] = true;
                (this as any)[rejectionName!] = error;
            }
            this.capturedReject(error);
        }

        then<ChainContinueType, ChainAbortType>(onfulfilled?: ((value: ResolveType) => ChainContinueType | PromiseLike<ChainContinueType>) | null, onrejected?: ((reason: RejectType) => ChainAbortType | PromiseLike<ChainAbortType>) | null): Promise<ChainContinueType | ChainAbortType>
        {
            return this.__promise__.then(onfulfilled, onrejected);
        }

        catch<ChainAbortType>(onrejected?: ((reason: RejectType) => ChainAbortType | PromiseLike<ChainAbortType>) | null | undefined)
        {
            return this.__promise__.catch(onrejected);
        }

        finally(onfinally?: (() => void) | null)
        {
            return this.__promise__.finally(onfinally);
        }
    } as unknown as new<SuccessType = void, FailureType = void>() => IBasePromise<ResolveType, RejectType> & IExtendedPromise<ResolveType, RejectType, IPromise<ResolveType, RejectType>, Config>;
}