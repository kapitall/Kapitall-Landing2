'use strict';

var $hamburger = $('.cd-nav-trigger span');
var $closeButton = $('.closeButton');
var $menu = $('div#MenuContainer');
var $navContainer = $('.topBar nav');
var $signInUpToggles = $('div.signInUpToggles');
var $header = $('div#Header');


var openMenu = function() {
	console.log('Open Seasame');
	$menu.animate({
		right: 0
	});

	$navContainer.animate({
		right: '43px'
	});

	$signInUpToggles.animate({
		right: '18px'
	});
};

var closeMenu = function() {
	console.log('Simon says, "Close"');
	$menu.animate({
		right: '-100%'
	});

	$navContainer.animate({
		right: '-100%'
	});

	$signInUpToggles.animate({
		right: '-100%'
	});
};



var attachMenuEvents = function() {
	$hamburger.on('click', openMenu);

	$menu.on('click', closeMenu);

	$signInUpToggles.on('click', closeMenu);

	$header.on('click', function() {
		if($header.hasClass('signInOpen')){
			console.log('Awesome');
			$closeButton.on('click', function(){
				$(this).toggleClass('signInOpen');
			})
		}
	});
};


attachMenuEvents();