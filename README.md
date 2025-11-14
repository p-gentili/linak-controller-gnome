# Linak Desk Controller - GNOME Shell Extension

A GNOME Shell extension for controlling IKEA Idasen standing desks via the [linak-controller](https://github.com/rhyst/linak-controller) command-line tool.

## Prerequisites

**⚠️ Important**: This extension requires the [linak-controller](https://github.com/rhyst/linak-controller) Python package to be installed and available in your PATH.

Install it with:
```bash
pip install linak-controller
```

Verify installation:
```bash
linak-controller --help
```

## Features

- System panel indicator for quick access to desk positions
- Read favorite positions directly from linak-controller configuration
- GUI preferences for managing desk positions
- Refresh functionality to reload config changes
- Native GNOME integration with Adwaita styling

## Requirements

- GNOME Shell 42-46
- [linak-controller](https://github.com/rhyst/linak-controller) Python package installed and in PATH
- Existing linak-controller configuration at `~/.config/linak-controller/config.yaml`

## Installation

### From Source

1. Clone this repository:
   ```bash
   git clone https://github.com/p-gentili/linak-controller-gnome.git
   cd linak-controller-gnome
   ```

2. Install the extension:
   ```bash
   make install
   ```

3. Enable the extension:
   ```bash
   gnome-extensions enable linak-controller@pgentili.com
   ```

4. Restart GNOME Shell (Alt+F2, type 'r', press Enter on X11 or logout/login on Wayland)

### From extensions.gnome.org

Once published, you can install directly from [extensions.gnome.org](https://extensions.gnome.org) through your browser or GNOME Extensions app.

## Usage

### Quick Access
- Click the desk icon in the system panel
- Select your desired position from the menu
- Use "Refresh" to reload config changes

### Managing Positions
- Right-click the desk icon and select "Preferences"
- Add, edit, or remove favorite positions
- Click "Save to linak-controller config" to apply changes

### Configuration
The extension reads positions from your existing linak-controller configuration file at `~/.config/linak-controller/config.yaml`. Example:

```yaml
mac_address: F9:9F:47:7E:55:34
scan_timeout: 5
connection_timeout: 5
adapter_name: hci0
favourites:
  sit: 170
  stand: 490
  focus: 300
```

## Building

To package the extension for upload to extensions.gnome.org:

```bash
make zip
```

This creates `linak-controller@pgentili.com.zip` ready for upload.

### Available Make Targets

- `make install` - Install extension locally for testing
- `make uninstall` - Remove installed extension
- `make zip` - Build zip file for distribution
- `make clean` - Remove build artifacts

## Development

### Local Testing

1. Make your changes to the source files
2. Install the updated extension:
   ```bash
   make install
   ```
3. Restart GNOME Shell (Alt+F2, type 'r' on X11 or logout/login on Wayland)
4. View logs:
   ```bash
   journalctl -f -o cat /usr/bin/gnome-shell
   ```

### Testing linak-controller Integration

```bash
# Test linak-controller commands
linak-controller --move-to sit
linak-controller --move-to stand

# Check current config
cat ~/.config/linak-controller/config.yaml
```

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [linak-controller](https://github.com/rhyst/linak-controller) - The underlying CLI tool for desk control
- GNOME Shell Extensions documentation