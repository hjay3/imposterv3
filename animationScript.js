// Cache for storing loaded images
const imageCache = new Map();
const totalFrames = 10;
let imagesLoaded = false;

// Preload images
function preloadImages() {
  return new Promise((resolve) => {
    let loadedCount = 0;
    for (let i = 0; i < totalFrames; i++) {
      const img = new Image();
      img.onload = () => {
        loadedCount++;
        if (loadedCount === totalFrames) {
          imagesLoaded = true;
          resolve();
        }
      };
      img.src = `path/to/your/image_${i}.png`; // Replace with your image paths
      imageCache.set(i, img);
    }
  });
}

class Particle {
  constructor(canvas) {
    this.canvas = canvas;
    this.reset();
  }

  reset() {
    this.x = Math.random() * this.canvas.width;
    this.y = Math.random() * this.canvas.height;
    this.size = Math.random() * 4 + 2;
    this.baseX = this.x;
    this.baseY = this.y;
    this.density = Math.random() * 30 + 1;
    this.angle = Math.random() * 360;
    this.speed = 0.05 + Math.random() * 0.03;
    this.color = this.getRandomColor();
    this.alpha = 1;
  }

  getRandomColor() {
    const hue = Math.floor(Math.random() * 360);
    const saturation = 70 + Math.random() * 30; // 70-100%
    const lightness = 50 + Math.random() * 10; // 50-60%
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

  update() {
    this.angle += this.speed;

    let moveX = Math.sin(this.angle) * 2;
    let moveY = Math.cos(this.angle) * 2;

    this.x = this.baseX + moveX * this.density;
    this.y = this.baseY + moveY * this.density;

    // Wrap around the canvas
    if (this.x < 0) this.x = this.canvas.width;
    if (this.x > this.canvas.width) this.x = 0;
    if (this.y < 0) this.y = this.canvas.height;
    if (this.y > this.canvas.height) this.y = 0;

    // Slowly change color
    const hue = parseFloat(this.color.match(/\d+/)[0]);
    this.color = `hsl(${(hue + 0.5) % 360}, 85%, 55%)`;

    // Pulsate size
    this.size = 2 + Math.sin(this.angle) * 2;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.alpha;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

// Preload images
function preloadImages() {
  return new Promise((resolve) => {
    let loadedCount = 0;
    for (let i = 0; i < totalFrames; i++) {
      const img = new Image();
      img.onload = () => {
        loadedCount++;
        if (loadedCount === totalFrames) {
          imagesLoaded = true;
          resolve();
        }
      };
      img.src = `star/frame_${i}.png`; // Replace with your image paths
      imageCache.set(i, img);
    }
  });
}

function initializeCanvas(canvasElement, frameRate, color, isRandom) {
  const ctx = canvasElement.getContext('2d');
  let currentFrame = 0;
  let lastFrameTime = 0;
  let fps = frameRate;
  let overlayColor = color;

  const originalWidth = 500;
  const originalHeight = 500;
  const newWidth = Math.floor(originalWidth * 2.7);
  const newHeight = Math.floor(originalHeight * 2.7);

  let particles = [];
  let lastBurstTime = 0;
  let nextBurstDelay = getRandomDelay();

  function getRandomDelay() {
    return Math.random() * 10000 + 10000; // Random delay between 10-20 seconds
  }

  function createBurst() {
    const burstX = Math.random() * canvasElement.width;
    const burstY = Math.random() * canvasElement.height;
    for (let i = 0; i < 50; i++) {
      particles.push(new Particle(canvasElement, burstX, burstY));
    }
    lastBurstTime = performance.now();
    nextBurstDelay = getRandomDelay();
  }

  function animate(currentTime) {
    requestAnimationFrame(animate);

    if (currentTime - lastFrameTime < 1000 / fps) return;

    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    if (imagesLoaded) {
      ctx.drawImage(
        imageCache.get(currentFrame),
        0,
        0,
        originalWidth,
        originalHeight,
        0,
        0,
        newWidth,
        newHeight
      );

      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillStyle = overlayColor;
      ctx.globalAlpha = 0.5;
      ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);

      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;

      currentFrame = (currentFrame + 1) % totalFrames;
    }

    // Check if it's time for a new burst
    if (currentTime - lastBurstTime > nextBurstDelay) {
      createBurst();
    }

    // Update and draw particles
    particles = particles.filter(
      (particle) => particle.alpha > 0 && particle.size > 0
    );
    particles.forEach((particle) => {
      particle.update();
      particle.draw(ctx);
    });

    lastFrameTime = currentTime;

    if (isRandom) {
      updateRandomSettings();
    }
  }

  function updateRandomSettings() {
    fps = Math.floor(Math.random() * 60) + 1;
    overlayColor = getRandomColor();
  }

  function getRandomColor() {
    return `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(
      Math.random() * 256
    )}, ${Math.floor(Math.random() * 256)}, ${Math.random().toFixed(2)})`;
  }

  if (isRandom) {
    updateRandomSettings();
  }

  requestAnimationFrame(animate);
}

// Preload images before initializing canvases
preloadImages().then(() => {
  console.log('Images loaded and cached');
  // Here you should call initializeCanvas for each canvas you want to create
  // For example:
  // const canvas1 = document.getElementById('canvas1');
  // initializeCanvas(canvas1, 30, 'rgba(255, 0, 0, 0.5)', false);
});
