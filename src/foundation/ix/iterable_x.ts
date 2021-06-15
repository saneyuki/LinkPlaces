export abstract class IterableX<TInput, TOutput = TInput> implements Iterable<TOutput> {
    protected _source: Iterable<TInput>;
    constructor(source: Iterable<TInput>) {
        this._source = source;
    }
    abstract [Symbol.iterator](): Iterator<TOutput>;
}

export abstract class AsyncIterableX<TInput, TOutput = TInput> implements AsyncIterable<TOutput> {
    protected _source: AsyncIterable<TInput>;
    constructor(source: AsyncIterable<TInput>) {
        this._source = source;
    }
    abstract [Symbol.asyncIterator](): AsyncIterator<TOutput>;
}
