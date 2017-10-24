(function() {
  function ResizeObserver(callback) {
    this.__callback = callback;
    this.__observers = new Map();
  }

  ResizeObserver.prototype.observe = function(target) {
    var _this = this;
    var observer = new IntersectionObserver(function(entries) {
      _this.__callback([mapEntry(entries[0], target)], _this);
    }, {
      root: target,
      rootMargin: '0px',
      threshold: buildThresholdList(1000)
    });

    var resizer = document.createElement('x-y-z-resize-observer');
    // Maybe change pointer-events + opacity to visibility: hidden;
    resizer.style.cssText = 'display:block;position:absolute;top:0;left:0;width:100%;height:100%;pointer-events: none;opacity: 0;'

    target.appendChild(resizer);
    observer.__resizer = resizer;
    observer.observe(resizer);
    this.__observers.set(target, observer);
  };

  ResizeObserver.prototype.unobserve = function(target) {
    var observer = this.__observers.get(target);
    if (!observer) return;

    observer.disconnect();
    observer.__resizer.remove();
    observer.__resizer = null;
    this.__observers.delete(target);
  };

  ResizeObserver.prototype.disconnect = function() {
    this.__observers.forEach(function(observer) {
      observer.disconnect();
      observer.__resizer.remove();
      observer.__resizer = null;
    });

    this.__observers.clear();
  };

  window.ResizeObserver2 = ResizeObserver;

  function mapEntry(entry, target) {
    console.log(entry);

    var paddingRight = entry.boundingClientRect.right - entry.intersectionRect.right;
    var paddingLeft = entry.boundingClientRect.width - entry.intersectionRect.width - paddingRight;
    var paddingBottom = entry.boundingClientRect.bottom - entry.intersectionRect.bottom;
    var paddingTop = entry.boundingClientRect.height - entry.intersectionRect.height - paddingBottom;

    var width = entry.intersectionRect.width;
    var height = entry.intersectionRect.height;

    return {
      target: target,
      contentRect: {
        width: width,
        height: height,

        left: paddingLeft,
        top: paddingTop,
        x: paddingLeft,
        y: paddingTop,

        right: width + paddingLeft,
        bottom: height + paddingTop
      }
    };
  }

  function buildThresholdList(numSteps) {
    var thresholds = [];

    for (var i=1.0; i<=numSteps; i++) {
      var ratio = i/numSteps;
      thresholds.push(ratio);
    }

    thresholds.push(0);
    return thresholds;
  }
})();