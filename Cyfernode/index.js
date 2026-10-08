(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var headless = /HeadlessChrome/.test(navigator.userAgent);
  var motion = !reduce && !headless;
  if (motion) document.documentElement.classList.add('js-motion');

  /* ---------- starfield ---------- */
  var cv = document.getElementById('stars'), ctx = cv.getContext('2d'), stars = [], W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
  function rnd(seed){ return function(){ seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
  function size(){
    var r = cv.parentElement.getBoundingClientRect(); W = r.width; H = r.height;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
    var R = rnd(42), n = Math.round(W * H / 5200); stars = [];
    for (var i = 0; i < n; i++) stars.push({x:R()*W, y:R()*H, r:R()<.92? R()*.9+.25 : R()*1.4+.9, a:R()*.7+.2, p:R()*6.28, s:R()*.6+.2, v:R()*.06+.01});
    draw(0);
  }
  function draw(t){
    ctx.clearRect(0,0,W,H);
    for (var i = 0; i < stars.length; i++){
      var s = stars[i], tw = motion ? (Math.sin(t/1000*s.s + s.p)*.35 + .65) : .8;
      var y = motion ? (s.y + t*s.v/60) % H : s.y;
      ctx.globalAlpha = s.a * tw; ctx.fillStyle = s.r > 1.2 ? (i % 7 === 0 ? '#FFB08F' : (i % 5 === 0 ? '#C9BEFF' : '#F2F4F8')) : '#F2F4F8';
      ctx.beginPath(); ctx.arc(s.x, y, s.r, 0, 6.2832); ctx.fill();
      if (s.r > 1.6){ ctx.globalAlpha = s.a*tw*.18; ctx.beginPath(); ctx.arc(s.x, y, s.r*4, 0, 6.2832); ctx.fill(); }
    }
    ctx.globalAlpha = 1;
  }
  size();
  if ('ResizeObserver' in window) new ResizeObserver(size).observe(cv.parentElement); else window.addEventListener('resize', size);
  if (motion){ (function loop(t){ draw(t); requestAnimationFrame(loop); })(0); }

  /* ---------- typed prompt ---------- */
  var typed = document.getElementById('typed'), answer = document.getElementById('answer');
  if (motion){
    var txt = typed.getAttribute('data-text').replace(/&amp;/g,'&'), i = 0;
    answer.classList.add('pending');
    typed.innerHTML = '<span class="caret"></span>';
    setTimeout(function tick(){
      i++; typed.innerHTML = ''; typed.appendChild(document.createTextNode(txt.slice(0,i)));
      var c = document.createElement('span'); c.className = 'caret'; typed.appendChild(c);
      if (i < txt.length) setTimeout(tick, 22 + Math.random()*38);
      else setTimeout(function(){ answer.classList.remove('pending'); }, 450);
    }, 700);
  }

  /* ---------- satellite along trajectory ---------- */
  var flight = document.getElementById('flight'), sat = document.getElementById('sat');
  if (motion && flight && flight.getTotalLength){
    var L = flight.getTotalLength();
    sat.setAttribute('opacity','1');
    (function fly(t){ var p = flight.getPointAtLength(((t/9000)%1)*L); sat.setAttribute('cx',p.x); sat.setAttribute('cy',p.y); requestAnimationFrame(fly); })(0);
  }

  /* ---------- star map ---------- */
  var svg = document.getElementById('starmap'), NS = 'http://www.w3.org/2000/svg';
  // constellation: [week, day] pairs, relative to a 52-week map, rescaled for small screens
  var CON = [[4,5],[9,3],[14,4],[18,1],[23,2],[27,5],[31,3],[36,1],[40,2],[44,4],[48,2]];
  var BRANCH = [[18,1],[21,5]];
  function buildMap(){
    svg.innerHTML = '';
    var weeks = window.innerWidth < 640 ? 26 : 52, cell = 16, gap = 4, step = cell + gap;
    var w = weeks*step - gap, h = 7*step - gap, pad = 14;
    svg.setAttribute('viewBox', (-pad)+' '+(-pad)+' '+(w+pad*2)+' '+(h+pad*2));
    var R = rnd(7), cells = [], k = weeks/52;
    var con = CON.map(function(p){ return [Math.min(weeks-1, Math.round(p[0]*k)), p[1]]; });
    var branch = BRANCH.map(function(p){ return [Math.min(weeks-1, Math.round(p[0]*k)), p[1]]; });
    function isStar(x,y){ return con.concat(branch).some(function(p){return p[0]===x&&p[1]===y;}); }
    var gCells = document.createElementNS(NS,'g'), gLinks = document.createElementNS(NS,'g'), gStars = document.createElementNS(NS,'g');
    for (var x = 0; x < weeks; x++) for (var y = 0; y < 7; y++){
      var v = R(), trend = .25 + .75 * (x/weeks);
      var lvl = isStar(x,y) ? 1 : (v < .35 ? 0 : v < .6 ? .22 : v < .8 ? .45*trend+.1 : v < .93 ? .7*trend+.1 : .95);
      var r = document.createElementNS(NS,'rect');
      r.setAttribute('x', x*step); r.setAttribute('y', y*step); r.setAttribute('width', cell); r.setAttribute('height', cell); r.setAttribute('rx', 4);
      r.setAttribute('class','cell');
      r.setAttribute('fill', lvl === 0 ? '#F2F4F8' : '#3FB950');
      r.dataset.lvl = lvl === 0 ? .05 : lvl;
      r.style.transitionDelay = (x*18 + y*6) + 'ms';
      gCells.appendChild(r); cells.push(r);
    }
    function ctr(p){ return [p[0]*step + cell/2, p[1]*step + cell/2]; }
    var links = [];
    function link(a,b){
      var A = ctr(a), B = ctr(b), l = document.createElementNS(NS,'line');
      l.setAttribute('x1',A[0]); l.setAttribute('y1',A[1]); l.setAttribute('x2',B[0]); l.setAttribute('y2',B[1]);
      l.setAttribute('stroke','#F2F4F8'); l.setAttribute('stroke-opacity','.55'); l.setAttribute('stroke-width','1.3');
      var len = Math.hypot(B[0]-A[0], B[1]-A[1]); l.setAttribute('stroke-dasharray', len); l.setAttribute('class','link'); l.dataset.len = len;
      gLinks.appendChild(l); links.push(l);
    }
    for (var i = 0; i < con.length-1; i++) link(con[i], con[i+1]);
    link(branch[0], branch[1]);
    var starEls = [];
    con.concat([branch[1]]).forEach(function(p, i){
      var c = ctr(p), g = document.createElementNS(NS,'circle');
      g.setAttribute('cx',c[0]); g.setAttribute('cy',c[1]); g.setAttribute('r', 0); g.setAttribute('fill','url(#smglow)'); g.setAttribute('class','star');
      var s = document.createElementNS(NS,'circle');
      s.setAttribute('cx',c[0]); s.setAttribute('cy',c[1]); s.setAttribute('r', 0); s.setAttribute('class','star');
      s.setAttribute('fill', i === con.length-1 ? '#FF7A45' : '#FFFFFF');
      g.style.transitionDelay = s.style.transitionDelay = (i*90)+'ms';
      gStars.appendChild(g); gStars.appendChild(s); starEls.push([g,s,i === con.length-1]);
    });
    var defs = document.createElementNS(NS,'defs');
    defs.innerHTML = '<radialGradient id="smglow"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".9"/><stop offset=".25" stop-color="#9BF0A8" stop-opacity=".45"/><stop offset="1" stop-color="#3FB950" stop-opacity="0"/></radialGradient>';
    svg.appendChild(defs); svg.appendChild(gCells); svg.appendChild(gLinks); svg.appendChild(gStars);

    function state(n){ // 0 empty, 1 grid lit, 2 constellation
      cells.forEach(function(c){
        var l = +c.dataset.lvl;
        c.setAttribute('fill-opacity', n === 0 ? .04 : n === 1 ? l : (l >= 1 ? .9 : l*.42));
      });
      links.forEach(function(l,i){ l.style.transitionDelay = (n===2 ? 500 + i*140 : 0)+'ms'; l.setAttribute('stroke-dashoffset', n === 2 ? 0 : l.dataset.len); });
      starEls.forEach(function(e){ e[0].setAttribute('r', n === 2 ? (e[2]?26:20) : 0); e[1].setAttribute('r', n === 2 ? (e[2]?5:3.6) : 0); });
    }
    function play(){
      if (!motion){ state(2); return; }
      state(0);
      requestAnimationFrame(function(){ requestAnimationFrame(function(){
        state(1);
        setTimeout(function(){ state(2); }, 2100);
      }); });
    }
    return {play:play, state:state};
  }
  var map = buildMap(), played = false;
  if (!motion) map.play();
  else {
    map.state(0);
    var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting && !played){ played = true; map.play(); } }); }, {threshold:.35});
    io.observe(svg);
  }
  document.getElementById('replay').addEventListener('click', function(){ map.play(); });
  var lastW = window.innerWidth < 640;
  window.addEventListener('resize', function(){ var nw = window.innerWidth < 640; if (nw !== lastW){ lastW = nw; map = buildMap(); map.state(2); } });

  /* ---------- reveal ---------- */
  if (motion && 'IntersectionObserver' in window){
    var ro = new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting){ e.target.classList.add('in'); ro.unobserve(e.target); } }); }, {threshold:.12, rootMargin:'0px 0px -40px 0px'});
    document.querySelectorAll('.rv').forEach(function(el){ ro.observe(el); });
  }
})();
