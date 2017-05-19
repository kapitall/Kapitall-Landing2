'use strict';

(function($, KapitallPageController){

var initParallax = function() {

    // Global variables
    var windowHeight = $(window).height();
    var parallaxElements = [];
    var itemFunctions = {};
    var $footer = $('#Footer');
    var $anchors = $('#parallax-nav ul li a[href*=#]');
    var anchors = [];
    var currentBG = $('section.intro').css('background-color');
    var introNavVisible = false;
    var now = Date.now || function() { return new Date().getTime(); };
    var oldIE;
    var gearAnimControl = true;

    // Detect ie8
    if ($('html').hasClass('ie8')) {
        oldIE = true;
    }

    // Underscore debounce
    var debounce = function(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) {
                    func.apply(context, args);
                }
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) {
                func.apply(context, args);
            }
        };
    };

    // Underscore throttle
    var throttle = function(func, wait, options) {
        var context, args, result;
        var timeout = null;
        var previous = 0;
        options = options || {};
        var later = function() {
            previous = options.leading === false ? 0 : now();
            timeout = null;
            result = func.apply(context, args);
            context = args = null;
        };
        return function() {
            var _now = now();

            if (!previous && options.leading === false) {
                previous = _now;
            }

            var remaining = wait - (_now - previous);
            context = this;
            args = arguments;

            if (remaining <= 0) {
                clearTimeout(timeout);
                timeout = null;
                previous = _now;
                result = func.apply(context, args);
                context = args = null;
            } else if (!timeout && options.trailing !== false) {
                timeout = setTimeout(later, remaining);
            }
            return result;
        };
    };

    var registerAnchors = function() {
        for(var n = 0; n < $anchors.length; n++) {
            var $currentAnchor = $anchors.eq(n);
            var $currentElem = $( $currentAnchor.attr('href') );
            var nextElemId = $currentAnchor.parent().next().find('a').attr('href');

            anchors[n] = [ $currentElem.offset().top, (nextElemId ? $(nextElemId).offset().top : 1000000), $currentAnchor.attr('id'), $currentAnchor.attr('href') ];
        }
    };

    var initQuoteBanner = function() {
        function cycle() {
            var $elements = $('#QuoteTicker li');

            $elements.eq(0).addClass('post');
            $elements.eq(1).removeClass('pre');

            setTimeout(function(){
                $elements.eq(0)
                    .addClass('none')
                    .removeClass('post')
                    .addClass('pre')
                    .appendTo('#QuoteTicker ul');
            }, 2000);
        }

        setInterval(cycle, 4500);

        var $ticker = $('#QuoteTicker');
        var showing = false;
        setInterval(function(){
            if(showing) { $ticker.fadeOut(); }
            else  { $ticker.fadeIn(); }
            showing = !showing;
        }, 18000);
    };

    var positionFooter = function() {
        $footer.css('top', windowHeight - 45 + 'px');
    };

    var flushParallaxState = function() {
        parallax(true);
    };

    var registerLayout = function() {
        positionFooter();
        registerFunctions();
        registerObjects();
        initQuoteBanner();
        flushParallaxState();
    };

    var adjustLayout = function() {
        var scrollTop = $(window).scrollTop();
        windowHeight = $(window).height();

        for(var id in parallaxElements) {
            parallaxElements[id].action(null, scrollTop, true);
            parallaxElements[id].inWindow = false;
        }

        registerAnchors();
        $('html,body').animate({scrollTop: 0}, '200', registerLayout);
    };



    /****** Parallax ******/

    var parallax = function(runAll) {
        var scrollTop = $(window).scrollTop();
        runAll = runAll ? runAll : false;

        // Check for current nav icon
        for(var n = 0; n < anchors.length; n++) {
            var anchorId = ' #' + anchors[n][2];
            var $anchorNode = $(anchorId);

            if($anchorNode.css('background-color') === currentBG) {
                $anchorNode.addClass('contrast');
            } else {
                $anchorNode.removeClass('contrast');
            }

            if( scrollTop >= anchors[n][0] && scrollTop < anchors[n][1] && anchors[n][2] !== 'IntroLink') {
                $anchorNode.removeClass('contrast').addClass('active');
                currentBG = $anchorNode.css('background-color');
            } else {
                $anchorNode.removeClass('active');
            }
        }

        // Hide/Show top nav icon
        if(scrollTop > windowHeight && introNavVisible === false) {
            $('nav.parallax-nav a#IntroLink').css('visibility', 'visible');
            introNavVisible = true;
        } else if (scrollTop < windowHeight) {
            $('nav.parallax-nav a#IntroLink').removeAttr('style');
            introNavVisible = false;
        }

        // Check scroll position for each parallax item
        for(var id in parallaxElements) {
            var vOffsetTop = scrollTop - parallaxElements[id].offsetTop;
            var vOffsetMod = parallaxElements[id].startMod === null ? parallaxElements[id].start : 0;

            if( (vOffsetTop >= parallaxElements[id].start) && ((vOffsetTop - vOffsetMod) <= parallaxElements[id].stop) ) {

                parallaxElements[id].inWindow = true;
                parallaxElements[id].action('enter', scrollTop, runAll);

            } else if( (vOffsetTop - vOffsetMod) > parallaxElements[id].stop) {

                parallaxElements[id].action('exit', scrollTop, runAll);
                parallaxElements[id].inWindow = false;

            } else if(vOffsetTop < parallaxElements[id].start) {

                parallaxElements[id].action(null, scrollTop, runAll);
                parallaxElements[id].inWindow = false;

            }
        }
    };



    /****** Register Objects ******/

    var registerObjects = function() {

        $('[data-id]').each(function() {
            var $el = $(this);
            var id = $el.data('id');
            var modifiedStart = null;
            var modifiedStop = null;

            // start modifier
            if($el.data('start') === 'window') {
                var startMultiplier = $el.data('start-modifier') ? parseFloat($el.data('start-modifier'), 10) : 1;
                modifiedStart = windowHeight * startMultiplier;
            } else if($el.data('start') === 'inView') {
                modifiedStart = -(windowHeight);
            }

            // stop modifier
            if($el.data('stop') === 'window') {
                var stopMultiplier = $el.data('stop-modifier') ? parseFloat($el.data('stop-modifier'), 10) : 1;
                modifiedStop = windowHeight * stopMultiplier;
            }

            var action = $el.data('action');

            parallaxElements[id] = {
                id: $el.data('id')
                ,startMod: $el.data('start-modifier') ? parseInt($el.data('start-modifier'),10) : null
                ,stopMod: $el.data('stop-modifier') ? parseInt($el.data('stop-modifier'),10) : null
                ,start: modifiedStart ? modifiedStart : parseInt($el.data('start'), 10)
                ,stop: modifiedStop ? modifiedStop : parseInt($el.data('stop'), 10)
                ,el: $el[0]
                ,elTop: $el.css('top')
                ,elRight: $el.css('right')
                ,elBottom: $el.css('bottom')
                ,elLeft: $el.css('left')
                ,offsetTop: Math.round($el.offset().top)
                ,height: $el.height()
                ,width: $el.width()
                ,action: $.proxy(itemFunctions[action], window, id)
                ,childNode: $el.find('.parallax-item')
                ,textNode: $el.find('.text-container')
                ,fadeDir: 'in'
                ,inWindow: false
            };
        });
    };



    /****** Register Functions ******/

    var registerFunctions = function() {
        itemFunctions = {
            stick: function(id, state, scrollTop, runAll) {

                if(parallaxElements[id].inWindow === true || runAll === true) {
                    var $elem = $(parallaxElements[id].el);

                    if(state === 'enter') {

                        if($elem.css('position') !== 'fixed' ) { $elem.css({position: 'fixed', top: parallaxElements[id].elTop}); }

                    } else if(state === 'exit') {

                        $elem.css({position: 'fixed', top: parallaxElements[id].elTop});

                    } else {
                        $elem.removeAttr('style');
                        if($elem.css('position') === 'fixed') { $elem.css('position', 'absolute'); }
                    }
                }

            },
            unstick: function(id, state, scrollTop, runAll) {

                if(parallaxElements[id].inWindow === true || runAll === true) {
                    var $child = parallaxElements[id].childNode;

                    if(state === 'enter') {

                        if($child.css('position') !== 'absolute') {
                            $child.removeAttr('style');
                            $child.css({position: 'absolute', top: -45 + 'px'});
                        }

                    } else {
                        $child.css({position: 'fixed', top: windowHeight - 45 + 'px'});
                    }
                }

            },
            spinGear: function(id, state, scrollTop, runAll) {

                if(parallaxElements[id].inWindow === true || runAll === true) {
                    var $elem = $(parallaxElements[id].el);

                    if(state === 'enter') {
                        var i = 0;
                        var gear = function() {

                            var gearPos = -(Math.floor( i / 2.6315789473684212) * 300);

                            if (i < 100) {
                                $elem.find('.gear').css({backgroundPosition: gearPos + 'px 0px'});
                            } else {
                                $elem.find('.gear').css({ backgroundPosition: '0px 0px' });
                                clearInterval(gearInterval);
                            }

                            gearAnimControl = false;
                            i++;
                        };

                        if(gearAnimControl) { var gearInterval = setInterval(gear, 5); }

                        if($elem.css('position') !== 'fixed' ) { $elem.css({position: 'fixed', top: parallaxElements[id].elTop}); }

                    } else if(state === 'exit') {
                        $elem.css({position: 'fixed', top: parallaxElements[id].elTop});
                        $elem.find('.gear').css({ backgroundPosition: '0px 0px' });
                        gearAnimControl = true;

                    } else {
                        $elem.removeAttr('style');
                        if($elem.css('position') === 'fixed') { $elem.css('position', 'absolute'); }
                        $elem.find('.gear').removeAttr('style');
                        gearAnimControl = true;

                    }
                }

            },
            slideIn: function(id, state, scrollTop, runAll) {

                if(parallaxElements[id].inWindow === true || runAll === true) {
                    var $elem = $(parallaxElements[id].el);

                    if(state === 'enter') {
                        var scrollDiff = scrollTop - (parallaxElements[id].start + parallaxElements[id].offsetTop);
                        var leftPercentage = 100 - ((scrollDiff / windowHeight) * 100);

                        if($elem.css('position') !== 'fixed' ) { $elem.css({position: 'fixed', top: 0}); }

                        if(oldIE) {
                            if(leftPercentage >= 0) { $elem.css({left: leftPercentage + '%'}); } else { $elem.css('left', '0px'); }
                        } else {
                            if(leftPercentage >= 0) { $elem.css({transform: 'translateX(' + leftPercentage + '%)'}); } else { $elem.css('transform', 'translateX(0px)'); }
                        }

                    } else if(state === 'exit') {

                        $elem.css({position: 'fixed', top: 0});
                        if(oldIE) {
                            $elem.css('left', '0px');
                        } else {
                            $elem.css('transform', 'translateX(0px)');
                        }

                    } else {
                        $elem.removeAttr('style');
                        if($elem.css('position') === 'fixed') { $elem.css('position', 'absolute'); }
                    }
                }

            },
            fadeIn: function(id, state, scrollTop, runAll) {

                if(parallaxElements[id].inWindow === true || runAll === true) {
                    var $elem = $(parallaxElements[id].el);
                    var $textNode = parallaxElements[id].textNode;
                    var scrollOffset = scrollTop - (parallaxElements[id].start + parallaxElements[id].offsetTop);

                    if(state === 'enter') {
                        var scrollPercentage = scrollOffset / parallaxElements[id].stop;

                        if( $elem.css('position') !== 'fixed' ) { $elem.css({ position: 'fixed', top: 0 }); }
                        $textNode.css('opacity', scrollPercentage);

                    } else if(state === 'exit') {

                        $elem.css({ position: 'fixed', top: 0 });
                        $textNode.css('opacity', 1);

                    } else {
                        $elem.removeAttr('style');
                        if($elem.css('position') === 'fixed') { $elem.css('position', 'absolute'); }
                        $textNode.removeAttr('style');

                    }
                }

            },
            fadeOut: function(id, state, scrollTop, runAll) {

                if(parallaxElements[id].inWindow === true || runAll === true) {
                    var $elem = $(parallaxElements[id].el);
                    var $textNode = parallaxElements[id].textNode;
                    var scrollOffset = scrollTop - (parallaxElements[id].start + parallaxElements[id].offsetTop);

                    if(state === 'enter') {
                        var scrollPercentage = 1-(scrollOffset / parallaxElements[id].stop);

                        if( $elem.css('position') !== 'fixed' ) { $elem.css({ position: 'fixed', top: 0 }); }
                        $textNode.css('opacity', scrollPercentage);

                    } else if(state === 'exit') {

                        $elem.css({ position: 'fixed', top: 0 });
                        $textNode.css('opacity', 0);

                    } else {
                        $elem.removeAttr('style');
                        if($elem.css('position') === 'fixed') { $elem.css('position', 'absolute'); }
                        $textNode.removeAttr('style');

                    }
                }

            },
            fadeInOut: function(id, state, scrollTop, runAll) {

                if(parallaxElements[id].inWindow === true || runAll === true) {
                    var $elem = $(parallaxElements[id].el);
                    var $textNode = parallaxElements[id].textNode;

                    if(state === 'enter') {
                        var scrollOffset = scrollTop - (parallaxElements[id].start + parallaxElements[id].offsetTop);
                        var sectionDivision = Math.min( scrollOffset, (parallaxElements[id].stop - scrollOffset));
                        var scrollPercentage;

                        if(parallaxElements[id].fadeDir === 'in') {
                            scrollPercentage = (sectionDivision / windowHeight) * 2;
                        } else {
                            scrollPercentage = 1 - ((scrollOffset / windowHeight) * 2);
                        }

                        if( $elem.css('position') !== 'fixed' ) {
                            $elem.css({ position: 'fixed', top: 0});
                        }

                        $textNode.css({ opacity: scrollPercentage });

                        if(scrollPercentage >= 1) {
                            parallaxElements[id].fadeDir = 'out';
                        }

                    } else if(state === 'exit') {

                        $elem.css({ position: 'fixed', top: 0});
                        $textNode.css('opacity', 0);
                        parallaxElements[id].fadeDir = 'in';

                    } else {
                        $elem.removeAttr('style');
                        if($elem.css('position') === 'fixed') { $elem.css('position', 'absolute'); }
                        $textNode.removeAttr('style');
                        parallaxElements[id].fadeDir = 'in';

                    }
                }

            },
            fadeInQuotes: function(id, state, scrollTop, runAll) {

                if(parallaxElements[id].inWindow === true || runAll === true) {
                    var $elem = $(parallaxElements[id].el);
                    var $child = parallaxElements[id].childNode;
                    var scrollOffset = scrollTop - (parallaxElements[id].start + parallaxElements[id].offsetTop);

                    if(state === 'enter') {
                        var scrollPercentage = (scrollOffset / parallaxElements[id].stop) * 100;

                        if($elem.css('position') !== 'fixed' ) { $elem.css({position: 'fixed', top: parallaxElements[id].elTop}); }

                        if(scrollPercentage < 47) {
                            $child.css('bottom', scrollPercentage + '%');
                        } else {
                            $child.css('bottom', '47%');
                        }

                        if (scrollPercentage > 50) { $child.find('.quote-finance').addClass('visible'); } else { $child.find('.quote-finance').removeClass('visible'); }
                        if (scrollPercentage > 53) { $child.find('.quote-mashable').addClass('visible'); } else { $child.find('.quote-mashable').removeClass('visible'); }
                        if (scrollPercentage > 56) { $child.find('.quote-readwrite').addClass('visible'); } else { $child.find('.quote-readwrite').removeClass('visible'); }
                        if (scrollPercentage > 59) { $child.find('.quote-huffington').addClass('visible'); } else { $child.find('.quote-huffington').removeClass('visible'); }
                        if (scrollPercentage > 62) { $child.find('.quote-usa').addClass('visible'); } else { $child.find('.quote-usa').removeClass('visible'); }
                        if (scrollPercentage > 65) { $child.find('.quote-bloomberg').addClass('visible'); } else { $child.find('.quote-bloomberg').removeClass('visible'); }
                        if (scrollPercentage > 68) { $child.find('.quote-pc').addClass('visible'); } else { $child.find('.quote-pc').removeClass('visible'); }

                    } else if(state === 'exit') {

                        $elem.css({position: 'fixed', top: parallaxElements[id].elTop});
                        $child.css('bottom', '47%');

                        $child.find('.quote-finance').addClass('visible');
                        $child.find('.quote-mashable').addClass('visible');
                        $child.find('.quote-readwrite').addClass('visible');
                        $child.find('.quote-huffington').addClass('visible');
                        $child.find('.quote-usa').addClass('visible');
                        $child.find('.quote-bloomberg').addClass('visible');
                        $child.find('.quote-pc').addClass('visible');

                    } else {
                        $elem.removeAttr('style');
                        $child.removeAttr('style');

                        $child.find('.quote-finance').removeClass('visible');
                        $child.find('.quote-mashable').removeClass('visible');
                        $child.find('.quote-readwrite').removeClass('visible');
                        $child.find('.quote-huffington').removeClass('visible');
                        $child.find('.quote-usa').removeClass('visible');
                        $child.find('.quote-bloomberg').removeClass('visible');
                        $child.find('.quote-pc').removeClass('visible');

                        if($elem.css('position') === 'fixed') { $elem.css('position', 'absolute'); }
                    }
                }

            },
            stickCoin: function(id, state, scrollTop, runAll) {

                if(parallaxElements[id].inWindow === true || runAll === true) {
                    var $elem = $(parallaxElements[id].el);
                    var $icon = parallaxElements[id].childNode;
                    var $textNode = parallaxElements[id].textNode;
                    var scrollOffset = scrollTop - (parallaxElements[id].start + parallaxElements[id].offsetTop);

                    if(state === 'enter') {
                        var scrollPercentage = 1-((scrollOffset / parallaxElements[id].stop) * 3); // multiplied by number of window heights

                        if( $elem.css('position') !== 'fixed' ) { $elem.css({ position: 'fixed', top: parallaxElements[id].elTop }); }
                        if( !$icon.hasClass('in-place') ) { $icon.addClass('in-place').removeClass('dropped'); }
                        $textNode.css('opacity', scrollPercentage);

                    } else if(state === 'exit') {

                        $elem.css({ position: 'fixed', top: parallaxElements[id].elTop });
                        $textNode.css('opacity', 0);
                        $icon.addClass('dropped').removeClass('in-place');

                    } else {
                        $elem.removeAttr('style');
                        if($elem.css('position') === 'fixed') { $elem.css('position', 'absolute'); }
                        $icon.removeClass('in-place');
                        $textNode.removeAttr('style');

                    }
                }

            },
            stickAndDrop: function(id, state, scrollTop, runAll) {

                if(parallaxElements[id].inWindow === true || runAll === true) {
                    var $elem = $(parallaxElements[id].el);
                    var $icon = parallaxElements[id].childNode;
                    var $textNode = parallaxElements[id].textNode;

                    if(state === 'enter') {
                        var scrollOffset = scrollTop - (parallaxElements[id].start + parallaxElements[id].offsetTop);
                        var sectionDivision = Math.min( scrollOffset, ( (parallaxElements[id].stop / parseInt(parallaxElements[id].stopMod, 10)) - scrollOffset));
                        var scrollPercentage;

                        if(parallaxElements[id].fadeDir === 'in') {
                            scrollPercentage = (sectionDivision / windowHeight) * 2;
                        } else {
                            scrollPercentage = 1 - ((scrollOffset / windowHeight) * 2);
                        }

                        if($elem.css('position') !== 'fixed' ) { $elem.css({position: 'fixed', top: parallaxElements[id].elTop}); }
                        if( !$icon.hasClass('in-place') ) { $icon.addClass('in-place').removeClass('dropped'); }

                        $textNode.css({ opacity: scrollPercentage });

                        if(scrollPercentage >= 1) {
                            parallaxElements[id].fadeDir = 'out';
                        }

                    } else if(state === 'exit') {

                        $elem.css({position: 'fixed', top: parallaxElements[id].elTop});
                        $icon.addClass('dropped').removeClass('in-place');
                        $textNode.css('opacity', 0);
                        parallaxElements[id].fadeDir = 'in';

                    } else {
                        $elem.removeAttr('style');
                        if($elem.css('position') === 'fixed') { $elem.css('position', 'absolute'); }
                        $icon.removeClass('in-place');
                        $textNode.removeAttr('style');
                        parallaxElements[id].fadeDir = 'in';

                    }
                }

            },
            dropItems: function(id, state, scrollTop, runAll) {

                if(parallaxElements[id].inWindow === true || runAll === true) {
                    var $elem = $(parallaxElements[id].el);
                    var $shirt = $elem.find('.items-shirt');
                    var $lessons = $elem.find('.items-lessons');
                    var $token = $elem.find('.items-token');

                    if(state === 'enter') {
                        var scrollPercentage =  100 - (((scrollTop - (parallaxElements[id].start + parallaxElements[id].offsetTop)) / windowHeight) * 100);

                        if($elem.css('position') !== 'fixed' ) { $elem.css({position: 'fixed', top: parallaxElements[id].elTop}); }

                        if(scrollPercentage < 90) { $shirt.addClass('dropped'); } else { $shirt.removeClass('dropped'); }
                        if(scrollPercentage < 85) { $lessons.addClass('dropped'); } else { $lessons.removeClass('dropped'); }
                        if(scrollPercentage < 80) { $token.addClass('dropped'); } else { $token.removeClass('dropped'); }

                    } else if(state === 'exit') {
                        $shirt.addClass('dropped');
                        $lessons.addClass('dropped');
                        $token.addClass('dropped');
                        $elem.css('position', 'fixed');

                    } else {
                        $shirt.removeClass('dropped');
                        $lessons.removeClass('dropped');
                        $token.removeClass('dropped');
                        $elem.removeAttr('style');
                    }
                }

            },
            dragDrop: function(id, state, scrollTop, runAll) {

                if(parallaxElements[id].inWindow === true || runAll === true) {
                    var $elem = $(parallaxElements[id].el);

                    if(state === 'enter') {
                        var scrollDiff = scrollTop - (parallaxElements[id].start + parallaxElements[id].offsetTop);
                        var scrollPercentage = (scrollDiff / windowHeight) * 100;
                        var $chip = $elem.find('.chip');

                        if($elem.css('position') !== 'fixed' ) {
                            $elem.css({position: 'fixed', top: parallaxElements[id].elTop});
                        }

                        $elem.css('visibility', 'visible');
                        $elem.find('.drag').css({ backgroundPosition: 100 + '% 0px' });

                        if(oldIE) {

                            if(scrollPercentage >= 0 && scrollPercentage <= 100) {
                                $chip.css({left: '0px', top: scrollPercentage + '%'});
                            } else {
                                $chip.css({left: '0px', top: '0px'});
                            }

                        } else {

                            if(scrollPercentage >= 0 && scrollPercentage <= 100) {
                                $chip.css({transform: 'translateX(-' + (scrollPercentage < 33.333 ? ( scrollPercentage * 3 ) : '100') + '%) translateY(' + scrollPercentage + '%)'});
                            } else {
                                $chip.css('transform', 'translateX(0px) translateY(0px)');
                            }

                        }

                    } else if(state === 'exit') {

                        $elem.css('visibility', 'hidden');

                    } else {
                        $elem.removeAttr('style');
                        $elem.find('.drag').removeAttr('style');
                        if($elem.css('position') === 'fixed') { $elem.css('position', 'absolute'); }

                    }
                }

            },
            trade: function(id, state, scrollTop, runAll) {

                if(parallaxElements[id].inWindow === true || runAll === true) {
                    var $elem = $(parallaxElements[id].el);

                    if(state === 'enter') {
                        var scrollDiff = scrollTop - (parallaxElements[id].start + parallaxElements[id].offsetTop);
                        var scrollPercentage = (scrollDiff / windowHeight) * 25;
                        var resultPos = -(Math.floor( scrollPercentage / 1.666666666667) * 300);

                        if($elem.css('position') !== 'fixed' ) { $elem.css({position: 'fixed', top: 0}); }
                        $elem.css('visibility', 'visible');
                        $elem.find('.trade').css({ backgroundPosition: resultPos + 'px 0px' });

                    } else if(state === 'exit') {

                        $elem.css({
                            position: 'absolute'
                            ,top: 0
                        });
                        $elem.parent().css({
                            top: 'auto'
                            ,bottom: 0
                        });
                        $elem.find('.trade').css({ backgroundPosition: '-8700px 0px' });

                    } else {
                        $elem.removeAttr('style');
                        $elem.parent().removeAttr('style');
                        $elem.find('.trade').removeAttr('style');
                        if($elem.css('position') === 'fixed') { $elem.css('position', 'absolute'); }

                    }
                }

            }
        };
    };


    /****** Event Listeners ******/

    // scroll
    /* jshint ignore:start */
    var touchSupported = (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch);
    if(touchSupported && window.addEventListener) {
        window.addEventListener('touchmove', throttle(parallax, 20), false);
    }
    /* jshint ignore:end */

    var scrollThrottled = throttle(parallax, 20);
    var scrollDebounced = debounce(flushParallaxState, 50);

    var afterScroll = function() {
        scrollThrottled();
        scrollDebounced();
    };

    window.onscroll = afterScroll;


    // resize
    $(window).resize(debounce(adjustLayout, 200));

    // always scroll to top on refresh
    window.onload = function() {
     setTimeout (function () {
      scrollTo(0,0);
     }, 0);
    };

    // navigation
    $('a[href*=#]:not([href=#])').click(function() {
        if (location.pathname.replace(/^\//,'') === this.pathname.replace(/^\//,'') && location.hostname === this.hostname) {
            var $target = $(this.hash);
            $target = $target.length ? $target : $('[name=' + this.hash.slice(1) +']');

            if ($target.length) {
                $('html,body').animate({
                    scrollTop: $target.offset().top
                }, 1000, flushParallaxState);
                return false;
            }
        }
    });

    // trade now button
    $('#tradeBtn').on('click', function(){
        KapitallPageController.fireMessage('toggleSignUp');
    });

    registerAnchors();
    registerLayout();

};

KapitallPageController.addModule(function() {
    initParallax();
});

}(jQuery, window.KapitallPageController));