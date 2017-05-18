'use strict';

(function ($, KapitallPageController) {

    var $header = $('#Header');
    var $signInForm = $('div.kapitallSignIn', $header[0]);
    var $signUp = $('#SignUp');

    var toggleSignIn = function (params) {
        params = params || {};
        $signUp.removeClass('whyKapitall');
        $header.removeClass('signUpOpen');
        $header.toggleClass('signInOpen', params.forceOpen);

        if (KapitallPageController.productSelected) {
            KapitallPageController.toggleProductSelected(false);
            $('#signUpForm').find('input[name="landingPageProduct"]').val('');
        }

        if (params.email) {
            $('input[name="username"]', $signInForm[0]).val(params.email);
        }

        if ($header.hasClass('signInOpen')) {
            //this is set for the same as the css transition time
            //to prevent weird scrolling
            var target = params.targetPassword ? 'user_password' : 'user_id';
            setTimeout(function () {
                $('input[name="' + target + '"]', $signInForm[0]).focus();
            }, 500);
        }
        if (params.roboToken) {
            $('input[name="roboInviteToken"]', $signInForm[0]).val(params.roboToken);
        }
    };

    var toggleSignUp = function (params) {
        params = params || {};

        $signUp.toggleClass('whyKapitall', !!params.showWhyKapitall);

        if ($signUp.hasClass('product')) {
            $signUp.removeClass('product').addClass('default');
        }

        $header.removeClass('signInOpen');
        $header.toggleClass('signUpOpen', params.forceOpen);

        var $signUpContainer = $signUp.find('div.kapitallSignUp');

        if (params.noOptionView && $signUpContainer.hasClass('optionsView')) {
            $signUpContainer.removeClass('optionsView');
        } else if (!$signUpContainer.hasClass('optionsView')) {
            $signUpContainer.addClass('optionsView');
        }

        if (params.email) {
            var $emailField = $('input[name="username"]', $signUpContainer);
            $emailField.val(params.email);
            if (params.readyOnlyEmail) {
                $emailField.prop('readonly', 'readonly');
            }
            if (params.roboToken) {
                $('input[name="roboInviteToken"]', $signUpContainer).val(params.roboToken);
            }
        }


        if (KapitallPageController.productSelected) {
            KapitallPageController.toggleProductSelected(false);
            $('#signUpForm').find('input[name="landingPageProduct"]').val('');
        }

        if ($header.hasClass('signUpOpen')) {
            KapitallPageController.fireMessage('signUpOpen');
        }
    };

    var handleQueryParams = function () {
        var errorcode = KapitallPageController.getURLParameter('errorcode');
        var referrer = KapitallPageController.getURLParameter('referrer') || KapitallPageController.getURLParameter('reference');
        var signUp = KapitallPageController.getURLParameter('showSignUp');
        var signIn = KapitallPageController.getURLParameter('showLogin');

        if (errorcode && errorcode === 'incorrectlogin') {
            toggleSignIn({forceOpen: true});
            $('div.error', $signInForm[0]).html('Please enter the correct password').fadeIn();
        }
        else if (signUp) {
            toggleSignUp();
        }
        else if (signIn) {
            toggleSignIn();
        }
    };

    var attachWhyKapitallEvents = function () {
        $('#WhyKapitallToggle').on('click', function () {
            if ($header.hasClass('signUpOpen') && !$signUp.hasClass('whyKapitall')) {
                $signUp.addClass('whyKapitall');
            } else {
                toggleSignUp({showWhyKapitall: true});
            }

            KapitallPageController.fireMessage('whyKapitallToggled');
        });
    };

    var mobileHeaderEvents = function () {
        var signInMobile = $('#signIn_mobile');
        var signUpMobile = $('#signUp_mobile');
        var hamburgerIcon = $("#hamburger-icon");

        var openMenu = false;
        hamburgerIcon.click(function () {
            if(hamburgerIcon.hasClass('closeSign')){ return false; }
            openMenu = !openMenu;
            hamburgerIcon.toggleClass('active');
            $(".mobileLayout").toggleClass('active');
            return false;
        });

        centerElementInViewport($('div.kapitallSignIn', signInMobile));
        centerElementInViewport($('div.kapitallSignUp', signUpMobile));


        $('a.signInButton_mobile, a.signInButton').on('click', function(){

            signApplied(signInMobile);
        });
        $('a.signUpButton_mobile, a.signUpButton, button.apply.mobile').on('click', function(){
            signApplied(signUpMobile);
        });

        function signApplied(el){
            $('div.overlayBackground').css('display', 'inherit');
            el.css('visibility', 'inherit');
            hamburgerIcon.addClass('active closeSign');
            $(".mobileLayout").removeClass('active');
            hamburgerIcon.one('click', function(){
                signInMobile.css('visibility', 'hidden');
                signUpMobile.css('visibility', 'hidden');
                hamburgerIcon.removeClass('active closeSign');
                $('body').css('overflow-y', 'auto');
                $('div.overlayBackground').css('display', 'none');
            });
            $('body').css('overflow-y', 'hidden');
            $('body').scrollTop(0);


        }

        // Center an absolutely-positioned element in the viewport.
        function centerElementInViewport(el, container) {

            // Default parameters
            if ((typeof container == 'undefined') || (container === null))
            // By default, use the body tag as the relative container.
                container = document.body;

            // Get the container position relative to the viewport.
            var pos = container.getBoundingClientRect() ;

            // Center the element
            var left = ((window.innerWidth >> 1) - pos.left) - (el.offsetWidth >> 1);
            var top = ((window.innerHeight >> 1) - pos.top) - (el.height() >> 1);
            if(top < 100) { top = 135; }
            el.css({
                top: top + 'px'
            });
        }
    };

    KapitallPageController.addListener('showEmailConfirmation', function (params) {
        var $emailConfirmScreen = $('#EmailConfirmationMessage');
        $emailConfirmScreen.find('span.emailAddress').html(params.email);
        $('#SendItAgain').one('click', params.sendAgain);
        $emailConfirmScreen.show();
    });

    KapitallPageController.addListener('rememberMePopulated', function () {
        toggleSignIn({forceOpen: true, targetPassword: true});
    });

    KapitallPageController.addListener('toggleSignIn', function (params) {
        toggleSignIn(params);
    });
    KapitallPageController.addListener('toggleSignUp', function (params) {
        toggleSignUp(params);
    });

    KapitallPageController.addListener('newSocialUser', function (params) {
        console.error(params);
        $signUp.find('div.kapitallSignUp').KapitallSignUpForm('populateForm', params);
        toggleSignUp({forceOpen: true});
        $('div.kapitallSignUp').removeClass('optionsView');
    });

    KapitallPageController.addModule(function () {
        $('#SignInToggle').on('click', toggleSignIn);
        $('h1', $header[0]).on('click', function () {
            window.location = window.location.href;
        });
        $('button.createAccountButton', $header[0]).on('click', toggleSignUp);

        $(document).keydown(function (e) {
            if (e.which === 27 && ($header.hasClass('signUpOpen') || $header.hasClass('signInOpen'))) {
                if ($header.hasClass('signInOpen')) {
                    toggleSignIn();
                } else if ($header.hasClass('signUpOpen')) {
                    toggleSignUp();
                }
            }
        });

        $header.find('#closeSignUp').on('click', function () {
            if ($header.hasClass('signUpOpen')) {
                toggleSignUp();
            }
        });

        $signInForm.KapitallSignInForm();
        $signUp.find('div.kapitallSignUp').KapitallSignUpForm();
        $('button.socialButton').KapitallSocialLoginButton();

        KapitallPageController.attachChatEvents($('.newHeaderChatLive'));
        handleQueryParams();
        attachWhyKapitallEvents();
        mobileHeaderEvents();

    });



})(jQuery, window.KapitallPageController);
