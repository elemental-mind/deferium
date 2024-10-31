import { EventEmitter } from "./eventEmitter";
import assert from "assert";

export class EventEmitterTests {
    eventEmitter = new EventEmitter<string>();

    ShouldSubscribeAndEmitEvents() {
        let receivedEvent: any | null = null;
        const handler = (event: any) => { receivedEvent = event; };

        this.eventEmitter.subscribe(handler);
        this.eventEmitter.emit("TestEvent");

        assert.equal(receivedEvent, "TestEvent");
    }

    ShouldSubscribeOnceAndEmitOnlyOnce() {
        let receivedEvents = 0;
        const handler = (event: any) => { receivedEvents++; };

        this.eventEmitter.subscribeOnce(handler);
        this.eventEmitter.emit("TestEvent");
        this.eventEmitter.emit("TestEvent");

        assert.equal(receivedEvents, 1);
    }

    ShouldUnsubscribeHandler() {
        let receivedEvents = 0;
        const handler = (event: any) => { receivedEvents++; };

        this.eventEmitter.subscribe(handler);
        this.eventEmitter.emit("TestEvent");
        this.eventEmitter.unsubscribe(handler);
        this.eventEmitter.emit("TestEvent");

        assert.equal(receivedEvents, 1);
    }

    ShouldHandleMultipleSubscribers() {
        let receivedEvent1: any | null = null;
        let receivedEvent2: any | null = null;
        const handler1 = (event: any) => { receivedEvent1 = event; };
        const handler2 = (event: any) => { receivedEvent2 = event; };

        this.eventEmitter.subscribe(handler1);
        this.eventEmitter.subscribe(handler2);
        this.eventEmitter.emit("TestEvent");

        assert.equal(receivedEvent1, "TestEvent");
        assert.equal(receivedEvent2, "TestEvent");
    }

    ShouldHandleInstanceSubscriptions() {
        class TestClass {
            receivedEvent: string | null = null;
            handleEvent(event: string) {
                this.receivedEvent = event;
            }
        }

        const instance = new TestClass();
        this.eventEmitter.subscribe(instance, instance.handleEvent);
        this.eventEmitter.emit("TestEvent");

        assert.equal(instance.receivedEvent, "TestEvent");
    }

    ShouldUnsubscribeInstanceMethod() {
        class TestClass {
            callCount = 0;
            handleEvent() {
                this.callCount++;
            }
        }

        const instance = new TestClass();
        this.eventEmitter.subscribe(instance, instance.handleEvent);
        this.eventEmitter.emit("TestEvent");
        this.eventEmitter.unsubscribe(instance, instance.handleEvent);
        this.eventEmitter.emit("TestEvent");

        assert.equal(instance.callCount, 1);
    }

    ShouldMaintainSubscriptionOrder() {
        const executionOrder: number[] = [];
        const handler1 = () => executionOrder.push(1);
        const handler2 = () => executionOrder.push(2);
        const handler3 = () => executionOrder.push(3);

        this.eventEmitter.subscribe(handler1);
        this.eventEmitter.subscribe(handler2);
        this.eventEmitter.subscribe(handler3);
        this.eventEmitter.emit("TestEvent");

        assert.deepEqual(executionOrder, [1, 2, 3]);
    }

    ShouldHandleMultipleOnceSubscriptions() {
        const results: string[] = [];
        const handler1 = () => results.push("first");
        const handler2 = () => results.push("second");
        const handler3 = () => results.push("third");

        this.eventEmitter.subscribeOnce(handler1);
        this.eventEmitter.subscribeOnce(handler2);
        this.eventEmitter.subscribeOnce(handler3);

        this.eventEmitter.emit("TestEvent");
        this.eventEmitter.emit("TestEvent");

        assert.deepEqual(results, ["first", "second", "third"]);
    }

    ShouldHandleInstanceOnceSubscription() {
        class TestClass {
            callCount = 0;
            handleEvent() {
                this.callCount++;
            }
        }

        const instance = new TestClass();
        this.eventEmitter.subscribeOnce(instance, instance.handleEvent);
        this.eventEmitter.emit("TestEvent");
        this.eventEmitter.emit("TestEvent");

        assert.equal(instance.callCount, 1);
    }
}