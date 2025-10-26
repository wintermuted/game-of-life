#!/bin/bash

# This script updates the README with the screenshot

README_FILE="README.md"
SCREENSHOT_PATH="screenshots/app-screenshot.png"

# Check if the Screenshot section already exists
if grep -q "## Screenshot" "$README_FILE"; then
  echo "Screenshot section exists, updating..."
  # Use awk to replace the screenshot section
  awk '
    /## Screenshot/ {
      print "## Screenshot"
      print ""
      print "![App Screenshot](screenshots/app-screenshot.png)"
      print ""
      # Skip existing screenshot content until next section or non-empty line
      while (getline > 0) {
        if ($0 ~ /^## [^#]/ || ($0 !~ /^!\[App Screenshot\]/ && $0 !~ /^$/ && NF > 0)) {
          print $0
          break
        }
      }
      next
    }
    { print }
  ' "$README_FILE" > "$README_FILE.tmp"
  mv "$README_FILE.tmp" "$README_FILE"
else
  echo "Screenshot section does not exist, adding..."
  # Add screenshot section after the badge line
  awk '
    /^\[!\[Unit Tests\]/ {
      print
      print ""
      print "## Screenshot"
      print ""
      print "![App Screenshot](screenshots/app-screenshot.png)"
      next
    }
    { print }
  ' "$README_FILE" > "$README_FILE.tmp"
  mv "$README_FILE.tmp" "$README_FILE"
fi

echo "README updated successfully!"
