#!/bin/bash
# Voer dit eenmalig uit om de git repository te initialiseren

echo "📸 Photobooth repository initialiseren..."

git init
git add .
git commit -m "eerste commit: photobooth PWA met camera, strip, SumUp en AirPrint"

echo ""
echo "✅ Klaar! Voer nu uit:"
echo ""
echo "  git remote add origin https://github.com/JOUW_GEBRUIKERSNAAM/photobooth.git"
echo "  git push -u origin main"
echo ""
echo "Maak eerst een lege repository aan op github.com"
