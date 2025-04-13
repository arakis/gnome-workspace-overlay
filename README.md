# Workspace Overlay Gnome Extension

Temporarily overlay windows from another workspace onto the current screen.

## Features (Planned)

*   Pull windows from a target workspace to the current screen via shortcut.
*   Revert the overlay automatically when switching global workspaces or pulling another workspace.
*   Configure multiple shortcuts for different target workspaces.

## Installation

1.  Clone or download this repository.
2.  Copy the extension folder (`workspace-overlay@arakis`) to `~/.local/share/gnome-shell/extensions/`.
3.  Restart Gnome Shell (`Alt+F2`, type `r`, press Enter) or log out and log back in.
4.  Enable the extension using the Gnome Extensions app or `gnome-extensions enable workspace-overlay@arakis`.

## Usage

*   Press `<Super><Alt>1` to (currently) show a notification indicating a pull from Workspace 1.
*   Switching workspaces will (currently) show a notification indicating the overlay is reverted.

## Development

*   Logs can be viewed using `journalctl -f /usr/bin/gnome-shell`.

## TODO

*   Implement actual window moving logic.
*   Implement settings schema and UI for keybindings.
*   Handle multi-monitor setups.
*   Refine overlay reversion logic. 