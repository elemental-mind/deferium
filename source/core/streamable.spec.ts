import { AsyncStreamable } from "./streamable.js";
import assert from "assert";

export class StreamableTests
{
    stream = new AsyncStreamable<string>();

    async #captureStreamData(stream: AsyncStreamable<string>, target: string[], prefix = "")
    {
        for await (const chunk of stream) 
            target.push(prefix + chunk);
    }

    async #captureEnd(stream: AsyncStreamable<string>)
    {
        for await (const chunk of stream) { };
        return true;
    }

    async #captureError(stream: AsyncStreamable<string>)
    {
        try
        {
            for await (const chunk of stream) { };
        }
        catch(e)
        {
            return e;
        }
    }

    async ShouldSendData()
    {
        const receivedData: string[] = [];

        const dataCapture = this.#captureStreamData(this.stream, receivedData);

        this.stream.emit("First");
        this.stream.emit("Second");
        this.stream.close();

        await dataCapture;

        assert.deepEqual(receivedData, ["First", "Second"]);
    }

    async ShouldEndStream()
    {
        let hasEnded = this.#captureEnd(this.stream);

        this.stream.emit("First");
        this.stream.emit("Second");
        this.stream.close();

        assert.equal(await hasEnded, true);
    }

    async ShouldHandleErrors()
    {
        let caughtError = this.#captureError(this.stream);

        this.stream.emit("First");
        this.stream.emit("Second");
        this.stream.emit("Third");
        const error = new Error("Test error");
        this.stream.abort(error);

        assert.equal(await caughtError, error);
    }

    async ShouldHandleParallelStreams()
    {
        const receivedData: string[] = [];

        const firstListener = this.#captureStreamData(this.stream, receivedData, "X: ");
        const secondListener = this.#captureStreamData(this.stream, receivedData, "O: ");
        
        this.stream.emit("First");
        this.stream.emit("Second");
        this.stream.emit("Third");
        this.stream.emit("Fourth");
        this.stream.close();

        await Promise.all([firstListener, secondListener]);

        assert.deepEqual(receivedData, [
            "X: First",
            "O: First",
            "X: Second",
            "O: Second",
            "X: Third",
            "O: Third",
            "X: Fourth",
            "O: Fourth"
            ]);
    }

    async ShouldOnlyStreamElementsAfterSubscription()
    {
        const receivedData: string[] = [];

        
        this.stream.emit("First");
        this.stream.emit("Second");
        const dataCapture = this.#captureStreamData(this.stream, receivedData);
        this.stream.emit("Third");
        this.stream.emit("Fourth");
        this.stream.close();

        await dataCapture;

        assert.deepEqual(receivedData, ["Third", "Fourth"]);
    }

    async ShouldHandleParallelOffsetStreams()
    {
        const receivedData: string[] = [];

        
        const firstListener = this.#captureStreamData(this.stream, receivedData, "X: ");
        this.stream.emit("First");
        this.stream.emit("Second");
        const secondListener = this.#captureStreamData(this.stream, receivedData, "O: ");
        this.stream.emit("Third");
        this.stream.emit("Fourth");
        this.stream.close();

        await Promise.all([firstListener, secondListener]);

        assert.deepEqual(receivedData, [
            "X: First",
            "O: Third",
            "X: Second",
            "O: Fourth",
            "X: Third",
            "X: Fourth"
            ]);
    }

    async ShouldFlushSyncChunks()
    {
        const receivedData: string[] = [];

        
        const firstListener = this.#captureStreamData(this.stream, receivedData, "X: ");
        this.stream.emit("First");
        this.stream.emit("Second");
        await this.stream.asyncFlushSyncChunks();
        const secondListener = this.#captureStreamData(this.stream, receivedData, "O: ");
        this.stream.emit("Third");
        this.stream.emit("Fourth");
        this.stream.close();

        await Promise.all([firstListener, secondListener]);

        assert.deepEqual(receivedData, [
            "X: First",
            "X: Second",
            "X: Third",
            "O: Third",
            "X: Fourth", 
            "O: Fourth"
            ]);
    }
}
