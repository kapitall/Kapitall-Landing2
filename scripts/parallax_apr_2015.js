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

	var ParallaxPage = function() {};
	ParallaxPage.prototype.init = function() {
		var self = this;

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
		this.$productIconList = $('ul.productIcons');
		this.$productDetailList = $('ul.productDetails');

		$.each(this.$sections, function(i, val) {
			var $val = $(val);
			self.sectionData[ $val.attr('id') ] = {
				'index': i,
				'offset': $val.offset().top
			};
		});

		this.attachPageEvents();

		this.initProductReel();
	};


	ParallaxPage.prototype.attachPageEvents = function() {
		var self = this;

		// intro events
		var $icons = this.$productIconList.children();

		$icons.each(function() {
			var hammer = new window.Hammer(this);
			var $this = $(this);
			hammer.on('tap', function(e) {
                clearInterval(self.interval);

				if ($(e.target).hasClass('position_3')) {
					// launch onboarding flow for that product?
				}

				self.scrollProducts($this.data('position'));
			});

			hammer.on('swipe', function(e) {
				if (e.direction === 2) {
					self.scrollProducts(null, 'right');
				} else if (4) {
					self.scrollProducts(null, 'left');
				}
			});
		});

		$(document).keydown(function(e){
            clearInterval(self.interval);
			if(!self.$header.hasClass('signUpOpen') && !self.$header.hasClass('signInOpen')) {
				switch(e.which) {
					case 37:
						// Key left.
						self.scrollProducts(null, 'left');
						break;
					case 39:
						// Key right.
						self.scrollProducts(null, 'right');
						break;
					default:
						break;
				}
			}
		});

		$('a.chatLink').on('click', function() {
            clearInterval(self.interval);
            window.open('https://v2.zopim.com/widget/livechat.html?key=3Q9SRvJ50Y896aVntZZA52Km3eP1WkiL', 'Chat', 'status,width=480, height=520');
		});

		$('a.info').on('click', function(e) {
            clearInterval(self.interval);
			var target = $(e.target).attr('data-faq');
			window.open(target, 'FAQ','width=1009,height=804');
		});

		// parallax events
		$('[data-switch]').on('touchend mouseup', function(e) {
            clearInterval(self.interval);
			e.preventDefault();
			var elem = this;

			self.changeState(elem);
		});

	    $('#parallax-join-now, #SignUpToggle').on('click', function(){
            clearInterval(self.interval);

	        KapitallPageController.fireMessage('toggleSignUp');
	    });

	    $('button[id*="join_"]').on('click', function() {
            clearInterval(self.interval);

	        KapitallPageController.fireMessage('toggleSignUp');

			var product = $(this).attr('data-product');
            var productValue = $(this).attr('data-value');
			if (product) {
				$('#SignUp').removeClass('default').addClass('product');

				$('#signUpForm input[name="landingPageProduct"]').val(product);
                $('#signUpForm input[name="landingKSValue"]').val(productValue);
				self.productSelected = true;
				KapitallPageController.toggleProductSelected(true);
			}
	    });

		$('a[data-section]').on('click', function(e) {
			e.preventDefault();

            clearInterval(self.interval);

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


		self.sizeIntro(true);

        //30 sec auto move to next option
        this.interval = setInterval(function(){
            self.scrollProducts(null, 'right');
        }, 5000);
	};

	ParallaxPage.prototype.sizeIntro = function(isInit) {
		this.windowHeight = this.$window.height();
		this.windowWidth = this.$window.width();

		if (this.windowHeight < 1020) {
			this.smallScreen = true;
			this.$header.addClass('scrollingState');
		}

		var $product = $('ul.productIcons li:nth-of-type(3)');
		var productHeight = $product.find('h3').outerHeight(true) * 1.75 + 100;

		$('.intro-info').css('margin-top', productHeight);

		// if (!window.KapitallConfig.noJoinButton && this.$joinButton.offset() && this.$joinButton.offset().top + this.$joinButton.height() >= $('#intro-banner').offset().top ) {
		// 	this.$joinButton.css({
		// 		top: 'auto',
		// 		bottom: -80 + 'px'
		// 	});
		// }

		if (isInit) { this.$loading.fadeOut(300, this.parallaxScroll()); }
	};


	ParallaxPage.prototype.initProductReel = function() {
		this.productIconWidth = this.$productIconList.find('li')[0].offsetWidth;
		var $icons = this.$productIconList.children();

		/******
			3 is the position at which the icon is displayed in full. here's a graph of the product positions:
								|  |  |  |  |
								|  |  |  |  |
								1  2 [3] 4  5
								|  |  |  |  |
								|  |  |  |  |
			left edge of screen:|  |  |  |  |:right edge of screen
		******/
		this.primaryPosition = 3;

		for (var i = 0, len = $icons.length; i < len; i++) {
			var $icon = $($icons[i]);

			$icon.data('position', (i+1));

			if ( (i+1) > 5 ) {
				$icon.addClass('position_offRight');
			} else {
				$icon.addClass('position_' + (i+1));
			}
		}

		var initialProduct = window.KapitallConfig.product || 'live';
		var initialProductOverride = KapitallPageController.getURLParameter('product');

		if (initialProductOverride) {
			initialProduct = initialProductOverride;
		}

		var $initialIcon = $icons.filter(function() {
			return $(this).attr('data-icon') === initialProduct;
		});

		this.scrollProducts($initialIcon.data('position'));

		var $initialDetail = this.$productDetailList.find('[data-detail="' + initialProduct + '"]');
		$initialDetail.addClass('active');
		this.$activeDetail = $initialDetail;
	};

	ParallaxPage.prototype.scrollProducts = function(targetPosition, direction) {
		var self = this;

		if ( (targetPosition && typeof targetPosition !== 'number')) { return; }

        if(this.$activeDetail && targetPosition === this.primaryPosition){
            this.$activeDetail.find('.primary')[0].click();
            return;
        }

		var positionOffset = 0;
		if (!targetPosition && direction) {
			positionOffset = direction === 'right' ? -1 : 1;
		} else {
			positionOffset = this.primaryPosition - targetPosition;
		}

		var $icons = this.$productIconList.children();

		$icons.each(function() {
			var $this = $(this);
			var position = typeof $this.data('position') === 'number' ? $this.data('position') : 0;
			var newPosition = position + positionOffset;

			$this.removeClass('full');

			var positionClass = '';
			var classList = $this[0].className.split(/\s+/);
			for (var n = 0, len = classList.length; n < len; n++) {
				if (/position_/.exec(classList[n])) {
					positionClass = classList[n];
					break;
				}
			}
			$this.removeClass(positionClass);

			var newStyle = {};

			if (newPosition < 1) {
				positionClass = 'position_offLeft';
				newStyle = {transform: 'translateX(' + (-Math.abs(self.windowWidth * 0.25)) + 'px)'};
			} else if (newPosition > 5) {
				positionClass = 'position_offRight';
				newStyle = {transform: 'translateX(' + (self.windowWidth * 1.25) + 'px)'};
			} else {
				positionClass = 'position_' + newPosition;
			}

			switch (newPosition) {
				case 1:
					newStyle = {transform: 'translateX(0px)'};
					break;
				case 2:
					newStyle = {transform: 'translateX(' + (self.windowWidth / 4) + 'px)'};
					break;
				case 3:
					newStyle = {transform: 'translateX(' + (self.windowWidth / 2) + 'px)'};
					break;
				case 4:
					newStyle = {transform: 'translateX(' + (self.windowWidth * 0.75) + 'px)'};
					break;
				case 5:
					newStyle = {transform: 'translateX(' + self.windowWidth + 'px)'};
					break;
				case 10:
					newPosition = 1;
					positionClass = 'position_1';
					newStyle = {transform: 'translateX(0px)'};
					break;
				case 11:
					newPosition = 2;
					positionClass = 'position_2';
					newStyle = {transform: 'translateX(' + (self.windowWidth / 4) + 'px)'};
					break;
				case -4:
					newPosition = 5;
					positionClass = 'position_5';
					newStyle = {transform: 'translateX(' + self.windowWidth + 'px)'};
					break;
				case -5:
					newPosition = 4;
					positionClass = 'position_4';
					newStyle = {transform: 'translateX(' + (self.windowWidth * 0.75) + 'px)'};
					break;
			}

			$this.data('position', newPosition).addClass(positionClass);

			var detail;
			if (newPosition === 3) { // switch product detail
				newStyle = {transform: 'translateX(' + (self.windowWidth/2) + 'px)'};
				$this.addClass('full');

				detail = $this.attr('data-icon');
				self.$productDetailList.attr('data-current-detail', detail);
				$('#sec-intro').attr('data-current-detail', detail);

				var $detailInfo = self.$productDetailList.find('.detailInfo');

				if (self.$activeDetail) {
					$detailInfo.velocity({
						top: 5,
						opacity: 0
					}, {
						duration: 200,
						complete: function() {
							self.$activeDetail.removeClass('active');

							self.$activeDetail = self.$productDetailList.find('li[data-detail="' + detail + '"]');
							self.$activeDetail.addClass('active');

							$detailInfo = self.$productDetailList.find('.detailInfo');

							$detailInfo.velocity({
								top: 0,
								opacity: 1
							}, {
								duration: 200
							});
						}
					});
				}
			}

			$this.css(newStyle);
		});
	};


	ParallaxPage.prototype.parallaxScroll = function() {
		this.lastScrollY = this.$window.scrollTop();
		this.checkScrollDirection();

		this.checkSections();
	};


	ParallaxPage.prototype.checkScrollDirection = function() {
		var currentScrollY = this.lastScrollY;

		if (!this.smallScreen && currentScrollY > this.pageYOffset && currentScrollY > this.windowHeight) {
			this.$header.addClass('scrollingState');
		} else if (!this.smallScreen && (currentScrollY < this.pageYOffset || currentScrollY < this.windowHeight)) {
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
		if(location.href.split('errorcode=').length > 1) {

			if(location.href.split('errorcode=')[1].split('&')[0] === "testDriveExpired") 
			{

					$('#session-expired').show();
				setTimeout(function () {$('#SignUpToggle').trigger('click')}, 2000);
				setTimeout(function() {$('#session-expired').hide();}, 5000);
$('.signup-ab').hide();
			}
		}
$('#testDrive-btn').on('click', function(e) {
	$('#testDrive-btn').attr('disabled', 'disabled');
	$('#testDrive-btn').css('background-color','#777');
$('#testDrive-btn').css('color','#fff');	 
$('#testDrive-btn').css('cursor', 'not-allowed');
$('#form_registration1').submit();
});
$('#testDrive-btn-signup').on('click', function(e) {
	$('#testDrive-btn-signup').attr('disabled', 'disabled');
	$('#testDrive-btn-signup').css('background-color','#777');
$('#testDrive-btn-signup').css('color','#fff');	 
$('#testDrive-btn-signup').css('cursor', 'not-allowed');
$('#form_registration1').submit();
});
	    page.init();
	});

}(jQuery, window.KapitallPageController));
