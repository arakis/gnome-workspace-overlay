import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';

export default class WorkspaceOverlayExtension extends Extension {
    enable() {
        this._workspaceHandlerId = global.workspace_manager.connect(
            'workspace-switched',
            this._onWorkspaceSwitched.bind(this)
        );
        this._keyBindingSettings();
        log('Workspace Overlay extension enabled');
    }

    disable() {
        if (this._workspaceHandlerId) {
            global.workspace_manager.disconnect(this._workspaceHandlerId);
            this._workspaceHandlerId = null;
        }
        this._removeKeybindings();
        log('Workspace Overlay extension disabled');
    }

    _onWorkspaceSwitched(workspaceManager, from, to, direction) {
        log(`Workspace switched from index ${from} to index ${to}`);
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