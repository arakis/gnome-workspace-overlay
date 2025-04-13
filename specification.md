Okay, here is a concise specification for the Gnome Shell Extension:

**Extension Name:** Workspace Overlay (or similar)

**Goal:** Allow temporary display of windows from a specific *target* workspace onto the current screen(s), overlaying the current global workspace view without actually changing the global workspace.

**Core Functionality:**

1.  **Pull Workspace:**
    * **Trigger:** User-defined keyboard shortcut (e.g., `Super+Alt+3`).
    * **Action:** Fetches all windows from the associated *target* workspace (e.g., Workspace 3). Moves these windows to the *current* screen(s) and brings them to the foreground, maintaining their relative stacking order. This creates a temporary overlay.
    * **Scope:** Affects all windows of the target workspace.

2.  **Revert Overlay:**
    * **Trigger:** Activating a standard global workspace switch (e.g., `Super+<Num>`, `Ctrl+Alt+<Arrow>`) OR triggering another "Pull Workspace" shortcut.
    * **Action:** All windows currently part of the overlay are moved back to their original *target* workspace. The standard workspace switch then proceeds (if applicable).

**Behavior Details:**

* **Persistence:** If an overlay is active on specific screen(s), switching the *global* workspace will *not* affect those screens. They continue displaying the overlay until a "Revert Overlay" action occurs. Screens *without* an overlay switch normally with the global workspace.
* **Global Workspaces:** Standard global workspace switching remains the primary navigation method. This extension provides temporary, per-screen overlays *on top of* the current global view.
* **Multiple Overlays:** Triggering a "Pull" shortcut while another overlay is active will first revert the existing overlay, then apply the new one.

**Configuration:**

* Users must be able to define multiple shortcuts, each mapped to pull windows from a specific target workspace index.

**Example Flow:**

* **Setup:** 4 global workspaces. `Super+Alt+3` configured to pull Workspace 3.
* **State:** Global Workspace 1 active (on Screens 1 & 2).
* **Action:** User presses `Super+Alt+3`.
* **Result:** Windows from Workspace 3 appear on Screen 1 & 2 (or focused screen, TBD), overlaying Workspace 1 content.
* **Action:** User presses `Super+2` (switch global to Workspace 2).
* **Result:** Screens 1 & 2 *continue* showing the pulled Workspace 3 windows.
* **Action:** User presses `Super+1` (switch global to Workspace 1).
* **Result:** Pulled Workspace 3 windows return to Workspace 3. Screens 1 & 2 now show Workspace 1 content.