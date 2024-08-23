# Deferium

Events, promises and asynchronous operations simplified! Through a few useful and composable primitives, Deferium gives you a toolbox to greatly simplify the handling and organisation of complex time-dependent and asynchronous processes.

As a base it defines a useful set of `Traits` that are compatible with `fusium-js`: 
- Awaitable Trait
- Cancellable Trait 
- Memory-Leakable Trait
- Streamable Trait
- Subscribable Trait

You can use these traits standalone to build your own primitives as compositions of those traits.
Alternatively, this library provides more useful primitives building on top of those traits:
- Timing
    - Timer Objects
    - Interval/Cycle Objects
- Deferred execution
    - Task objects that are cancellable and lazyily evaluated (as opposed to eagerly and non-cancellable promises)
- Streaming & Compute Graph
    - Pushable (event-driven) and Pullable (processing-driven) Streams
    - Sync & Async streams
    - Tools to convert from Push to Pull and to manage backpressure in streams
    - Configurable stream transformation primitives like you may know from RxJS et al. (`map`, `debounce`, `join/merge` etc.)
    - Tools to analyze a constructed compute graph

By providing a suite of classes to extend native Promise functionality, Deferium allows developers to manage asynchronous tasks with greater control and clarity. Whether you're dealing with deferred execution, timeouts, progress tracking, or complex promise chains and streams, Deferium offers a structured approach to make your asynchronous/event driven code more readable and maintainable by easing application of modern `async/await` and making practical use of JS Generator syntax.

# Traits

Deferium exposes a few `Trait` classes that you can use or derive from or that you can compose together to make your asynchronous operations/classes more semantically understandable and concise.
`Deferium` is heavily class based and targeted for developers seeking an object oriented approach to complex state management.

The core traits `Deferium` defines and aids with are the following:

- Awaitability
- Cancellability
- Memory-Leakability
- Streamability
- Subscribability

By providing composable base classes that already contain a lot of logic around these mentioned semantic elements it's easy to compose more complex classes that are Awaitable, Cancellable and Streamable at the same time.

## Name-Mapping

As most of the traits are pretty universal, it may be desired to specify more specific names for methods and properties of these traits. When talking about processes in general, for example, you may not want to `reject` a process, but rather `abort` it.

Deferium allows you to do that, without losing the logic behind the base types through its `NameMapped` types.

To Name-Map a trait, just use its `NameMappedX` equivalent, if provided.

## Using Traits in your own primitives

Some of the traits you can use standalone. Some are more useful to be a basis for compisition or to derive from. 

To get more info about them and their usage, look into [source\core\README.md](source\core\README.md)

# Primitives

## Timing

For now Deferium gives you the following timer primitives:
- Delay
- Adjustable Delay
- Cycle (or interval)
- Adjustable Cycle

You can use these primitives in the following way:

```typescript
import { Delay, Cycle } from "deferium";

async function wait(ms: number)
{
    await Delay.for(ms);
}

async function waitUntil(pointInTime: Date)
{
    await Delay.until(pointInTime)
}

async function cycleLoop()
{
    const cycle = Cycle.running(1000);
    let cycleCount = 0;

    for await (const tick of cycle)
    {
        cycleCount++;
        //tick is a date object with the current time
        console.log("The current time is:" + tick);

        if(cycleCount < 10)
            console.log("The next tick will be at:" + cycle.nextCycleStart);
        else
            cycle.stop();
    }
    
    console.log("Cycle ended");
}

async function cycleCallback()
{
    const cycle = Cycle.running(1000);
    let cycleCount = 0;

    cycle.onTick.subscribe(() => {
        cycleCount++;

        if(cycleCount === 10)
            cycle.stop();
    })}
}
```

For detailed member information and more in depth information see [source\time\README.md](source\time\README.md)

## Tasks

Promises by default are eager (they start executing as soon as you create them) and uncancellable (you can not halt the execution of a promise). This can lead to wasteful programs, for example if you have a lot of async requests in your promise logic, but half way down the execution you already know you won't need the result anymore.

Tasks fill that gap. They do not run eagerly - you need to explicitly `run` them.
Once you `run` them you get an `ExecutionHandle`, which is an `Awaitable` (read: Promise you can await) which you can also call `cancel` on. The task will not continue it's execution after you cancel it.

Tasks make use of JS-Generators. You define the core logic of a task by making use of a generator function:

```typescript
import { Task } from "deferium";

async function taskWithCompletion()
{
    const task = new Task(function* ()
    {
        //Each yield is a potential point of cancellation where the execution can stop
        const resolvedFirstString = yield getSomeAsyncString(); //e.g. Promise that resolves to "Hello"
        const resolvedExpensiveString = yield getAnotherExpensiveAsyncString(); //e.g. Promise that resolves to "World"
        
        return resolvedFirstString + " " + resolvedExpensiveString;
    });

    //Prints "Hello World"
    console.log(await task.run()); 
}

async function taskWithCancellation()
{
    const task = new Task(function* ()
    {
        console.log("Step 1");
        const resolvedFirstString = yield getSomeAsyncString(); //e.g. Promise that resolves to "Hello"
        yield Delay.for(1000);
        //This will not execute
        console.log("Step 2");
        const resolvedExpensiveString = yield getAnotherExpensiveAsyncString(); //e.g. Promise that resolves to "World"
        
        return resolvedFirstString + " " + resolvedExpensiveString;
    });

    //This starts the task
    const executionHandle = task.run();
    //We wait for 300ms before we cancel the task
    await Delay.for(300);
    //We cancel the task. 
    //"Step 2" will never be printed on the console, as we cancel it before the Delay.for(1000) in the task.
    executionHandle.cancel();
}

```

In the background, everything you yield will be awaited for you and the result will be handed back through the yield - but only if the task has not been cancelled in the meantime. 
Using generators means that any async logic is easily refactored into cancellable task logic, by simply replacing `await` with `yield`. You then pass your generator into a `Task` constructor and everything will be taken care of.

A simple refactoring example:

```typescript
//this async/promise logic...
async function fetchChainAsync()
{
    const result = "";
    result += await fetchStringFromURL(...);
    await throttleRequests();
    result += await fetchStringFromURL(...);
    await throttleRequests();
    result += await fetchStringFromURL(...);

    return result;
}

//...becomes
function* fetchChainTask()
{
    const result = "";
    result += yield fetchStringFromURL(...);
    yield throttleRequests();
    result += yield fetchStringFromURL(...);
    yield throttleRequests();
    result += yield fetchStringFromURL(...);

    return result;
}
```

You can of course mix await and yield in async generator functions as you like, but a Task can only be stopped/cancelled at `yield` points, not at `awaits`.
Also, using `yield*` is allowed.

## Streams & Compute Graphs

...coming soon

# Installation

To get started with Deferium, install the package using npm:

```
npm install deferium
```

Or using yarn:

```
yarn add deferium
```

# Contributing

Contributions are welcome! If you have a feature request, bug report, or a pull request, please feel free to contribute to the project.

# License

Deferium is open-sourced software licensed under the MIT license.
