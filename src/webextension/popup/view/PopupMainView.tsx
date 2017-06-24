import * as React from 'react';
import { Store } from 'redux';
//import * as PropTypes from 'prop-types';

import { BookmarkTreeNode, BookmarkTreeNodeItem, BookmarkTreeNodeFolder } from '../../../../typings/webext/bookmarks';

import { isBookmarkTreeNodeItem } from '../../shared/Bookmark';

import { PopupMainState } from '../PopupMainState';
import { openItem, openSidebar } from '../PopupMainThunk';

export interface PopupMainViewProps {
    state: PopupMainState;
    store: Store<PopupMainState>;
    list: Array<BookmarkTreeNode>;
}

export function PopupMainView(props: Readonly<PopupMainViewProps>): JSX.Element {
    const onClick = (_event: React.MouseEvent<HTMLDivElement>) => {
        const a = openSidebar();
        props.store.dispatch(a);
    };

    const items = props.list.map((item, i) => {
        const v = <ListItem key={i} item={item} store={props.store}/>;
        return v;
    });

    return (
        <div className={'panel'}>
            <div className={'panel-section panel-section-footer'}>
                <div className={'panel-section-footer-button'}
                    onClick={onClick}>
                    {'View LinkPlaces Sidebar'}
                </div>
            </div>
            <div className={'panel-section panel-section-list'}>
                {items}
            </div>
        </div>
    );
}
(PopupMainView as React.StatelessComponent<PopupMainViewProps>).propTypes = {
};

interface ListItemProps {
    item: BookmarkTreeNode;
    store: Store<PopupMainState>;
}
function ListItem(props: ListItemProps): JSX.Element {
    const { item, store, } = props;

    let node: JSX.Element;
    if (!isBookmarkTreeNodeItem(item)) {
        node = <FolderListItem item={item}/>;
    }
    else{
        node = <ItemListItem item={item} store={store}/>;
    }

    return node;
}

interface FolderListItemProps {
    item: BookmarkTreeNodeFolder;
    //store: Store<PopupMainState>;
}
function FolderListItem(props: FolderListItemProps): JSX.Element {
    const { item, } = props;

    // http://design.firefox.com/StyleGuide/#/navigation
    return (
        <div className={'panel-list-item'}>
            <div className={'icon'}>
                <img className={'popup__listitem_icon_folder'}  src={'../shared/image/icon/folder-16.svg'} alt={''}/>
            </div>
            <div className={'text'}>
                <span className={'popup__listitem_text_inner'}>
                    {item.title}
                </span>
            </div>
        </div>
    );
}

interface ItemListItemProps {
    item: BookmarkTreeNodeItem;
    store: Store<PopupMainState>;
}
function ItemListItem(props: ItemListItemProps): JSX.Element {
    const { item, store } = props;
    const url = item.url;
    const id = item.id;

    const onClick = (event: React.SyntheticEvent<HTMLAnchorElement>) => {
        event.preventDefault();

        const a = openItem(id, url);
        store.dispatch(a);
    };

    const title = item.title;
    const tooltiptext = `"${title}"\n${url}`;

    // http://design.firefox.com/StyleGuide/#/navigation
    return (
        <div className={'panel-list-item'}>
            <div className={'icon'}>
                <img className={'popup__listitem_icon_item'} src={'../shared/image/icon/identity-not-secure.svg'} alt={''}/>
            </div>
            <div className={'text'}>
                <a className={'popup__listitem_text_inner'} href={url} title={tooltiptext} onClick={onClick}>
                    {item.title}
                </a>
            </div>
        </div>
    );
}
