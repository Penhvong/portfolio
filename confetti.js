// High-Performance Native Canvas Confetti Engine
// Spawns celebratory physics-based particles without external dependencies.
(function(){
  var canvas = null, ctx = null, particles = [], animId = null;

  function initCanvas(){
    if(!canvas){
      canvas = document.createElement('canvas');
      canvas.id = 'confettiCanvas';
      canvas.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;z-index:99999;pointer-events:none;display:none;';
      document.body.appendChild(canvas);
      ctx = canvas.getContext('2d');
    }
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  var COLORS = ['#00F5D4', '#0284C7', '#F59E0B', '#10B981', '#A855F7', '#EC4899', '#FFFFFF'];

  function Particle(x, y, color){
    this.x = x;
    this.y = y;
    this.color = color || COLORS[Math.floor(Math.random() * COLORS.length)];
    this.size = Math.random() * 8 + 5;
    this.speed = Math.random() * 7 + 4;
    this.angle = Math.random() * Math.PI * 2;
    this.vx = Math.cos(this.angle) * this.speed;
    this.vy = Math.sin(this.angle) * this.speed - 3;
    this.gravity = 0.22;
    this.friction = 0.96;
    this.opacity = 1;
    this.rotation = Math.random() * 360;
    this.rotSpeed = (Math.random() - 0.5) * 12;
    this.wobble = Math.random() * 10;
  }

  Particle.prototype.update = function(){
    this.vx *= this.friction;
    this.vy *= this.friction;
    this.vy += this.gravity;
    this.x += this.vx;
    this.y += this.vy;
    this.rotation += this.rotSpeed;
    this.opacity -= 0.014;
  };

  Particle.prototype.draw = function(c){
    c.save();
    c.translate(this.x, this.y);
    c.rotate((this.rotation * Math.PI) / 180);
    c.globalAlpha = Math.max(0, this.opacity);
    c.fillStyle = this.color;
    c.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
    c.restore();
  };

  function loop(){
    if(!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(var i = particles.length - 1; i >= 0; i--){
      var p = particles[i];
      p.update();
      p.draw(ctx);
      if(p.opacity <= 0 || p.y > canvas.height + 20){
        particles.splice(i, 1);
      }
    }
    if(particles.length > 0){
      animId = requestAnimationFrame(loop);
    } else {
      if(canvas) canvas.style.display = 'none';
      if(animId){ cancelAnimationFrame(animId); animId = null; }
    }
  }

  window.fireConfetti = function(options){
    var opt = options || {};
    var count = opt.particleCount || 70;
    var x = opt.x || window.innerWidth / 2;
    var y = opt.y || window.innerHeight / 2;

    initCanvas();
    canvas.style.display = 'block';

    for(var i = 0; i < count; i++){
      particles.push(new Particle(x, y, opt.color));
    }

    if(!animId){
      animId = requestAnimationFrame(loop);
    }
  };

  window.addEventListener('resize', function(){
    if(canvas && canvas.style.display !== 'none'){
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  });
})();
