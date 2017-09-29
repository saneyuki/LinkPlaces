/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Nullable } from 'option-t/es6/Nullable';

const ADDON_NAME = 'LinkPlaces';

const SIDEBAR_BROADCAST_ID = 'viewLinkplacesSidebar';

const BROADCASTER_CONTAINER_ID = 'mainBroadcasterSet';
const MENUBAR_CONTAINER_ID = 'viewSidebarMenu';
const SIDEBAR_HEADER_SWITCH_CONTAINER_ID = 'sidebarMenu-popup';

class DOMbuilder {

  static create(win: Window, localname: string, param: Map<string, string>, children: Iterable<DOMbuilder>): DOMbuilder {
    const dom = win.document.createElement(localname);
    for (const [k, v] of param.entries()) {
      dom.setAttribute(k, v);
    }

    for (const c of children) {
      dom.appendChild(c.dom);
    }

    const wrapper = new DOMbuilder(dom);
    return wrapper;
  }

  private _dom: Nullable<Element>;

  private constructor(dom: Element) {
    this._dom = dom;
    Object.seal(this);
  }

  destroy() {
    this.removeFromParent();
    this._dom = null;
  }

  get dom(): Element {
    if (this._dom === null) {
      throw new TypeError('this instance has been dead');
    }

    return this._dom;
  }

  appendToById(subrootId: string): void {
    if (this._dom === null) {
      throw new TypeError(`this._dom is \`null\``);
    }

    const doc = this._dom.ownerDocument;
    const subroot = doc.getElementById(subrootId);
    if (subroot === null) {
      throw new TypeError(`not fount #${subrootId} in the document`);
    }

    subroot.appendChild(this._dom);
  }

  removeFromParent(): void {
    if (this._dom !== null) {
      this._dom.remove();
    }
  }
}

export class LinkplacesChromeSidebar {

  private _win: Window;
  private _menubar: Nullable<DOMbuilder>;
  private _broadcaster: Nullable<DOMbuilder>;
  private _headerSwitcher: Nullable<DOMbuilder>;

  constructor(win: Window) {
    this._win = win;
    this._menubar = null;
    this._broadcaster = null;
    this._headerSwitcher = null;

    Object.seal(this);
    this._init();
  }

  destroy() {
    this._finalize();

    this._headerSwitcher = null;
    this._broadcaster = null;
    this._menubar = null;
    this._win = null as any;
  }

  private _init() {
    const win = this._win;

    this._menubar = DOMbuilder.create(win, 'menuitem', new Map([
      ['id', 'linkplaces-menu-sidebar'],
      ['observes', SIDEBAR_BROADCAST_ID],
    ]), []);
    this._menubar.appendToById(MENUBAR_CONTAINER_ID);

    this._broadcaster = DOMbuilder.create(win, 'broadcaster', new Map([
      ['id', SIDEBAR_BROADCAST_ID],
      ['label', ADDON_NAME],
      ['autoCheck', 'false'],
      ['type', 'checkbox'],
      ['group', 'sidebar'],
      ['sidebartitle', ADDON_NAME],
      ['sidebarurl', 'chrome://linkplaces/content/sidebar/linkplaces-sidebar.xul'],

      // XXX: Does not work with `addEventListener()`
      ['oncommand', `SidebarUI.toggle("${SIDEBAR_BROADCAST_ID}")`],
    ]), []);
    this._broadcaster.appendToById(BROADCASTER_CONTAINER_ID);

    this._headerSwitcher = DOMbuilder.create(win, 'toolbarbutton', new Map([
      ['id', 'sidebar-switcher-linkplaces'],
      ['label', ADDON_NAME],
      ['class', 'subviewbutton subviewbutton-iconic'],
      ['observes', SIDEBAR_BROADCAST_ID],
      ['oncommand', `SidebarUI.show('${SIDEBAR_BROADCAST_ID}')`],
    ]), [
      DOMbuilder.create(win, 'observes', new Map([
        ['element', SIDEBAR_BROADCAST_ID],
        ['attribute', 'checked'],
      ]), []),
    ]);

    {
      const container = win.document.getElementById(SIDEBAR_HEADER_SWITCH_CONTAINER_ID)!;
      const ip = container.querySelector('toolbarseparator');
      container.insertBefore(this._headerSwitcher.dom, ip);
    }
  }

  _finalize() {
    // Close sidebar to release the reference to it from the current window.
    const win = this._win;
    if ((win as any).SidebarUI.currentID === SIDEBAR_BROADCAST_ID) {
      (win as any).SidebarUI.hide();
    }

    this._menubar!.destroy();
    this._broadcaster!.destroy();
    this._headerSwitcher!.destroy();
  }
}
