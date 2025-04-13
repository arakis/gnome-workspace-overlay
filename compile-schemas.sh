#!/bin/bash

# Script to compile the GSettings schema for workspace-overlay extension

echo "Compiling GSettings schema..."
cd "$(dirname "$0")"

if [ -d "schemas" ]; then
    cd schemas
    glib-compile-schemas .
    echo "Schema compiled successfully!"
else
    echo "Error: schemas directory not found!"
    exit 1
fi 