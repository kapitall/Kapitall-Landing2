'use strict';

(function($, KapitallPageController){

    var initStockStars = function() {
        var value = "13829305-19ef-48a4-91e7-9ab78ce91193";

/*        $('#signUpForm input[name="landingKSAction"]').val("QUEST_MONTHLY_TOURNAMENT");
        $('#signInForm input[name="landingKSAction"]').val("QUEST_MONTHLY_TOURNAMENT");
        $('#signInForm input[name="landingKSValue"]').val(value);
        $('#signUpForm input[name="landingKSValue"]').val(value);*/

        $('button.pageMainButton').on('click', function(){
            $('body').animate({
                scrollTop: 0
            });
            KapitallPageController.fireMessage('toggleSignIn');
        });
    };

    KapitallPageController.addModule(function() {
        initStockStars();
    });

})(jQuery, window.KapitallPageController);
