import {readFile,stat,readdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url)),out=path.join(root,'dist');
const config=JSON.parse(await readFile(path.join(root,'site-config.json'),'utf8'));
const pkg=JSON.parse(await readFile(path.join(root,'..','package.json'),'utf8'));
if(config.version!==pkg.version)throw Error('Website and application versions differ');
if(config.releasePublished&&!config.releaseUrl)throw Error('A published release needs an approved releases URL');
const expected=['','features','screenshots','download','docs','getting-started','roadmap','changelog','contributing','faq'];let linkCount=0;
for(const page of expected){const dir=path.join(out,page),html=await readFile(path.join(dir,'index.html'),'utf8');if(!html.includes('<html lang="en">')||!html.includes('<meta name="description"')||!html.includes('<main id="main">'))throw Error(`Missing page metadata or structure: ${page||'home'}`);for(const m of html.matchAll(/(?:href|src)="([^"]+)"/g)){const href=m[1];if(/^(?:https?:|mailto:|#)/.test(href))continue;const target=path.resolve(dir,href.split('#')[0]);if(!target.startsWith(out+path.sep)&&target!==out)throw Error('Link escapes site root');let info;try{info=await stat(target)}catch{throw Error(`Broken local link: ${page||'home'} → ${href}`)}if(info.isDirectory())await stat(path.join(target,'index.html'));linkCount++}}
for(const file of ['projects.png','script.png','shotlist.png','lighting.png','script-dark.png','help.png']){const bytes=await readFile(path.join(out,'assets','screenshots',file));if(bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw Error(`Invalid PNG: ${file}`);let offset=8,ended=false;while(offset+12<=bytes.length){const size=bytes.readUInt32BE(offset),type=bytes.toString('ascii',offset+4,offset+8);if(offset+size+12>bytes.length)throw Error(`Invalid PNG chunk: ${file}`);if(['eXIf','tEXt','zTXt','iTXt','tIME','iCCP'].includes(type))throw Error(`Review screenshot metadata: ${file}`);offset+=size+12;if(type==='IEND'){ended=true;break}}if(!ended||offset!==bytes.length)throw Error(`Truncated PNG: ${file}`)}
const source=await readdir(path.join(root,'assets','screenshots'));if(source.length!==6)throw Error('Review screenshot list before deployment');
console.log(`Checked ${expected.length} pages, ${linkCount} local references, version and six screenshots.`);
