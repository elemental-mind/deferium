import { Trait } from "fusium-js";
import { IStreamable, IsStreamable, StreamableKeys } from "./core.types.js";

abstract class Chunk
{
    public readonly resolveNext: (value: Chunk | null) => void;
    public readonly next: Promise<Chunk>;
    constructor()
    {
        let resolver;
        this.next = new Promise(resolve => resolver = resolve);
        this.resolveNext = resolver!;
    }
}

export class StartChunk extends Chunk { };
export class DataChunk<T> extends Chunk
{
    constructor(public data: T) { super(); }
}

export class CloseChunk extends Chunk
{
    constructor() { super(); this.resolveNext(this); };
}

export class ErrorChunk extends Chunk 
{
    constructor(public error: any) { super(); this.resolveNext(this); };
}


export class AsyncStreamable<T = any> extends Trait implements IsStreamable<T>, IStreamable<T>
{
    //We don't need this symbol. It's only needed for type identification purposes for framework typing.
    declare [StreamableKeys]: undefined;
    public isAborted = false;
    public hasEnded = false;
    public latestChunk: Chunk = new StartChunk();

    constructor()
    {
        super();
        this.latestChunk = new StartChunk();
    }

    emit(data: T)
    {
        this.#updateAndEmitAsLatest(new DataChunk(data));
    }

    async asyncFlushSyncChunks()
    {
        return new Promise(resolve => setImmediate(resolve));
    }

    abort(error: any)
    {
        this.#updateAndEmitAsLatest(new ErrorChunk(error));
        this.isAborted = true;
        this.hasEnded = true;
    }

    close()
    {
        this.#updateAndEmitAsLatest(new CloseChunk());
        this.hasEnded = true;
    }

    #updateAndEmitAsLatest(chunk: Chunk)
    {
        if (!this.hasEnded)
        {
            this.latestChunk.resolveNext(chunk);
            this.latestChunk = chunk;
        }
    }

    [Symbol.asyncIterator]()
    {
        return this.chunks("AbortInOrder");
    }

    async *chunks(abortBehaviour: "AbortImmediate" | "AbortInOrder")
    {
        if (this.hasEnded) return;

        //We cast this to const to ease optimization for JS Engines
        const abortImmediate = abortBehaviour === "AbortImmediate";

        let chunk = await this.latestChunk.next;
        do {
            if (abortImmediate && this.isAborted)
                throw (this.latestChunk as ErrorChunk).error;

            if (chunk instanceof DataChunk)
                yield chunk.data;
            else
            {
                if (chunk instanceof ErrorChunk)
                    throw chunk.error;
                else if (chunk instanceof CloseChunk)
                    return;
            }

            chunk = await chunk.next;
        } while(true)
    }
}