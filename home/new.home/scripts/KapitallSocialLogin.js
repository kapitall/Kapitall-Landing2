'use strict';

(function(){

	window.janrain = {settings: {
		tokenUrl: window.KapitallConfig.kStudioURL + 'login/socialMediaToken'
		,tokenAction: 'event'
		,custom: true
		,appId: 'coajhgnmpmdpfecmdkaj'
		,appUrl: 'https://kapitall.rpxnow.com'
	}};

	function isReady() { window.janrain.ready = true; }
	if (document.addEventListener) {
	  document.addEventListener('DOMContentLoaded', isReady, false);
	} else {
	  window.attachEvent('onload', isReady);
	}

	var e = document.createElement('script');
	e.type = 'text/javascript';
	e.id = 'janrainAuthWidget';
	e.src = 'https://rpxnow.com/js/lib/kapitall/engage.js';

	var s = document.getElementsByTagName('script')[0];
	s.parentNode.insertBefore(e, s);


$.fn.KapitallSocialLoginButton = function() {
	return this.each(function() {
		$(this).on('click', function(){
			window.janrain.engage.signin.triggerFlow($(this).attr('data-target'));

		});
	});
};

})(jQuery, window.KapitallPageController);

//Add event to social media login buttona
window.janrainWidgetOnload = function() {

	window.janrain.events.onProviderLoginToken.addHandler(function(response) {
		$.ajax({
			url: window.KapitallConfig.kStudioURL + 'login/socialMediaToken?token=' + response.token
			,dataType: 'jsonp'
			,success: function(data) {
				if(!data.success) { //TODO handle errors

				}

				if(data.newUser) {
					window.KapitallPageController.fireMessage('newSocialUser', data);

                    var $form = $('#signUpForm', '#header_mobile');
                    var $inputFirstName = $('input[name="name_first"]', $form);
                    var $inputLastName = $('input[name="name_last"]', $form);
                    var $email = $('input[name="username"]', $form);
                    $inputFirstName.val(data.firstName);
                    $inputLastName.val(data.lastName);
                    $email.val(data.email);



				} else {
					window.top.location = data.redirectURL;
				}
			}
		});
	});
};
