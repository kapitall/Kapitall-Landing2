'use strict';

(function($, KapitallPageController){
	var action = KapitallPageController.getURLParameter('action');
	var firstName = KapitallPageController.getURLParameter('fname');
	var lastName = KapitallPageController.getURLParameter('lname');

	$('#Hero').addClass(action);
	var $redeemTitle = $('#redeemTitle');
	var $redeemText = $('#redeemText');
	var $signinButton = $('div.kapitallSignIn button[type="submit"]');

	switch(action){
		case 'invitation':
			$redeemTitle.html('IT\'S GOING DOWN.');
			$redeemText.html('Welcome to ' + firstName + ' ' + lastName + '\'s' + 'Tournament. <br/> Sign in now and get ready to fight for all the Koins!');
			$signinButton.text('SIGN UP');

			//setup tournament tool
			var tournamentId = KapitallPageController.getURLParameter('tournamentId');
			var $redirectUrl = $('input[name="redirectUrl"]', 'form');
			$redirectUrl.val($redirectUrl.val() + '&tool=FightKlubKreator&params=' + tournamentId);

			break;
		case 'loser':
			$redeemTitle.html('YOU SHOULD SEE THE OTHER GUY.');
			$redeemText.html('You got starched and didn\'t win any Prizes. Sign in and create your own tournament to begin your comback.');
			$signinButton.text('Get Up');
			break;
		case 'winner':
			var rank = KapitallPageController.getURLParameter('rank') || '';
			var tournamentName = KapitallPageController.getURLParameter('tournamentName');
			var prizes = KapitallPageController.getURLParameter('prizes');
			var rankFormatted = KapitallPageController.getURLParameter('rankFormated');
			$('#Hero').addClass(action + rank);

			if (rank && tournamentName && prizes && rankFormatted) {
				$redeemText.html('You won ' + rankFormatted + ' place and ' + prizes + ' in the ' + tournamentName + ' tournament. Create your own tournament and invite your friends to play again.');
				if(rank === 1){
					$redeemTitle.html('TOP DOG.');
				}else if(rank === 2){
					$redeemTitle.html('BADASS.');
				}	else if(rank === 3){
					$redeemTitle.html('JACKED UP.');
				} else {
					break;
				}
			}

			$signinButton.text('Throwdown!');
			break;
		default:
			$redeemText.html('Create your own tournament and invite your friends to play.');
			break;
	}
    $redeemTitle.html('US Bank Tournament');


    $('button.pageMainButton').on('click', function(){
        $('body').animate({
            scrollTop: 0
        });
        KapitallPageController.fireMessage('toggleSignIn');
    });

})(jQuery, window.KapitallPageController);
