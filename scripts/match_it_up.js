
'use strict';

(function($, KapitallPageController){

var MU_class = function() {};

MU_class.prototype.init = function() {
	var self = this;
	this.adjustBodyHeight();
	this.initMiniGame();

	setTimeout(function() {
		self.flip($('.flipped'));
		$('div.portfolioBox').removeClass('disabled');
	},1000);

	$(window).on('resize', this.adjustBodyHeight.bind(this));
};

MU_class.prototype.adjustBodyHeight = function() {
	var mainBodyHeight = $( window ).height();
	var $mainBody = $('#MainBody');
	$mainBody.height(mainBodyHeight);
};

MU_class.prototype.initMiniGame = function() {
	this.$gamepiece = $('div.gamepiece');

	this.initAudio();

	this.attachGameEvents();
	this.newGame();
};

MU_class.prototype.initAudio = function() {
	this.matchAudio = new Audio('audio/match.mp3');
	this.winAudio = new Audio('audio/win.mp3');

	this.matchAudio.volume = 0.1;
	this.winAudio.volume = 0.1;

	this.matchAudio.load();
	this.winAudio.load();
};

MU_class.prototype.newGame = function() {
	this.picks = [];
	this.matched = 0;

	var sectors = [
		{'computerAndTechnology': ['FB', 'AAPL']}
		,{'consumerStaples': ['KO']}
		,{'consumerDiscretionary': ['NKE']}
		,{'retailWholesale': ['AMZN', 'SBUX', 'GPS', 'CMG']}
		,{'autoTiresTrucks': ['FCAM', 'TSLA']}
	];

	var chosenGroups = [];

	var groupSelector = Math.floor(Math.random() * sectors.length);

	chosenGroups.push(sectors[groupSelector]);
	sectors.splice(groupSelector,1);

	groupSelector = Math.floor(Math.random() * sectors.length);

	chosenGroups.push(sectors[groupSelector]);
	sectors.splice(groupSelector,1);

	var chosenCompanies = [];
	for (var i = 0; i < chosenGroups.length; i++) {
		var group = chosenGroups[i];

		for (var sector in group) {
			var sectorArray = group[sector];
			chosenCompanies.push( sectorArray[Math.floor(Math.random() * sectorArray.length)]);
		}
	}

	chosenCompanies = [
		{ ticker: chosenCompanies[0], type: 'ticker' }
		,{ ticker: chosenCompanies[0], type: 'logo' }
		,{ ticker: chosenCompanies[1], type: 'ticker' }
		,{ ticker: chosenCompanies[1], type: 'logo' }
	];

	chosenCompanies = this.shuffleTickers(chosenCompanies);


	this.$gamepiece.each(function(i) {
		var $this = $(this);
		$this.attr('data-company', chosenCompanies[i].ticker).addClass(chosenCompanies[i].type + 'View');
		if (chosenCompanies[i].type === 'ticker'){
			$this.find('text').text(chosenCompanies[i].ticker);
		} else {
			$this.find('use').attr('xlink:href', '#' + chosenCompanies[i].ticker);
		}
	});
};

MU_class.prototype.shuffleTickers = function(companies) {
	var length = companies.length;
	var shuffled = new Array(length);

	for (var index = 0, rand; index < length; index++) {
		rand = Math.floor(Math.random() * index);
		if (rand !== index) {
			shuffled[index] = shuffled[rand];
		}
		shuffled[rand] = companies[index];
	}
	return shuffled;
};

MU_class.prototype.attachGameEvents = function() {
	var self = this;

	var handleGameEvent = function(e) {
		var $this = $(e.target);
		if (!$this.hasClass('gamepiece')) {
			$this = $this.closest('.gamepiece');
		}

		if($this.parent().hasClass('disabled') || $this.hasClass('flipped') || $this.hasClass('matched') || self.inReset) { return; }
		self.flip($this);
		self.picks.push($this.attr('data-company'));

		if(self.picks.length === 1){
			return;
		} else if (self.picks.length === 2) {
			self.checkFlip();
		}
	};

	this.$gamepiece.each(function() {
		var hammer = new window.Hammer(this);

		hammer.on('tap', handleGameEvent);
		hammer.get('pan').set({threshold: 0, direction: window.Hammer.DIRECTION_ALL});

		hammer.on('pan', function(e) {
			if (e.isFinal) {
				handleGameEvent(e.srcEvent);
			}
		});
	});
};

// GAMEPLAY
MU_class.prototype.checkFlip = function() {
	var self = this;

	if(this.picks[0] === this.picks[1]){
		this.matched ++;
		this.$gamepiece.filter('[data-company="' + self.picks[0] +'"]').addClass('matched');
		this.matchAudio.play();
	} else {
		setTimeout(function() {
			self.flip(self.$gamepiece.filter('.flipped'));
			self.inReset = false;
		}, 250);

		this.inReset = true;
	}

	if(this.matched === 2){
		this.winAudio.play();
	}

	self.picks = [];
};

//ANIMATION
MU_class.prototype.flip = function() {
	var args = Array.prototype.slice.call(arguments);

	args.forEach(function(element) {
		var $element = $(element);
		$element.find('svg.canvas')
		.velocity({rotateY:'91deg'},{
			duration: 200,
			easing: 'ease-in',
			complete: function() {
				$element.toggleClass('flipped');
			}
		})
		.velocity({rotateY:'0deg'},{
			duration: 200,
			easing: 'ease-out'
		});
	});
};

KapitallPageController.addModule(function() {
	var MU = new MU_class();
	MU.init();

	$('body').velocity({
		opacity: 1
	},{
		duration: 120
	});

});

})(jQuery, window.KapitallPageController);