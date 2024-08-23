import { FusionOf } from "fusium-js";
import { Awaitable, Cancellable } from "../deferium.js";

interface Thenable<T>
{
    then<TResult1 = T, TResult2 = never>(
        onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
        onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
    ): Thenable<TResult1 | TResult2>;
}

type ArgsOf<T extends (...args: any[]) => Generator<Thenable<any>, any, any>> = T extends (...args: infer A) => Generator ? A : never;

export class Task<T extends (...args: any[]) => Generator<Thenable<any>, any, any>>
{
    constructor(public steps: T) { }

    run(...args: ArgsOf<T>): TaskExecutionHandle
    {
        return new TaskExecutionHandle(this, ...args);
    }
}

class TaskExecutionHandle extends FusionOf(Awaitable, Cancellable)
{
    constructor(private task: Task<any>, ...args: any)
    {
        super();
        this.run(...args);
    }

    async run(...args: any)
    {
        let taskSteps = this.task.steps(...args);

        try
        {
            let generatorResult = taskSteps.next();

            while (!generatorResult.done && !this.isCancelled)
            {
                generatorResult = taskSteps.next(await generatorResult.value);
            }

            if (this.isCancelled)
            {
                this.reject(this.cancelReason);
            } else
            {
                this.resolve(generatorResult.value);
            }
        } catch (error: any)
        {
            this.reject(error);
        }
    }
}
