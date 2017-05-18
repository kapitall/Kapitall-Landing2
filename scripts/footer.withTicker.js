'use strict';

(function($, KapitallPageController){

var heightAdj = 35 + 45; //header + ticker heights
var $mainBody = $('#MainBody');
var $window = $(window);

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

var adjustBodyHeight = function() {
	$mainBody.height($window.height() - heightAdj);
};

adjustBodyHeight();

KapitallPageController.addModule(function(){
	initQuoteBanner();

	$window.resize(adjustBodyHeight);
});

})(jQuery, window.KapitallPageController);