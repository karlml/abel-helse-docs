const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8888;
const DIST_DIR = 'dist';

// Simple static file server
function createServer() {
  return http.createServer((req, res) => {
    let filePath = req.url === '/' ? '/index.html' : req.url;
    filePath = path.join(__dirname, filePath);
    
    const ext = path.extname(filePath);
    const contentTypes = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml',
    };
    
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(404);
        res.end('Not Found');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'text/plain' });
      res.end(content);
    });
  });
}

async function prerender() {
  console.log('🚀 Starting prerender process...');
  
  // Create dist directory
  if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR, { recursive: true });
  }
  
  // Start local server
  const server = createServer();
  await new Promise(resolve => server.listen(PORT, resolve));
  console.log(`📡 Server running on http://localhost:${PORT}`);
  
  // Launch Puppeteer with robust options
  console.log('🌐 Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-extensions'
    ],
    timeout: 60000,
    protocolTimeout: 120000
  });
  
  const page = await browser.newPage();
  
  // Set viewport for consistent rendering
  await page.setViewport({ width: 1280, height: 800 });
  
  console.log('📄 Loading page...');
  await page.goto(`http://localhost:${PORT}`, {
    waitUntil: 'networkidle0',
    timeout: 90000
  });
  
  // Wait for Tailwind CSS to be fully applied
  console.log('⏳ Waiting for styles to load...');
  await page.waitForFunction(() => {
    return document.querySelector('body') && 
           getComputedStyle(document.body).fontFamily.includes('Outfit');
  }, { timeout: 30000 }).catch(() => {
    console.log('⚠️ Font check timed out, continuing anyway...');
  });
  
  // Additional wait for any animations/transitions
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Extract all computed styles and inline them
  console.log('🎨 Extracting and inlining CSS...');
  const inlinedCSS = await page.evaluate(() => {
    const styles = [];
    
    // Get all stylesheets
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) {
          styles.push(rule.cssText);
        }
      } catch (e) {
        // Cross-origin stylesheets can't be read, skip them
      }
    }
    
    return styles.join('\n');
  });

  // Get the fully rendered HTML
  console.log('📝 Extracting rendered HTML...');
  let html = await page.content();
  
  // Create fully static version:
  // 1. Remove the Tailwind CDN script
  // 2. Remove the tailwind.config script
  // 3. Inject the computed CSS
  
  const staticHtml = html
    // Add prerendered meta tag
    .replace('</head>', '  <meta name="prerendered" content="true">\n</head>')
    // Remove Tailwind CDN script
    .replace(/<script src="https:\/\/cdn\.tailwindcss\.com"><\/script>\s*/g, '')
    // Remove tailwind.config script block
    .replace(/<script>\s*tailwind\.config\s*=[\s\S]*?<\/script>\s*/g, '')
    // Inject computed CSS before closing head
    .replace('</head>', `<style id="prerendered-styles">\n${inlinedCSS}\n</style>\n</head>`);
  
  // Write prerendered HTML
  const outputPath = path.join(DIST_DIR, 'index.html');
  fs.writeFileSync(outputPath, staticHtml);
  console.log(`✅ Prerendered HTML saved to ${outputPath}`);
  
  // Copy any additional assets if they exist
  const assetDirs = ['images', 'assets', 'static'];
  for (const dir of assetDirs) {
    if (fs.existsSync(dir)) {
      copyDir(dir, path.join(DIST_DIR, dir));
      console.log(`📁 Copied ${dir} to dist/`);
    }
  }
  
  // Create a text-only version for better NotebookLM ingestion
  console.log('📄 Extracting text content...');
  const textContent = await page.evaluate(() => {
    const sections = [];
    sections.push('# ' + document.title);
    sections.push('');
    
    document.querySelectorAll('section, article, main').forEach(section => {
      const headings = section.querySelectorAll('h1, h2, h3, h4, h5, h6');
      headings.forEach(h => {
        const level = parseInt(h.tagName[1]);
        sections.push('#'.repeat(level) + ' ' + h.textContent.trim());
      });
      
      section.querySelectorAll('p, li').forEach(el => {
        const text = el.textContent.trim();
        if (text && text.length > 10) {
          if (el.tagName === 'LI') {
            sections.push('- ' + text);
          } else {
            sections.push(text);
          }
        }
      });
      sections.push('');
    });
    
    return sections.join('\n');
  });
  
  const textPath = path.join(DIST_DIR, 'content.txt');
  fs.writeFileSync(textPath, textContent);
  console.log(`📄 Text content saved to ${textPath}`);
  
  // Create markdown version
  console.log('📝 Generating markdown...');
  const markdownContent = await page.evaluate(() => {
    const md = [];
    md.push('# ' + document.title);
    md.push('');
    md.push('---');
    md.push('');
    
    document.querySelectorAll('section').forEach(section => {
      const heading = section.querySelector('h1, h2, h3');
      if (heading) {
        md.push('## ' + heading.textContent.trim());
        md.push('');
      }
      
      section.querySelectorAll('p').forEach(p => {
        const text = p.textContent.trim();
        if (text.length > 5) {
          md.push(text);
          md.push('');
        }
      });
      
      section.querySelectorAll('ul, ol').forEach(list => {
        list.querySelectorAll('li').forEach(li => {
          md.push('- ' + li.textContent.trim());
        });
        md.push('');
      });
      
      section.querySelectorAll('table').forEach(table => {
        const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent.trim());
        if (headers.length > 0) {
          md.push('| ' + headers.join(' | ') + ' |');
          md.push('| ' + headers.map(() => '---').join(' | ') + ' |');
        }
        table.querySelectorAll('tbody tr').forEach(row => {
          const cells = Array.from(row.querySelectorAll('td')).map(td => td.textContent.trim());
          md.push('| ' + cells.join(' | ') + ' |');
        });
        md.push('');
      });
    });
    
    return md.join('\n');
  });
  
  const mdPath = path.join(DIST_DIR, 'content.md');
  fs.writeFileSync(mdPath, markdownContent);
  console.log(`📝 Markdown content saved to ${mdPath}`);
  
  // Cleanup
  await browser.close();
  server.close();
  
  console.log('');
  console.log('✨ Prerender complete!');
  console.log(`   📁 Output directory: ${DIST_DIR}/`);
  console.log('   📄 index.html - Full prerendered page (CSS inlined, no JS required)');
  console.log('   📄 content.txt - Plain text version');
  console.log('   📄 content.md - Markdown version');
}

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

prerender().catch(err => {
  console.error('❌ Prerender failed:', err);
  process.exit(1);
});
