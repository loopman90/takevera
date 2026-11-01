// Preserve icon representations while removing generated metadata from ICNS and embedded PNGs.
const fs=require('node:fs');
const {stripPngMetadata}=require('./strip-png-metadata.cjs');
const file=process.argv[2];if(!file)throw Error('Supply an ICNS file');
const data=fs.readFileSync(file);if(data.toString('ascii',0,4)!=='icns'||data.readUInt32BE(4)!==data.length)throw Error('Invalid ICNS');
const chunks=[];let offset=8;
while(offset+8<=data.length){const type=data.toString('ascii',offset,offset+4),length=data.readUInt32BE(offset+4);if(length<8||offset+length>data.length)throw Error('Invalid ICNS chunk');let payload=data.subarray(offset+8,offset+length);if(type!=='info'){if(payload.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))payload=stripPngMetadata(payload);const header=Buffer.alloc(8);header.write(type,0,4,'ascii');header.writeUInt32BE(payload.length+8,4);chunks.push(header,payload)}offset+=length}
if(offset!==data.length)throw Error('Truncated ICNS');const header=Buffer.alloc(8);header.write('icns');header.writeUInt32BE(8+chunks.reduce((n,x)=>n+x.length,0),4);fs.writeFileSync(file,Buffer.concat([header,...chunks]));
