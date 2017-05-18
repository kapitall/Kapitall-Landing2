'use strict';

(function($, KapitallPageController){

var attachBackstageEvent = function() {
	var $wrap = $('#Backstage div.imageWrap');

	$('#Backstage a').on({
		mouseenter : function() {
			$wrap.ClassyWiggle('start', {delay: 45});
		}
		,mouseleave : function() {
			$wrap.ClassyWiggle('stop');
		}
	});

	$('#Backstage').click(function(){
		window.open('http://backstage.kapitall.com');
	});

};

var handleInvalidSignIn = function() {
	if(/errorcode=incorrectlogin/.test(window.location.href)) {
		$('#Hero div.error').html('Please enter the correct password').fadeIn();
	}
};

var happyHour = {
	getHappyHour: function() {
		var self = this;

		$.ajax({
			url: window.KapitallConfig.kserverURI + 'happyHourSchedule/isHappyHourEnabled'
			,dataType: 'jsonp'
			,success: function(data) {
				if (data.enabled === true || data.enabled === 'true') {
					self.happy_hour_end = new Date(data.endTime);
					self.happy_hour = new Date(self.happy_hour_end - 3600000);

					var msToHappyHour = self.happy_hour - new Date();
					var msToHappyHourEnd = self.happy_hour_end - new Date();

					//happyhour not yet
					if (msToHappyHour >= 0) {
						setTimeout(function() {
							self._start();
						}, msToHappyHour);
					//happyhour is on
					} else if (msToHappyHourEnd > 0) {
						self._start();
					}
				}
			}
			,timeout: 15000
		});
	},

	_start: function() {
		var that = this;
		var endTime = that.happy_hour_end.getHours();
		var amOrPm = ' PM';

		if(endTime < 12) {
			amOrPm = ' AM';
		}

		if(endTime > 12) {
			endTime -= 12;
		} else if (endTime === 0) {
			endTime = 12;
		}

		endTime = endTime + amOrPm;

		$('#Hero').addClass('isOn');

		var pad = function(number) {
			return (number < 10) ? ('0' + number) : String(number);
		};

		var it = setInterval(function() {
			var currentTime = new Date();
			var minutes = currentTime.getMinutes();
			var seconds = currentTime.getSeconds();
			var secondsRemaining = 59 - seconds;
			var minutesRemaining = 59 - minutes;

			$('#tagline-time').text('0:' + pad(minutesRemaining) + ':' + pad(secondsRemaining));
			if(minutesRemaining === 0 && secondsRemaining === 0) {
				clearInterval(it);
				$('#Hero').removeClass('isOn');
			}
		}, 1000);
	}

};

KapitallPageController.addModule(function(){
	var $hero = $('#Hero');

	if($hero.hasClass('worldCupHero')) {
		var version = KapitallPageController.getURLParameter('ver') || 'mem';
		$hero.attr('data-status',version);
	}


	if($hero.hasClass('heroHappyHour')) {
		happyHour.getHappyHour();
	}

	if($hero.hasClass('heroRedemption')) {
		var action = KapitallPageController.getURLParameter('action', window.location.hash) || 'fourth';
		$hero.css('background', 'url("../images/mm/redemption/market_masters_landing_page_' + action + '.png") no-repeat');
	}

	handleInvalidSignIn();

	KapitallPageController.attachChatEvents($('#ChatLink'));
	attachBackstageEvent();

	$('#QuoteCycle').cycle({ timeout: 8000, fx : 'scrollLeft' });

	$('#Hero div.kapitallSignIn').KapitallSignInForm();
	$('#Hero button.socialButton').KapitallSocialLoginButton();
});

KapitallPageController.addListener('newSocialUser', function(){
	if(window.confirm('Head on over to Kapitall.com to sign up now.')) {
		window.location = 'https://www.kapitall.com';
	}
});

})(jQuery, window.KapitallPageController);