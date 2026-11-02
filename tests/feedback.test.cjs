'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {buildFeedbackHtml,validateResponse}=require('../src/feedback-export.cjs');

test('feedback HTML embeds script as data and has no network endpoints',()=>{
  const html=buildFeedbackHtml({projectId:'project_1',title:'Demo',scenes:[{id:'scene_1',heading:'INT. TEST',text:'</script><script>alert(1)</script>'}]});
  assert.ok(!html.includes('</script><script>alert(1)</script>'));
  assert.ok(html.includes('\\u003c/script>'));
  assert.match(html,/default-src 'none'/);
  assert.doesNotMatch(html,/https?:\/\//);
});
test('feedback validation rejects malformed and oversized responses',()=>{
  const valid={format:'takevera-feedback-response',version:1,projectId:'project_1',comments:[{sceneId:'scene_1',author:' Reader ',text:' Useful comment '}]};
  assert.deepEqual(validateResponse(valid).comments,[{sceneId:'scene_1',author:'Reader',text:'Useful comment'}]);
  assert.throws(()=>validateResponse({...valid,projectId:'../wrong'}));
  assert.throws(()=>validateResponse({...valid,comments:[{sceneId:'scene_1',author:'',text:'x'.repeat(5001)}]}));
  assert.throws(()=>buildFeedbackHtml({projectId:'p',title:'x',scenes:[{id:'same',heading:'x',text:'a'},{id:'same',heading:'y',text:'b'}]}));
});
