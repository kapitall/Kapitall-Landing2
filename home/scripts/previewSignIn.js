'use strict';

(function($, KapitallPageController){

var $header = $('#Header');
var $signInForm = $('div.kapitallSignIn', $header[0]);
var $newUser = $('div.newUser', $header[0]);

var handleInvalidSignIn = function() {
	if(/errorcode=incorrectlogin/.test(window.location.href)) {
		$('div.error', $signInForm[0]).html('Please enter the correct password').fadeIn();
	}
};

var openSignUpScreen = function(){
	window.top.postMessage(JSON.stringify({module: 'SignUp', action: 'showSignUp'}), '*');
};

KapitallPageController.addModule(function(){
	$signInForm.KapitallSignInForm();
	$('button.socialButton', $header[0]).KapitallSocialLoginButton();
	$('a.signUpLink').on('click', $header[0], openSignUpScreen);
	handleInvalidSignIn();
});

KapitallPageController.addListener('newSocialUser', function(){
	$newUser.show();
	$signInForm.hide();
});



})(jQuery, window.KapitallPageController);