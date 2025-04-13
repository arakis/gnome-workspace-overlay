import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';

export default class WorkspaceOverlayExtension extends Extension {
    enable() {
        this._workspaceOverlays = [
            { sourceWorkspaceIndex: 2, sourceWorkspaceNumber: 3, comment: 'communication' },
            { sourceWorkspaceIndex: 3, sourceWorkspaceNumber: 4, comment: 'dashboard' },
        ];

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

    /**
     * List all windows of a specific workspace
     * @param {number} workspaceIndex - The index of the workspace (0-based)
     * @returns {Meta.Window[]} - Array of windows in the workspace
     */
    getWindowsOfWorkspace(workspaceIndex) {
        // Get the workspace at the specified index
        const workspace = global.workspace_manager.get_workspace_by_index(workspaceIndex);
        
        if (!workspace) {
            log(`Workspace with index ${workspaceIndex} not found`);
            return [];
        }
        
        // Get all windows on this workspace
        const windows = workspace.list_windows();
        
        // Log window information (optional)
        windows.forEach((window, index) => {
            if (window.get_title) {
                log(`Window ${index} on workspace ${workspaceIndex}: ${window.get_title()}`);
            }
        });
        
        return windows;
    }

    _keyBindingSettings() {
        // Create keybindings for workspaces 1-10
        for (let i = 1; i <= 10; i++) {
            const keyName = `overlay-workspace-${i}`;
            Main.wm.addKeybinding(
                keyName,
                this.getSettings(),
                Meta.KeyBindingFlags.IGNORE_AUTOREPEAT,
                Shell.ActionMode.NORMAL,
                () => {
                    log(`CTRL+ALT+${i % 10} was pressed for workspace ${i}!`);
                    // Get windows from workspace i
                    // Note: Workspace numbers are 1-based, but indexes are 0-based
                    const workspaceIndex = i - 1;
                    const windows = this.getWindowsOfWorkspace(workspaceIndex);
                    log(`Found ${windows.length} windows in workspace ${i} (index ${workspaceIndex})`);
                    // Logic to overlay windows from workspace i
                }
            );
        }
    }

    _removeKeybindings() {
        // Remove keybindings for workspaces 1-10
        for (let i = 1; i <= 10; i++) {
            Main.wm.removeKeybinding(`overlay-workspace-${i}`);
        }
    }
} 