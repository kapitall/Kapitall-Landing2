'use strict';

(function($, KapitallPageController) {

var addError = function($errors, slug, message) {
	var $existingError = $errors.find('[data-name="' + slug + '"]');

	if($existingError.length) {
		$existingError.html(message);
	} else  {
		var errorMessage = [
			'<div data-name="'
			,slug
			,'">'
			,message
			,'</div>'
		].join('');


		if(!$errors.children().length || slug === 'validemail'){
			$errors.append(errorMessage).show();
		}

	}
};

var removeError = function($errors, slug) {
	var $existingError = $errors.find('[data-name="' + slug + '"]');
	$existingError.remove();
};

var validateInput = function(params) {
	params = params || {criteria: {}};
	var trimmedVal = $.trim(params.val || '');
	var name = params.name;
	var slug = name.replace(' ','');

	if(params.criteria.required && !trimmedVal) {
		addError(params.$errors, slug, 'Please enter a ' + name);
	}
	else if(params.criteria.len && trimmedVal.length < params.criteria.len) {
		addError(params.$errors, slug, name.charAt(0).toUpperCase() + name.slice(1) + ' must be at least ' + params.criteria.len + ' characters');
	}
	else if(params.criteria.validEmail && !validateEmail(trimmedVal)) {
		addError(params.$errors, slug, 'Please enter a valid email.');
	}
	else if(params.criteria.password && passwordCheck(trimmedVal) !== true) {
		addError(params.$errors, slug, 'Password may not contain "' + passwordCheck(trimmedVal) + '"');
	}
	else {
		removeError(params.$errors, slug);
		return true;
	}
};

var validateEmail = function(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
};

var passwordCheck = function(password) {
	if(/\s/.test(password)) {
		return ' ';
	}

	return true;
};

window.LandingPageSrc = '';
var setLandingPageSrc = function($input) {
	var pageSrc = KapitallPageController.getURLParameter('page');

	if(pageSrc) {
        window.LandingPageSrc = pageSrc;
		$input.val(window.LandingPageSrc);
	} else {
		window.LandingPageSrc = $input.val();
	}
};

var updateForMarketing = function($form) {
	var $landingPageSrcInput = $('input[name="landingPageSource"]', $form[0]);
	setLandingPageSrc($landingPageSrcInput);

	var clickId  = KapitallPageController.getURLParameter('sid') || '';
	if(clickId) {
		$form.append('<input type="hidden" name="clickId" value="' + clickId + '" />');
	}
};

var toggleOptions = function($form, bForceMode) {
	$form.toggleClass('optionsView', bForceMode);
};

var populateForm = function($form, params) {
	var $formElem = $('form', $form[0]);
	var $socialIcon = $('span.signUpIcon', $form[0]);
	var $socialTitle = $('h3.socialTitle', $form[0]);
	var $inputFirstName = $('input[name="name_first"]', $form[0]);
	var $inputLastName = $('input[name="name_last"]', $form[0]);
	var $inputUsername = $('input[name="username"]', $form[0]);


	if(params.avatar || params.photo) {
		var $iconNode = $('<img src="' + (params.avatar || params.photo) + '"/>');
		$socialIcon.css('background','none').html('').append($iconNode);
	}

	if(params.provider) {
		$formElem.append('<input type="hidden" name="provider" value="'+params.provider+'" />');
		$formElem.append('<input type="hidden" name="uid" value="'+params.uid+'" />');
	}

	$socialTitle.text(params.firstName + ' ' + params.lastName);
	$inputFirstName.val(params.firstName);
	$inputLastName.val(params.lastName);

	var $connectionNode = $('<span>' + params.provider + ' connected</span>');
	$socialTitle.append($connectionNode);

	$inputUsername.val(params.email ? params.email : '');

	toggleOptions($form, false);
};

$.fn.KapitallSignUpForm = function(action, params) {
	switch(action) {
		case 'populateForm':
			return populateForm($(this), params);
	}

	return this.each(function() {
		var self = this;
		if(!$(this).hasClass('kapitallSignUp')) { return; }

		var $form = $(this).find('form');
		var $inputFirstName = $('input[name="name_first"]', $form[0]);
		var $inputLastName = $('input[name="name_last"]', $form[0]);
		var $inputPassword = $('input[name="password"]', $form[0]);
		var $inputUsername = $('input[name="username"]', $form[0]);
        var $inputPhoneNumber = $('input[name="phone_number"]', $form[0]);
        $inputPhoneNumber.mask("(999) 999-9999");
		var $errors = $('div.error', $form[0]);

		updateForMarketing($form);

		$('input[name="landingPageReferrer"]').val(KapitallPageController.getURLParameter('referrer')); // set referrer

		$('button[data-target="default"], button[data-target="options"]', $(this)[0]).on('click', function() {
			toggleOptions($(self));
		});

		$inputFirstName.on('blur', function() {
			validateInput({$errors: $errors, val: $(this).val(), name: 'first name', criteria: {required: true}});
		});

		$inputLastName.on('blur', function() {
			validateInput({$errors: $errors, val: $(this).val(), name: 'last name', criteria: {required: true}});
		});

		$inputPassword.on('blur', function() {
			validateInput({$errors: $errors, val: $(this).val(), name: 'password', criteria: {required: true, len: 6, password: true}});
		});

		$inputUsername.on('blur', function() {
			var res = validateInput({$errors: $errors, val: $(this).val(), name: 'valid email', criteria: {required: true, validEmail: true}});

			if(res) {
				$.ajax({
					url: window.KapitallConfig.MODURL + '/register/register.api.asp?callback=?',
					data: 'action=checkUsername&username=' + $(this).val(),
					dataType: 'jsonp',
					success: function(data /*, status, request*/) {
						if (data.status) {
							addError($errors, 'validemail', 'Email is already registered');
						}
					}
				});
			}
		});

		$form.on('submit', function(){
			var phone = $inputPhoneNumber.val();
			var startMode = $(this).find('button[data-startmode]').attr('data-startmode');

			$inputFirstName.trigger('blur');
			$inputLastName.trigger('blur');
			$inputPassword.trigger('blur');
			$inputUsername.trigger('blur');

			if(!$errors.children().length) {
				if(startMode) {
					$.cookie('startmode', startMode, {path:'/', domain: window.KapitallConfig.domain});
				}

				if(phone) {
					$.cookie('user_phoneNumber', phone, {path:'/', domain: window.KapitallConfig.domain});
				}

				if(window.KapitallConfig.emailConfirm) {
					var username = $('input[name="username"]', $form[0]).val();

					KapitallPageController.fireMessage('showEmailConfirmation', {
						email: username
						,sendAgain: function() {
							$.ajax({
								url: window.KapitallConfig.kStudioURL + 'userEmailConfirmation/resendEmailConfirmation?callback=?',
								data: 'email='+ username,
								type: 'POST',
								dataType: 'jsonp',
								success: function(data /*, status, request*/) {
									window.location.href = '/email_confirmation/?type=' + data.status;
								}
							});
						}
					});

					$.ajax({
						url: window.KapitallConfig.kStudioURL + 'userEmailConfirmation/sendConfirmationEmail?callback=?',
						data: $(this).serialize() + '&startMode=' + startMode,
						type: 'POST',
						dataType: 'jsonp',
						success: function(data /*, status, request*/) {
							if(data.status === 'err'){
							  window.alert('An error occured, please try again.');
							}
						}
					});

					return false;
				} else {
					return true;
				}
			}

			return false; //errors
		});

	});
};

})(jQuery, window.KapitallPageController);
