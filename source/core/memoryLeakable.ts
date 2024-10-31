import { Trait } from "fusium-js";
import { IMemoryLeakable } from "./core.types.js";

export const ResourceMap = new Set<MemoryLeakable>();
export const MemoryLeakableConfig = 
{
    debug: false
} 

export class MemoryLeakable extends Trait implements IMemoryLeakable
{
    #resourceHandle: MemoryLeakable | null = null;

    constructor()
    {
        super();
    }

    set resourceHandle(value: any)
    {
        this.#resourceHandle?.destroy?.();

        if(value === null || value === undefined)
            this.#resourceHandle = null;
        else
        {
            this.#resourceHandle = value;
            if(MemoryLeakableConfig.debug) ResourceMap.add(this);
        }
    }

    destroy()
    {
        if(MemoryLeakableConfig.debug) ResourceMap.delete(this);
        this.#resourceHandle?.destroy?.();
        this.#resourceHandle = null;
    }

    get resourcesReleased()
    {
        return this.resourceHandle === null;
    }
}