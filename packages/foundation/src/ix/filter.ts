import { IterableX } from './iterable_x.js';

export type FilterFn<T> = (input: T) => boolean;

class FilterIterable<T> extends IterableX<T> {
    private _filter: FilterFn<T>;

    constructor(source: Iterable<T>, filter: FilterFn<T>) {
        super(source);
        this._filter = filter;
    }

    [Symbol.iterator](): Iterator<T> {
        const iter = generateForIterator(this._source, this._filter);
        return iter;
    }
}

function* generateForIterator<T>(
    iter: Iterable<T>,
    filter: FilterFn<T>
): Iterator<T> {
    for (const item of iter) {
        const ok: boolean = filter(item);
        if (!ok) {
            continue;
        }
        yield item;
    }
}

export function filterForIterable<T>(
    source: Iterable<T>,
    filter: FilterFn<T>
): Iterable<T> {
    const wrapper = new FilterIterable(source, filter);
    return wrapper;
}
