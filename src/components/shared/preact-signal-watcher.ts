/* ═══ Oda v3.0 — PreactSignalWatcher Mixin ═══ */
import { LitElement } from "lit";
import { effect } from "@preact/signals-core";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T extends LitElement = LitElement> = new (...args: any[]) => T;

/**
 * Mixin that connects @preact/signals-core with Lit's update cycle.
 *
 * Any Preact signal accessed via .value inside render() automatically
 * triggers a requestUpdate() when the signal changes.
 *
 * Usage: class MyEl extends PreactSignalWatcher(LitElement) { ... }
 */
export function PreactSignalWatcher<T extends Constructor>(Base: T) {
  class SignalLit extends Base {
    private _psDispose?: () => void;

    override performUpdate() {
      this._psDispose?.();
      let isFirst = true;
      this._psDispose = effect(() => {
        if (isFirst) {
          isFirst = false;
          super.performUpdate();
        } else {
          this.requestUpdate();
        }
      });
    }

    override disconnectedCallback() {
      super.disconnectedCallback();
      this._psDispose?.();
      this._psDispose = undefined;
    }
  }
  return SignalLit as unknown as T;
}
