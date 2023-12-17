import { Trait } from "fusium-js";
import type { EventHandler, ISubscribable as ISubscribable } from "./core.types.js";

//We use these to save memory on EventManager object instances.
const GlobalBindingMap = new WeakMap<object, Set<EventHandler<any>>>();
const GlobalOnceSubscribers = new WeakMap<Subscribable<any>, Set<EventHandler<any>>>();

const handlersSym = Symbol();
export class Subscribable<E = void> extends Trait implements ISubscribable<E>
{
    protected [handlersSym] = new Set<EventHandler<E>>();

    subscribe(handlerOrInstance: EventHandler<E> | object, method?: EventHandler<E>)
    {
        if (!method)
        {
            this[handlersSym].add(handlerOrInstance as EventHandler<E>);
        }
        else
        {
            const boundFunction = method.bind(handlerOrInstance as object);
            GlobalBindingMap.get(handlerOrInstance)?.add(boundFunction) ?? GlobalBindingMap.set(handlerOrInstance, new Set([boundFunction]));
            this[handlersSym].add(boundFunction);
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
                const boundFunction = this.#intersect(this[handlersSym], boundFunctions)[0];
                if(boundFunction) this.#unsubscribeHandler(boundFunction);
            }
        }
    }

    emit(event: E)
    {
        for (const handler of this[handlersSym]) handler(event);
        const onceHandlers = GlobalOnceSubscribers.get(this);
        if (onceHandlers) for (const onceHandler of onceHandlers) this[handlersSym].delete(onceHandler);
    }

    #addHandlerOnce(handler: EventHandler<E>)
    {
        this[handlersSym].add(handler);
        GlobalOnceSubscribers.get(this)?.add(handler) ?? GlobalOnceSubscribers.set(this, new Set([handler]));
    }

    #unsubscribeHandler(handler: EventHandler<E>)
    {
        this[handlersSym].delete(handler);
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
            const registeredInstanceHandlers = this.#intersect(this[handlersSym], boundMethods);
            for (const boundMethod of registeredInstanceHandlers) this[handlersSym].delete(boundMethod);
        }
    }

    #intersect<S>(setA: Set<S>, setB: Set<S>) : S[]
    {
        const [smallSet, bigSet] = setA.size < setB.size ? [setA, setB] : [setB, setA];
        return [...smallSet].filter(element => bigSet.has(element));
    }
}