'use strict';

(function($, KapitallPageController){

    var $signUp = $('div.formCol');
	$('#referrer_input').val(KapitallPageController.getURLParameter('referrer') || '');

KapitallPageController.addListener('newSocialUser', function(params){
	$signUp.find('div.kapitallSignUp').KapitallSignUpForm('populateForm', params);
});

KapitallPageController.addModule(function(){
	$signUp.find('div.kapitallSignUp').KapitallSignUpForm();
	$('button.socialButton').KapitallSocialLoginButton();

});

KapitallPageController.addListener('newSocialUser', function(params){
	$signUp.find('div.kapitallSignUp').KapitallSignUpForm('populateForm', params);
});

})(jQuery, window.KapitallPageController);
