// Remove ancillary metadata without changing PNG pixel data.
const fs = require('node:fs');
const signature = Buffer.from([137,80,78,71,13,10,26,10]);
function stripPngMetadata(data) {
  if (!data.subarray(0,8).equals(signature)) throw new Error('Expected PNG data');
  const output=[signature], discard=new Set(['eXIf','tEXt','zTXt','iTXt','tIME','iCCP']);
  let offset=8, ended=false;
  while (offset+12<=data.length) {
    const length=data.readUInt32BE(offset), end=offset+length+12;
    if (end>data.length) throw new Error('Truncated PNG chunk');
    const type=data.toString('ascii',offset+4,offset+8);
    if (!discard.has(type)) output.push(data.subarray(offset,end));
    offset=end;
    if (type==='IEND') { ended=true; break; }
  }
  if (!ended||offset!==data.length) throw new Error('Invalid PNG structure');
  return Buffer.concat(output);
}
module.exports={stripPngMetadata};
if (require.main===module) for (const name of process.argv.slice(2)) fs.writeFileSync(name,stripPngMetadata(fs.readFileSync(name)));
