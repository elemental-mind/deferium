
import { Task } from "./task.js";
import assert from "assert";

export class TaskTests
{
    async ShouldExecuteSteps()
    {
        const executionTrace: string[] = [];

        const task = new Task(function* ()
        {
            executionTrace.push("Step 1");
            yield Promise.resolve().then(() => executionTrace.push("Promise 1 Fulfilled"));
            executionTrace.push("Step 2");
            yield Promise.resolve().then(() => executionTrace.push("Promise 2 Fulfilled"));
            executionTrace.push("Task Complete");
            return 3;
        });

        const execution = task.run();
        const result = await execution;

        assert.equal(result, 3);
        assert.equal(execution.isResolved, true);
        assert.equal(execution.isRejected, false);
        assert.deepStrictEqual(executionTrace, [
            "Step 1",
            "Promise 1 Fulfilled",
            "Step 2",
            "Promise 2 Fulfilled",
            "Task Complete"
        ]);
    }

    async ShouldHandleAsyncSteps()
    {
        const task = new Task(function* ()
        {
            const a = yield Promise.resolve(1);
            const b = yield Promise.resolve(2);
            return a + b;
        });

        const execution = task.run();
        const result = await execution;

        assert.equal(result, 3);
        assert.equal(execution.isResolved, true);
        assert.equal(execution.isRejected, false);
    }

    async ShouldHandleErrors()
    {
        const task = new Task(function* ()
        {
            yield Promise.resolve(1);
            throw new Error("Test error");
        });

        const execution = task.run();

        try
        {
            await execution;
            assert.fail("Should have thrown an error");
        } catch (error)
        {
            assert.equal(error.message, "Test error");
            assert.equal(execution.isResolved, false);
            assert.equal(execution.isRejected, true);
        }
    }

    async ShouldBeCancellable()
    {
        const task = new Task(function* ()
        {
            yield new Promise(resolve => setTimeout(resolve, 1000));
            return "Completed";
        });

        const execution = task.run();

        setTimeout(() => execution.cancel("Cancelled by user"), 100);

        try
        {
            await execution;
            assert.fail("Should have been cancelled");
        } catch (error)
        {
            assert.equal(error, "Cancelled by user");
            assert.equal(execution.isResolved, false);
            assert.equal(execution.isRejected, true);
            assert.equal(execution.isCancelled, true);
        }
    }

    async ShouldAcceptArguments()
    {
        const task = new Task(function* (a: number, b: number)
        {
            yield Promise.resolve();
            return a + b;
        });

        const execution = task.run(2, 3);
        const result = await execution;

        assert.equal(result, 5);
        assert.equal(typeof execution.run, "function");
        assert.equal(typeof execution.cancel, "function");
    }
}