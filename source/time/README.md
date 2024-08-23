### Delay

- `Delay.for(msDelay: number)`: Creates a delay for a specified number of milliseconds.
- `Delay.until(time: Date | number)`: Creates a delay until a specific time.
- `duration`: Get the total duration of the delay.
- `msElapsed`: Get the number of milliseconds elapsed since the delay started.
- `msRemaining`: Get the number of milliseconds remaining in the delay.
- `endTime`: Get the expected end time of the delay.
- `abort()`: Cancels the delay and rejects the promise.

### AdjustableDelay

Extends `Delay` with additional functionality:

- `duration` setter: Adjust the duration of the delay.
- `endTime` setter: Set a new end time for the delay.
- `reset()`: Restarts the delay with the current duration.

### Cycle

- `Cycle.pending(msPeriod: number)`: Creates a pending cycle.
- `Cycle.running(msPeriod: number)`: Creates and starts a cycle.
- `Cycle.startingFirstCycleAt(msPeriod: number, startFirstCycleAt: Date | number)`: Creates a cycle starting at a specific time.
- `Cycle.endingFirstCycleAt(msPeriod: number, endFirstCycleAt: Date | number)`: Creates a cycle ending its first iteration at a specific time.
- `start()`: Starts the cycle.
- `startAt(time: Date | number)`: Starts the cycle at a specific time.
- `stop()`: Stops the cycle.
- `destroy()`: Stops the cycle and cleans up resources.
- `isPending`: Check if the cycle is pending.
- `isRunning`: Check if the cycle is running.
- `period`: Get the cycle period.
- `lastCycleStart`: Get the start time of the last cycle.
- `nextCycleStart`: Get the expected start time of the next cycle.
- `msSinceLastCycleStart`: Get milliseconds elapsed since the last cycle start.
- `msBeforeNextCycleStart`: Get milliseconds remaining before the next cycle start.

### AdjustableCycle

Extends `Cycle` with additional functionality:

- `setPeriod(msPeriod: number, affectedCycle: "immediate" | "next" | "reset" = "next", silent = false)`: Adjust the cycle period.
- `sync(silent = false)`: Synchronize the cycle, optionally emitting a tick.

These classes provide flexible and powerful timing primitives for managing delays and recurring events in your applications.