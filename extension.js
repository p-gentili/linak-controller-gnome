import GObject from 'gi://GObject';
import St from 'gi://St';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import {Extension, gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

const DeskIndicator = GObject.registerClass(
class DeskIndicator extends PanelMenu.Button {
    _init() {
        super._init(0.0, _('Linak Desk Controller'));

        // Create desk icon
        this._icon = new St.Icon({
            icon_name: 'go-up-symbolic',
            style_class: 'system-status-icon'
        });
        this.add_child(this._icon);

        this._updateMenu();
    }

    _updateMenu() {
        // Clear existing menu items
        this.menu.removeAll();

        // Get favorite positions from linak-controller config
        const favoritePositions = this._loadLinakConfig();

        // Add menu items for each favorite position
        favoritePositions.forEach(position => {
            const menuItem = new PopupMenu.PopupMenuItem(`${position.name} (${position.height}mm)`);
            menuItem.connect('activate', () => {
                this._moveToPosition(position.name);
            });
            this.menu.addMenuItem(menuItem);
        });

        // Add separator
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        // Add refresh item
        const refreshItem = new PopupMenu.PopupMenuItem(_('Refresh'));
        refreshItem.connect('activate', () => {
            this._updateMenu();
        });
        this.menu.addMenuItem(refreshItem);

        // Add preferences item
        const prefsItem = new PopupMenu.PopupMenuItem(_('Preferences'));
        prefsItem.connect('activate', () => {
            this._openPreferences();
        });
        this.menu.addMenuItem(prefsItem);
    }

    _loadLinakConfig() {
        const homeDir = GLib.get_home_dir();
        const configPath = GLib.build_filenamev([homeDir, '.config', 'linak-controller', 'config.yaml']);

        try {
            const file = Gio.File.new_for_path(configPath);
            const [success, contents] = file.load_contents(null);

            if (!success) {
                console.error('Failed to load linak-controller config');
                return this._getDefaultPositions();
            }

            const configText = new TextDecoder('utf-8').decode(contents);
            return this._parseYamlFavorites(configText);

        } catch (e) {
            console.error('Error reading linak-controller config:', e);
            return this._getDefaultPositions();
        }
    }

    _parseYamlFavorites(yamlContent) {
        const favorites = [];
        const lines = yamlContent.split('\n');
        let inFavoritesSection = false;

        for (const line of lines) {
            const trimmed = line.trim();

            if (trimmed === 'favourites:') {
                inFavoritesSection = true;
                continue;
            }

            if (inFavoritesSection) {
                // Check if we've reached the end of the favorites section
                if (trimmed && !line.startsWith('  ') && !line.startsWith('\t')) {
                    break;
                }

                // Parse favorite line: "  name: height"
                const match = trimmed.match(/^([^:]+):\s*(.+)$/);
                if (match) {
                    const name = match[1].trim();
                    const height = match[2].trim();
                    favorites.push({
                        name: name,
                        height: height
                    });
                }
            }
        }

        return favorites.length > 0 ? favorites : this._getDefaultPositions();
    }

    _getDefaultPositions() {
        return [
            {name: 'sit', height: '170'},
            {name: 'stand', height: '490'}
        ];
    }

    _moveToPosition(position) {
        console.log(`Moving desk to position: ${position}`);

        try {
            // Execute linak-controller command with position name
            const proc = Gio.Subprocess.new(
                ['linak-controller', '--move-to', position],
                Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE
            );

            proc.communicate_utf8_async(null, null, (proc, res) => {
                try {
                    const [, stdout, stderr] = proc.communicate_utf8_finish(res);

                    if (proc.get_successful()) {
                        console.log(`Desk moved to position ${position} successfully`);
                        if (stdout) console.log('linak-controller output:', stdout);
                    } else {
                        console.error(`Failed to move desk to position ${position}`);
                        if (stderr) console.error('linak-controller error:', stderr);

                        // Show notification on error
                        Main.notify(_('Desk Controller'),
                                  _(`Failed to move desk: ${stderr || 'Unknown error'}`));
                    }
                } catch (e) {
                    console.error('Error executing linak-controller:', e);
                    Main.notify(_('Desk Controller'),
                              _(`Error: ${e.message}`));
                }
            });

        } catch (e) {
            console.error('Failed to start linak-controller process:', e);
            Main.notify(_('Desk Controller'),
                      _(`Failed to start linak-controller: ${e.message}`));
        }
    }

    _openPreferences() {
        try {
            const proc = Gio.Subprocess.new(
                ['gnome-extensions', 'prefs', 'linak-controller@pgentili.com'],
                Gio.SubprocessFlags.NONE
            );
        } catch (e) {
            console.error('Failed to open preferences:', e);
        }
    }

    destroy() {
        super.destroy();
    }
});

export default class LinakControllerExtension extends Extension {
    enable() {
        console.log('Enabling Linak Controller extension');

        // Create and add indicator to panel
        this._indicator = new DeskIndicator();
        Main.panel.addToStatusArea(this.uuid, this._indicator);
    }

    disable() {
        console.log('Disabling Linak Controller extension');

        if (this._indicator) {
            this._indicator.destroy();
            this._indicator = null;
        }
    }
}