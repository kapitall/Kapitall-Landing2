'use strict';

(function($, KapitallPageController){

var addEmbedPopup = function() {
	var htmlString = [
		'<div id="EmbedPopup">'
			,'<a href="javascript:void(\'Close\')" class="closeBtn">X</a>'
			,'<h3>Embed This Info-graphic on your site</h3>'
			,'<p>Copy and paste this code</p>'
			,'<textarea name="embed_code" id="embed_code" cols="30" rows="10">'
				,'<a href="',window.location.href,'"><img src="',window.location.href,'images/infographic.jpg" alt="" width="470"></a>'
			,'</textarea>'
		,'</div>'
	].join('');

	var $popup = $(htmlString);
	$('body').append($popup);

	$popup.find('a.closeBtn').on('click', function(){ $popup.addClass('none'); });

	return $popup;
};

KapitallPageController.addModule(function(){
	var $popup;

	$('#Embed').on('click', function(){
		if(!$popup) { $popup = addEmbedPopup(); }

		$popup.removeClass('none');
	});
});

})(jQuery, window.KapitallPageController);