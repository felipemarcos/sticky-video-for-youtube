class StickyVideo {
  constructor() {
    this.options = {
      observe: {
        childList: true,
        subtree: true
      },
      isStickied: false
    };

    this._reload();
    this._watchPlayerChanges();
  }

  stick() {
    if (this.options.isStickied) {
      return;
    }

    this.options.isStickied = true;
    this.player.classList.add('player-sticky');

    if (this.sidebar) {
      const sidebarPosition = this.sidebar.getBoundingClientRect();
      this.playerApi.style.right = document.body.clientWidth - sidebarPosition.right + 'px';
      this.playerApi.style.width = sidebarPosition.width + 'px';
    }

    window.dispatchEvent(new Event('resize'));
  }

  unstick() {
    if (!this.options.isStickied) {
      return;
    }

    this.options.isStickied = false;
    this.player.classList.remove('player-sticky');
    this.playerApi.style.removeProperty('width');
    this.playerApi.style.removeProperty('right');
    window.dispatchEvent(new Event('resize'));
  }

  handleScroll() {
    if (window.scrollY > this.scrollHeight && window.innerWidth > 640) {
      this.stick();
    } else {
      this.unstick();
    }
  }

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

  _watchPlayerChanges() {
    const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    this.observer = new MutationObserver( this._reload.bind(this) );

    this.observer.observe(document.querySelector('#player'), this.options.observe);
  }

  // Runs everytime the player changes
  _reload(mutations) {
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
  }

  _removeListeners() {
    if (this.listener) {
      window.removeEventListener('scroll', this.listener);
    }
  }

  _listeners() {
    this.listener = this.throttle(this.handleScroll.bind(this), 10);
    window.addEventListener('scroll', this.listener);

    this.handleScroll();
  }

  _destroy() {
    this.observer.disconnect();
    this._removeListeners();
    this.unstick();
    this.options.isStickied = false;
  }

  _init() {
    this._listeners();
  }
}

new StickyVideo();
