class CardCarousel {
    constructor(container) {
      this.container = container;
      this.cards = [];
      this.cardHeight = 320; // Match the card height
      this.spacing = 20;    // Reduced spacing between cards
      this.middlePosition = window.innerHeight / 2;
      this.isDragging = false;
      this.startY = 0;
      this.scrollOffset = 0;
      this.currentOffset = 0;
      this.velocity = 0;
      this.lastY = 0;
      this.lastTime = 0;
  
      this.init();
    }
  
    createCard(index) {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div class="content"></div>
        <div class="meta">
          <div class="meta-row">
            <div class="avatar"></div>
            <div class="line line-long"></div>
          </div>
          <div class="line line-short"></div>
        </div>
      `;
      return card;
    }
  
    init() {
      for (let i = 0; i < 8; i++) {
        const card = this.createCard(i);
        this.cards.push(card);
        this.container.appendChild(card);
      }
  
      this.updateCardsPosition();
      this.setupEventListeners();
      this.startAnimation();
    }
  
    updateCardsPosition(extraOffset = 0) {
      const totalOffset = this.currentOffset + extraOffset;
  
      this.cards.forEach((card, index) => {
        const cardCenterY = index * (this.cardHeight + this.spacing) - totalOffset;
        const distanceFromCenter = cardCenterY - window.innerHeight / 2;
        const normalizedDistance = Math.abs(distanceFromCenter) / (window.innerHeight / 3);
        const scale = normalizedDistance <= 1 ? 1 - normalizedDistance * 0.6 : 0.4;
        const y = cardCenterY;
  
        card.style.transform = `translateY(${y}px) scale(${scale})`;
        card.style.opacity = Math.max(0.3, 1 - normalizedDistance * 0.7);
        card.style.zIndex = 1000 - Math.abs(Math.round(distanceFromCenter));
        const blur = Math.min(normalizedDistance * 5, 10);
        card.style.backdropFilter = `blur(${10 + blur}px)`;
      });
    }
  
    setupEventListeners() {
      this.container.addEventListener('mousedown', this.startDragging.bind(this));
      window.addEventListener('mousemove', this.drag.bind(this));
      window.addEventListener('mouseup', this.stopDragging.bind(this));
      this.container.addEventListener('touchstart', this.startDragging.bind(this));
      window.addEventListener('touchmove', this.drag.bind(this));
      window.addEventListener('touchend', this.stopDragging.bind(this));
    }
  
    startDragging(e) {
      this.isDragging = true;
      this.startY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;
      this.scrollOffset = this.currentOffset;
      this.lastY = this.startY;
      this.lastTime = Date.now();
      this.velocity = 0;
  
      this.container.style.cursor = 'grabbing';
      clearInterval(this.momentumInterval);
    }
  
    drag(e) {
      if (!this.isDragging) return;
      e.preventDefault();
  
      const currentY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;
      const deltaY = this.lastY - currentY;
      const currentTime = Date.now();
      const deltaTime = currentTime - this.lastTime;
  
      this.velocity = deltaY / deltaTime;
      this.currentOffset = this.scrollOffset + (this.startY - currentY);
  
      this.updateCardsPosition();
  
      this.lastY = currentY;
      this.lastTime = currentTime;
    }
  
    stopDragging() {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.container.style.cursor = 'grab';
  
      if (Math.abs(this.velocity) > 0.1) {
        this.startMomentumScroll();
      }
    }
  
    startMomentumScroll() {
      let momentum = this.velocity * 120;
  
      this.momentumInterval = setInterval(() => {
        momentum *= 0.95;
        this.currentOffset += momentum;
  
        this.updateCardsPosition();
  
        if (Math.abs(momentum) < 0.01) {
          clearInterval(this.momentumInterval);
        }
      }, 16);
    }
  
    startAnimation() {
      this.animationFrame = requestAnimationFrame(() => {
        this.updateCardsPosition();
        this.startAnimation();
      });
    }
  }
  
  const carousel = new CardCarousel(document.getElementById('cardsWrapper'));
  