const assert=require('node:assert/strict'),{Engine,LIMIT}=require('../src/game/engine.js');
const game=new Engine(()=>.5);game.step(.04,{x:1,y:1});assert(Math.abs(Math.hypot(game.player.x-240,game.player.y-300)-235*.04)<.001);
for(let i=0;i<100;i++)game.step(.04,{x:1,y:1});assert.equal(game.player.x,470);assert.equal(game.player.y,470);
game.reset();game.intermission=0;game.spawn=100;game.bullets=[{x:240,y:300,vx:0,vy:0,r:5,warm:0,age:0}];game.step(.01);assert.equal(game.lives,2);game.step(.01);assert.equal(game.lives,2);
game.invincible=0;game.step(.01,{dash:true});assert.equal(game.lives,2);assert(game.cooldown>1);const cooldown=game.cooldown;game.step(.01,{dash:true});assert(game.cooldown<cooldown);
game.reset();game.invincible=1e6;let maximum=0;for(let i=0;i<55000;i++){game.step(.04,{x:Math.sin(i*.01),y:Math.cos(i*.01)});maximum=Math.max(maximum,game.bullets.length);}assert(game.wave>100);assert(maximum<=LIMIT);assert(!game.dead);
game.wave=100000;game.time=game.duration-.01;game.intermission=0;const speed=game.speed;game.step(.04);assert.equal(game.wave,100001);assert(game.speed>speed);
game.reset();game.intermission=0;game.spawn=100;game.lives=1;game.bullets=[{x:240,y:300,vx:0,vy:0,r:5,warm:0,age:0}];game.step(.01);assert(game.dead);const frozen=game.elapsed;game.step(.04);assert.equal(game.elapsed,frozen);
console.log('PASS: movement, boundaries, hit grace, dash cooldown, 100+ waves, increasing high-wave difficulty, bounded bullets and game over');
