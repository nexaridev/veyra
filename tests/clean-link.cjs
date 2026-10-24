const assert=require('node:assert/strict'),{cleanLink}=require('../src/clean-link.cjs');
assert.deepEqual(cleanLink('https://example.com/p?a=%20&UTM_source=x&a=two+words&fbclid=x#section'),{url:'https://example.com/p?a=%20&a=two+words#section',removed:2});
assert.equal(cleanLink('https://example.com/?code=abc%2F%2B&state=a+b&utm_medium=email').url,'https://example.com/?code=abc%2F%2B&state=a+b');
assert.equal(cleanLink('https://example.com/?ref=friend&tag=store&tracking=needed').removed,0);
assert.equal(cleanLink('https://example.com/?utm_source=x&X-Amz-Signature=abc').removed,0);
assert.equal(cleanLink('https://example.com/#?utm_source=fragment').removed,0);
assert.equal(cleanLink('https://example.com/?%75tm_source=x').url,'https://example.com/');
assert.throws(()=>cleanLink('file:///private.txt'));
console.log('PASS clean links: exact functional encoding, OAuth parameters, signed links, fragments and scheme restrictions');
