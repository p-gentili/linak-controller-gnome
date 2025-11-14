# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a GNOME Shell extension for controlling IKEA Idasen desks via the `linak-controller` command-line tool. The extension provides a system tray indicator with a menu for quick access to favorite desk positions.

## Architecture

The extension follows the standard GNOME Shell extension structure and reads configuration directly from the linak-controller package:

- **Main Extension (`extension.js`)**: Contains the `LinakControllerExtension` class and `DeskIndicator` panel button
  - `DeskIndicator`: A panel menu button that displays favorite positions and handles desk movement
  - Reads favorite positions from `~/.config/linak-controller/config.yaml`
  - Executes `linak-controller --move-to <position_name>` subprocess calls using position names
  - Includes simple YAML parser for the favorites section
  - Provides refresh functionality to reload config changes

- **Configuration Source**: Uses linak-controller's YAML configuration file
  - Located at `~/.config/linak-controller/config.yaml`
  - Reads the `favourites:` section which contains `name: height` pairs
  - No extension-specific settings - fully relies on linak-controller configuration

- **Styling (`stylesheet.css`)**: Basic CSS for panel icon and menu styling

## Project Structure

Extension files are in the project root:
- `extension.js` - Main extension code
- `prefs.js` - Preferences window
- `metadata.json` - Extension metadata (UUID: linak-controller@pgentili.com)
- `stylesheet.css` - Styling
- `LICENSE` - MIT License
- `Makefile` - Build and install automation

## Development Commands

### Install Extension
```bash
# Install extension to user directory using Makefile
make install

# Enable extension
gnome-extensions enable linak-controller@pgentili.com

# Disable extension
gnome-extensions disable linak-controller@pgentili.com

# Uninstall extension
make uninstall
```

### Building for Distribution
```bash
# Create zip file for upload to extensions.gnome.org
make zip

# Clean build artifacts
make clean
```

### Testing
```bash
# View extension logs
journalctl -f -o cat /usr/bin/gnome-shell

# Test linak-controller integration with position names
linak-controller --move-to sit
linak-controller --move-to stand

# Test with specific height (mm)
linak-controller --move-to 1000

# Check current linak-controller config
cat ~/.config/linak-controller/config.yaml
```

### Development Workflow
1. Edit source files in the project root (`extension.js`, `prefs.js`, etc.)
2. Install updated extension: `make install`
3. Restart GNOME Shell: `Alt+F2`, type `r`, press Enter (X11) or logout/login (Wayland)
4. Check logs for errors: `journalctl -f -o cat /usr/bin/gnome-shell`
5. Use the "Refresh" menu item to reload config changes without restarting

## Dependencies

- **Runtime**: `linak-controller` command must be installed and in PATH
- **Configuration**: `~/.config/linak-controller/config.yaml` must exist with `favourites:` section
- **GNOME Shell**: Compatible with versions 42-47

## Key Implementation Details

- Configuration is read directly from linak-controller's YAML config file
- Simple YAML parser extracts only the `favourites:` section
- Favorite positions are passed by name to `linak-controller --move-to <name>`
- Error handling includes user notifications via `Main.notify()`
- Extension lifecycle is simplified without settings management
- Refresh functionality allows config reloading without shell restart