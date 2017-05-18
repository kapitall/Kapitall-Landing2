'use strict';

(function($, KapitallPageController) {

var populateRememberMe = function($user_id, $user_rememberMe) {
	if(typeof(Storage) !== 'undefined') {
		var email = localStorage.user_email;
		
		if(email) {
			$user_rememberMe.prop('checked', true);
			$user_id.val(email);

			KapitallPageController.fireMessage('rememberMePopulated');
		}

	} else { $user_rememberMe.hide(); }
};

var setRememberMe = function(email) {
	email = email || '';

	if(typeof(Storage) !== 'undefined') {
		localStorage.user_email = email;
	}
};

var setReturningMemberCookie = function() {
	if(/\/home(?:_returning)?\//.test(window.location.href)) {
		$.cookie('User','returningUser',{expires: 7, path:'/'});
	}
};

$.fn.KapitallSignInForm = function() {
	return this.each(function() {
		
		if(!$(this).hasClass('kapitallSignIn')) { return; }

		var $form = $(this).children('form');
		var $user_id = $(this).find('input[name="username"]');
		var $user_rememberMe = $(this).find('input[name="user_rememberMe"]');

		populateRememberMe($user_id, $user_rememberMe);

		$form.on('submit', function(){
			if($user_rememberMe.is(':checked')) { setRememberMe($user_id.val()); }
			setReturningMemberCookie();
			return true;
		});

		$user_rememberMe.on('click', function(){
			if(!$user_rememberMe.is(':checked')) { setRememberMe(''); }
		});

		$form.on('keyup', function(e){
			if($(this).attr('name') === 'user_password' && e.keyCode === 13) { $form.submit(); }
			else { e.preventDefault(); return false; }
		});

		$('a.forgotPasswordLink', $form[0]).on('click', function(){
			var email = $user_id.val();
			var $error = $('div.error', $form[0]);
		
			if(!email) {
				$error.html('Please enter a valid email to proceed').fadeIn();
				return;
			}

			$error.html('An email with instructions has been sent to the address on record.').fadeIn();

			$.ajax({
				url: window.KapitallConfig.kStudioURL + 'login',
				data: 'action=forgotPassword&username=' + email,
				dataType: 'json'
			});
		});
	});
};

})(jQuery, window.KapitallPageController);