'use strict';

(function($, KapitallPageController){

var initKlub = function() {

    var setActiveStatus = function() {
        var actionParam = KapitallPageController.getURLParameter('action') || 'member';
        $('.status.' + actionParam).find('.statusDescription').addClass('active');
    };

    var positionDisclaimer = function() {
        var $disclaimer = $('.disclaimer');

        $disclaimer.css('top', $(window).height());
        $disclaimer.show();
    };

    $('#joinKlub').on('click', function() {
        KapitallPageController.fireMessage('toggleSignUp');
    });

    setActiveStatus();
    positionDisclaimer();
};

KapitallPageController.addModule(function() {
    initKlub();
});

})(jQuery, window.KapitallPageController);