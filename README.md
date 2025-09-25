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

1. Clone or download this repository
2. Copy the extension to your extensions directory:
   ```bash
   cp -r linak-controller@pgentili.com ~/.local/share/gnome-shell/extensions/
   ```
3. Enable the extension:
   ```bash
   gnome-extensions enable linak-controller@pgentili.com
   ```
4. Restart GNOME Shell (Alt+F2, type 'r', press Enter on X11 or logout/login on Wayland)

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

## Development

### Testing
```bash
# View extension logs
journalctl -f -o cat /usr/bin/gnome-shell

# Test linak-controller integration
linak-controller --move-to sit
linak-controller --move-to stand
```

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

[Add your chosen license here]

## Acknowledgments

- [linak-controller](https://github.com/rhyst/linak-controller) - The underlying CLI tool for desk control
- GNOME Shell Extensions documentation