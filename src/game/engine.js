(function (host) {
 'use strict';
 const SIZE = 480, LIMIT = 360;
 class Engine {
  constructor(random = Math.random) { this.random = random; this.reset(); }
  reset() { this.wave = 1; this.lives = 3; this.time = 0; this.elapsed = 0; this.intermission = 1.5; this.spawn = 0; this.shots = 0; this.bullets = []; this.player = {x:240,y:300}; this.invincible = 0; this.dash = 0; this.cooldown = 0; this.dead = false; }
  get duration() { return 12 + Math.min(10, this.wave * .25); }
  get speed() { return 90 + 29 * Math.log2(this.wave + 1); }
  add(x,y,vx,vy,r = 5,warm = .55) { if (this.bullets.length < LIMIT) this.bullets.push({x,y,vx,vy,r,warm,age:0}); }
  aimed(x,y,speed = this.speed) { const dx=this.player.x-x,dy=this.player.y-y,l=Math.hypot(dx,dy)||1; this.add(x,y,dx/l*speed,dy/l*speed); }
  pattern() {
   const n=this.wave, s=this.speed, k=this.shots++, kind=(n-1)%6, r=this.random;
   if(kind===0){const edge=k%4,t=30+r()*420; this.aimed(edge===0?0:edge===1?480:t,edge===2?0:edge===3?480:t);}
   else if(kind===1){const x=45+r()*390,y=20,count=5+Math.min(7,Math.floor(n/4));for(let i=0;i<count;i++){const a=Math.PI*.15+Math.PI*.7*i/(count-1);this.add(x,y,Math.cos(a)*s,Math.sin(a)*s);}}
   else if(kind===2){const gap=60+r()*360,horizontal=k%2===0;for(let t=12;t<480;t+=29)if(Math.abs(t-gap)>55){if(horizontal)this.add(t,0,0,s*.82,5,.8);else this.add(0,t,s*.82,0,5,.8);}}
   else if(kind===3){const angle=k*.49;for(let i=0;i<3;i++){const a=angle+i*Math.PI*2/3;this.add(240,30,Math.cos(a)*s,Math.sin(a)*s,5,.7);}}
   else if(kind===4){const x=k%2?0:480,y=30+r()*420;this.aimed(x,y,s);this.add(x,y,(k%2?1:-1)*s*.8,s*.45);this.add(x,y,(k%2?1:-1)*s*.8,-s*.45);}
   else {const count=6+Math.min(8,Math.floor(n/5)),x=k%2?35:445,y=35;for(let i=0;i<count;i++){const a=i*Math.PI*2/count+k*.21;this.add(x,y,Math.cos(a)*s,Math.sin(a)*s,5,.7);}}
  }
  step(dt,input={}) {
   if(this.dead)return;dt=Math.max(0,Math.min(.04,dt));this.elapsed+=dt;this.cooldown=Math.max(0,this.cooldown-dt);this.invincible=Math.max(0,this.invincible-dt);this.dash=Math.max(0,this.dash-dt);
   let dx=Number(input.x)||0,dy=Number(input.y)||0,len=Math.hypot(dx,dy);if(len>1){dx/=len;dy/=len;}
   if(input.dash&&this.cooldown===0){this.dash=.16;this.invincible=Math.max(this.invincible,.18);this.cooldown=1.8;}
   const speed=this.dash>0?640:input.slow?125:235;
   this.player.x=Math.max(10,Math.min(470,this.player.x+dx*speed*dt));this.player.y=Math.max(10,Math.min(470,this.player.y+dy*speed*dt));
   if(this.intermission>0){this.intermission-=dt;return;}
   this.time+=dt;this.spawn-=dt;
   if(this.time>=this.duration){this.wave++;this.time=0;this.intermission=1.8;this.bullets=[];this.spawn=0;this.shots=0;if(this.wave%4===0)this.lives=Math.min(3,this.lives+1);return;}
   if(this.spawn<=0){this.pattern();const spacing=(this.wave-1)%6===2?2.1:Math.max(.11,.68/(1+(this.wave-1)*.075));this.spawn=spacing;}
   for(const b of this.bullets){b.age+=dt;if(b.warm>0){b.warm-=dt;continue;}b.x+=b.vx*dt;b.y+=b.vy*dt;if(this.invincible===0&&Math.hypot(b.x-this.player.x,b.y-this.player.y)<b.r+5){this.lives--;this.invincible=1.35;if(this.lives<=0){this.dead=true;break;}}}
   this.bullets=this.bullets.filter(b=>b.age<12&&b.x>-65&&b.y>-65&&b.x<545&&b.y<545);
  }
 }
 const api={Engine,SIZE,LIMIT};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else host.VeyraDodge=api;
})(typeof window==='undefined'?globalThis:window);
