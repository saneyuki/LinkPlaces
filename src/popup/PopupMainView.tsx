import type { Nullable } from 'option-t/esm/Nullable/Nullable';
import { StrictMode, MouseEvent, MouseEventHandler, useState } from 'react';

import type { BookmarkTreeNode, BookmarkTreeNodeItem, BookmarkTreeNodeFolder } from '../../typings/webext/bookmarks';

import { isBookmarkTreeNodeSeparator, isBookmarkTreeNodeItem } from '../shared/Bookmark';
import {
    PanelListItem,
    PanelListItemIcon,
    PanelListItemText,
} from '../shared/component/PanelListItem';
import { PanelSectionList, PanelSectionListSeparator } from '../shared/component/PanelSectionList';
import type { PopupMainIntent } from './PopupMainIntent';

import type { PopupMainState } from './PopupMainState';

const ICON_DIR = '../resources/icon/';

export interface PopupMainViewProps {
    state: PopupMainState;
    intent: PopupMainIntent;
}

export function PopupMainView(props: Readonly<PopupMainViewProps>): JSX.Element {
    const { state, intent } = props;

    const onClickOpenWebExtSidebar = (_event: MouseEvent<HTMLDivElement>) => {
        intent.openWebExtSidebar().catch(console.error);
    };

    const items = state.list.map((item, i) => {
        const v = <ListItem key={i} item={item} intent={intent} />;
        return v;
    });

    return (
        <StrictMode>
            <main>
                <Header onClick={onClickOpenWebExtSidebar} />
                <PanelSectionListSeparator />
                <PanelSectionList>{items}</PanelSectionList>
            </main>
        </StrictMode>
    );
}

interface HeaderProps {
    onClick: MouseEventHandler<HTMLElement>;
}

function Header(props: HeaderProps): JSX.Element {
    return (
        <StrictMode>
            <div className={'popup-c-PopupMainView-Header__container'}>
                <PanelSectionList>
                    <PanelListItem onClick={props.onClick}>
                        <PanelListItemIcon>
                            <popup-item-icon
                                icondir={ICON_DIR}
                                iconfile={'sidebars.svg'}
                            />
                        </PanelListItemIcon>
                        <PanelListItemText>
                            <span className={'popup__listitem_text_inner'}>
                                {'View LinkPlaces Sidebar'}
                            </span>
                        </PanelListItemText>
                    </PanelListItem>
                </PanelSectionList>
            </div>
        </StrictMode>
    );
}

interface ListItemProps {
    item: BookmarkTreeNode;
    intent: PopupMainIntent;
}
function ListItem(props: ListItemProps): JSX.Element {
    const { item, intent } = props;

    let node: JSX.Element;
    if (isBookmarkTreeNodeSeparator(item)) {
        node = <hr />;
    }
    else if (isBookmarkTreeNodeItem(item)) {
        node = <ItemListItem item={item} intent={intent} />;
    }
    else {
        node = <FolderListItem item={item} intent={intent} />;
    }

    return node;
}

interface FolderListItemProps {
    item: BookmarkTreeNodeFolder;
    intent: PopupMainIntent;
}
function FolderListItem(props: FolderListItemProps): JSX.Element {
    const { item } = props;

    const onClick: MouseEventHandler<HTMLDivElement> = (event: MouseEvent<HTMLDivElement>) => {
        event.preventDefault();
        // FIXME: This should implement to transition to the given id folder.
    };

    // https://design.firefox.com/StyleGuide/#/navigation
    return (
        <StrictMode>
            <span
                className={'popup-c-PopupMainView-ItemListItem__container'}
            >
                <PanelListItem onClick={onClick}>
                    <PanelListItemIcon>
                        <popup-item-icon icondir={ICON_DIR} iconfile={'folder.svg'} />
                    </PanelListItemIcon>
                    <PanelListItemText>
                        {item.title}
                    </PanelListItemText>
                </PanelListItem>
            </span>
        </StrictMode>
    );
}

interface ItemListItemProps {
    item: BookmarkTreeNodeItem;
    intent: PopupMainIntent;
}
function ItemListItem(props: ItemListItemProps): Nullable<JSX.Element> {
    const { item, intent, } = props;
    const url = item.url;
    const id = item.id;

    const [isOpening, setIsOpening] = useState<boolean>(false);
    if (isOpening) {
        return null;
    }

    const onClick: MouseEventHandler<HTMLAnchorElement> = (event) => {
        event.preventDefault();

        intent.openItem(id, url).catch(console.error);

        setIsOpening(true);
    };

    const title = item.title;
    const tooltiptext = `"${title}"\n${url}`;
    const label = (title === '') ?
        url :
        title;

    // https://design.firefox.com/StyleGuide/#/navigation
    return (
        <StrictMode>
            <a
                className={'popup-c-PopupMainView-ItemListItem__container'}
                href={url}
                title={tooltiptext}
                onClick={onClick}
            >
                <PanelListItem>
                    <PanelListItemIcon>
                        <popup-item-icon icondir={ICON_DIR} iconfile={'defaultFavicon.svg'} />
                    </PanelListItemIcon>
                    <PanelListItemText>
                        {label}
                    </PanelListItemText>
                </PanelListItem>
            </a>
        </StrictMode>
    );
}
