## Usage

### Awaitable Types
If you ever tried to derive from a `Promise` directly you will know that it's not easy.
The Awaitable types solve that problem and add additional logic.

`Awaitable` is an easily derivable drop-in-replacement for `Promise`.

Use it standalone:

```typescript
class Process
{
    public completion = new Awaitable();

    ...
    onCompletion()
    {
        this.completion.resolve();
    }
    ...
}
```

Or use it as a base class:

```typescript
class Process extends Awaitable
{
    ...
    onCompletion()
    {
        this.resolve();
    }
    ...
}

const FindNeedleInHaystack = new Process()

await FindNeedleInHaystack;

if(!FindNeedleInHaystack.isResolved)    //This is one of the properties that automatically gets updated
    console.log("Still searching");

console.log("Medal of Honour");
```

### Cancellable Types

In many asynchronous operations, there is a need to abort an ongoing task before it naturally completes. The `Cancellable` types in Deferium provide a structured way to handle such scenarios, allowing you to not only initiate cancellation but also to react to it within your asynchronous workflows.

A `Cancellable` type extends the basic `Promise` functionality with methods to cancel the operation, check if it has been cancelled, and specify a cancellation reason. This makes it easier to manage resources and avoid potential memory leaks by cleaning up after a task that is no longer needed.

Here's how you can use a `Cancellable` type:

```typescript
class LongRunningProcess extends Cancellable {
    constructor() {
        super();
        // Start the process
    }

    // Method to initiate the cancellation
    abortProcess() {
        this.cancel("Process was aborted by the user.");
    }
}

// Usage
const process = new LongRunningProcess();

// At some point later, if you need to abort the process:
process.abortProcess();

// You can check if the process was cancelled:
if (process.isCancelled) {
    console.log(`Process cancelled: ${process.cancelReason}`);
}
```

The `Cancellable` type ensures that your asynchronous operations are robust and respect the lifecycle of your application, preventing unintended side effects when operations are no longer relevant.

Remember to handle the cancellation in your asynchronous tasks through an override of the respective functions to properly free up resources and avoid executing further logic after the cancellation has been requested.

For more advanced use cases, you can combine Cancellable with other traits provided by Deferium to create complex types that are both awaitable and cancellable, among other things.

### Streamable Types

Streamable types in Deferium provide a way to handle a sequence of asynchronous events or data chunks over time, similar to how streams work in many programming environments. These types are particularly useful when dealing with data that is not available all at once, allowing you to process each piece of data as it arrives.

A `Streamable` type typically includes methods to push data into the stream, subscribe to data events, and handle the end of the stream or errors that may occur during data processing.

Here's a basic example of how a `Streamable` type might be used:

```typescript
class DataStreamer extends Streamable<string> {
    constructor() {
        super(); // Initialize the stream
    }

    pushData(data: string) {
        //...customizable logic
        this.emit(data);
    }

    endStream() {
        //...customizable logic
        this.close();
    }
}

async logStream()
{
    for await (const chunk of dataStreamer)
        console.log(stream);
}

// Usage
const dataStreamer = new DataStreamer();

logStream();

// Synchronous as well as asynchronous emissions to the stream are handled without losses
dataStreamer.pushData("First");
dataStreamer.pushData("Second");
await Delay.for(1000);
dataStreamer.pushData("Third");

dataStreamer.endStream();

```

The `Streamable` type allows you to build responsive and efficient data processing mechanisms that can handle real-time data, streams of API responses, or any other form of sequential data.

### Subscribable Types

Subscribable types in Deferium provide a pattern for creating objects that other parts of your application can listen to for events or changes. This pattern is commonly used in event-driven programming and can help decouple the components of your system by allowing them to communicate through well-defined events.

A `Subscribable` type typically includes methods to subscribe to events, unsubscribe from events, and emit events to notify all current subscribers. This pattern is useful for creating custom events, implementing observer patterns, or simply for allowing parts of your application to react to changes in state or other significant occurrences.

Here's a basic example of how a `Subscribable` type might be used:

```typescript
class EventHub
{
    ...
    public onMessage = new Subscribable();
    ...
}

// Usage
const dispatcher = new EventHub();

// Function to handle events
function eventHandler(data) {
    console.log(`Event received with data: ${data}`);
}

dispatcher.onMessage.subscribe(eventHandler);
dispatcher.onMessage.emit('Hello, Subscribers!');

// Unsubscribe from the 'customEvent' event
dispatcher.onMessage.unsubscribe(eventHandler);

```

The `Subscribable` type is a utility type for managing and coordinating events within your application.

The `Subscribable` type can of course also be derived from to have more customized subscriber management etc. or name mapped methods and members.

### Memory-Leakable Types

Memory-Leakable Types
The MemoryLeakable type in Deferium provides a unified interface to build disposable objects that need explicit cleanup to avoid memory leaks. This is useful for event handler subscriptions, database connections, network sockets, file handles, etc. that can leak if not properly closed.

A MemoryLeakable type has a `dispose()` method that should be called to clean up any resources when the object is no longer needed. It also exposes `isDisposed` to check if disposal has occurred.

Here is an example:

```typescript
class DatabaseConnection extends MemoryLeakable {
  constructor() {
    super();
    this.handle = db.open(...)
  }
}

const db = new DatabaseConnection();

// use database 

db.dispose(); // avoid memory leak

```

The MemoryLeakable type ensures you build classes that cleanly free resources, avoiding hard-to-debug memory leaks. It enforces that disposal logic is implemented.

For advanced cases, you can combine with other Deferium types like Awaitable to make classes awaitable and disposable.