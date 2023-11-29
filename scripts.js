(function () {
  class Carousel extends HTMLElement {
    screenCount = 0;
    scrollInterval;
    swipeStartPos = 0;
    swipeEndPos = 0;
    imagesPerSlide = this.getAttribute("imagesPerSlide") || 3;
    totalImageGrid = 12;
    images = this.getAttribute("images")
      ? this.getAttribute("images").split(",")
      : [];
    constructor() {
      super();
      this.renderView();
    }
    renderView() {
      const styleLinks = [
        "style.css",
        "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css",
        "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.min.css",
      ];
      this.attachShadow({ mode: "open" });
      this.shadowRoot.innerHTML = `
			<div id="carouselContainer">
				<div class="row" id="carouselSection">
				</div>
				<button id="previousIcon">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-arrow-left-circle-fill" viewBox="0 0 16 16">
						<path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0m3.5 7.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5z"/>
					</svg>
				</button>
				<button id="nextIcon">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-arrow-right-circle-fill" viewBox="0 0 16 16">
						<path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0M4.5 7.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5z"/>
					</svg>
				</button>
				<div id="dotsButtonGroup" class="text-center">
				</div>
			</div>`;
      styleLinks.forEach((styleLinkUrl) => {
        const styleLink = document.createElement("link");
        styleLink.setAttribute("rel", "stylesheet");
        styleLink.setAttribute("href", styleLinkUrl);
        this.shadowRoot.appendChild(styleLink);
      });
    }
    connectedCallback() {
      const carouselContainerElement =
        this.shadowRoot.querySelector("#carouselContainer");
      const previousIconBtn = this.shadowRoot.querySelector("#previousIcon");
      const nextIconBtn = this.shadowRoot.querySelector("#nextIcon");
      const carouselSection = this.shadowRoot.querySelector("#carouselSection");
      this.appendImages();
      this.addDotsAndListenersToDot();
      carouselContainerElement.addEventListener(
        "mouseenter",
        this.pauseCarouselAnimation.bind(this)
      );
      carouselContainerElement.addEventListener(
        "mouseleave",
        this.carouselAnimation.bind(this)
      );
      previousIconBtn.addEventListener(
        "click",
        this.moveSlideBackward.bind(this)
      );
      nextIconBtn.addEventListener("click", this.moveSlideForward.bind(this));
      carouselSection.addEventListener(
        "touchstart",
        (event) => {
          this.swipeStartPos = event.touches[0].clientX;
          this.pauseCarouselAnimation();
        },
        { passive: true }
      );
      carouselSection.addEventListener(
        "touchmove",
        (event) => {
          this.swipeEndPos = event.touches[0].clientX;
        },
        { passive: true }
      );
      carouselSection.addEventListener(
        "touchend",
        () => {
          this.handleScreenSwipe();
          this.carouselAnimation();
        },
        { passive: true }
      );
      this.carouselAnimation();
    }
    appendImages() {
      const carouselSection = this.shadowRoot.querySelector("#carouselSection");
      for (let img of this.images) {
        const imageElement = document.createElement("img");
        imageElement.src = img;
        imageElement.alt = "slide image";
        const imageWidth = this.totalImageGrid / this.imagesPerSlide;
        imageElement.classList.add("col-" + imageWidth);
        carouselSection.appendChild(imageElement);
      }
    }
    addDotsAndListenersToDot() {
      const btnGroupElement = this.shadowRoot.querySelector("#dotsButtonGroup");
      const numberOfDots =
        this.images.length % this.imagesPerSlide
          ? Math.floor(this.images.length / this.imagesPerSlide) + 1
          : Math.floor(this.images.length / this.imagesPerSlide);
      for (let i = 0; i < numberOfDots; i++) {
        const dotsButton = document.createElement("button");
        dotsButton.classList.add("dot");
        if (i == 0) {
          dotsButton.classList.add("active");
        }
        btnGroupElement.appendChild(dotsButton);
      }
      for (let i = 0; i < btnGroupElement.children.length; i++) {
        const dotButton = btnGroupElement.children[i];
        dotButton.addEventListener("click", () => this.moveFrame(i));
      }
    }
    updateDotBasedOnSlide() {
      const btnGroupElement = this.shadowRoot.querySelector("#dotsButtonGroup");
      for (let i = 0; i < btnGroupElement.children.length; i++) {
        btnGroupElement.children[i].classList.remove("active");
      }
      btnGroupElement.children[this.screenCount].classList.add("active");
    }
    moveFrame(slideIndex) {
      const carouselSection = this.shadowRoot.querySelector("#carouselSection");
      if (slideIndex >= 0) {
        this.screenCount = slideIndex;
      }
      carouselSection.style.transform = `translateX(${
        -carouselSection.clientWidth * this.screenCount
      }px)`;
      this.updateDotBasedOnSlide();
    }
    incrementSlide() {
      if (
        this.screenCount >=
        Math.ceil(this.images.length / this.imagesPerSlide) - 1
      ) {
        this.screenCount = 0;
      } else this.screenCount++;
    }
    decrementSlide() {
      if (this.screenCount <= 0) {
        this.screenCount =
          Math.ceil(this.images.length / this.imagesPerSlide) - 1;
      } else this.screenCount--;
    }
    moveSlideForward() {
      this.incrementSlide();
      this.moveFrame();
    }
    moveSlideBackward() {
      this.decrementSlide();
      this.moveFrame();
    }
    carouselAnimation() {
      this.scrollInterval = setInterval(() => this.moveSlideForward(), 3000);
    }
    pauseCarouselAnimation() {
      clearInterval(this.scrollInterval);
    }
    handleScreenSwipe() {
      const swipePosDiff = this.swipeStartPos - this.swipeEndPos;
      const minimumPosDifference = 100;

      if (Math.abs(swipePosDiff) > minimumPosDifference) {
        if (swipePosDiff > 0) {
          this.moveSlideForward();
        } else {
          this.moveSlideBackward();
        }
      }
    }
  }
  customElements.define("carousel-element", Carousel);
})();
