'use strict';

(function($, KapitallPageController){

var $brandVideo = $('#BrandVideo');
var $brandButton = $('#BrandButton');
var $header = $('#Header');
var $window = $(window);

var adjustBrandVideo = function() {
	
	if($window.height() < 600) {
		$brandButton.css('bottom', 5);
	}
	else {
		var adj = Math.floor(($window.height() - 600) / 2);

		$brandVideo.css('margin-top', adj);
		$brandButton.css('bottom', Math.max(Math.floor(adj / 3), 5));
	}
};

KapitallPageController.addListener('signUpOpen', function(){
	if(!/ipad/i.test(navigator.userAgent)) {
		$brandVideo.find('iframe')[0].contentWindow.postMessage('{"event" : "command", "func" : "pauseVideo", "arg" : ""}','*');
	}
});

KapitallPageController.addListener('whyKapitallToggled', function(){
	if(!/ipad/i.test(navigator.userAgent) && !$header.hasClass('signUpOpen')) {
		$brandVideo.find('iframe')[0].contentWindow.postMessage('{"event" : "command", "func" : "playVideo", "arg" : ""}','*');
	}
});

KapitallPageController.addModule(function(){
	adjustBrandVideo();

	$window.resize(function() {
		adjustBrandVideo();
	});

	$brandButton.on('click', function(){
		KapitallPageController.fireMessage('toggleSignUp');
	});
});

})(jQuery, window.KapitallPageController);