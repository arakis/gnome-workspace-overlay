import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';

export default class WorkspaceOverlayExtension extends Extension {
    enable() {
        this._keyBindingSettings();
        log('Workspace Overlay extension enabled');
    }

    disable() {
        this._removeKeybindings();
        log('Workspace Overlay extension disabled');
    }

    _keyBindingSettings() {
        Main.wm.addKeybinding(
            'overlay-workspace-1',
            this.getSettings(),
            Meta.KeyBindingFlags.IGNORE_AUTOREPEAT,
            Shell.ActionMode.NORMAL,
            () => {
                log('CTRL+ALT+1 was pressed!');
            }
        );
    }

    _removeKeybindings() {
        Main.wm.removeKeybinding('overlay-workspace-1');
    }
} 