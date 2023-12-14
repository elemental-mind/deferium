export const CustomPromiseSym = Symbol();
export type ResolveFunction<SuccessType> = (value: SuccessType) => void;
export type RejectFunction<FailureType> = (value: FailureType) => void;

export abstract class IBasePromise<ResolveType, RejectType>
{
    declare [CustomPromiseSym]: undefined;
    then!: typeof Promise.prototype.then;
    catch!: typeof Promise.prototype.catch;
    finally!: typeof Promise.prototype.finally;
}

export abstract class IPromise<SuccessType, FailureType>
{
    resolve!: ResolveFunction<SuccessType>;
    isResolved!: boolean;
    result?: SuccessType | undefined;
    reject!: RejectFunction<FailureType>;
    isRejected!: boolean;
    rejection?: FailureType | undefined;
}

export abstract class IProtectedPromise<SuccessType, FailureType>
{
    protected resolve!: ResolveFunction<SuccessType>;
    protected isResolved!: boolean;
    protected result?: SuccessType | undefined;
    protected reject!: RejectFunction<FailureType>;
    protected isRejected!: boolean;
    protected rejection?: FailureType | undefined;
}

abstract class IPrivatePromise<SuccessType, FailureType>
{
    private resolve!: ResolveFunction<SuccessType>;
    private isResolved!: boolean;
    private result?: SuccessType | undefined;
    private reject!: RejectFunction<FailureType>;
    private isRejected!: boolean;
    private rejection?: FailureType | undefined;
}

export type ConfigurationMap<ResolveType, RejectType> = { [K in keyof (IPromise<ResolveType, RejectType>)]-?: string; };
export type INameMappedPromise<ResolveType, RejectType, Names> = { -readonly [Prop in keyof Names as Names[Prop] extends string ? Names[Prop] : never]: Prop extends keyof IPromise<ResolveType, RejectType> ? IPromise<ResolveType, RejectType>[Prop] : never; } & IPrivatePromise<ResolveType, RejectType>;
