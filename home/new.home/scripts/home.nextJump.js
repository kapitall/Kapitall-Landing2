'use strict';

(function($, KapitallPageController){

var initNextJump = function() {

    var positionDisclaimer = function() {
        var $disclaimer = $('.disclaimer');

        $disclaimer.css('top', $(window).height()*1.25);
        $disclaimer.show();
    };

    $('#joinNextJump').on('click', function() {
        KapitallPageController.fireMessage('toggleSignUp');
    });

    positionDisclaimer();
    $(window).resize(positionDisclaimer);
};

KapitallPageController.addModule(function() {
    initNextJump();
});

})(jQuery, window.KapitallPageController);