export type ResolveFunction<SuccessType> = (value: SuccessType) => void;
export type RejectFunction<FailureType> = (value: FailureType) => void;
export type CancelFunction<CancelType> = (value: CancelType) => void;
export type ConfigurationMap<ResolveType, RejectType, CancelType> = { [K in keyof (IPromise<ResolveType, RejectType, CancelType>)]-?: string; };
export type INameMappedPromise<ResolveType, RejectType, CancelType, Names> = { -readonly [Prop in keyof Names as Names[Prop] extends string ? Names[Prop] : never]: Prop extends keyof IPromise<ResolveType, RejectType, CancelType> ? IPromise<ResolveType, RejectType, CancelType>[Prop] : never; } & IPrivatePromise<ResolveType, RejectType, CancelType>;
export type EventHandler<E> = (event: E) => void;

export const CustomPromiseSym = Symbol();
export abstract class IBasePromise<SuccessType, FailureType, CancelType>
{
    declare [CustomPromiseSym]: undefined;
    then!: typeof Promise.prototype.then;
    catch!: typeof Promise.prototype.catch;
    finally!: typeof Promise.prototype.finally;
}

export abstract class IPromise<SuccessType, FailureType, CancelType>
{
    resolve!: ResolveFunction<SuccessType>;
    isResolved!: boolean;
    result?: SuccessType;
    reject!: RejectFunction<FailureType>;
    isRejected!: boolean;
    rejection?: FailureType;
    cancel!: CancelFunction<CancelType>;
    isCancelled!: boolean;
    cancelReason?: CancelType;
}

export abstract class IProtectedPromise<SuccessType, FailureType, CancelType>
{
    protected resolve!: ResolveFunction<SuccessType>;
    protected isResolved!: boolean;
    protected result?: SuccessType;
    protected reject!: RejectFunction<FailureType>;
    protected isRejected!: boolean;
    protected rejection?: FailureType;
    protected cancel!: CancelFunction<CancelType>;
    protected isCancelled!: boolean;
    protected cancelReason?: CancelType;
}

abstract class IPrivatePromise<SuccessType, FailureType, CancelType>
{
    private resolve!: ResolveFunction<SuccessType>;
    private isResolved!: boolean;
    private result?: SuccessType;
    private reject!: RejectFunction<FailureType>;
    private isRejected!: boolean;
    private rejection?: FailureType;
    private cancel!: CancelFunction<CancelType>;
    private isCancelled!: boolean;
    private cancelReason?: CancelType;
}

export interface IEventEmitter<E>
{
    subscribe(handler: EventHandler<E>): void;
    subscribe(instance: object, method: EventHandler<E>): void;
    
    subscribeOnce(handler: EventHandler<E>): void;
    subscribeOnce(instance: object, method: EventHandler<E>): void;

    unsubscribe(handler: EventHandler<E>): void;
    unsubscribe(instance: object): void;
    unsubscribe(instance: object, method: EventHandler<E>): void;
}