'use strict';

var pageController_class = function() { };
pageController_class.prototype.HEADER_BAR_HEIGHT = 0;
pageController_class.prototype.FOOTER_TICKER_HEIGHT = 70;

pageController_class.prototype.init = function() {

	window.KapitallConfig.kapitallURI = (location.host === 'landing.kapitall.com') ? 'https://www.kapitall.com' : 'https://kapitall.wsodqa.com';
	window.KapitallConfig.kserverURI  = (window.KapitallConfig.kapitallURI.indexOf('www') > -1) ? 'https://kstudio.kapitall.com/kserver/' : 'https://kstudioqa.kapitall.com/kserver/';
	window.KapitallConfig.domain = window.KapitallConfig.kapitallURI.substring(window.KapitallConfig.kapitallURI.indexOf('.'));

	this.$window = $(window);
	this.$mainBody = $('#MainBody');
	this.$header = $('#Header');

	this.populateRememberMe();

	this.adjustBodyHeight();
	this.attachEvents();

	this.handleSignout();

	this.setupKSAction();
};

pageController_class.prototype.adjustBodyHeight = function() {
	this.mainBodyHeight = this.$window.height() - this.HEADER_BAR_HEIGHT - this.FOOTER_TICKER_HEIGHT;
	this.$mainBody.height(this.mainBodyHeight);
};

pageController_class.prototype.attachEvents = function() {
	var self = this;

	this.$window.resize(function() {
		self.adjustBodyHeight();
	});

	$('#SignIn form').on('submit', function(){
		if($('#UserRememberMe').is(':checked')) { self.setRememberMe($('#user_id').val()); }
		return true;
	});

	$('#UserRememberMe').on('click', function(){
		if(!$('#UserRememberMe').is(':checked')) { self.setRememberMe(''); }
	});

	$('#user_password').on('keyup', function(e){
		if(e.keyCode === 13) { $('#SignIn form').submit(); }
	});

	$('#SignIn button').on('click', function(){
		$('#SignIn form').submit();
	});

	$('#ForgotPassword').on('click', function(){
		var email = $('#user_id').val();

		if(!email) {
			$('#SignInError').html('Please enter a valid email to proceed').fadeIn();
			return;
		}

		$('#SignInError').html('An email with instructions has been sent to the address on record.').fadeIn();

		$.ajax({
			url: window.KapitallConfig.kapitallURI + '/register/register.api.asp?callback=?',
			data: 'action=forgotPassword&username=' + email,
			dataType: 'json',
			success: function(data /*, status, request*/) {
				if(!data.status) {
					$('#SignInError').html(data.message).fadeIn();
				}
			}
		});

	});

	$('#SignUpToggle').on('click', function(){
		$('#SignUp').show();
		$('#SignUpControl').css('visibility','hidden');
		$('html, body').animate({
          scrollTop: self.mainBodyHeight
        }, 1000);
	});

	this.setupSignUpForm();
};

pageController_class.prototype.setupSignUpForm = function() {
	$('#input_username').on('blur', function() {
		window.alert('hi');
		var val = $.trim($(this).val() || '');

		if(!val) {
			$('#SignUpError').append('<div data-name="username">Please enter a valid email address</div>');
			return;
		}

		$('#SignUpError [data-name="username"]').remove();

		$.ajax({
			url: window.KapitallConfig.kapitallURI + '/register/register.api.asp?callback=?',
			data: 'action=checkUsername&username=' + val,
			dataType: 'jsonp',
			success: function(data /*, status, request*/) {
				if (data.status) {
					$('#SignUpError').append('<div data-name="username">Email is already registered</div>');
				} else {
					$('#SignUpError [data-name="username"]').remove();
				}
			}
		});
	});

	$('#input_nameFirst').on('blur', function() {
		var val = $.trim($(this).val() || '');
		if(!val) {
			$('#SignUpError').append('<div data-name="firstName">Please enter a first name</div>');
			return;
		}
		$('#SignUpError [data-name="firstName"]').remove();
	});

	$('#input_nameLast').on('blur', function() {
		var val = $.trim($(this).val() || '');
		if(!val) {
			$('#SignUpError').append('<div data-name="lastName">Please enter a last name</div>');
			return;
		}
		$('#SignUpError [data-name="lastName"]').remove();
	});

	$('#input_password').on('blur', function(){
		var pass = $.trim($(this).val() || '');

		if(!pass) {
			$('#SignUpError').append('<div data-name="password">Please enter a valid password</div>');
			return;
		} else if(pass.length < 6) {
			$('#SignUpError').append('<div data-name="password">Password must be at least 6 characters.</div>');
			return;
		}

		$('#SignUpError [data-name="password"]').remove();
	});

	$('#SignUp button').on('click', function(){ $(this).closest('form').submit(); });

	$('#SignUp form').on('submit', function(){
		var firstName = $('#input_nameFirst').val();
		var lastName = $('#input_nameLast').val();
		var userName = $('#input_username').val();
		var password = $('#input_password').val();
		var phone = $('#input_phoneNumber').val();
		var startMode = $(this).find('button[data-startmode]').attr('data-startmode');
		var pass = $.trim(password || '');
		var error = false;

		if( !(firstName && $.trim(firstName).length > 0) ) {
			$('#SignUpError').append('<div data-name="firstName">Please enter a first name</div>');
			error = true;
		} else if( !(lastName && $.trim(lastName).length > 0) ) {
			$('#SignUpError').append('<div data-name="lastName">Please enter a last name</div>');
			error = true;
		} else if(!pass) {
			$('#SignUpError').append('<div data-name="password">Please enter a valid password</div>');
			error = true;
		} else if(pass.length < 6) {
			$('#SignUpError').append('<div data-name="password">Password must be at least 6 characters.</div>');
			error = true;
		} else if( !(userName && $.trim(userName).length > 0) ) {
			$('#SignUpError').append('<div data-name="username">Password must be at least 6 characters.</div>');
			error = true;
		}

		if( $('#SignUpError').children().length > 0 ) { error = true; }

		if(!error && startMode) {
			$.cookie('startmode', startMode, {path:'/', domain: window.KapitallConfig.domain});
		}

		if(!error && phone) {
			$.cookie('user_phoneNumber', phone, {path:'/', domain: window.KapitallConfig.domain});
		}

		if(!error && window.KapitallConfig.emailConfirm) {
			var $emailConfirm = $('#emailConfirmationMessage');
			$emailConfirm.find('.emailAddress').text(userName);

			$('#SignUp .fleft').hide();
			$('#SignUp .fright').hide();
			$('#SignUp .banner').hide();
			$('#SignUp form').addClass('none');
			$emailConfirm.removeClass('none');

			$emailConfirm.find('#send_it_again').one('click', function(){
				$.ajax({
					url: window.KapitallConfig.kserverURI + 'userEmailConfirmation/resendEmailConfirmation?callback=?',
					data: 'email='+ userName,
					type: 'POST',
					dataType: 'jsonp',
					success: function(data /*, status, request*/) {
						window.location.href = '/email_confirmation/?type='+data.status;
					}
				});

			});

			$.ajax({
				url: window.KapitallConfig.kserverURI + 'userEmailConfirmation/sendConfirmationEmail?callback=?',
				data: $(this).serialize() + '&startMode=' + startMode + '&passwordLength=' +pass.length,
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
			return !error;
		}
	});
};

pageController_class.prototype.handleSignout = function() {
	var currentURL = window.location.href;

	if (/signedout=1/.test(currentURL)) {
		$('#SignOutMessage').html('You have successfully signed out.').fadeIn();
	}

	if(/errorcode=incorrectlogin/.test(currentURL)) {
		$('#SignInError').html('Please enter the correct password').fadeIn();
	}
};

pageController_class.prototype.populateRememberMe = function() {
	if(typeof(Storage) !== 'undefined') {
		var email = localStorage.user_email;

		if(email) {
			this.$header.addClass('signInOpen');

			$('#UserRememberMe').prop('checked', true);
			$('#user_id').val(email);
			$('#user_password').focus();
		}

	} else { $('#UserRememberMe').hide(); }
};

pageController_class.prototype.setRememberMe = function(email) {
	email = email || '';

	if(typeof(Storage) !== 'undefined') {
		localStorage.user_email = email;
	}
};

pageController_class.prototype.setupKSAction = function() {
	if(window.KapitallConfig.ksAction === 'NEW_CHALLENGE') {
		window.KapitallConfig.challengeShortName = window.KapitallConfig.challengeShortName || '';
		var challengeShortName = window.getURLParameter('shortName', window.location.hash) || window.KapitallConfig.challengeShortName;

		var ksAction = window.KapitallConfig.ksAction + '_SHORTNAME_' + challengeShortName;
		$.cookie('landingKSAction', ksAction, {path: '/', domain: '.kapitall.com'});
	}
};

$(function(){
	window.PageController = new pageController_class();
	window.PageController.init();
});


/*
* @author Klaus Hartl/klaus.hartl@stilbuero.de
 */
jQuery.cookie = function(name, value, options) {
    if (typeof value !== 'undefined') { // name and value given, set cookie
        options = options || {};
        if (value === null) {
            value = '';
            options.expires = -1;
        }
        var expires = '';
        if (options.expires && (typeof options.expires === 'number' || options.expires.toUTCString)) {
            var date;
            if (typeof options.expires === 'number') {
                date = new Date();
                date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
            } else {
                date = options.expires;
            }
            expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
        }
        // CAUTION: Needed to parenthesize options.path and options.domain
        // in the following expressions, otherwise they evaluate to undefined
        // in the packed version for some reason...
        var path = options.path ? '; path=' + (options.path) : '';
        var domain = options.domain ? '; domain=' + (options.domain) : '';
        var secure = options.secure ? '; secure' : '';
        document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
    } else { // only name given, get cookie
        var cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
};



/*
 * Password Strength (0.1.2)
 * by Sagie Maoz (n0nick.net)
 * n0nick@php.net
 *
 * This plugin will check the value of a password field and evaluate the
 * strength of the typed password. This is done by checking for
 * the diversity of character types: numbers, lowercase and uppercase
 * letters and special characters.
 *
 * Copyright (c) 2010 Sagie Maoz <n0nick@php.net>
 * Licensed under the GPL license, see http://www.gnu.org/licenses/gpl-3.0.html
 *
 *
 * NOTE: This script requires jQuery to work.  Download jQuery at www.jquery.com
 *
 */

(function($){

var passwordStrength = function()
{
	this.countRegexp = function(val, rex)
	{
		var match = val.match(rex);
		return match ? match.length : 0;
	};

	this.getStrength = function(val, minLength)
	{
		var len = val.length;

		// too short =(
		if (len < minLength)
		{
			return 0;
		}

		var nums = this.countRegexp(val, /\d/g),
			lowers = this.countRegexp(val, /[a-z]/g),
			uppers = this.countRegexp(val, /[A-Z]/g),
			specials = len - nums - lowers - uppers;

		// just one type of characters =(
		if (nums === len || lowers === len || uppers === len || specials === len)
		{
			return 1;
		}

		var strength = 0;
		if (nums)	{ strength+= 2; }
		if (lowers)	{ strength+= uppers? 4 : 3; }
		if (uppers)	{ strength+= lowers? 4 : 3; }
		if (specials) { strength+= 5; }
		if (len > 10) { strength+= 1; }

		return strength;
	};

	this.getStrengthLevel = function(val, minLength)
	{
		var strength = this.getStrength(val, minLength);

		val = 1;
		if (strength <= 0) {
			val = 1;
		} else if (strength > 0 && strength <= 4) {
			val = 2;
		} else if (strength > 4 && strength <= 8) {
			val = 3;
		} else if (strength > 8 && strength <= 12) {
			val = 4;
		} else if (strength > 12) {
			val = 5;
		}

		return val;
	};
};

$.fn.password_strength = function(options)
{
	var settings = $.extend({
		'container' : null,
		'bar': null, // thanks codemonkeyking
		'minLength' : 6,
		'texts' : {
			1 : 'Too weak',
			2 : 'Weak password',
			3 : 'Normal strength',
			4 : 'Strong password',
			5 : 'Very strong password'
		},
		'onCheck': null
	}, options);

	return this.each(function()
	{
		var container = null, $bar = null;
		if (settings.container)
		{
			container = $(settings.container);
		}
		else
		{
			container = $('<span/>').attr('class', 'password_strength');
			$(this).siblings('label').after(container);
		}

		if (settings.bar)
		{
			$bar = $(settings.bar);
		}

		$(this).bind('keyup.password_strength', function()
		{
			var val = $(this).val(),
					level = passwordStrength.getStrengthLevel(val, settings.minLength);

			if (val.length > 0)
			{
				var _class = 'password_strength_' + level,
						_barClass = 'password_bar_' + level;

				if (!container.hasClass(_class) && level in settings.texts)
				{
					container.text(settings.texts[level]).attr('class', 'password_strength ' + _class);
				}
				if ($bar && !$bar.hasClass(_barClass))
				{
					$bar.attr('class', 'password_bar ' + _barClass);
				}
			}
			else
			{
				container.text('').attr('class', 'password_strength');
				if ($bar) {
					$bar.attr('class', 'password_bar');
				}
			}
			if (settings.onCheck) {
				settings.onCheck.call(this, level);
			}
		});

        if ($(this).val() !== '') { // thanks Jason Judge
           $(this).trigger('keyup.password_strength');
        }
	});
};

})(jQuery);