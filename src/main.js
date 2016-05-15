class StickyVideo {
  constructor() {
    this.options = {
      observe: {
        childList: true,
        subtree: true
      }
    };

    this._reload();

    this._controls();
    this._watchPlayerChanges();
  }

  stick() {
    this.player.classList.add('player-sticky');

    if (this.sidebar) {
      const sidebarPosition = this.sidebar.getBoundingClientRect();
      this.playerApi.style.right = document.body.clientWidth - sidebarPosition.right + 'px';
      this.playerApi.style.width = sidebarPosition.width + 'px';
    }
  }

  unstick() {
    this.player.classList.remove('player-sticky');
    this.playerApi.style.removeProperty('width');
    this.playerApi.style.removeProperty('right');
  }

  handleScroll() {
    if (window.scrollY > this.scrollHeight && window.innerWidth > 640) {
      this.stick();
    } else {
      this.unstick();
    }
  }

  // Utils
  throttle(callback, limit) {
    let wait = false;

    return () => {
      if (!wait) {
        callback.call();
        wait = true;

        setTimeout(() => {
          wait = false;
        }, limit);
      }
    }
  }

  isVideoPage() {
    return location.pathname === '/watch';
  }

  _controls() {
    const button = document.createElement('button');
    button.classList.add('player-sticky-controls');
    button.innerHTML = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 988 982" enable-background="new 0 0 988 982" xml:space="preserve"> <path d="M496,10C232,10,16,226,16,490s216,480,480,480s480-216,480-480S760,10,496,10z M736,670l-60,60L496,550L316,730l-60-60 l180-180L256,310l60-60l180,180l180-180l60,60L556,490L736,670z"/></svg>';

    if (this.playerApi) {
      this.playerApi.appendChild(button);
    }

    button.addEventListener('click', this._destroy.bind(this));
  }

  _watchPlayerChanges() {
    const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    this.observer = new MutationObserver( this._reload.bind(this) );

    this.observer.observe(document.querySelector('#player'), this.options.observe);
  }

  // Runs everytime the player changes
  _reload() {
    if (!this.isVideoPage()) {
      return;
    }

    this._removeListeners();
    this._setPlayer();
    this._init();
  }

  _setPlayer() {
    this.playerApi = document.querySelector('#player-api');
    this.player = document.querySelector('#player');
    this.sidebar = document.querySelector('#watch7-sidebar-contents');

    this.scrollHeight = this.playerApi.clientHeight;
    window.dispatchEvent(new Event('resize'));
  }

  _removeListeners() {
    if (this.listener) {
      window.removeEventListener('scroll', this.listener);
      window.removeEventListener('resize', this.listener);
    }
  }

  _listeners() {
    this.listener = this.throttle(this.handleScroll.bind(this), 10);

    window.addEventListener('scroll', this.listener);
    window.addEventListener('resize', this.listener);

    this.handleScroll();
  }

  _destroy() {
    this.observer.disconnect();
    this._removeListeners();
    this.unstick();
  }

  _init() {
    this._listeners();
  }
}

new StickyVideo();
