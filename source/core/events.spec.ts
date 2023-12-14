import { EventEmitter } from "./events.js";
import assert from "assert";

class HandlerClass {
    public eventCount1 = 0;
    public eventCount2 = 0;

    handleEvent1(event: string) {
        this.eventCount1++;
    }

    handleEvent2(event: string) {
        this.eventCount2++;
    }
}

export class EventEmitterTests {
    eventEmitter = new EventEmitter<string>();

    ShouldSubscribeAndEmitEvents() {
        let receivedEvent: string | null = null;
        const handler = (event: string) => { receivedEvent = event; };

        this.eventEmitter.subscribe(handler);
        this.eventEmitter.emit("TestEvent");

        assert.equal(receivedEvent, "TestEvent");
    }

    ShouldSubscribeOnceAndEmitOnlyOnce() {
        let receivedEvents = 0;
        const handler = (event: string) => { receivedEvents++; };

        this.eventEmitter.subscribeOnce(handler);
        this.eventEmitter.emit("TestEvent");
        this.eventEmitter.emit("TestEvent");

        assert.equal(receivedEvents, 1);
    }

    ShouldUnsubscribeHandler() {
        let receivedEvents = 0;
        const handler = (event: string) => { receivedEvents++; };

        this.eventEmitter.subscribe(handler);
        this.eventEmitter.emit("TestEvent");
        this.eventEmitter.unsubscribe(handler);
        this.eventEmitter.emit("TestEvent");

        assert.equal(receivedEvents, 1);
    }

    ShouldUnsubscribeInstance() {
        let receivedEvents = 0;
        const instance = {};
        const handler = function(event: string) { receivedEvents++; };

        this.eventEmitter.subscribe(instance, handler);
        this.eventEmitter.emit("TestEvent");
        this.eventEmitter.unsubscribe(instance);
        this.eventEmitter.emit("TestEvent");

        assert.equal(receivedEvents, 1);
    }

    ShouldHandleMultipleSubscribers() {
        let receivedEvent1: string | null = null;
        let receivedEvent2: string | null = null;
        const handler1 = (event: string) => { receivedEvent1 = event; };
        const handler2 = (event: string) => { receivedEvent2 = event; };

        this.eventEmitter.subscribe(handler1);
        this.eventEmitter.subscribe(handler2);
        this.eventEmitter.emit("TestEvent");

        assert.equal(receivedEvent1, "TestEvent");
        assert.equal(receivedEvent2, "TestEvent");
    }

    ShouldSubscribeMethodsOfSameInstance() {
        const testInstance = new HandlerClass();
        const eventEmitter = new EventEmitter<string>();

        eventEmitter.subscribe(testInstance, testInstance.handleEvent1);
        eventEmitter.subscribe(testInstance, testInstance.handleEvent2);

        eventEmitter.emit("TestEvent");

        assert.equal(testInstance.eventCount1, 1);
        assert.equal(testInstance.eventCount2, 1);
    }

    ShouldUnsubscribeMethodsOfSameInstance() {
        const testInstance = new HandlerClass();
        const eventEmitter = new EventEmitter<string>();

        eventEmitter.subscribe(testInstance, testInstance.handleEvent1);
        eventEmitter.subscribe(testInstance, testInstance.handleEvent2);
        eventEmitter.unsubscribe(testInstance, testInstance.handleEvent1);

        eventEmitter.emit("TestEvent");

        assert.equal(testInstance.eventCount1, 0);
        assert.equal(testInstance.eventCount2, 1);
    }

    ShouldUnsubscribeSingleInstanceOfMultiple() {
        const instance1 = new HandlerClass();
        const instance2 = new HandlerClass();
        const eventEmitter = new EventEmitter<string>();

        eventEmitter.subscribe(instance1, instance1.handleEvent1);
        eventEmitter.subscribe(instance2, instance2.handleEvent1);

        eventEmitter.emit("TestEvent");
        eventEmitter.unsubscribe(instance1);
        eventEmitter.emit("TestEvent");

        assert.equal(instance1.eventCount1, 1);
        assert.equal(instance2.eventCount1, 2);
    }
}