# Workspace Overlay

Display windows from one workspace across all other workspaces simultaneously.

## Description

Workspace Overlay allows you to temporarily make all windows from a specific *source* workspace visible on *every* workspace. This creates an "overlay" effect, letting you keep important windows in view while navigating different workspaces. Pressing the same shortcut again hides the overlay, returning the windows to their original workspace.

You can even overlay windows from multiple source workspaces at the same time!

## Example Usage

Imagine this scenario: You have multiple screens and primarily work across two main workspaces, utilizing all your screens.

However, you also have two messenger applications, arranged side-by-side, on Workspace 3. While working on your main workspaces, you want to quickly check your messages. By pressing a configured shortcut, like `<Shift><Super>3`, the windows from Workspace 3 instantly appear as an overlay on your current workspace. Pressing `<Shift><Super>3` again hides the messenger windows, returning them visually to Workspace 3.

## Features

*   **Toggle Workspace Overlay:** Use a keyboard shortcut (configurable) to show/hide windows from a specific workspace across all others.
*   **Multiple Concurrent Overlays:** Activate overlays from several workspaces simultaneously.
*   **Persistence:** Overlays remain active even when switching workspaces until toggled off.
*   **Configurable Shortcuts:** Set custom keyboard shortcuts for overlaying each workspace (up to 10) via the extension's preferences.

## Usage

1.  **Open Extension Preferences:** Use the Extensions app or `gnome-extensions prefs workspace-overlay@arakis`.
2.  **Configure Shortcuts:** Assign a keyboard shortcut (e.g., `<Shift><Super>1` for Workspace 1, `<Shift><Super>2` for Workspace 2, etc.) for each workspace you want to overlay.
3.  **Activate/Deactivate Overlay:** Press the configured shortcut for a specific workspace to toggle its windows' visibility across all workspaces.

## Installation

1.  **Through extensions.gnome.org (Recommended):** Search for "Workspace Overlay" and install it directly from the website, or use this direct link: https://extensions.gnome.org/extension/8058/workspace-overlay
2.  **Manual Installation:**
    *   Clone or download this repository.
    *   Copy the extension folder (`workspace-overlay@arakis`) to `~/.local/share/gnome-shell/extensions/`.
    *   Restart Gnome Shell (`Alt+F2`, type `r`, press Enter) or log out and log back in.
    *   Enable the extension using the Gnome Extensions app or by running the command: `gnome-extensions enable workspace-overlay@arakis`

## Reporting Bugs

Please report any issues or suggest features on the [GitHub repository issue tracker](https://github.com/arakis/gnome-workspace-overlay/issues)

## Development

Logs can be viewed using `journalctl -f /usr/bin/gnome-shell`. 