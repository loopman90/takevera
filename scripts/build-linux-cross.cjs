/* Cross-build a portable Linux x64 test archive from the official Electron ZIP. */
const {execFileSync}=require('node:child_process');
const crypto=require('node:crypto');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
if(!['darwin','linux'].includes(process.platform))throw new Error('Requires macOS or Linux');
const project=path.resolve(__dirname,'..'),info=require(path.join(project,'package.json'));
const electron=require(path.join(project,'node_modules','electron','package.json'));
const checksums=require(path.join(project,'node_modules','electron','checksums.json'));
const source=process.env.TAKEVERA_ELECTRON_LINUX_ZIP,npmCli=process.env.npm_execpath;
const expected=checksums[`electron-v${electron.version}-linux-x64.zip`];
if(!source||!fs.existsSync(source)||!expected)throw new Error('Set TAKEVERA_ELECTRON_LINUX_ZIP to the matching official Electron Linux x64 ZIP');
if(!npmCli||!fs.existsSync(npmCli))throw new Error('Run this builder using npm');
const hash=crypto.createHash('sha256'),fd=fs.openSync(source,'r');try{const buffer=Buffer.allocUnsafe(1024*1024);let n;while((n=fs.readSync(fd,buffer,0,buffer.length,null))>0)hash.update(buffer.subarray(0,n))}finally{fs.closeSync(fd)}
if(hash.digest('hex')!==expected)throw new Error('Electron Linux archive checksum mismatch');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'takevera-linux-cross-'));fs.mkdirSync(path.join(project,'dist'),{recursive:true});const output=fs.mkdtempSync(path.join(project,'dist','linux-cross-'));
const call=(file,args,options={})=>execFileSync(file,args,{stdio:'inherit',...options});
const copy=(from,to)=>fs.cpSync(from,to,{recursive:true,dereference:false,verbatimSymlinks:true});
try{
 const production=path.join(temp,'production');fs.mkdirSync(production);
 for(const name of ['package.json','package-lock.json'])fs.copyFileSync(path.join(project,name),path.join(production,name));
 call(process.execPath,[npmCli,'ci','--omit=dev','--ignore-scripts','--no-fund','--os=linux','--cpu=x64'],{cwd:production});
 const dirname='Takevera-linux-x64',bundle=path.join(temp,dirname);fs.mkdirSync(bundle);call('unzip',['-q',source,'-d',bundle]);fs.renameSync(path.join(bundle,'electron'),path.join(bundle,'takevera'));
 const app=path.join(bundle,'resources','app');fs.mkdirSync(app,{recursive:true});
 for(const name of ['src','collaboration','locales'])copy(path.join(project,name),path.join(app,name));fs.mkdirSync(path.join(app,'docs'));
 for(const name of ['USER_GUIDE_NL.md','USER_GUIDE_EN.md'])fs.copyFileSync(path.join(project,'docs',name),path.join(app,'docs',name));
 copy(path.join(production,'node_modules'),path.join(app,'node_modules'));fs.rmSync(path.join(app,'node_modules','.bin'),{recursive:true,force:true});
 fs.writeFileSync(path.join(app,'package.json'),JSON.stringify({name:info.name,productName:info.build.productName,version:info.version,main:info.main,license:info.license,dependencies:info.dependencies},null,2)+'\n');
 for(const name of ['LICENSE','THIRD_PARTY_NOTICES.md'])fs.copyFileSync(path.join(project,name),path.join(app,name));
 fs.copyFileSync(path.join(project,'src','assets','takevera-logo.png'),path.join(bundle,'takevera.png'));fs.copyFileSync(path.join(project,'docs','LINUX_TEST_NL.txt'),path.join(bundle,'LEESMIJ-LINUX.txt'));
 const archive=path.join(output,`Takevera-${info.version}-linux-x64-experimental.tar.gz`);call('tar',['-czf',archive,'-C',temp,dirname]);
 const digest=crypto.createHash('sha256').update(fs.readFileSync(archive)).digest('hex');fs.writeFileSync(archive+'.sha256',`${digest}  ${path.basename(archive)}\n`);
 console.log(`Portable Linux test archive: ${archive}\nSHA-256: ${digest}\nCross-built; not tested on Linux or packaged as an installer.`);
}finally{fs.rmSync(temp,{recursive:true,force:true})}
