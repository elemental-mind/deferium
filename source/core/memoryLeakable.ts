import { Trait } from "fusium-js";
import { IMemoryLeakable } from "./core.types.js";

export const ResourceMap = new Set<MemoryLeakable>();
export const MemoryLeakableConfig = 
{
    debug: false
} 

export class MemoryLeakable extends Trait implements IMemoryLeakable
{
    constructor()
    {
        super();
        if(MemoryLeakableConfig.debug) ResourceMap.add(this);
    }

    destroy()
    {
        if(MemoryLeakableConfig.debug) ResourceMap.delete(this);
    }
}