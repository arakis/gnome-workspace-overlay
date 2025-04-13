# Workspace Overlay

Display windows from one workspace across all other workspaces simultaneously.

## Description

Workspace Overlay allows you to temporarily make all windows from a specific *source* workspace visible on *every* workspace. This creates an "overlay" effect, letting you keep important windows in view while navigating different workspaces. Pressing the same shortcut again hides the overlay, returning the windows to their original workspace.

You can even overlay windows from multiple source workspaces at the same time!

## Features

*   **Toggle Workspace Overlay:** Use a keyboard shortcut (configurable) to show/hide windows from a specific workspace across all others.
*   **Multiple Concurrent Overlays:** Activate overlays from several workspaces simultaneously.
*   **Persistence:** Overlays remain active even when switching workspaces until toggled off.
*   **Configurable Shortcuts:** Set custom keyboard shortcuts for overlaying each workspace (up to 10) via the extension's preferences.

## Usage

1.  **Open Extension Preferences:** Use the Extensions app or `gnome-extensions prefs workspace-overlay@arakis`.
2.  **Configure Shortcuts:** Assign a keyboard shortcut (e.g., `<Super><Control>1` for Workspace 1, `<Super><Control>2` for Workspace 2, etc.) for each workspace you want to overlay.
3.  **Activate/Deactivate Overlay:** Press the configured shortcut for a specific workspace to toggle its windows' visibility across all workspaces.

## Installation

1.  ~~**Through extensions.gnome.org (Recommended):** Search for "Workspace Overlay" and install it directly from the website.~~
2.  **Manual Installation:**
    *   Clone or download this repository.
    *   Copy the extension folder (`workspace-overlay@arakis`) to `~/.local/share/gnome-shell/extensions/`.
    *   Restart Gnome Shell (`Alt+F2`, type `r`, press Enter) or log out and log back in.
    *   Enable the extension using the Gnome Extensions app or by running the command: `gnome-extensions enable workspace-overlay@arakis`

## Reporting Bugs

Please report any issues or suggest features on the [GitHub repository issue tracker](https://github.com/arakis/gnome-workspace-overlay/issues)

## Development

Logs can be viewed using `journalctl -f /usr/bin/gnome-shell`. 