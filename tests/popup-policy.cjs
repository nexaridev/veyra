const assert=require('node:assert/strict'),{separateWindow}=require('../src/popup-policy.cjs');
for(const details of [{disposition:'foreground-tab',features:''},{disposition:'background-tab',features:'noopener,noreferrer'},{disposition:'foreground-tab',features:'popup=no'}])assert.equal(separateWindow(details),false);
for(const details of [{disposition:'new-window',features:''},{disposition:'foreground-tab',features:'popup=yes'},{features:'width=640,height=720'},{features:'top=30,left=20'}])assert.equal(separateWindow(details),true);
assert.equal(separateWindow({features:''},true),true);console.log('PASS ordinary links, noopener, explicit popups and all-windows preference');
