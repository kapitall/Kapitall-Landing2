'use strict';

(function($, KapitallPageController){

var $mainBody = $('#MainBody');
var $window = $(window);
var heightAdj = 35; //header
var $emailInput = $('#PromoContainer input');
var $error = $('#PromoContainer div.error');

var adjustBodyHeight = function() {
	$mainBody.height($window.height() - heightAdj);
};

var validateEmail = function(email) {
	var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(email);
};

var buttonClicked = function() {
	if(!validateEmail($emailInput.val())) {
		$error.show();
		return;
	}

	$('#PromoContainer div.title').addClass('complete');
	$('#PromoContainer div.actions').hide();
	$('#PromoContainer div.social').show();

	var data = {email: $emailInput.val()};

	$.ajax({
		type: 'POST'
		,url: window.KapitallConfig.kserverURI + 'PromotionPocketPre/addEmail'
		,data: data
		,dataType: 'jsonp'
	});
};

adjustBodyHeight();

KapitallPageController.addModule(function(){

	$window.resize(adjustBodyHeight);

	$('#PromoContainer button').on('click', buttonClicked);
	$('#PromoContainer input').on('focus', function(){ $error.hide(); });
});

})(jQuery, window.KapitallPageController);