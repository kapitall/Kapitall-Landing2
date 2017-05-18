'use strict';

(function($, KapitallPageController){

	var utilities = {
		now : Date.now || function() {
			return new Date().getTime();
		},
		debounce : function(func, wait, context, immediate) {
			var timeout;
			return function() {
			    context = context || this;
			    var args = arguments;
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
		},
	    throttle : function(func, wait, context, options) {
			var self = this;
			var args, result;
			var timeout = null;
			var previous = 0;
			options = options || {};
			var later = function() {
			    previous = options.leading === false ? 0 : self.now();
			    timeout = null;
			    result = func.apply(context, args);
				args = null;
			};
			return function() {
			    var _now = self.now();

			    if (!previous && options.leading === false) {
			        previous = _now;
			    }

			    var remaining = wait - (_now - previous);
			    context = context || this;
			    args = arguments;

			    if (remaining <= 0) {
			        clearTimeout(timeout);
			        timeout = null;
			        previous = _now;
			        result = func.apply(context, args);
			        args = null;
			    } else if (!timeout && options.trailing !== false) {
			        timeout = setTimeout(later, remaining);
			    }

			    return result;
			};
		}
	};


	var ParallaxPage = function() {
		this.$window = $(window);
		this.windowHeight = this.$window.height();
		this.windowWidth = this.$window.width();
		this.$loading = $('div.loading');
		this.lastScrollY = 0;
		this.pageYOffset = this.$window.scrollTop();
		this.$header = $('#Header');
		this.$joinButton = $('#parallax-join-now');
		this.$sections = $('section.parallax');
		this.sectionData = {};
	};


	ParallaxPage.prototype.init = function() {
		var self = this;

		$.each(this.$sections, function(i, val) {
			var $val = $(val);
			self.sectionData[ $val.attr('id') ] = {
				'index': i,
				'offset': $val.offset().top
			};
		});

		this.attachPageEvents();
	};


	ParallaxPage.prototype.attachPageEvents = function() {
		var self = this;

		$('[data-switch]').on('touchend mouseup', function(e) {
			e.preventDefault();
			var elem = this;

			self.changeState(elem);
		});

	    $('#parallax-join-now, #SignUpToggle').on('click', function(){
	        KapitallPageController.fireMessage('toggleSignUp');
	    });

		$('a[data-section]').on('click', function(e) {
			e.preventDefault();

			var target = $('#' + this.dataset.section);

			if (target.length) {
				$('html,body').animate({
					scrollTop: target.offset().top
				}, 700);

				return false;
			}
		});

		var parallaxScroll = this.parallaxScroll;
		var sizeIntro = this.sizeIntro;

		this.$window.on({
			scroll: utilities.throttle(parallaxScroll, 300, self),
			resize: utilities.debounce(sizeIntro, 200, self)
		});

		this.sizeIntro(true);
	};


	ParallaxPage.prototype.sizeIntro = function(isInit) {
		this.windowHeight = this.$window.height();
		this.windowWidth = this.$window.width();

		$('section.parallax.intro').css('height', this.windowHeight);

		if (!window.KapitallConfig.noJoinButton && this.$joinButton.offset() && this.$joinButton.offset().top + this.$joinButton.height() >= $('#intro-banner').offset().top ) {
			this.$joinButton.css({
				top: 'auto',
				bottom: -80 + 'px'
			});
		}

		if (isInit) { this.$loading.fadeOut(300, this.parallaxScroll()); }
	};


	ParallaxPage.prototype.parallaxScroll = function() {
		this.lastScrollY = this.$window.scrollTop();
		this.checkScrollDirection();
		this.checkSections();
	};


	ParallaxPage.prototype.checkScrollDirection = function() {
		var currentScrollY = this.lastScrollY;

		if ( currentScrollY > this.pageYOffset && currentScrollY > this.windowHeight ) {
			this.$header.addClass('scrollingState');
		} else if ( currentScrollY < this.pageYOffset || currentScrollY < this.windowHeight ) {
			this.$header.removeClass('scrollingState');
		} else {
			return;
		}

		this.pageYOffset = currentScrollY;
	};


	ParallaxPage.prototype.checkSections = function() {
		for (var section in this.sectionData) {
			if (this.lastScrollY >= (this.sectionData[section].offset)) {
				$(this.$sections[this.sectionData[section].index]).find('div.parallax-content').addClass('in-view');
			}
		}
	};


	ParallaxPage.prototype.changeState = function(elem) {
		var $elem = $(elem);

		var $siblings = $elem.siblings('[data-switch]');
		if (! $siblings.length) {
			var $parent = $elem.parent();
			$parent.addClass('current');

			$siblings = $parent.siblings().removeClass('current').find('[data-switch]');
		}

		$siblings.removeClass('current');
		$elem.addClass('current');

		var $state = $elem.closest('[data-state]');

		var newState = $elem.data('switch');

		$state.attr('data-state', newState);
	};



	KapitallPageController.addModule(function() {
	    var page = new ParallaxPage();

	    page.init();
	});

}(jQuery, window.KapitallPageController));