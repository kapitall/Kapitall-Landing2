'use strict';

var KapitallM = function () {
    this.init();
};

KapitallM.prototype.init = function () {
    this.$container = $('div.container');
    this.$email = $('input[name="email"]', this.$container);
    this.$submitEmail = $('div.submitEmail', this.$container);
    this.$error = $('div.errorMessage', this.$container);
    this.$closeButton = $('div.closeOverlay', this.$container);
    this.$overlay =  $('div.overlay.submitted', this.$container);

    this.attachEvent();
};

KapitallM.prototype.attachEvent = function () {
    var self = this;

    this.$submitEmail.on('click', function(){
        self.checkForm();
    });

    this.$closeButton.on('click', function(){
        self.$overlay.hide('fast');
    });

    this.$email.on('keydown', function(event){
        self.$email.removeClass('error');
        self.$error.hide();
        if(event.keyCode == 13){
            self.$submitEmail.trigger('click');
        }
    });
};

KapitallM.prototype.checkForm = function () {

    if(this.validateEmail(this.$email.val())){
        this.submitEmail(this.$email.val());
    }else{
        this.$error.show();
        this.$email.addClass('error').show();
    }
};

KapitallM.prototype.submitEmail = function (email) {
    var self = this;
    $.ajax({
        url: window.KapitallConfig.kStudioURL + 'promotion',
        data: 'action=submit&promotion=finovate_2015&email=' + email,
        dataType: 'json',
        complete: function(data){
            self.$overlay.show('fast');
            self.$email.val("");
        }
    });
};

KapitallM.prototype.validateEmail = function (email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);

};

new KapitallM();
