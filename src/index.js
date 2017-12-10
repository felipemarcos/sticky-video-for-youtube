class StickyVideo {
  constructor() {
    this._reload = this._reload.bind(this);
    this._watchPlayerChanges = this._watchPlayerChanges.bind(this);
    this._handleScroll = this._handleScroll.bind(this);
    this._initNew = this._initNew.bind(this);
    this._initOld = this._initOld.bind(this);

    this.isSticky = false;
    // The new YouTube uses Polymer, so we test if a polymer element exists.
    this.isNewYouTube = document.querySelector('#masthead') || document.querySelector('#polymer-app');

    this.options = {
      observe: {
        childList: true,
        subtree: true
      }
    };

    this._reload();
    this.select(this._initNew, this._initOld)();
  }

  stick() {
    if (this.isSticky) {
      return;
    }

    this.isSticky = true;
    this.player.classList.add('player-sticky');

    if (this.sidebar) {
      const sidebarPosition = this.sidebar.getBoundingClientRect();
      this.playerVideo.style.right = document.body.clientWidth - sidebarPosition.right + 'px';
      this.playerVideo.style.width = sidebarPosition.width + 'px';
    }

    window.dispatchEvent(new Event('resize'));
  }

  unstick() {
    if (!this.isSticky) {
      return;
    }

    this.isSticky = false;
    this.player.classList.remove('player-sticky');
    this.playerVideo.style.removeProperty('width');
    this.playerVideo.style.removeProperty('right');
    window.dispatchEvent(new Event('resize'));
  }

  _handleScroll() {
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
    const element = document.querySelector( this.select('ytd-watch', '#player') );

    if (!element) {
      return;
    }

    const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

    this.observer = new MutationObserver( this._reload );
    this.observer.observe(element, this.options.observe);

    window.removeEventListener('yt-action', this._watchPlayerChanges);
  }

  // Runs everytime the player changes
  _reload(mutations) {
    if (!this.isVideoPage()) {
      return;
    }

    this._removeListeners();
    this._setPlayer();
    this._listeners();
  }

  _setPlayer() {
    const player = this.select('ytd-watch #player', '#player');
    const playerVideo = this.select('ytd-watch #player', '#player-api');
    const sidebar = this.select('#related', '#watch7-sidebar-contents');

    this.player = document.querySelector( player );
    this.playerVideo = document.querySelector( playerVideo );
    this.sidebar = document.querySelector( sidebar );

    if (this.playerVideo) {
      this.scrollHeight = this.playerVideo.clientHeight;
    }
  }

  _removeListeners() {
    if (this.listener) {
      window.removeEventListener('scroll', this.listener);
    }
  }

  _listeners() {
    this.listener = this.throttle(this._handleScroll, 10);
    window.addEventListener('scroll', this.listener);

    this._handleScroll();
  }

  _destroy() {
    this.observer.disconnect();

    this._removeListeners();
    this.unstick();
  }

  _initNew() {
    console.log('Sticky Video - New YouTube');
    window.addEventListener('yt-action', this._watchPlayerChanges);
  }

  _initOld() {
    console.log('Sticky Video - Old YouTube');
    this._watchPlayerChanges();
  }

  select(newProp, oldProp) {
    return this.isNewYouTube ? newProp : oldProp;
  }
}

new StickyVideo();
