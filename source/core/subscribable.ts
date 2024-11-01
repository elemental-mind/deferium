import { Trait } from "fusium-js";
import type { EventHandler, ISubscribable as ISubscribable } from "./core.types.js";

export const nextSubscription = Symbol();

export interface SubscriptionListElement<T>
{
    [nextSubscription]?: Subscription<T>;
}

export interface Subscription<T> extends SubscriptionListElement<T>
{
    emit(event: T): boolean;
    matches(handlerOrInstance: object | EventHandler<T>, method?: EventHandler<T> | undefined): boolean;
}

export class Subscribable<T = void> extends Trait implements ISubscribable<T>
{
    [nextSubscription]?: Subscription<T>;

    subscribe(handlerOrInstance: object | EventHandler<T>, method?: EventHandler<T> | undefined): void
    {
        this.#appendToSubscriptions(method ? new PermanentInstanceSubscription(handlerOrInstance, method) : new PermanentSubscription(handlerOrInstance as EventHandler<T>));
    }

    subscribeOnce(handlerOrInstance: object | EventHandler<T>, method?: EventHandler<T> | undefined): void
    {
        this.#appendToSubscriptions(method ? new EphemeralInstanceSubscription(handlerOrInstance, method) : new EphemeralSubscription(handlerOrInstance as EventHandler<T>));
    }

    #appendToSubscriptions(subscription: Subscription<T>)
    {
        let currentChainElement: SubscriptionListElement<T> = this;
        while (currentChainElement[nextSubscription]) currentChainElement = currentChainElement[nextSubscription]!;

        currentChainElement[nextSubscription] = subscription;
    }

    unsubscribe(handlerOrInstance: object | EventHandler<T>, method?: EventHandler<T> | undefined): void
    {
        for (let currentElement: SubscriptionListElement<T> = this; currentElement[nextSubscription] !== undefined; currentElement = currentElement[nextSubscription]!)
        {
            const subscription = currentElement[nextSubscription];

            if (subscription.matches(handlerOrInstance, method))
            {
                currentElement[nextSubscription] = subscription[nextSubscription];
                break;
            }
        }
    }

    emit(event: T): void
    {
        let currentElement: SubscriptionListElement<T> = this;

        while (currentElement[nextSubscription])
        {
            const subscription = currentElement[nextSubscription];

            if (subscription.emit(event))
                currentElement = subscription;
            else
                currentElement[nextSubscription] = subscription[nextSubscription];
        }
    }
}

export class PermanentSubscription<T> implements Subscription<T>
{
    constructor(
        public handler: EventHandler<T>
    ) { }

    emit(event: T)
    {
        this.handler(event);
        return true;
    }

    matches(handlerOrInstance: object | EventHandler<T>, method?: EventHandler<T> | undefined): boolean
    {
        if (method)
            return false;
        else
            return handlerOrInstance === this.handler;
    }
}

export class PermanentInstanceSubscription<T> implements Subscription<T>
{
    constructor(
        public instance: object,
        public method: EventHandler<T>,
    ) { }

    emit(event: T)
    {
        this.method.call(this.instance, event);
        return true;
    }

    matches(handlerOrInstance: object | EventHandler<T>, method?: EventHandler<T> | undefined): boolean
    {
        if (!method)
            return false;
        else
            return handlerOrInstance === this.instance && this.method === method;
    }
}

export class EphemeralSubscription<T> implements Subscription<T>
{
    constructor(
        public handler: EventHandler<T>
    ) { }

    emit(event: T)
    {
        this.handler(event);
        return false;
    }

    matches(handlerOrInstance: object | EventHandler<T>, method?: EventHandler<T> | undefined): boolean
    {
        if (method)
            return false;
        else
            return handlerOrInstance === this.handler;
    }
}

export class EphemeralInstanceSubscription<T> implements Subscription<T>
{
    constructor(
        public instance: object,
        public method: EventHandler<T>,
    ) { }

    emit(event: T)
    {
        this.method.call(this.instance, event);
        return false;
    }

    matches(handlerOrInstance: object | EventHandler<T>, method?: EventHandler<T> | undefined): boolean
    {
        if (!method)
            return false;
        else
            return handlerOrInstance === this.instance && this.method === method;
    }
}