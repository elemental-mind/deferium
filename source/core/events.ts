import type { EventHandler, IEventEmitter } from "./core.types.js";

//We use these to save memory on EventManager object instances.
const GlobalBindingMap = new WeakMap<object, Set<EventHandler<any>>>();
const GlobalOnceSubscribers = new WeakMap<EventEmitter<any>, Set<EventHandler<any>>>();

export class EventEmitter<E = void> implements IEventEmitter<E>
{
    handlers = new Set<EventHandler<E>>();

    subscribe(handlerOrInstance: EventHandler<E> | object, method?: EventHandler<E>)
    {
        if (!method)
        {
            this.handlers.add(handlerOrInstance as EventHandler<E>);
        }
        else
        {
            const boundFunction = method.bind(handlerOrInstance as object);
            GlobalBindingMap.get(handlerOrInstance)?.add(boundFunction) ?? GlobalBindingMap.set(handlerOrInstance, new Set([boundFunction]));
            this.handlers.add(boundFunction);
        }
    }
    

    subscribeOnce(handlerOrInstance: EventHandler<E> | object, method?: EventHandler<E>)
    {
        if (!method)
        {
            this.#addHandlerOnce(handlerOrInstance as EventHandler<E>)
        }
        else
        {
            const boundFunction = method.bind(handlerOrInstance as object);
            GlobalBindingMap.get(handlerOrInstance)?.add(boundFunction) ?? GlobalBindingMap.set(handlerOrInstance, new Set([boundFunction]));
            this.#addHandlerOnce(boundFunction);
        }
    }

    unsubscribe(handlerOrInstance: EventHandler<E> | object, method?: EventHandler<E>)
    {
        if (!method)
        {
            if(handlerOrInstance instanceof Function)
                this.#unsubscribeHandler(handlerOrInstance as EventHandler<E>)
            else
                this.#unsubscribeInstance(handlerOrInstance as object);
        }
        else
        {
            const boundFunctions = GlobalBindingMap.get(handlerOrInstance as object)
            if(boundFunctions)
            {
                const boundFunction = this.#intersect(this.handlers, boundFunctions)[0];
                if(boundFunction) this.#unsubscribeHandler(boundFunction);
            }
        }
    }

    emit(event: E)
    {
        for (const handler of this.handlers) handler(event);
        const onceHandlers = GlobalOnceSubscribers.get(this);
        if (onceHandlers) for (const onceHandler of onceHandlers) this.handlers.delete(onceHandler);
    }

    #addHandlerOnce(handler: EventHandler<E>)
    {
        this.handlers.add(handler);
        GlobalOnceSubscribers.get(this)?.add(handler) ?? GlobalOnceSubscribers.set(this, new Set([handler]));
    }

    #unsubscribeHandler(handler: EventHandler<E>)
    {
        this.handlers.delete(handler);
        const onceSubscriptions = GlobalOnceSubscribers.get(this);
        if(onceSubscriptions)
        {
            onceSubscriptions.delete(handler);
            if(!onceSubscriptions.size) GlobalOnceSubscribers.delete(this);
        }
    }

    #unsubscribeInstance(instance: object)
    {
        const boundMethods = GlobalBindingMap.get(instance);
        if(boundMethods)
        {
            const registeredInstanceHandlers = this.#intersect(this.handlers, boundMethods);
            for (const boundMethod of registeredInstanceHandlers) this.handlers.delete(boundMethod);
        }
    }

    #intersect<S>(setA: Set<S>, setB: Set<S>) : S[]
    {
        const [smallSet, bigSet] = setA.size < setB.size ? [setA, setB] : [setB, setA];
        return [...smallSet].filter(element => bigSet.has(element));
    }
}