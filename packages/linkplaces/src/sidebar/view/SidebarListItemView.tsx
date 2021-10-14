import { WhereToOpenItem, WHERE_TO_OPEN_ITEM_TO_WINDOW, WHERE_TO_OPEN_ITEM_TO_TAB } from '@linkplaces/ipc_message';
import type { BookmarkTreeNodeItem, BookmarkTreeNodeFolder } from '@linkplaces/webext_types';
import type { Nullable } from 'option-t/esm/Nullable/Nullable';
import { StrictMode, useState, MouseEventHandler, MouseEvent, SetStateAction, Dispatch } from 'react';

import { isBookmarkTreeNodeSeparator, isBookmarkTreeNodeItem } from '../../shared/Bookmark';
import {
    PanelListItem,
    PanelListItemIcon,
    PanelListItemText,
} from '../../shared/component/PanelListItem';
import { PanelSectionListSeparator } from '../../shared/component/PanelSectionList';

import type { SidebarItemViewModelEntity } from '../SidebarDomain';
import type { SidebarIntent } from '../SidebarIntent';

const CLASS_NAME_PREFIX = 'sidebar-com-SidebarListItemView';

interface ListBaseItemProps {
    iconDir: string;
    iconFile: string;
    label: string;
}

function ListBaseItem(props: ListBaseItemProps): JSX.Element {
    const {
        iconDir,
        iconFile,
        label,
    } = props;

    if (!iconDir.endsWith('/')) {
        throw new URIError(`iconDir: \`${iconDir}\` should be ended with /`);
    }

    if (iconFile.startsWith('/')) {
        throw new URIError(`iconFile: \`${iconFile}\` should not be started with /`);
    }

    return (
        <StrictMode>
            <PanelListItem>
                <PanelListItemIcon>
                    <picture className={`${CLASS_NAME_PREFIX}__icon_img`}>
                        <source srcSet={`${iconDir}dark/${iconFile}`} media={'(prefers-color-scheme: dark)'} />
                        <source srcSet={`${iconDir}light/${iconFile}`} media={'(prefers-color-scheme: light)'} />
                        <img alt={''} src={`${iconDir}context-fill/${iconFile}`} />
                    </picture>
                </PanelListItemIcon>
                <PanelListItemText>
                    {label}
                </PanelListItemText>
            </PanelListItem>
        </StrictMode>
    );
}

const ICON_DIR = '../resources/icon/';

interface ListItemProps {
    item: SidebarItemViewModelEntity;
    intent: SidebarIntent;
}
export function ListItem(props: ListItemProps): Nullable<JSX.Element> {
    const { item, intent } = props;
    const [isOpening, setIsOpening] = useState<boolean>(false);
    if (isOpening) {
        return null;
    }

    const bookmark = item.bookmark;

    if (isBookmarkTreeNodeSeparator(bookmark)) {
        return (
            <PanelSectionListSeparator />
        );
    }

    if (isBookmarkTreeNodeItem(bookmark)) {
        return (
            <StrictMode>
                <ListItemForBookmarkItem
                    bookmark={bookmark}
                    intent={intent}
                    setIsOpening={setIsOpening}
                />
            </StrictMode>
        );
    }

    return (
        <StrictMode>
            <ListItemForBookmarkFolder
                bookmark={bookmark}
            />
        </StrictMode>
    );
}

interface ListItemForBookmarkItemProps {
    bookmark: BookmarkTreeNodeItem;
    intent: SidebarIntent;
    setIsOpening: Dispatch<SetStateAction<boolean>>;
}

function ListItemForBookmarkItem(props: ListItemForBookmarkItemProps) {
    const { bookmark, intent, setIsOpening } = props;

    const id = bookmark.id;
    const url = bookmark.url;
    const bookmarkTitle = bookmark.title;
    const title = `${bookmarkTitle}\n${url}`;

    const onClick: MouseEventHandler<HTMLAnchorElement> = (evt) => {
        evt.preventDefault();

        const where = calculateWhereToOpenItem(evt);
        intent.openItem(id, url, where);

        setIsOpening(true);
    };

    const label = bookmarkTitle === '' ? url : bookmarkTitle;

    return (
        <StrictMode>
            <a
                className={`${CLASS_NAME_PREFIX}__container`}
                href={url}
                onClick={onClick}
                title={title}
            >
                <ListBaseItem
                    iconDir={ICON_DIR}
                    iconFile={'defaultFavicon.svg'}
                    label={label}
                />
            </a>
        </StrictMode>
    );
}

function calculateWhereToOpenItem(syntheticEvent: MouseEvent<HTMLAnchorElement>): WhereToOpenItem {
    if (syntheticEvent.shiftKey) {
        return WHERE_TO_OPEN_ITEM_TO_WINDOW;
    }

    return WHERE_TO_OPEN_ITEM_TO_TAB;
}

interface ListItemForBookmarkFolderProps {
    bookmark: BookmarkTreeNodeFolder;
}

function ListItemForBookmarkFolder(props: ListItemForBookmarkFolderProps) {
    const { bookmark } = props;
    const bookmarkTitle = bookmark.title;
    return (
        <StrictMode>
            <span
                className={`${CLASS_NAME_PREFIX}__container`}
                title={bookmarkTitle}
            >
                <ListBaseItem
                    iconDir={ICON_DIR}
                    iconFile={'folder.svg'}
                    label={bookmarkTitle}
                />
            </span>
        </StrictMode>
    );
}
