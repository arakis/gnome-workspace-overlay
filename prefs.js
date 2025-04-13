// prefs.js for Workspace Overlay GNOME Shell Extension

imports.gi.versions.Adw = '1';
imports.gi.versions.Gtk = '4.0';
imports.gi.versions.Gdk = '4.0';

import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';
import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class WorkspaceOverlayPreferences extends ExtensionPreferences {
    constructor(metadata) {
        super(metadata);
    }

    getPreferencesWidget() {
        const settings = this.getSettings();
        
        // Create parent box
        const box = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            margin_top: 12,
            margin_bottom: 12,
            margin_start: 12,
            margin_end: 12,
            spacing: 12
        });

        // Add heading
        const heading = new Adw.WindowTitle({
            title: "Workspace Overlay Shortcuts",
            subtitle: "Set keyboard shortcuts for workspace overlays"
        });
        box.append(heading);

        // Create entries for workspaces 1-10
        for (let i = 1; i <= 10; i++) {
            const row = new Adw.ActionRow({
                title: `Workspace ${i}`,
                subtitle: `Shortcut to overlay workspace ${i} windows`,
            });

            const entry = new Gtk.Entry({
                hexpand: false,
                width_request: 200
            });

            settings.bind(
                `overlay-workspace-${i}`,
                entry,
                'text',
                Gio.SettingsBindFlags.DEFAULT
            );

            row.add_suffix(entry);
            box.append(row);
        }

        return box;
    }
} 