import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import {ExtensionPreferences, gettext as _} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class LinakControllerPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        // Create main page
        const page = new Adw.PreferencesPage();
        window.add(page);

        // Create positions group
        const positionsGroup = new Adw.PreferencesGroup({
            title: _('Favorite Positions'),
            description: _('Configure your favorite desk positions (edits ~/.config/linak-controller/config.yaml)')
        });
        page.add(positionsGroup);

        // Create list box for positions
        const listBox = new Gtk.ListBox({
            selection_mode: Gtk.SelectionMode.NONE,
            css_classes: ['boxed-list']
        });
        positionsGroup.add(listBox);

        // Load positions from YAML config
        this._loadPositions(listBox);

        // Button container
        const buttonBox = new Gtk.Box({
            orientation: Gtk.Orientation.HORIZONTAL,
            spacing: 12,
            margin_top: 12,
            halign: Gtk.Align.START
        });

        // Add new position button
        const addButton = new Gtk.Button({
            label: _('Add Position'),
            css_classes: ['suggested-action']
        });
        addButton.connect('clicked', () => {
            this._addPosition(listBox);
        });
        buttonBox.append(addButton);

        // Save button
        const saveButton = new Gtk.Button({
            label: _('Save to linak-controller config'),
            css_classes: ['suggested-action']
        });
        saveButton.connect('clicked', () => {
            this._savePositions(listBox);
        });
        buttonBox.append(saveButton);

        positionsGroup.add(buttonBox);
    }

    _getConfigPath() {
        const homeDir = GLib.get_home_dir();
        return GLib.build_filenamev([homeDir, '.config', 'linak-controller', 'config.yaml']);
    }

    _loadPositions(listBox) {
        const configPath = this._getConfigPath();

        try {
            const file = Gio.File.new_for_path(configPath);
            const [success, contents] = file.load_contents(null);

            if (!success) {
                console.error('Failed to load linak-controller config');
                this._addDefaultPositions(listBox);
                return;
            }

            const configText = new TextDecoder('utf-8').decode(contents);
            const favorites = this._parseYamlFavorites(configText);

            favorites.forEach(position => {
                this._addPositionRow(listBox, position.name, position.height);
            });

            if (favorites.length === 0) {
                this._addDefaultPositions(listBox);
            }

        } catch (e) {
            console.error('Error reading linak-controller config:', e);
            this._addDefaultPositions(listBox);
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

        return favorites;
    }

    _addDefaultPositions(listBox) {
        this._addPositionRow(listBox, 'sit', '170');
        this._addPositionRow(listBox, 'stand', '490');
    }

    _addPosition(listBox) {
        this._addPositionRow(listBox, '', '');
    }

    _addPositionRow(listBox, name, height) {
        const row = new Adw.ActionRow();

        // Name entry
        const nameEntry = new Gtk.Entry({
            text: name || '',
            placeholder_text: _('Position name (e.g. "sit")'),
            hexpand: true
        });

        // Height entry
        const heightEntry = new Gtk.Entry({
            text: height || '',
            placeholder_text: _('Height (mm)'),
            width_chars: 10
        });

        // Delete button
        const deleteButton = new Gtk.Button({
            icon_name: 'user-trash-symbolic',
            css_classes: ['destructive-action']
        });
        deleteButton.connect('clicked', () => {
            listBox.remove(row);
        });

        // Add widgets to row
        const box = new Gtk.Box({
            orientation: Gtk.Orientation.HORIZONTAL,
            spacing: 12,
            margin_top: 6,
            margin_bottom: 6,
            margin_start: 12,
            margin_end: 12
        });

        box.append(nameEntry);
        box.append(heightEntry);
        box.append(deleteButton);

        row.set_child(box);
        row._nameEntry = nameEntry;
        row._heightEntry = heightEntry;

        listBox.append(row);
    }

    _savePositions(listBox) {
        const configPath = this._getConfigPath();

        // Read existing config to preserve other settings
        let existingConfig = '';
        try {
            const file = Gio.File.new_for_path(configPath);
            const [success, contents] = file.load_contents(null);
            if (success) {
                existingConfig = new TextDecoder('utf-8').decode(contents);
            }
        } catch (e) {
            console.error('Error reading existing config:', e);
        }

        // Collect positions from UI
        const positions = [];
        let child = listBox.get_first_child();

        while (child) {
            if (child._nameEntry && child._heightEntry) {
                const name = child._nameEntry.text.trim();
                const height = child._heightEntry.text.trim();

                if (name && height) {
                    positions.push({name, height});
                }
            }
            child = child.get_next_sibling();
        }

        // Generate new YAML content
        const newConfig = this._updateYamlFavorites(existingConfig, positions);

        // Write config file
        try {
            // Ensure config directory exists
            const configDir = GLib.path_get_dirname(configPath);
            GLib.mkdir_with_parents(configDir, 0o755);

            const file = Gio.File.new_for_path(configPath);
            file.replace_contents(
                new TextEncoder().encode(newConfig),
                null,
                false,
                Gio.FileCreateFlags.REPLACE_DESTINATION,
                null
            );

            console.log('Saved positions to linak-controller config:', positions);

            // Show success message
            const toast = new Adw.Toast({
                title: _('Saved to linak-controller config'),
                timeout: 3
            });
            this.get_root().add_toast(toast);

        } catch (e) {
            console.error('Error saving config:', e);

            // Show error message
            const toast = new Adw.Toast({
                title: _('Error saving config: ') + e.message,
                timeout: 5
            });
            this.get_root().add_toast(toast);
        }
    }

    _updateYamlFavorites(existingConfig, positions) {
        const lines = existingConfig.split('\n');
        const newLines = [];
        let inFavoritesSection = false;
        let favoritesProcessed = false;

        for (const line of lines) {
            const trimmed = line.trim();

            if (trimmed === 'favourites:') {
                inFavoritesSection = true;
                newLines.push(line);

                // Add all favorite positions
                positions.forEach(pos => {
                    newLines.push(`  ${pos.name}: ${pos.height}`);
                });
                favoritesProcessed = true;
                continue;
            }

            if (inFavoritesSection) {
                // Skip existing favorite lines and stop when reaching next section
                if (trimmed && !line.startsWith('  ') && !line.startsWith('\t')) {
                    inFavoritesSection = false;
                    newLines.push(line);
                }
                // Skip lines that are part of the favorites section
                continue;
            }

            newLines.push(line);
        }

        // If no favorites section existed, add it at the end
        if (!favoritesProcessed) {
            if (newLines.length > 0 && newLines[newLines.length - 1].trim() !== '') {
                newLines.push('');
            }
            newLines.push('favourites:');
            positions.forEach(pos => {
                newLines.push(`  ${pos.name}: ${pos.height}`);
            });
        }

        return newLines.join('\n');
    }
}