import { OnChangeInfo, WebExtBookmarkService } from '../../typings/webext/bookmarks';
import { PopupPlainReduxStore } from './PopupMainStore';
import { createItemChangedAction } from './PopupReduxAction';

export class PopupRepostiroy {
    private _onChanged: (id: string, info: OnChangeInfo) => void;
    private _store: PopupPlainReduxStore;
    private _bookmarks: WebExtBookmarkService;

    constructor(bookmarks: WebExtBookmarkService, reduxStore: PopupPlainReduxStore) {
        this._store = reduxStore;
        this._bookmarks = bookmarks;
        this._onChanged = (id, info) => {
            const a = createItemChangedAction(id, info);
            this._store.dispatch(a);
        };
        bookmarks.onChanged.addListener(this._onChanged);
    }

    destroy(): void {
        this._bookmarks.onChanged.removeListener(this._onChanged);

        // release reference
        this._store = null as never;
        this._bookmarks = null as never;
    }
}
