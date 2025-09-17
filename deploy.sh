#!/bin/bash

# QA Excellence Knowledge Base - Local Deployment Script

echo "🚀 Building QA Excellence Knowledge Base for GitHub Pages..."

# Navigate to website directory
cd website

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the site
echo "🏗️ Building Docusaurus site..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo "📁 Built files are in: website/build/"
    echo "🌐 To deploy to GitHub Pages, push to main branch"
    echo "🔗 Site will be available at: https://user.github.io/QA-SOB/"
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi