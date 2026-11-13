const assert=require('node:assert/strict'),crypto=require('node:crypto'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {PasswordVault}=require('../src/vault.cjs');
const root=fs.mkdtempSync(path.join(os.tmpdir(),'veyra-card-vault-')),file=path.join(root,'vault.json');
const storage={isEncryptionAvailable:()=>true,getSelectedStorageBackend:()=> 'test',encryptString:value=>Buffer.from(value),decryptString:value=>value.toString('utf8')};
(async()=>{
 const vault=new PasswordVault(file,storage);await vault.unlock('Correct Horse Battery Staple',true);
 vault.save({origin:'https://example.com',username:'user',password:'secret'});
 const card={holder:'Test Holder',number:'4111 1111 1111 1111',month:12,year:new Date().getFullYear()+2};
 const id=vault.saveCard(card);assert.deepEqual(vault.listCards(),[{id,holder:'Test Holder',last4:'1111',month:12,year:card.year,updated:vault.getCard(id).updated}]);
 assert.equal(vault.list().length,1);assert.equal(vault.getCard(id).number,'4111111111111111');assert.throws(()=>vault.get(id));
 assert.throws(()=>vault.saveCard({...card,number:'4111111111111112'}),/проверку/i);
 assert.throws(()=>vault.saveCard({...card,month:13}),/срок действия/i);
 assert.equal(fs.readFileSync(file,'utf8').includes('4111111111111111'),false);
 vault.lock();await vault.unlock('Correct Horse Battery Staple');assert.equal(vault.listCards()[0].last4,'1111');assert.equal(vault.getCard(id).number,'4111111111111111');
 vault.remove(id);assert.equal(vault.listCards().length,0);assert.equal(vault.list().length,1);vault.lock();fs.rmSync(root,{recursive:true,force:true});
 console.log('PASS: card PAN stored inside encrypted vault, masked listing, Luhn/expiry validation, no CVV field, lock/reopen persistence, separate password records');
})().catch(error=>{console.error(error);process.exitCode=1});
