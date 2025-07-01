const fs = require('fs-extra');
const { execSync } = require('child_process');
const glob = require('glob');
const path = require('path');

// Configuration
const SOURCE_DIR = './';
const BUILD_DIR = './build';
const FILES_TO_COPY = [
  'manifest.json',
  'privacy-policy.md',
  'icons/*.png'
];

// Minification functions
async function minifyJsFiles() {
  const jsFiles = glob.sync(`${SOURCE_DIR}/*.js`);
  
  for (const file of jsFiles) {
    const fileName = path.basename(file);
    const outputPath = path.join(BUILD_DIR, fileName);
    
    try {
      execSync(`terser "${file}" -o "${outputPath}" --compress --mangle`);
      console.log(`Minified JS: ${fileName}`);
    } catch (error) {
      console.error(`Error minifying ${file}:`, error);
      // Copy original as fallback
      fs.copyFileSync(file, outputPath);
    }
  }
}

async function minifyCssFiles() {
  const cssFiles = glob.sync(`${SOURCE_DIR}/*.css`);
  
  for (const file of cssFiles) {
    const fileName = path.basename(file);
    const outputPath = path.join(BUILD_DIR, fileName);
    
    try {
      execSync(`cleancss -o "${outputPath}" "${file}"`);
      console.log(`Minified CSS: ${fileName}`);
    } catch (error) {
      console.error(`Error minifying ${file}:`, error);
      // Copy original as fallback
      fs.copyFileSync(file, outputPath);
    }
  }
}

async function copyNonMinifiableFiles() {
  for (const pattern of FILES_TO_COPY) {
    const files = glob.sync(pattern);
    
    for (const file of files) {
      const dest = path.join(BUILD_DIR, file);
      await fs.ensureDir(path.dirname(dest));
      await fs.copy(file, dest);
      console.log(`Copied: ${file}`);
    }
  }
}

async function cleanBuildDirectory() {
  await fs.remove(BUILD_DIR);
  await fs.ensureDir(BUILD_DIR);
}

async function build() {
  console.log('Starting minification process...');
  await cleanBuildDirectory();
  
  console.log('Minifying JS files...');
  await minifyJsFiles();
  
  console.log('Minifying CSS files...');
  await minifyCssFiles();
  
  console.log('Copying other files...');
  await copyNonMinifiableFiles();
  
  console.log('Build completed successfully!');
  console.log(`Production files are in: ${path.resolve(BUILD_DIR)}`);
}

build().catch(console.error);