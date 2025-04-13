.PHONY: all clean

all: compile

compile: schemas/gschemas.compiled
	@echo "GSettings schema compiled successfully!"

schemas/gschemas.compiled: schemas/org.gnome.shell.extensions.workspace-overlay.gschema.xml
	@echo "Compiling GSettings schema..."
	cd schemas && glib-compile-schemas .

clean:
	@echo "Cleaning compiled schemas..."
	rm -f schemas/gschemas.compiled