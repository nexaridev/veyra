'use strict';
const assert=require('node:assert/strict');
const session=require('../src/session-state.cjs');

const first={id:1,sessionId:'11111111-1111-4111-8111-111111111111',url:'https://example.com/page',mode:'private',sleeping:true,pinned:true,zoomLevel:1.5,muted:true};
const second={id:2,sessionId:'22222222-2222-4222-8222-222222222222',url:first.url,mode:'google',sleeping:false};
const serialized=session.serialize([first,second],2);
assert.equal(serialized.selectedSessionId,second.sessionId,'selected duplicate URL is identified by tab ID');
assert.equal(serialized.tabs[0].sleeping,true);
assert.equal(serialized.tabs[1].sleeping,false);
assert.equal(serialized.tabs[0].pinned,true);
assert.equal(serialized.tabs[0].zoomLevel,1.5);
const temporary={id:3,sessionId:'33333333-3333-4333-8333-333333333333',url:'https://private.example',mode:'temporary'};
const privateOnly=session.serialize([first,temporary],3);
assert.equal(privateOnly.selectedSessionId,null,'temporary tabs never become the selected persistent tab');
assert.equal(privateOnly.selectedURL,null,'temporary URLs are not written into the persistent session');
const restored=session.restore(serialized,url=>/^https:\/\//.test(url));
assert.equal(restored.selectedSessionId,second.sessionId);
assert.equal(restored.rows[0].sleeping,true);
assert.equal(restored.rows[1].sleeping,false);
assert.equal(restored.rows[0].muted,true);
assert.equal(restored.rows[0].pinned,true);
const legacy=session.restore({tabs:[{url:first.url,mode:'private'}],selectedURL:first.url},()=>true);
assert.equal(legacy.rows.length,1);
assert.equal(legacy.selectedSessionId,null);
assert.equal(session.normalizePageURL('http://example.com'),null);
assert.equal(session.normalizePageURL('https://user:pass@example.com'),null);

const fields=session.normalizeForms('https://example.com/login',[
 {index:0,kind:'input',type:'text',id:'query',name:'query',value:'draft'},
 {index:1,kind:'input',type:'password',name:'password',value:'secret'},
 {index:2,kind:'input',type:'text',name:'otp_code',value:'123456'},
 {index:3,kind:'input',type:'text',name:'card_number',value:'4111111111111111'},
 {index:4,kind:'textarea',value:'multiline\ndraft'},
 {index:5,kind:'editable',value:'editable draft'},
 {index:6,kind:'input',type:'email',autocomplete:'email',value:'person@example.com'}
]);
assert.deepEqual(fields.fields.map(field=>field.index),[0,4,5,6],'safe form drafts are retained; secrets and payments are excluded');
assert.equal(session.normalizeForms('http://example.com',fields.fields),null);
assert.equal(session.normalizeForms('https://example.com',Array.from({length:129},(_,index)=>({index,kind:'input',type:'text',value:'x'})).concat([{index:129,kind:'input',type:'text',value:'overflow'}])).fields.length,128);
console.log('session state tests passed');
