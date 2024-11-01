import { EventHandler } from "../core/core.types.js";
import { nextSubscription, EphemeralInstanceSubscription, EphemeralSubscription, PermanentInstanceSubscription, PermanentSubscription, Subscription, SubscriptionListElement } from "../core/subscribable.js";

export class EventEmitter<T = void> implements SubscriptionListElement<T>
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
        while (currentChainElement[nextSubscription]) currentChainElement = currentChainElement[nextSubscription];

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

