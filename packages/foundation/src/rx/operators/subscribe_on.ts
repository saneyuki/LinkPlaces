import { isNotNull, type Nullable } from 'option-t/esm/Nullable';
import type { Observable } from '../observable.js';
import type { Observer } from '../observer.js';
import { OperatorObservable, type OperatorFunction } from '../operator.js';
import type { Unsubscribable } from '../subscribable.js';
import { Subscription } from '../subscription.js';

class SubscribeOnNextLoopObservable<T> extends OperatorObservable<T, T> {
    constructor(source: Observable<T>) {
        super(source);
    }

    protected override onSubscribe(observer: Observer<T>): Unsubscribable {
        let actualSubscribe: Nullable<Unsubscribable> = null;
        const id = window.setTimeout(() => {
            actualSubscribe = this.source.subscribe(observer);
        }, 0);

        const sub = new Subscription(() => {
            window.clearTimeout(id);
            if (isNotNull(actualSubscribe)) {
                actualSubscribe.unsubscribe();
            }
        });
        return sub;
    }
}

export function subscribeOnNextLoop<T>(): OperatorFunction<T, T> {
    const operator: OperatorFunction<T, T> = (source: Observable<T>) => {
        const mapped: Observable<T> = new SubscribeOnNextLoopObservable<T>(source);
        return mapped;
    };
    return operator;
}
