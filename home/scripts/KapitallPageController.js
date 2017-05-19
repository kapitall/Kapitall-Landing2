'use strict';

(function($){
var KapitallPageController_class = function() { };
KapitallPageController_class.prototype.INIT_MODULES = [];
KapitallPageController_class.prototype.LISTENERS = {};

KapitallPageController_class.prototype.init = function() {
	while(this.INIT_MODULES.length) {
		var fn = this.INIT_MODULES.shift();
		fn();
	}

	this.attachPlaceholders();
	this.setupKSAction();
	this.handleSignout();

	this.initComplete = true;
};


KapitallPageController_class.prototype.addModule = function(fn) {
	if(this.initComplete) {
		fn();
	} else {
		this.INIT_MODULES.push(fn);
	}
};

KapitallPageController_class.prototype.attachPlaceholders = function() {
	var isOperaMini = (navigator.userAgent.indexOf('Opera Mini') > -1);

	var isInputSupported = 'placeholder' in document.createElement('input') && !isOperaMini;
	if(!isInputSupported) {
		$('body').addClass('noPlaceholder');
	}
};

KapitallPageController_class.prototype.setupKSAction = function() {
	var ksAction;

	if(window.KapitallConfig.ksAction === 'NEW_CHALLENGE') {
		window.KapitallConfig.challengeShortName = window.KapitallConfig.challengeShortName || '';
		var challengeShortName = this.getURLParameter('shortName', window.location.hash) || window.KapitallConfig.challengeShortName;

		ksAction = 'NEW_CHALLENGE_SHORTNAME_' + challengeShortName;
		$.cookie('landingKSAction', ksAction, {path: '/', domain: window.KapitallConfig.domain});
	} else {
		window.KapitallConfig.ksAction = window.KapitallConfig.ksAction || '';
		ksAction = this.getURLParameter('ksAction', window.location.hash) || window.KapitallConfig.ksAction;

		$.cookie('landingKSAction', ksAction, {path: '/', domain: window.KapitallConfig.domain});
	}
};

KapitallPageController_class.prototype.handleSignout = function() {
	if (/signedout=1/.test(window.location.href)) {
		$('#SignOutMessage').html('You have successfully signed out.').fadeIn();
	}
};

KapitallPageController_class.prototype.attachChatEvents = function($chatToggles) {
	/**
	* Show availability of chat
	*   @todo needs to be fixed to get EST time, instead of local time..
	*   @todo needs to get market holidays to show 'unavailable' instead even on a typical weekday
	*/
	var d = new Date();
	var time = d.getHours();
	var day	 = d.getDay();
	var isOnline = false;

	if (day !== 0 && day !== 6 && time < 18 && time > 8) { isOnline = true; }

	$chatToggles.each(function(){
		$(this).toggleClass('online', isOnline);
        //$(this).on('click', function(){ window.open("https://kapitall.custhelp.com/app/chat/chat_launch", 'Chat', 'status,width=480, height=520'); });

		$(this).on('click', function(){ window.open('https://v2.zopim.com/widget/livechat.html?key=3Q9SRvJ50Y896aVntZZA52Km3eP1WkiL', 'Chat', 'status,width=480, height=520'); });
	});
};

KapitallPageController_class.prototype.fireMessage = function(message, params) {
	if(this.LISTENERS[message]) {
		for(var i = 0, len = this.LISTENERS[message].length; i < len; i++) {
			this.LISTENERS[message][i](params);
		}
	}
};

KapitallPageController_class.prototype.addListener = function(message, fn) {
	if(!this.LISTENERS[message]) {
		this.LISTENERS[message] = [];
	}

	this.LISTENERS[message].push(fn);
};

KapitallPageController_class.prototype.toggleProductSelected = function(bool) {
	this.productSelected = bool;
};


/*  UTILS  */
KapitallPageController_class.prototype.getURLParameter = function(name, url) {
	url = url || location.search;
	return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(url)||[,''])[1].replace(/\+/g, '%20'))||null;
};



/*   Create Signleton  */
window.KapitallPageController = new KapitallPageController_class();



})(jQuery);

