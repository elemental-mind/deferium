/**
 * Base Trait Types
 */
export type CancelFunction<CancelType> = (value: CancelType) => void;

export abstract class ICancellable<CancelType>
{
    cancel!: CancelFunction<CancelType>;
    isCancelled!: boolean;
    cancelReason?: CancelType;
}

export abstract class IProtectedCancellable<CancelType>
{
    protected cancel!: CancelFunction<CancelType>;
    protected isCancelled!: boolean;
    protected cancelReason?: CancelType;
}

/**
 * Awaitable Types
 */

export type AwaitableNames<ResolveType, RejectType, CancelType> = { [K in keyof (IAwaitable<ResolveType, RejectType, CancelType>)]-?: string; };
export type INameMappedAwaitable<ResolveType, RejectType, CancelType, Names> = { -readonly [Prop in keyof Names as Names[Prop] extends string ? Names[Prop] : never]: Prop extends keyof IAwaitable<ResolveType, RejectType, CancelType> ? IAwaitable<ResolveType, RejectType, CancelType>[Prop] : never; };

export type ResolveFunction<SuccessType> = (value: SuccessType) => void;
export type RejectFunction<FailureType> = (value: FailureType) => void;

export const AwaitableKeys = Symbol();
export abstract class IsAwaitable<SuccessType, FailureType, CancelType>
{
    declare [AwaitableKeys]: AwaitableNames<SuccessType, FailureType, CancelType> | void;
    then!: typeof Promise.prototype.then;
    catch!: typeof Promise.prototype.catch;
    finally!: typeof Promise.prototype.finally;
}

export abstract class IAwaitable<SuccessType, FailureType, CancelType>
{
    resolve!: ResolveFunction<SuccessType>;
    isResolved!: boolean;
    result?: SuccessType;
    reject!: RejectFunction<FailureType>;
    isRejected!: boolean;
    rejection?: FailureType;
}

export abstract class IProtectedAwaitable<SuccessType, FailureType, CancelType>
{
    protected resolve!: ResolveFunction<SuccessType>;
    protected isResolved!: boolean;
    protected result?: SuccessType;
    protected reject!: RejectFunction<FailureType>;
    protected isRejected!: boolean;
    protected rejection?: FailureType;
}


/***
 * Subscribable Types
 */

export type SubscribableNames<E> = { [K in keyof (ISubscribable<E>)]-?: string; };
export type INameMappedSubscribable<T, Names> = { -readonly [Prop in keyof Names as Names[Prop] extends string ? Names[Prop] : never]: Prop extends keyof ISubscribable<T> ? ISubscribable<T>[Prop] : never; };

export type EventHandler<E> = (event: E) => void;

export const SubscribableKeys = Symbol();

export abstract class IsSubscribable<E>
{
    declare [SubscribableKeys]: SubscribableNames<E> | void;
}

export abstract class ISubscribable<E>
{
    abstract subscribe(handler: EventHandler<E>): void;
    abstract subscribe(instance: object, method: EventHandler<E>): void;

    abstract subscribeOnce(handler: EventHandler<E>): void;
    abstract subscribeOnce(instance: object, method: EventHandler<E>): void;

    abstract unsubscribe(handler: EventHandler<E>): void;
    abstract unsubscribe(instance: object): void;
    abstract unsubscribe(instance: object, method: EventHandler<E>): void;
}

export abstract class IProtectedSubscribable<E>
{
    protected abstract subscribe(handler: EventHandler<E>): void;
    protected abstract subscribe(instance: object, method: EventHandler<E>): void;

    protected abstract subscribeOnce(handler: EventHandler<E>): void;
    protected abstract subscribeOnce(instance: object, method: EventHandler<E>): void;

    protected abstract unsubscribe(handler: EventHandler<E>): void;
    protected abstract unsubscribe(instance: object): void;
    protected abstract unsubscribe(instance: object, method: EventHandler<E>): void;
}

/**
 * Streamable Types
 */

export type StreamableNames<E> = { [K in keyof (IStreamable<E>)]-?: string; };
export type INameMappedStreamable<T, Names> = { -readonly [Prop in keyof Names as Names[Prop] extends string ? Names[Prop] : never]: Prop extends keyof IStreamable<T> ? IStreamable<T>[Prop] : never; };

export const StreamableKeys = Symbol();

export abstract class IsStreamable<T>
{
    declare [StreamableKeys] : StreamableNames<T> | void;
    abstract [Symbol.asyncIterator]() : AsyncIterator<T>;
}

export abstract class IStreamable<T>
{
    hasEnded!: boolean;
    abstract emit(chunk: T): void;
    abstract close() : void;
}

export abstract class IProtectedStreamable<T>
{
    protected hasEnded!: boolean;
    protected abstract emit(chunk: T): void;
    protected abstract close() : void;
}


/**
 * MemoryLeakable Types
 */

export abstract class IMemoryLeakable
{
    abstract destroy():void;
}