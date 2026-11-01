// Automated presence/metadata checks complement, but do not replace, legal review.
const fs=require('node:fs');
const lock=require('../package-lock.json');
const allowed=new Set(['MIT','Apache-2.0','0BSD']);
const entries=Object.entries(lock.packages).filter(([name,pkg])=>name.includes('node_modules/')&&!pkg.dev);
const issues=[];
for(const [name,pkg] of entries){
  if(!allowed.has(pkg.license))issues.push(`Review runtime dependency licence: ${name} (${pkg.license||'missing'})`);
  if(!fs.existsSync(name))continue; // Platform-specific optional packages may not be installed on this host.
  const pkgName=name.slice(name.lastIndexOf('node_modules/')+13);
  // Native canvas packages ship binaries under the parent project's MIT licence.
  const noticeDir=/^@napi-rs\/canvas-/.test(pkgName)?'node_modules/@napi-rs/canvas':name;
  if(!fs.existsSync(noticeDir)||!fs.readdirSync(noticeDir).some(file=>/^(license|licence|copying|notice)(\.|$)/i.test(file)))issues.push(`Missing installed licence notice: ${name}`);
}
for(const file of ['src/fonts/courier-prime/OFL.txt','src/fonts/bebas-neue/OFL.txt','THIRD_PARTY_NOTICES.md','node_modules/electron/LICENSE'])if(!fs.existsSync(file))issues.push(`Missing notice: ${file}`);
if(issues.length){for(const issue of issues)console.error(issue);process.exit(1)}
console.log('Runtime licence metadata, installed licence texts, Electron and font notices checked; manual review still required.');
