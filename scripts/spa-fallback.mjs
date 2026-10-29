// GitHub Pages serves 404.html for any address it does not recognise, such as
// /business/123. Making 404.html a copy of index.html lets the app's own router
// open the right page instead of GitHub showing "Page not found".
import { copyFileSync, writeFileSync } from 'node:fs';

copyFileSync('dist/index.html', 'dist/404.html');
writeFileSync('dist/.nojekyll', '');
console.log('Added 404.html and .nojekyll for GitHub Pages');
