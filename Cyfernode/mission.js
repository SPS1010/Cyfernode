(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var headless = /HeadlessChrome/.test(navigator.userAgent);
  var motion = !reduce && !headless;
  function rnd(seed){ return function(){ seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }

  /* T-minus countdown */
  var tEl = document.getElementById('tminus');
  var target = Date.now() + ((1*24 + 22)*3600 + 14*60 + 8)*1000;
  function pad(n){ return String(n).padStart(2,'0'); }
  function tick(){
    var s = Math.max(0, Math.round((target - Date.now())/1000));
    var d = Math.floor(s/86400), h = Math.floor(s%86400/3600), m = Math.floor(s%3600/60), x = s%60;
    tEl.textContent = pad(d)+'D '+pad(h)+':'+pad(m)+':'+pad(x);
  }
  if (!headless) setInterval(tick, 1000);

  /* mini star map */
  var svg = document.getElementById('mini'), NS = 'http://www.w3.org/2000/svg';
  var W = 20, cell = 12, gap = 4, step = cell+gap, R = rnd(11);
  svg.setAttribute('viewBox', '0 0 '+(W*step-gap)+' '+(7*step-gap));
  var cols = ['#FF7A45','#A08BFF','#4FD068'];
  var html = '';
  for (var x = 0; x < W; x++) for (var y = 0; y < 7; y++){
    var v = R(), active = x > 12 ? v < .78 : x > 6 ? v < .45 : v < .18;
    var cx = x*step + cell/2, cy = y*step + cell/2;
    if (active){
      var c = cols[Math.floor(R()*3)], big = R() < .18;
      html += '<circle cx="'+cx+'" cy="'+cy+'" r="'+(big?5.5:3.4)+'" fill="'+c+'" opacity="'+(big?1:.75)+'"/>';
      if (big) html += '<circle cx="'+cx+'" cy="'+cy+'" r="9" fill="'+c+'" opacity=".18"/>';
    } else {
      html += '<rect x="'+(x*step)+'" y="'+(y*step)+'" width="'+cell+'" height="'+cell+'" rx="3" fill="#F2F4F8" opacity=".045"/>';
    }
  }
  svg.innerHTML = html;

  /* launch modal */
  var modal = document.getElementById('modal'), lp = document.getElementById('lp'), count = document.getElementById('count'),
      arc = document.getElementById('arc'), items = document.querySelectorAll('#goList li'),
      title = document.getElementById('lpTitle'), sub = document.getElementById('lpSub'), timer = null, lastFocus = null;
  function setLive(){
    clearInterval(timer);
    if (!motion) arc.style.transition = 'none';
    lp.classList.add('live'); arc.style.strokeDashoffset = 0; arc.setAttribute('stroke','#3FB950');
    items.forEach(function(li){ li.classList.add('ok'); });
    title.textContent = 'Liftoff. Your mission is live.';
    sub.textContent = 'Anyone at Summer Fields can open it now. Ground Control added the launch to your Flight Log.';
  }
  function reset(){
    clearInterval(timer); lp.classList.remove('live'); count.textContent = '5';
    arc.style.transition = 'none'; arc.style.strokeDashoffset = 578; arc.setAttribute('stroke','#FF5A1F');
    arc.getBoundingClientRect(); arc.style.transition = 'stroke-dashoffset 1s linear';
    items.forEach(function(li){ li.classList.remove('ok'); });
    title.textContent = 'Ready for launch'; sub.textContent = 'Ground Control is running final checks.';
  }
  function open(){
    lastFocus = document.activeElement; reset(); modal.classList.add('open');
    document.getElementById('closeBtn').focus();
    if (!motion){ setLive(); return; }
    var n = 5;
    timer = setInterval(function(){
      n--;
      arc.style.strokeDashoffset = 578 * (n/5);
      if (4-n < items.length && 4-n >= 0) items[4-n].classList.add('ok');
      if (n <= 0){ setLive(); } else count.textContent = n;
    }, 1000);
    items[0].classList.add('ok');
  }
  function close(){ reset(); modal.classList.remove('open'); if (lastFocus) lastFocus.focus(); }
  document.getElementById('launchBtn').addEventListener('click', open);
  document.getElementById('closeBtn').addEventListener('click', close);
  document.getElementById('abortBtn').addEventListener('click', close);
  modal.addEventListener('click', function(e){ if (e.target === modal) close(); });
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && modal.classList.contains('open')) close(); });
  if (location.hash === '#launch') open();
})();
