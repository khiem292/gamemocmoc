/* MỘC MỘC VALLEY — bản đồ pixel art gốc vẽ bằng Canvas, không dùng tài sản từ game khác.
 * Lớp đồ họa tương tác với game.js, giữ nguyên tài khoản và tiến trình cũ.
 */
(function () {
'use strict';
const WORLD_W=1200, WORLD_H=760, PX=4;
const C={grass:'#79b64d',grassD:'#629e40',grassL:'#92c861',soil:'#865435',soilD:'#68402c',soilL:'#af7550',sand:'#e2c083',sandL:'#f2d39a',ink:'#49352a'};
const plotLeft=634, plotTop=364, plotDX=84, plotDY=84, plotW=72, plotH=69;
const spots=[{id:'seed',x:495,y:300,label:'Cô Mây'},{id:'sell',x:575,y:316,label:'Chú Tư'},{id:'tool',x:455,y:400,label:'Bác Nâu'}];
const well={x:549,y:536};
let canvas=null,ctx=null,ground=null,gctx=null,raf=0,lastFrame=0;
let cam={x:0,y:0,w:760,h:560};
let keys=new Set(),touchDirs=new Set(),destination=null,elapsed=0,frame=0,lastSaved=0;
let lastSeason='',lastCanvasW=0,lastCanvasH=0;
function rect(g,x,y,w,h,color){g.fillStyle=color;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
function rand(x,y){let v=Math.imul(x+139,y+433)^Math.imul(x+9,711);v^=v>>>11;v=Math.imul(v,1013904223);return ((v>>>0)%10000)/10000;}
function polygon(g,points,color){g.fillStyle=color;g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();}
function label(g,str,x,y,size=12,bg='#684328'){g.font=`900 ${size}px monospace`;g.textAlign='center';g.textBaseline='middle';const width=g.measureText(str).width+16;rect(g,x-width/2,y-11,width,22,bg);rect(g,x-width/2+3,y-8,width-6,16,'#f4dfb6');g.fillStyle='#614427';g.fillText(str,x,y+1);}
function tuft(g,x,y){rect(g,x-6,y,4,8,'#356b31');rect(g,x+2,y-3,4,11,'#3e8233');rect(g,x-2,y-7,4,8,'#4d9138')}
function flower(g,x,y,c){rect(g,x-1,y,3,8,'#478b39');rect(g,x-4,y-4,8,7,c);rect(g,x-1,y-2,3,3,'#f5db6c')}
function pebble(g,x,y){rect(g,x,y,8,4,'#d6b37b');rect(g,x+3,y-3,6,3,'#f8d9a8')}
function tree(g,x,y,r=1,type='round'){
  const s=r;g.save();g.translate(x,y);g.scale(s,s);
  rect(g,-7,0,15,42,'#613e29');rect(g,1,4,5,33,'#a96c35');rect(g,-24,23,49,7,'#50863255');
  if(type==='pine') {
    for(let i=0;i<3;i++){let yy=-39-i*16;polygon(g,[[-39+i*7,yy+38],[0,yy-19],[39-i*7,yy+38]],i%2?'#266d43':'#2b7d43');rect(g,-13,yy+13,26,11,'#55a455')}
  }else{
    rect(g,-34,-39,68,45,'#2d7738');rect(g,-41,-28,81,33,'#296935');rect(g,-25,-56,51,32,'#2b7438');
    rect(g,-37,-39,74,23,'#348b40');rect(g,-24,-62,48,30,'#388d40');
    for(let i=0;i<12;i++){const xx=Math.round(rand(i,19)*68-34),yy=Math.round(rand(i,20)*47-58);rect(g,xx,yy,9,5,i%3===0?'#a8d865':i%3===1?'#6dbc52':'#489d49')}
    for(let i=0;i<4;i++){let xx=Math.round(rand(i,111)*55-27);rect(g,xx,-15,5,5,'#edbe63')}
  }
  g.restore();
}
function fence(g,x,y,len){
  for(let k=0;k<len;k+=31){rect(g,x+k,y-1,10,38,'#70452b');rect(g,x+k+2,y,6,31,'#c78a4d');rect(g,x+k,y-4,10,7,'#e8b976')}
  rect(g,x,y+9,len,8,'#8a582f');rect(g,x,y+12,len,4,'#bd8449');rect(g,x,y+29,len,7,'#80512c');rect(g,x,y+31,len,3,'#b37a41');
}
function path(g){
  // Đường mòn uốn giữa nhà, giếng và các luống.
  polygon(g,[[194,373],[389,371],[525,430],[565,488],[618,501],[618,592],[494,603],[406,520],[210,497],[110,555],[0,549],[0,450],[137,457],[218,424]],'#c79f67');
  polygon(g,[[190,381],[376,382],[500,443],[547,492],[595,503],[592,563],[489,576],[390,504],[217,481],[112,530],[0,523],[0,469],[135,471],[226,433]],'#e8c58b');
  for(let i=0;i<65;i++){let x=rand(i,9)*615,y=403+rand(i,98)*163;if(x>370&&y<425)continue;rect(g,x,y,4+rand(i,62)*8,3,rand(i,14)>.6?'#f5d49e':'#d7b27e')}
}
function farmhouse(g,x,y){
  g.save();g.translate(x,y);
  rect(g,17,115,252,192,'#513e30');rect(g,26,121,234,170,'#b68d58');
  for(let i=0;i<13;i++){rect(g,29+i*18,129,4,162,'#916e49');rect(g,31+i*18,136,2,145,'#d5a776')}
  rect(g,20,275,248,13,'#724e38');rect(g,16,285,257,16,'#d5a671');
  polygon(g,[[-6,130],[118,17],[202,58],[278,143],[278,156],[170,71],[119,42],[7,153]],'#813e32');
  polygon(g,[[1,113],[120,3],[272,113],[273,134],[121,31],[1,138]],'#c35e3b');
  for(let yy=37; yy<120; yy+=19){for(let xx=30;xx<250;xx+=33){let dist=Math.abs(xx-121);if(yy<dist*.68+10)continue;rect(g,xx+(yy%3)*2,yy,30,5,(xx+yy)%4?'#a94d35':'#dd7944');rect(g,xx,yy+7,21,3,'#9e4935')}}
  rect(g,182,-12,35,52,'#9a5640');rect(g,187,-14,32,13,'#dd8b58');rect(g,182,9,32,6,'#764335');rect(g,189,22,7,7,'#e4a064');
  // cửa ra vào và cửa sổ
  rect(g,105,203,67,94,'#6e4933');rect(g,113,211,52,82,'#a8724a');rect(g,119,218,39,70,'#6f4833');rect(g,152,252,6,6,'#e9c975');rect(g,108,204,61,5,'#d2a674');
  rect(g,39,156,68,65,'#5d4734');rect(g,45,161,57,55,'#d49b56');rect(g,50,166,47,44,'#82bdc8');rect(g,71,166,5,45,'#f7d79b');rect(g,50,185,47,5,'#f5d497');rect(g,43,159,62,5,'#f6ddab');
  rect(g,199,173,44,50,'#4c382d');rect(g,203,177,36,40,'#8ec6c6');rect(g,218,177,4,40,'#f9d899');rect(g,203,195,36,4,'#e8c288');
  for(let i=0;i<5;i++)rect(g,50+i*12,293,9,3,'#67452f');
  rect(g,98,298,84,7,'#b08c55');
  g.restore();
}
function shop(g,x,y){
  g.save();g.translate(x,y);
  rect(g,2,72,170,151,'#724e33');rect(g,9,79,156,133,'#d0a165');
  for(let i=0;i<9;i++)rect(g,i*18+11,83,3,122,'#ae7f50');
  polygon(g,[[-8,94],[79,-6],[173,91],[169,111],[80,19],[2,116]],'#8a533b');
  polygon(g,[[-4,82],[80,-18],[179,82],[176,102],[81,8],[0,106]],'#6d8a44');
  for(let i=0;i<7;i++)rect(g,16+i*24,68,17,5,i%2?'#9ab35e':'#4f763a');
  rect(g,58,152,59,65,'#5e412e');rect(g,64,157,46,60,'#95603c');rect(g,73,176,13,20,'#d1a269');
  rect(g,15,112,35,44,'#654532');rect(g,19,117,27,32,'#8dc3ad');
  rect(g,122,111,34,46,'#684430');rect(g,126,115,25,36,'#81bdd2');
  // giàn hoa mái che
  rect(g,-5,199,180,10,'#547937');rect(g,10,193,18,12,'#7eae52');rect(g,143,190,23,15,'#7ba848');
  label(g,'CHỢ NÔNG TRẠI',85,62,11);
  g.restore();
}
function pond(g,x,y){
  polygon(g,[[x-132,y-34],[x-103,y-68],[x-55,y-89],[x+51,y-84],[x+115,y-55],[x+140,y-7],[x+126,y+50],[x+86,y+80],[x-50,y+82],[x-115,y+54]],'#afc36d');
  polygon(g,[[x-119,y-31],[x-96,y-61],[x-48,y-73],[x+53,y-72],[x+107,y-47],[x+129,y],[x+116,y+43],[x+75,y+65],[x-55,y+67],[x-101,y+42]],'#4b9cb4');
  polygon(g,[[x-105,y-25],[x-80,y-50],[x-38,y-62],[x+55,y-60],[x+94,y-38],[x+112,y+3],[x+101,y+33],[x+62,y+54],[x-44,y+54],[x-88,y+31]],'#66b5c3');
  for(let i=0;i<14;i++){let dx=(rand(i,88)-.5)*180,dy=(rand(i,43)-.5)*73;rect(g,x+dx,y+dy,17,4,i%2?'#a3d7d5':'#8acddb')}
  rect(g,x-66,y+4,20,7,'#558f56');rect(g,x-59,y,6,6,'#c4dc6f');
  for(let i=0;i<14;i++){let a=i*.47;tuft(g,x+Math.sin(a)*117,y+Math.cos(a)*63)}
}
function drawStatic(si){
  ground=document.createElement('canvas');ground.width=WORLD_W;ground.height=WORLD_H;
  gctx=ground.getContext('2d');let g=gctx;
  let grass=si.season==='dong'?'#a7be87':si.season==='thu'?'#89b753':'#77b956';
  rect(g,0,0,WORLD_W,WORLD_H,grass);
  for(let y=0;y<WORLD_H;y+=16)for(let x=0;x<WORLD_W;x+=16){let r=rand(x,y);if(r>.61)rect(g,x+2,y+4,13,8,si.season==='dong'?'#c1c9a2':r>.84?'#91c761':'#6da64d');if(r<.12)rect(g,x+10,y+13,6,4,'#5e9e42')}
  polygon(g,[[0,0],[1200,0],[1200,78],[1090,94],[970,36],[850,104],[670,35],[520,125],[360,62],[170,105],[0,45]],'#6aa688');
  polygon(g,[[0,0],[1200,0],[1200,36],[1090,63],[940,18],[804,89],[648,25],[534,89],[364,40],[164,73],[0,26]],'#72bdac');
  polygon(g,[[0,0],[600,0],[560,29],[340,12],[120,44],[0,20]],'#b9d4b4');
  pond(g,1010,218);path(g);
  // Rào sau nhà và quanh khu nông nghiệp.
  fence(g,40,298,132);fence(g,386,304,37);fence(g,610,297,366);
  for(let x=650;x<943;x+=53){tuft(g,x,325);if(x%2)flower(g,x+13,340,'#f7edbe')}
  farmhouse(g,146,130);shop(g,431,150);
  // tảng đá, cỏ, hoa nhỏ trên khu đất.
  for(let i=0;i<150;i++){let x=rand(i*8,7)*WORLD_W,y=rand(i*13,17)*(WORLD_H-35)+28;
    if((x>126&&x<655&&y>129&&y<490)||(x>603&&x<1001&&y>330&&y<642)||(x>864&&x<1180&&y>114&&y<305))continue;
    if(i%9===0)pebble(g,x,y);else if(i%6===0)flower(g,x,y,i%2?'#ffe4ef':'#fff0a1');else tuft(g,x,y)
  }
  tree(g,75,215,1.45);tree(g,88,620,1.8);tree(g,1099,485,1.65);tree(g,1160,679,1.9,'pine');tree(g,1075,95,1.45,'pine');tree(g,30,37,1.25,'pine');tree(g,368,657,1.42,'round');tree(g,1023,648,1.45);
  // luống trang trí quanh nhà
  rect(g,152,413,125,15,'#916534');rect(g,161,405,12,12,'#ffc767');rect(g,179,401,12,11,'#f6d47b');rect(g,199,402,12,10,'#f9b65a');
  // Giếng với mái nhỏ
  rect(g,well.x-25,well.y+6,52,38,'#7d7f76');rect(g,well.x-19,well.y+2,40,27,'#5a6b79');rect(g,well.x-12,well.y+8,25,15,'#246c8f');rect(g,well.x-31,well.y+5,63,8,'#c9b99a');
  rect(g,well.x-25,well.y-29,6,34,'#755431');rect(g,well.x+19,well.y-29,6,34,'#755431');polygon(g,[[well.x-34,well.y-26],[well.x,well.y-51],[well.x+35,well.y-26],[well.x+32,well.y-16],[well.x,well.y-38],[well.x-32,well.y-15]],'#bf6740');
  // Bảng tên vườn
  rect(g,613,338,5,23,'#7b4e2b');rect(g,937,341,5,22,'#7b4e2b');rect(g,682,329,192,23,'#996e41');rect(g,684,327,189,18,'#f0d6a0');
  g.font='bold 15px monospace';g.fillStyle='#5c432b';g.textAlign='center';g.fillText('VƯỜN CỦA BẠN',777,342);
}
function drawPlot(g,index){
  const row=Math.floor(index/4),col=index%4,x=plotLeft+col*plotDX,y=plotTop+row*plotDY;
  rect(g,x-3,y+7,plotW+7,plotH+3,'#537a36');rect(g,x,y,plotW,plotH,C.soilD);
  rect(g,x+4,y+4,plotW-8,plotH-10,C.soil);
  for(let k=0;k<3;k++)rect(g,x+7,y+14+k*18,plotW-14,5,'#a56b42');
  for(let k=0;k<6;k++)rect(g,x+4+rand(k,index+11)*56,y+11+rand(k+6,index)*50,5,3,k%2?'#c58a58':'#69402b');
  const p=state.plots[index];
  if(!p){rect(g,x+29,y+22,6,15,'#c58f63');rect(g,x+24,y+27,16,5,'#d8ad78');return}
  if(p.hp<=0){rect(g,x+31,y+25,4,26,'#605733');rect(g,x+17,y+23,14,5,'#947f44');rect(g,x+34,y+26,16,4,'#96874a');return}
  const progress=getProgress(p),grown=progress>=.99; const cx=x+36,base=y+56;
  if(progress<.2){rect(g,cx-3,base-20,6,18,'#54913a');rect(g,cx-15,base-25,14,6,'#55ab49');rect(g,cx+3,base-27,13,6,'#7ebf5c')}
  else if(progress<.56){for(let i=-1;i<=1;i++){rect(g,cx+i*13-3,base-18,6,22,'#41873e');rect(g,cx+i*13-10,base-28+(i%2)*6,13,9,'#69ac50')}}
  else {
    const type=p.crop;
    if(type==='carrot'){for(let i=-1;i<=1;i++){const k=cx+i*16;rect(g,k-6,base-32,12,26,'#e98835');rect(g,k-4,base-13,8,9,'#bf5e29');rect(g,k-8,base-44,16,11,'#4d9b43');rect(g,k-3,base-50,7,12,'#68b853')}}
    else if(type==='tomato'){rect(g,cx-4,base-45,8,42,'#347b34');for(let i=0;i<4;i++){const k=cx+[-17,11,-10,6][i],yy=base+[ -23,-23,-38,-43][i];rect(g,k-10,yy-7,18,17,'#c84832');rect(g,k-6,yy-8,10,4,'#f4724b');rect(g,k-1,yy-12,5,6,'#5d9d48')}}
    else if(type==='corn'){for(let i=-1;i<=1;i++){const k=cx+i*17;rect(g,k-5,base-45,11,33,'#e8b942');rect(g,k-1,base-40,5,24,'#ffe175');polygon(g,[[k-4,base],[k-18,base-35],[k-6,base-20],[k+10,base],[k+17,base-35],[k+6,base-22]],'#4c9c43')}}
    else if(type==='strawberry'){rect(g,cx-3,base-42,6,38,'#4e9839');for(let i=-1;i<=1;i++){let k=cx+i*17;polygon(g,[[k-10,base-24],[k+8,base-24],[k+1,base-2]],'#d94343');rect(g,k-5,base-28,11,7,'#66b456');rect(g,k-3,base-17,3,3,'#ffe4b2')}}
    else{rect(g,cx-29,base-31,58,30,'#c66b2e');rect(g,cx-21,base-37,43,29,'#e88a34');rect(g,cx-11,base-40,25,31,'#f4a448');rect(g,cx-3,base-48,6,11,'#468447')}
  }
  if(p.fertilized){rect(g,x+4,y+4,10,10,'#f7d47c');rect(g,x+8,y+1,4,17,'#fff3a0')}
  if(p.pest){rect(g,x+54,y+4,14,14,'#e7b851');rect(g,x+58,y+9,7,5,'#824133')}
  if(grown){rect(g,x+6,y+58,60,7,'#ebdc89');rect(g,x+6,y+58,60,4,'#fff6ae');rect(g,x+19,y+7,35,14,'#fceba8');g.font='bold 10px monospace';g.fillStyle='#6b4929';g.textAlign='center';g.fillText('CHÍN!',x+37,y+18)}
  else if(progress<1){rect(g,x+8,y+59,plotW-16,5,'#3c3b29');rect(g,x+8,y+59,(plotW-16)*progress,5,'#9ed66e')}
}
function drawSprite(g,x,y,colors={},walk=0,hat=true){
  const skin=colors.skin||'#e6aa7b',shirt=colors.shirt||'#df7457',hair=colors.hair||'#654430';
  g.save();g.translate(Math.round(x),Math.round(y));
  rect(g,-13,19,27,7,'#39683c7a');
  rect(g,-10,7,7,15,'#4e6381');rect(g,3,7,7,15,'#4e6381');
  if(walk){rect(g,-11,16,8,8,'#554034');rect(g,4,12,8,8,'#554034')}else{rect(g,-11,19,8,5,'#554034');rect(g,3,19,8,5,'#554034')}
  rect(g,-11,-11,22,22,shirt);rect(g,-15,-7,5,17,skin);rect(g,10,-7,5,17,skin);
  rect(g,-11,-31,22,22,skin);rect(g,-13,-33,25,7,hair);rect(g,-13,-29,5,10,hair);rect(g,8,-29,4,9,hair);
  rect(g,-6,-20,3,3,'#2d302b');rect(g,4,-20,3,3,'#2d302b');rect(g,-1,-12,7,2,'#ab634f');
  if(hat){rect(g,-17,-36,35,7,'#e0bb6e');rect(g,-10,-43,22,9,'#eccb83');rect(g,-9,-37,20,4,'#986541')}
  g.restore();
}
function drawNPC(g,spot,tick){const clr=spot.id==='seed'?{skin:'#edc2a1',shirt:'#a770a6',hair:'#573f2c'}:spot.id==='sell'?{skin:'#d6a071',shirt:'#4483ab',hair:'#443528'}:{skin:'#dda47d',shirt:'#bb7751',hair:'#7a4935'};drawSprite(g,spot.x,spot.y+Math.sin(tick*2+spot.x)*1.3,clr,0,true);label(g,spot.label,spot.x,spot.y-51,11)}
function drawAnimals(g,tick){const dx=Math.sin(tick*.75)*29; // gà cạnh nhà
 rect(g,358+dx,464,24,18,'#f9f1d8');rect(g,371+dx,452,13,14,'#fff5d8');rect(g,385+dx,462,7,5,'#dfab4f');rect(g,375+dx,447,7,6,'#de5645');rect(g,375+dx,457,3,3,'#37332d');rect(g,367+dx,483,3,7,'#dba05c');rect(g,378+dx,483,3,7,'#dba05c');
 // thỏ cạnh bờ
 rect(g,1044,558,29,19,'#dad7c8');rect(g,1064,550,16,17,'#eee9d8');rect(g,1068,534,6,18,'#eee9d8');rect(g,1077,536,6,16,'#e4dccd');rect(g,1076,559,4,4,'#3a3733');rect(g,1038,567,10,9,'#f0ede4');
}
function drawPlayer(g,tick){const a=state?.avatar||{};const x=state?.playerPos?.x??731,y=state?.playerPos?.y??651;
  let walking=keys.size>0||touchDirs.size>0||Boolean(destination);
  drawSprite(g,x,y, {skin:SKINS[a.skin]||'#e4b28b',shirt:SHIRTS[a.shirt]||'#e78f73',hair:HAIRS[a.hair]||'#49362b'},walking?Math.floor(tick*6)%2:0,a.hat!==false);
  rect(g,x-12,y+25,24,3,'#fff5c1');
}
function isSimulatedLandscape(){
  return document.body.classList.contains('mocmoc-playing') &&
    window.matchMedia('(max-width:850px) and (orientation:portrait)').matches;
}
function resize(){
  if(!canvas)return;
  // getBoundingClientRect() trả về kích thước đã XOAY; canvas.clientWidth/Height
  // giữ kích thước landscape LOGIC để hình không bị méo khi iPhone khóa xoay.
  const r=canvas.getBoundingClientRect();
  const width=isSimulatedLandscape()?canvas.clientWidth:r.width;
  const height=isSimulatedLandscape()?canvas.clientHeight:r.height;
  if(!width||!height)return;
  const cw=Math.max(200,Math.floor(width/2)),ch=Math.max(200,Math.floor(height/2));
  if(canvas.width!==cw||canvas.height!==ch){canvas.width=cw;canvas.height=ch;}
  cam.h=600;cam.w=600*width/height;
}
function draw(time){raf=requestAnimationFrame(draw);if(!canvas||!canvas.isConnected||screen!=='farm'||!state||document.hidden){return}const dt=Math.min(.08,(time-lastFrame)/1000||0);lastFrame=time;elapsed+=dt;frame++;
  let vx=0,vy=0;const active=d=>keys.has(d)||touchDirs.has(d);
  if(active('left'))vx--;if(active('right'))vx++;if(active('up'))vy--;if(active('down'))vy++;
  if(vx||vy)destination=null;
  else if(destination){const dx=destination.x-state.playerPos.x,dy=destination.y-state.playerPos.y;if(Math.hypot(dx,dy)>7){vx=dx;vy=dy}else destination=null}
  if(vx||vy){const len=Math.hypot(vx,vy),speed=150;
    const nx=Math.max(36,Math.min(WORLD_W-30,state.playerPos.x+vx/len*speed*dt));
    const ny=Math.max(130,Math.min(WORLD_H-26,state.playerPos.y+vy/len*speed*dt));
    const blockHouse=nx>132&&nx<430&&ny>168&&ny<424,blockShop=nx>420&&nx<620&&ny>160&&ny<365;
    if(!blockHouse&&!blockShop)state.playerPos={x:nx,y:ny};
    if(elapsed-lastSaved>2){save();lastSaved=elapsed;}
  }
  if(frame%60===0)resize();if(!ctx)ctx=canvas.getContext('2d',{alpha:false});
  const viewWidth=cam.w, viewHeight=cam.h;
  cam.x=Math.max(0,Math.min(WORLD_W-viewWidth,state.playerPos.x-viewWidth*.5));
  if(viewWidth>=WORLD_W)cam.x=-(viewWidth-WORLD_W)/2;
  cam.y=Math.max(0,Math.min(WORLD_H-viewHeight,state.playerPos.y-viewHeight*.60));
  ctx.imageSmoothingEnabled=false;rect(ctx,0,0,canvas.width,canvas.height,'#6a9d59');
  ctx.save();ctx.setTransform(canvas.width/viewWidth,0,0,canvas.height/viewHeight,-cam.x*canvas.width/viewWidth,-cam.y*canvas.height/viewHeight);
  if(ground)ctx.drawImage(ground,0,0);
  for(let i=0;i<12;i++)drawPlot(ctx,i);
  drawAnimals(ctx,elapsed);
  spots.forEach(s=>drawNPC(ctx,s,elapsed));drawPlayer(ctx,elapsed);
  let si=seasonInfo();
  if(si.night){rect(ctx,cam.x,cam.y,viewWidth,viewHeight,'#192e5870');for(let i=0;i<18;i++){const x=rand(i,101)*WORLD_W,y=rand(i,102)*WORLD_H;rect(ctx,x,y,3,3,'#ffe7a6')}}
  if(si.weather.id==='rain'){for(let i=0;i<80;i++){const x=((rand(i,172)*WORLD_W+elapsed*125)%WORLD_W),y=((rand(i,173)*WORLD_H+elapsed*195)%WORLD_H);rect(ctx,x,y,3,13,'#a7d5e299')}}
  ctx.restore();
}
function handleObject(x,y){
  if(x>plotLeft-8 && x<plotLeft+3*plotDX+plotW+5 && y>plotTop-8 && y<plotTop+2*plotDY+plotH+8){
    const col=Math.floor((x-plotLeft)/plotDX),row=Math.floor((y-plotTop)/plotDY),index=row*4+col;
    if(col>=0&&col<4&&row>=0&&row<3){onAction({dataset:{action:'plot',index:String(index)}});return true}
  }
  for(let spot of spots){if(Math.hypot(x-spot.x,y-spot.y)<46){shopTab=spot.id;navigate('shop');return true}}
  if(Math.hypot(x-well.x,y-well.y)<54){fetchWater();return true}
  if(x>147&&x<415&&y>145&&y<427){toast('🏡 Đây là ngôi nhà của bạn. Sắp tới có thể trang trí bên trong!');return true}
  return false;
}
function canvasClick(e){
  if(!state||!canvas||modal)return;
  const r=canvas.getBoundingClientRect();
  let ux,uy;
  if(isSimulatedLandscape()){
    // CSS rotate(90deg): trục x game trùng với trục y màn hình và
    // trục y game đi ngược trục x màn hình. Dùng tọa độ đã đảo để chạm đúng cây.
    ux=(e.clientY-r.top)/r.height;
    uy=(r.right-e.clientX)/r.width;
  }else{
    ux=(e.clientX-r.left)/r.width;
    uy=(e.clientY-r.top)/r.height;
  }
  const x=cam.x+ux*cam.w,y=cam.y+uy*cam.h;
  window.MocMocAudio?.unlock();
  if(!handleObject(x,y))destination={x:Math.max(36,Math.min(1160,x)),y:Math.max(130,Math.min(731,y))};
}
function nearby(){if(!state)return;const x=state.playerPos.x,y=state.playerPos.y;let chosen=null,distance=1e9;
  for(let i=0;i<12;i++){const xx=plotLeft+i%4*plotDX+plotW/2,yy=plotTop+Math.floor(i/4)*plotDY+plotH/2;let d=Math.hypot(x-xx,y-yy);if(d<distance){chosen={x:xx,y:yy};distance=d}}
  if(distance<110){handleObject(chosen.x,chosen.y);return}
  const targets=[...spots,well];let best=targets.map(s=>({...s,dist:Math.hypot(x-s.x,y-s.y)})).sort((a,b)=>a.dist-b.dist)[0];if(best.dist<94)handleObject(best.x,best.y);else toast('🌼 Hãy đi lại gần NPC, giếng hoặc luống đất để tương tác.');
}
function mount(){
  const node=document.getElementById('pixel-world');if(!node||!state||screen!=='farm')return;
  if(canvas===node && ctx)return;
  canvas=node;ctx=canvas.getContext('2d',{alpha:false});
  if(!state.playerPos)state.playerPos={x:755,y:647};
  resize();canvas.addEventListener('click',canvasClick);
  const si=seasonInfo();if(!ground||lastSeason!==si.season){drawStatic(si);lastSeason=si.season}
  if(!raf){lastFrame=performance.now();raf=requestAnimationFrame(draw)}
}
document.addEventListener('keydown',e=>{if(!state||screen!=='farm'||modal||['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;const dict={ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right'};if(dict[e.code]){e.preventDefault();keys.add(dict[e.code]);window.MocMocAudio?.unlock()}});
document.addEventListener('keyup',e=>{const dict={ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right'};if(dict[e.code])keys.delete(dict[e.code])});
window.addEventListener('blur',()=>{keys.clear();touchDirs.clear();destination=null});
document.addEventListener('pointerdown',e=>{let b=e.target.closest('[data-move]');if(!b)return;e.preventDefault();b.setPointerCapture(e.pointerId);touchDirs.add(b.dataset.move);destination=null;window.MocMocAudio?.unlock();});
const stop=e=>{let b=e.target.closest('[data-move]');if(b)touchDirs.delete(b.dataset.move)};
document.addEventListener('pointerup',stop);document.addEventListener('pointercancel',stop);
window.addEventListener('resize',()=>{resize()});
window.MocMocPixel={mount,nearby};
requestAnimationFrame(mount);
})();
