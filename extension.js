import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';

export default class WorkspaceOverlayExtension extends Extension {
    enable() {
        // Initialize _workspaces with all workspaces
        this._workspaces = [];
        const workspaceCount = global.workspace_manager.get_n_workspaces();
        
        // Populate all workspaces first
        for (let i = 0; i < workspaceCount; i++) {
            this._workspaces.push({
                sourceWorkspaceIndex: i,
                sourceWorkspaceNumber: i + 1,  // 1-based for display
                comment: i === 2 ? 'communication' : (i === 3 ? 'dashboard' : ''),
                isOverlay: false,  // All workspaces start as non-overlay
                overlayWindows: []  // Windows from this workspace shown as overlay
            });
        }

        // Track current workspace and active overlays
        this._currentWorkspaceIndex = global.workspace_manager.get_active_workspace_index();
        this._activeOverlayWorkspaces = new Set(); // Set of workspace indices currently shown as overlay

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
        
        // Clean up any active overlays
        this._activeOverlayWorkspaces.forEach(index => {
            this._stashOverlayWorkspace(index);
        });
        
        this._activeOverlayWorkspaces.clear();
        this._removeKeybindings();
        log('Workspace Overlay extension disabled');
    }

    _onWorkspaceSwitched(workspaceManager, fromIndex, toIndex, direction) {
        log(`Workspace switched from index ${fromIndex} to index ${toIndex}`);
        
        // Store previous and new workspace
        const previousWorkspaceIndex = this._currentWorkspaceIndex;
        this._currentWorkspaceIndex = toIndex;
        
        // Case: Switching to a workspace that is already an overlay
        if (this._activeOverlayWorkspaces.has(toIndex)) {
            log(`Switching to workspace ${toIndex} which is currently an overlay`);
            // Handle removing it from overlay
            this._stashOverlayWorkspace(toIndex);
        }
        
        // Case: Regular workspace switch - make sure overlay windows follow
        this._activeOverlayWorkspaces.forEach(overlayIndex => {
            // If we have active overlays, ensure they still show on the new workspace
            this._refreshOverlayWorkspace(overlayIndex);
        });
    }

    /**
     * List all windows of a specific workspace
     * @param {number} workspaceIndex - The index of the workspace (0-based)
     * @returns {Meta.Window[]} - Array of windows in the workspace, ordered by their stacking order
     */
    getWindowsOfWorkspace(workspaceIndex) {
        // Get the workspace at the specified index
        const workspace = global.workspace_manager.get_workspace_by_index(workspaceIndex);
        
        if (!workspace) {
            log(`Workspace with index ${workspaceIndex} not found`);
            return [];
        }
        
        // Get all windows from the display in stacking order
        const allWindows = global.display.get_tab_list(Meta.TabList.NORMAL, workspace);
        
        // Filter to keep only windows that are on this workspace
        const windows = allWindows.filter(window => 
            window.get_workspace() === workspace
        );
        
        // Log window information (optional)
        windows.forEach((window, index) => {
            if (window.get_title) {
                log(`Window ${index} on workspace ${workspaceIndex}: ${window.get_title()}`);
            }
        });
        
        return windows;
    }

    /**
     * Pull a workspace as an overlay to show on other workspaces
     * @param {number} workspaceIndex - The index of the workspace to pull as overlay
     */
    _pullOverlayWorkspace(workspaceIndex) {
        log(`Pulling workspace ${workspaceIndex} as overlay`);
        
        // Mark the workspace as an overlay
        if (workspaceIndex < this._workspaces.length) {
            const workspaceEntry = this._workspaces[workspaceIndex];
            workspaceEntry.isOverlay = true;
            this._activeOverlayWorkspaces.add(workspaceIndex);
            
            // Get windows from the overlay workspace
            const overlayWindows = this.getWindowsOfWorkspace(workspaceIndex);
            workspaceEntry.overlayWindows = overlayWindows;
            
            // Store original workspace information for each window
            // (We'll implement the actual window manipulation later)
        }
    }
    
    /**
     * Remove a workspace from being shown as overlay
     * @param {number} workspaceIndex - The index of the workspace to stash (hide overlay)
     */
    _stashOverlayWorkspace(workspaceIndex) {
        log(`Stashing overlay workspace ${workspaceIndex}`);
        
        if (this._activeOverlayWorkspaces.has(workspaceIndex)) {
            // Mark the workspace as no longer an overlay
            if (workspaceIndex < this._workspaces.length) {
                const workspaceEntry = this._workspaces[workspaceIndex];
                workspaceEntry.isOverlay = false;
                
                // Return windows to their original workspace
                // (We'll implement the actual window manipulation later)
                
                // Clear the overlay windows
                workspaceEntry.overlayWindows = [];
            }
            
            // Clean up tracking
            this._activeOverlayWorkspaces.delete(workspaceIndex);
        }
    }
    
    /**
     * Refresh an overlay workspace's windows on the current workspace
     * @param {number} overlayWorkspaceIndex - The index of the overlay workspace
     */
    _refreshOverlayWorkspace(overlayWorkspaceIndex) {
        log(`Refreshing overlay windows from workspace ${overlayWorkspaceIndex} on current workspace ${this._currentWorkspaceIndex}`);
        
        // Get the workspace entry
        if (overlayWorkspaceIndex < this._workspaces.length) {
            const workspaceEntry = this._workspaces[overlayWorkspaceIndex];
            
            // Get windows from the overlay
            const overlayWindows = workspaceEntry.overlayWindows || [];
            
            // Update the visibility/position of these windows on the current workspace
            // (We'll implement the actual window manipulation later)
        }
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
                    // Note: Workspace numbers are 1-based, but indexes are 0-based
                    const workspaceIndex = i - 1;
                    
                    // Toggle overlay state
                    if (this._activeOverlayWorkspaces.has(workspaceIndex)) {
                        // If already an overlay, stash it
                        this._stashOverlayWorkspace(workspaceIndex);
                    } else {
                        // Otherwise, pull it as an overlay
                        this._pullOverlayWorkspace(workspaceIndex);
                    }
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