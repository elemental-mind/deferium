import { Cancellable } from "./cancellable.js";
import assert from "assert";

export class CancellableTests {
    cancellable = new Cancellable<number>();

    ShouldHaveIsCancelledProperty() {
        assert.equal(this.cancellable.isCancelled, false);
    }

    ShouldCancel() {
        this.cancellable.cancel(1);

        assert.equal(this.cancellable.isCancelled, true);
        assert.equal(this.cancellable.cancelReason, 1);
    }
}