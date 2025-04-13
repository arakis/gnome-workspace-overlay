import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import Gdk from 'gi://Gdk';
import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import { ExtensionPreferences, gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

// Log helper function
function log(msg) {
    console.log(`[Workspace-Overlay] ${msg}`);
}

// Helper function to create a Gtk shortcut label string
function getShortcutLabel(accelerator) {
    if (!accelerator) {
        return _('Disabled');
    }
    // Gtk.accelerator_parse is available in GTK4 but deprecated
    // and might not parse all modern Gtk.ShortcutTrigger strings correctly.
    // For common cases like '<Shift><Super>1' it should work.
    // A more robust GTK4 approach involves Gtk.ShortcutTrigger.parse_string
    // but Gtk.accelerator_get_label is simpler here if it works.
    const [ok, keyval, mods] = Gtk.accelerator_parse(accelerator);
    if (ok) {
        return Gtk.accelerator_get_label(keyval, mods);
    }
    // Fallback for complex or unparseable accelerators
    return accelerator;
}

export default class WorkspaceOverlayPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        // Create a preferences page
        const page = new Adw.PreferencesPage();
        window.add(page);

        // Create a preferences group for the shortcuts
        const group = new Adw.PreferencesGroup({
            title: _('Keyboard Shortcuts'),
            description: _('Set the shortcuts to overlay workspaces.'),
        });
        page.add(group);

        // Get the extension settings
        const settings = this.getSettings();

        // Add rows for each shortcut setting
        for (let i = 1; i <= 10; i++) {
            const key = `overlay-workspace-${i}`;
            const title = _(`Overlay Workspace ${i}`);
            const row = this._createShortcutRow(title, settings, key);
            group.add(row);
        }
    }

    _createShortcutRow(title, settings, key) {
        const row = new Adw.ActionRow({ title: title });

        const button = new Gtk.Button({
            valign: Gtk.Align.CENTER,
            hexpand: false,
            halign: Gtk.Align.END,
        });
        row.add_suffix(button);
        row.activatable_widget = button;

        const updateLabel = () => {
            const accelStr = settings.get_strv(key)[0] || '';
            button.set_label(getShortcutLabel(accelStr));
        };

        // Update the label initially and when the setting changes
        updateLabel();
        settings.connect(`changed::${key}`, updateLabel);

        // Handle button click to open the edit dialog
        button.connect('clicked', () => {
            this._editShortcut(row.get_root(), settings, key, title);
        });

        return row;
    }

    _editShortcut(parentWindow, settings, key, title) {
        const dialog = new Gtk.Window({
            transient_for: parentWindow,
            modal: true,
            title: _(`Set Shortcut for ${title}`),
            destroy_with_parent: true,
            resizable: false,
        });

        const box = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            spacing: 15,
            margin_top: 15,
            margin_bottom: 15,
            margin_start: 15,
            margin_end: 15,
        });
        dialog.set_child(box);

        const instructions = new Gtk.Label({
            label: _('Press the desired key combination,\nor Backspace to clear the shortcut,\nor Escape to cancel.'),
            halign: Gtk.Align.CENTER,
        });
        box.append(instructions);

        const currentShortcut = settings.get_strv(key)[0] || '';
        const currentLabel = new Gtk.Label({
            label: _(`Current: ${getShortcutLabel(currentShortcut)}`),
            halign: Gtk.Align.CENTER,
        });
        box.append(currentLabel);

        const feedbackLabel = new Gtk.Label({
            label: _('Waiting for input...'),
            halign: Gtk.Align.CENTER,
        });
        box.append(feedbackLabel);

        // Capture key events
        const controller = new Gtk.EventControllerKey();
        dialog.add_controller(controller);

        controller.connect('key-pressed', (ctrl, keyval, keycode, state) => {
            log(`Key pressed: keyval=${keyval}, keycode=${keycode}, state=${state}, name=${Gdk.keyval_name(keyval)}`);

            if (keyval === Gdk.KEY_Escape) {
                log('Escape pressed, cancelling.');
                dialog.close();
                return Gdk.EVENT_STOP; // Stop propagation
            }

            if (keyval === Gdk.KEY_BackSpace) {
                log('Backspace pressed, clearing shortcut.');
                settings.set_strv(key, []);
                dialog.close();
                return Gdk.EVENT_STOP; // Stop propagation
            }

            // Ignore modifier-only presses
            if (Gdk.keyval_is_modifier(keyval)) {
                log('Modifier key pressed, ignoring.');
                return Gdk.EVENT_PROPAGATE; // Allow propagation
            }

            // Use Gtk.accelerator_name to get the string representation (e.g., '<Shift>a')
            const accelName = Gtk.accelerator_name(keyval, state);
            log(`Captured shortcut: ${accelName}`);

            if (accelName) {
                 feedbackLabel.set_label(_(`Captured: ${getShortcutLabel(accelName)}`));
                 settings.set_strv(key, [accelName]);
                 // Short delay before closing to show feedback
                 GLib.timeout_add(GLib.PRIORITY_DEFAULT, 50, () => {
                    dialog.close();
                    return GLib.SOURCE_REMOVE;
                 });
            } else {
                 feedbackLabel.set_label(_('Invalid combination'));
            }

            return Gdk.EVENT_STOP; // Stop propagation
        });

        dialog.present();
    }
}
