**Gnome Extension Name:** Workspace Overlay

**Goal:** On Gnome, allow temporary display of windows from specific *source* workspaces onto all workspaces, creating an overlay effect where selected windows persist across workspace switches.

**Core Functionality:**

1.  **Toggle Workspace Overlay:**
    * **Trigger:** User-defined keyboard shortcut (e.g., `Ctrl+Alt+3`).
    * **Action:** Toggles the visibility of all windows from the associated *source* workspace (e.g., Workspace 3) across all workspaces. When activated, windows from the source workspace become "sticky" and appear on every workspace. When toggled again, windows return to their original workspace.
    * **Scope:** Affects all windows of the source workspace.

2.  **Multiple Concurrent Overlays:**
    * **Action:** Users can activate overlays from multiple source workspaces simultaneously. Each overlay is managed independently.
    * **Example:** Windows from both Workspace 3 and Workspace 4 can be shown across all workspaces at the same time.

**Behavior Details:**

* **Persistence:** Once an overlay is activated, the windows persist across all workspaces until explicitly toggled off using the same keybinding.
* **Window Stickiness:** The implementation uses window "sticking" functionality to make windows appear on all workspaces.
* **Workspace Switching:** When switching workspaces, any active overlay windows remain visible. The extension ensures that overlays follow the user to any workspace they navigate to.
* **Original State Preservation:** The extension tracks each window's original workspace and "sticky" state, restoring these properties when the overlay is deactivated.

**Configuration:**

* Users can define keyboard shortcuts for each workspace, allowing them to toggle overlays for specific workspaces using `Ctrl+Alt+[Workspace Number]`.

**Example Flow:**

* **Setup:** Multiple global workspaces with `Ctrl+Alt+3` configured to toggle overlay for Workspace 3.
* **State:** User is on Workspace 1.
* **Action:** User presses `Ctrl+Alt+3`.
* **Result:** Windows from Workspace 3 appear on all workspaces, overlaying the content of the current workspace.
* **Action:** User switches to Workspace 2.
* **Result:** Windows from Workspace 3 remain visible, now overlaying Workspace 2 content.
* **Action:** User presses `Ctrl+Alt+3` again.
* **Result:** Windows from Workspace 3 are no longer visible on all workspaces and return to only being visible on Workspace 3.