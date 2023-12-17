import assert from "assert";
import { MemoryLeakableConfig, MemoryLeakable, ResourceMap } from "./memoryLeakable.js";

export class MemoryLeakableTests
{
    constructor()
    {
        MemoryLeakableConfig.debug = true;
    }

    ShouldAddInstanceToResourceMapOnConstruction()
    {
        const leakable = new MemoryLeakable();
        assert.equal(ResourceMap.has(leakable), true);
    }

    ShouldRemoveInstanceFromResourceMapOnDestroy()
    {
        const leakable = new MemoryLeakable();
        assert.equal(ResourceMap.has(leakable), true);
        leakable.destroy();
        assert.equal(ResourceMap.has(leakable), false);
    }
}