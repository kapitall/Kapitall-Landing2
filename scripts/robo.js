'use strict';

(function ($, KapitallPageController) {
    var initRobo = function () {
        var $window = $(window);
        //Check if IE
        var ua = window.navigator.userAgent;
        var msie = ua.indexOf(".NET CLR");
        if (msie > 0){
            $('.lColumn img').css("width", "auto");
        }

        var positionDisclaimer = function () {
            var $disclaimer = $('.disclaimer');
            var mainBodyHeight = $('#MainBody').outerHeight();
            var windowHeight = $window.height();


            if (mainBodyHeight > 690) {
                var offset = 50;
                $disclaimer.css('top', mainBodyHeight + offset);
            }else{
                $disclaimer.css('top', '750px');
            }


            $disclaimer.show();
        };

        $('#apply').on('click', function() {
            KapitallPageController.fireMessage('toggleSignUp', {noOptionView: true});
        });


        //$window.on('resize', positionDisclaimer);

        //positionDisclaimer();
        var $disclaimer = $('.disclaimer');
        $disclaimer.show();
        KapitallPageController.attachChatEvents($('#chatLive'));


        //Check if has invitation token
        var tokenParam = KapitallPageController.getURLParameter('token');
        if(tokenParam){
            roboCheckToken(tokenParam);
        }
        //toggleSignUp
    };

    var roboCheckToken = function(token){
        $.ajax({
            url: window.KapitallConfig.kStudioURL + 'autoPilot/checkInviteToken',
            data: 'token=' + token,
            dataType: 'json',
            success: function(data){
                if(data.success && data.validToken){

                    if(!data.registered){

                        $('#SignUp').find('input[name="username"]').val(data.email).prop('readonly', 'readonly');
                        setTimeout(function(){
                            $('#apply').fadeTo('slow', 0.2).fadeTo('slow', 1.0, function(){
                                if(!$('#Header').hasClass('signUpOpen')){
                                    KapitallPageController.fireMessage('toggleSignUp', {noOptionView: true, email: data.email, roboToken: data.token});
                                }

                            });
                        }, 3000);


                    }else{
                        KapitallPageController.fireMessage('toggleSignIn', {email: data.email, roboToken: data.token, forceOpen: true});
                    }

                }else{
                    //window.location = 'https://landing.kapitall.com/home'
                }
            }
        });
    };


    KapitallPageController.addModule(function () {
        initRobo();
    });

})(jQuery, window.KapitallPageController);
