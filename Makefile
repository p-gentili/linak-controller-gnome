# GNOME Shell Extension Makefile

UUID = linak-controller@pgentili.com
EXTENSION_FILES = extension.js prefs.js metadata.json stylesheet.css LICENSE
ZIP_FILE = $(UUID).zip
INSTALL_DIR = $(HOME)/.local/share/gnome-shell/extensions/$(UUID)

.PHONY: all zip clean install uninstall

all: zip

# Build the extension zip file for upload to extensions.gnome.org
zip: clean
	@echo "Building $(ZIP_FILE)..."
	@zip -r $(ZIP_FILE) $(EXTENSION_FILES)
	@echo "Extension packaged as $(ZIP_FILE)"
	@echo "Ready for upload to https://extensions.gnome.org"

# Install the extension locally for testing
install:
	@echo "Installing extension to $(INSTALL_DIR)..."
	@mkdir -p $(INSTALL_DIR)
	@cp $(EXTENSION_FILES) $(INSTALL_DIR)/
	@echo "Extension installed. Enable it with:"
	@echo "  gnome-extensions enable $(UUID)"
	@echo "Then restart GNOME Shell (Alt+F2, type 'r' on X11 or logout/login on Wayland)"

# Uninstall the extension
uninstall:
	@echo "Uninstalling extension..."
	@rm -rf $(INSTALL_DIR)
	@echo "Extension uninstalled"

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	@rm -f $(ZIP_FILE)
	@echo "Clean complete"
