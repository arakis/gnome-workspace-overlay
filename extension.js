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
        
        return windows.reverse();
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
            
            // Make the windows stick to all workspaces
            overlayWindows.forEach(window => {
                // Skip windows that are already on all workspaces
                if (window.is_on_all_workspaces())
                    return;

                // Store original workspace information for each window
                window._originalWorkspaceIndex = workspaceIndex;
                window._wasSticky = window.is_on_all_workspaces();
                
                // Make windows appear on all workspaces
                window.stick();

                // Activate the window to bring it to the foreground
                Main.activateWindow(window);
            });
            
            log(`Made ${overlayWindows.length} windows from workspace ${workspaceIndex} visible across all workspaces`);
        }
    }
    
    /**
     * Remove a workspace from being shown as overlay
     * @param {number} sourceWorkspaceIndex - The index of the workspace to stash (hide overlay)
     */
    _stashOverlayWorkspace(sourceWorkspaceIndex) {
        log(`Stashing overlay workspace ${sourceWorkspaceIndex}`);
        
        if (this._activeOverlayWorkspaces.has(sourceWorkspaceIndex)) {
            // Mark the workspace as no longer an overlay
            if (sourceWorkspaceIndex < this._workspaces.length) {
                const workspaceEntry = this._workspaces[sourceWorkspaceIndex];
                workspaceEntry.isOverlay = false;
                
                // Original list of windows that were pulled for this overlay
                const originalOverlayWindows = workspaceEntry.overlayWindows || [];
                if (originalOverlayWindows.length === 0) {
                    this._activeOverlayWorkspaces.delete(sourceWorkspaceIndex);
                    return; // Nothing to stash
                }

                // Get current windows on the workspace in their current stack order
                const currentWindowsInStackOrder = this.getWindowsOfWorkspace(this._currentWorkspaceIndex);

                // Filter to get only the windows that were part of the original overlay, 
                // maintaining the current stack order.
                const windowsToStashInOrder = currentWindowsInStackOrder.filter(window => 
                    originalOverlayWindows.includes(window)
                );
                
                log(`Stashing ${windowsToStashInOrder.length} windows in current stack order`);

                // Return windows to their original workspace in the current stack order
                windowsToStashInOrder.forEach(window => {
                    // Skip invalid windows
                    if (!window || !window.get_workspace) 
                        return;
                    
                    if (window._wasSticky === undefined || window._wasSticky === false) {
                        // If window wasn't originally sticky, unstick it
                        window.unstick();
                        
                        // Move it back to its original workspace
                        if (window._originalWorkspaceIndex !== undefined) {
                            const targetWorkspace = global.workspace_manager.get_workspace_by_index(
                                window._originalWorkspaceIndex
                            );
                            if (targetWorkspace) {
                                window.change_workspace(targetWorkspace);
                            }
                        }
                    }
                    
                    // Optional: Restore original opacity if changed
                    // window.opacity = 255; // 100% opacity
                    
                    // Clean up our custom properties
                    delete window._originalWorkspaceIndex;
                    delete window._wasSticky;
                });
                
                // Clear the stored overlay windows now that they are processed
                workspaceEntry.overlayWindows = [];
            }
            
            // Clean up tracking
            this._activeOverlayWorkspaces.delete(sourceWorkspaceIndex);
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
            
            // Since windows are set to appear on all workspaces,
            // we don't need to do additional manipulation when refreshing
            // Just log the windows for debugging
            log(`${overlayWindows.length} overlay windows currently visible`);
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
                    log(`CTRL+Super+${i % 10} was pressed for workspace ${i}!`);
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