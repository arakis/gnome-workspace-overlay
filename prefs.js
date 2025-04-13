// prefs.js for Workspace Overlay GNOME Shell Extension

imports.gi.versions.Adw = '1';
imports.gi.versions.Gtk = '4.0';
imports.gi.versions.Gdk = '4.0';

import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

// Log helper function
function log(msg) {
    console.log(`[Workspace-Overlay] ${msg}`);
}

export default class WorkspaceOverlayPreferences extends ExtensionPreferences {
    constructor(metadata) {
        super(metadata);
    }

    getPreferencesWidget() {
        const settings = this.getSettings();
        log('Creating preferences widget');
        
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

            // Get the current shortcut
            const shortcutSetting = `overlay-workspace-${i}`;
            const accelerator = settings.get_strv(shortcutSetting)[0] || "";
            
            // Create a button to display and capture the shortcut
            const shortcutBtn = new Gtk.Button({
                label: accelerator ? accelerator : "Click to set shortcut",
                valign: Gtk.Align.CENTER,
                has_frame: true,
            });
            
            // Track shortcut index for logging
            const wsIndex = i;
            
            // Shortcut capture handler
            shortcutBtn.connect('clicked', () => {
                log(`Button clicked for workspace ${wsIndex}`);
                
                // Create dialog for shortcut capture
                const dialog = new Gtk.Dialog({
                    title: `Set shortcut for Workspace ${wsIndex}`,
                    modal: true,
                    use_header_bar: 1,
                });
                
                // Try to find parent window in different ways
                try {
                    // Try to get the root
                    const root = box.get_root();
                    if (root) {
                        log('Found root window');
                        dialog.set_transient_for(root);
                    } else {
                        log('No root window found for box');
                        
                        // Alternative approach: find the toplevel widget
                        const toplevel = box.get_toplevel();
                        if (Gtk.is_window(toplevel)) {
                            log('Found toplevel window');
                            dialog.set_transient_for(toplevel);
                        } else {
                            log('No valid toplevel window found');
                        }
                    }
                } catch (e) {
                    log(`Error setting transient_for: ${e.message}`);
                }
                
                // Add cancel button
                dialog.add_button("Cancel", Gtk.ResponseType.CANCEL);
                
                // Add content area with instructions
                const contentArea = dialog.get_content_area();
                contentArea.append(new Gtk.Label({
                    label: "Press keyboard shortcut...",
                    margin_top: 12,
                    margin_bottom: 12,
                    margin_start: 12,
                    margin_end: 12,
                }));
                
                // Handler for key press events
                const controller = new Gtk.EventControllerKey();
                dialog.add_controller(controller);
                
                controller.connect('key-pressed', (_widget, keyval, keycode, state) => {
                    log(`Key pressed: keyval=${keyval}, keycode=${keycode}, state=${state}`);
                    
                    // Filter out Escape key used to cancel
                    if (keyval === Gdk.KEY_Escape) {
                        log('Escape pressed, canceling');
                        dialog.response(Gtk.ResponseType.CANCEL);
                        return Gdk.EVENT_STOP;
                    }
                    
                    // Create accelerator string
                    const mask = state & Gtk.accelerator_get_default_mod_mask();
                    const accel = Gtk.accelerator_name(keyval, mask);
                    
                    log(`Created accelerator: ${accel}`);
                    
                    if (accel) {
                        // Save the accelerator
                        settings.set_strv(shortcutSetting, [accel]);
                        shortcutBtn.set_label(accel);
                        dialog.response(Gtk.ResponseType.ACCEPT);
                    }
                    
                    return Gdk.EVENT_STOP;
                });
                
                // Show dialog and handle response
                dialog.connect('response', (_dialog, response) => {
                    log(`Dialog response: ${response}`);
                    dialog.destroy();
                });
                
                try {
                    log('Showing dialog');
                    dialog.show();
                } catch (e) {
                    log(`Error showing dialog: ${e.message}`);
                }
            });
            
            row.add_suffix(shortcutBtn);
            box.append(row);
        }

        return box;
    }
} 