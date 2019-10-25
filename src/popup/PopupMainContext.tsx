// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="react-dom/experimental" />

import { Nullable, isNotNull, isNull } from 'option-t/esm/Nullable/Nullable';
import { expectNotNull } from 'option-t/esm/Nullable/expect';
import React from 'react';
import ReactDOM from 'react-dom';
import { applyMiddleware, createStore, Unsubscribe } from 'redux';
import { createThunkMiddleware } from '../third_party/redux-thunk';

import { ViewContext } from '../shared/ViewContext';

import { BookmarkTreeNode, OnChangeInfo } from '../../typings/webext/bookmarks';

import { PopupMainView } from './PopupMainView';

import { createItemChangedAction, PopupAction } from './PopupAction';
import { createReducer, PopupMainStateTree, createInitialPopupMainStateTree } from './PopupMainState';
import { PopupThunkArguments, PopupThunkDispatch } from './PopupMainThunk';
import { PopupMainStore } from './PopupMainStore';
import { RemoteActionChannel } from './PopupMessageChannel';

export class PopupMainContext implements ViewContext {

    private _channel: RemoteActionChannel;
    private _list: Array<BookmarkTreeNode>;
    private _renderRoot: Nullable<ReactDOM.Root>;
    private _disposerSet: Nullable<Set<Unsubscribe>>;

    constructor(channel: RemoteActionChannel, list: Array<BookmarkTreeNode>) {
        this._channel = channel;
        this._list = list;
        this._renderRoot = null;
        this._disposerSet = null;
    }

    async onActivate(mountpoint: Element): Promise<void> {
        if (isNotNull(this._disposerSet)) {
            throw new TypeError();
        }

        const reducer = createReducer();
        const args: PopupThunkArguments = {
            channel: this._channel,
        };
        const middleware = createThunkMiddleware<PopupAction, PopupMainStateTree, PopupThunkArguments, Promise<void>>(args);
        const enhancer = applyMiddleware<PopupThunkDispatch, PopupMainStateTree>(middleware);
        const initial = createInitialPopupMainStateTree(this._list);
        const store: PopupMainStore = createStore<PopupMainStateTree, PopupAction, {
            dispatch: PopupThunkDispatch;
        }, PopupMainStateTree>(reducer, initial, enhancer);

        this._renderRoot = ReactDOM.createBlockingRoot(mountpoint);

        const render = () => {
            window.requestAnimationFrame(() => {
                const { reducePopupMain: state, } = store.getState();
                const view = (
                    <React.StrictMode>
                        <PopupMainView state={state} store={store} />
                    </React.StrictMode>
                );

                const renderRoot = expectNotNull(this._renderRoot, 'should has been initialized the renderRoot');
                renderRoot.render(view);
            });
        };

        const onChanged = (id: string, info: OnChangeInfo) => {
            const a = createItemChangedAction(id, info);
            store.dispatch(a);
        };
        browser.bookmarks.onChanged.addListener(onChanged);

        this._disposerSet = new Set([
            store.subscribe(render),
            () => { browser.bookmarks.onChanged.removeListener(onChanged); }
        ]);

        // ignite the first rendering
        render();
    }

    async onDestroy(_mountpoint: Element): Promise<void> {
        if (isNull(this._disposerSet)) {
            throw new TypeError();
        }

        this._disposerSet.forEach((fn) => fn());
        this._disposerSet.clear();
        this._disposerSet = null;

        const renderRoot = expectNotNull(this._renderRoot, '');
        renderRoot.unmount();
        this._renderRoot = null;
    }

    async onResume(_mountpoint: Element): Promise<void> {
        throw new Error('Method not implemented.');
    }

    onSuspend(_mountpoint: Element): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
