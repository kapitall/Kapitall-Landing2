'use strict';

(function($, KapitallPageController){

var $brandVideo = $('#BrandVideo');
var $brandButton = $('#BrandButton');
var $header = $('#Header');
var $window = $(window);

var adjustBrandVideo = function() {

	var windowHeight = $window.height();
	var $video = $brandVideo.find('iframe');

	if(windowHeight > 1024) {
		$video.removeAttr('height width');
		$video.css({
			height: 395,
			width: 702
		});
	} else {
		$video.removeAttr('height width');
		$video.css({
			height: 310,
			width: 551
		});
	}

	if(windowHeight < $brandVideo.height()) {
		$brandButton.css('bottom', 50);
	} else {
		var adj = Math.floor((windowHeight - $brandVideo.height()) / 2);

		$brandVideo.css('margin-top', adj);
		$brandButton.css('bottom', Math.max(adj - (Math.floor(adj / 3) + $brandButton.height()/2), 50));
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