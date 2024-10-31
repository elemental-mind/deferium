type EventHandler<T> = (event: T) => void;

interface SubscriptionListElement<T>
{
    nextSubscription?: Subscription<T>;
}

interface Subscription<T> extends SubscriptionListElement<T>
{
    emit(event: T): boolean;
    matches(handlerOrInstance: object | EventHandler<T>, method?: EventHandler<T> | undefined): boolean;
}

export class EventEmitter<T = undefined> implements SubscriptionListElement<T>
{
    nextSubscription?: Subscription<T>;

    subscribe(handlerOrInstance: object | EventHandler<T>, method?: EventHandler<T> | undefined): void
    {
        this.#appendToSubscriptions(method ? new RecurringInstanceSubscription(handlerOrInstance, method) : new RecurringSubscription(handlerOrInstance as EventHandler<T>));
    }

    subscribeOnce(handlerOrInstance: object | EventHandler<T>, method?: EventHandler<T> | undefined): void
    {
        this.#appendToSubscriptions(method ? new OnceInstanceSubscription(handlerOrInstance, method) : new OnceSubscription(handlerOrInstance as EventHandler<T>));
    }

    #appendToSubscriptions(subscription: Subscription<T>)
    {
        let currentChainElement: SubscriptionListElement<T> = this;
        while (currentChainElement.nextSubscription) currentChainElement = currentChainElement.nextSubscription!;

        currentChainElement.nextSubscription = subscription;
    }

    unsubscribe(handlerOrInstance: object | EventHandler<T>, method?: EventHandler<T> | undefined): void
    {
        for (let currentElement: SubscriptionListElement<T> = this; currentElement.nextSubscription !== undefined; currentElement = currentElement.nextSubscription!)
        {
            const subscription = currentElement.nextSubscription;

            if (subscription.matches(handlerOrInstance, method))
            {
                currentElement.nextSubscription = subscription.nextSubscription;
                break;
            }
        }
    }

    emit(event: T): void
    {
        let currentElement: SubscriptionListElement<T> = this;

        while (currentElement.nextSubscription)
        {
            const subscription = currentElement.nextSubscription;

            if (subscription.emit(event))
                currentElement = subscription;
            else
                currentElement.nextSubscription = subscription.nextSubscription;
        }
    }
}

export class RecurringSubscription<T> implements Subscription<T>
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

export class RecurringInstanceSubscription<T> implements Subscription<T>
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

export class OnceSubscription<T> implements Subscription<T>
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

export class OnceInstanceSubscription<T> implements Subscription<T>
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