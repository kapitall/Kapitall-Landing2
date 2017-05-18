'use strict';

(function($, KapitallPageController){

//this should not be setup like this
KapitallPageController.addModule(function(){

	var mainPanel = $('#MainBody')
		,confettiAnimation
		,autoPlay = window.videoAutoPlay
		,raceCarAnimation
		,oldie = $('html').hasClass('oldie') ? true : false
		,winHeight = $(window).height()
		,winWidth = $(window).width();

	/*
	* Video show/pause action
	*/
	var iframe_video = $('#iframe_video');

	mainPanel.find('a.watchVideo').on('click', function(e){
		e.preventDefault();
		iframe_video[0].contentWindow.postMessage('{"event" : "command", "func" : "playVideo", "arg" : ""}','*');
		$(this).hide();
		iframe_video.css({
			'visibility': 'visible'
			,'opacity' : 1
		});
		if (!oldie) {
			clearTimeout(confettiAnimation);
			clearInterval(raceCarAnimation);
		}
	});

	mainPanel.find('button.regJoinNowBtn').on('click', function() {
		KapitallPageController.fireMessage('toggleSignUp');
	});

	/*
	* Video and ticker iframes un-block loading
	*/
	var updateIframes = function() {
		var video_src = document.getElementById('videoURL').innerHTML;
		var iframe_video = document.getElementById('iframe_video');

		iframe_video.src = video_src;
	};


	/*
	* blimp and clouds animations!! fun stuff! :-)
	*/
	var mainPanelBanner = mainPanel.find('.bannerPromo');

	// start animation only when enabled
	if (mainPanel.find('.bgCloud').hasClass('show')) {
		// funnyCloud.move();
	}

	/*
	* Floating clouds animation
	*/
	var floatingClouds = {
		// default values
		numbClouds : ($('html').hasClass('oldie')) ? 2 : Math.floor(winWidth/400), // number of clouds that can be added to the screen
		defaults : {
			width: 342
			,height: 202
			,stop: 0
		},

		/* start floating of the clouds!! clouds are set free!! :D */
		start: function() {
			var self = this;

			for (var i = 0; i < this.numbClouds; i++) {
				this.addCloud(i);
			}

			this.addCloud();
			setTimeout(function(){
				self.addCloud();
				setTimeout(function(){
					self.addCloud();
				}, 300);
			}, 500);
		},

		/* add one cloud to the screen somewhat-random-ly (cloud's size differs randomly too) */
		addCloud: function(i) {
			var cloud = $('<img class="cloud" src="../images/mm/landing/cloud.png"/>')
				,width = Math.round((0.2 + Math.random())*this.defaults.width + 40) - 10
				,topVar	= Math.round(Math.random()*(mainPanel.height() - 100))
				,leftVar;

			// if adding for the first time to the blank screen, position them in the middle of the screen
			if (i !== null) {
				leftVar = (Math.random()/this.numbClouds + i/this.numbClouds)*mainPanel.width();

				// if adding afterwards, position them out of the screen
			} else {
				if (Math.ceil(Math.random()*10 + 1)%2) {
					leftVar = mainPanel.width();    // at the right of the screen
					topVar *= 2/3;
				} else {
					topVar	= -1*width/2;
					leftVar = (Math.random() + 1)*mainPanel.width()/2 + 100;  // above the screen
				}
			}

			// set the position & size
			cloud.css({
				width: width
				,top: Math.round(topVar)
				,left: Math.round(leftVar)
			});

			cloud.insertAfter(mainPanelBanner);

			// cloud.insertBefore(mainPanelPlay); // this was to place the cloud on top of the blimp if bigger than blimp

			// start floating
			this.floatCloud(cloud, width);
		},

		/* float cloud - the speed depends on the size of the cloud. (bigger - closer - faster) (smaller - farther - slower) */
		floatCloud: function(cloud, width) {
			var animTopBy = Math.round(width * 0.04 / 1.4)
				,animLeftBy = Math.round(animTopBy * 7 / 1.4)
				,self = this;

			if (this.defaults.stop || $('body').hasClass('vidPopupOpen') || $('body').hasClass('regPopupOpen')) { return false; }

			// float animation
			function floating(){
				cloud.animate({
					top: '+=' + animTopBy
					,left: '-=' + (animLeftBy + 1)
					,width: '+=1'
				},{
					duration: 900
					,easing: 'linear'
					,complete: function() {
						if (cloud.offset().left + width < 0 || cloud.offset().top + 80 > winHeight) { // out of screen
							end();
						} else {
							floating();
						}
					}
				});
			}

			// remove the cloud and create a new one
			function end(){
				cloud.remove();
				self.addCloud();
			}

			floating();
		},

		/* Pauses and Resumes the animation of floating clouds */
		pauseResume: function() {
			// pause
			if (!this.defaults.stop) {
				this.defaults.stop = true;
				mainPanel.find('img.cloud').each(function(){
					$(this).clearQueue().stop(true, false).clearQueue();
				});
			// resume
			} else {
				this.defaults.stop = false;
				mainPanel.find('img.cloud').each(function(){
					this.floatCloud($(this), $(this).width());
				});
			}
		}

	}; // end of floatingClouds



	/*
	*  Market Masters Landing Animation
	*/
	var fallingConfetti;

	if(!oldie){
		fallingConfetti = function() {
			var confettiDirection = 0;
			// canvas init
			var canvas = document.getElementById('canvas');
			var ctx = canvas.getContext('2d');

			// canvas dimensions
			var W = window.innerWidth;
			var H = window.innerHeight;
			canvas.width = W;
			canvas.height = H;

			//snowflake particles
			var mp = 400; //max particles
			var particles = [];
			for (var i = 0; i < mp; i++) {
			    particles.push({
			        x: Math.random() * W, //x-coordinate
			        y: Math.random() * H, //y-coordinate
			        r: Math.random() * 7 + 1, //radius
			        d: Math.random() * mp, //density
			        color: 'rgba(' + Math.floor((Math.random() * 255)) + ', ' + Math.floor((Math.random() * 255)) + ', ' + Math.floor((Math.random() * 255)) + ', 0.8)',
			        tilt: Math.floor(Math.random() * 5) - 5
			    });
			}

		    //Lets draw the flakes
		    function draw() {
		        ctx.clearRect(0, 0, W, H);
		        for (var i = 0; i < mp; i++) {
		            var p = particles[i];
		            ctx.beginPath();
		            ctx.lineWidth = p.r;
		            ctx.strokeStyle = p.color; // Green path
		            ctx.moveTo(p.x, p.y);
		            ctx.lineTo(p.x + p.tilt + p.r / 2, p.y + p.tilt);
		            ctx.stroke(); // Draw it
		        }

		        update();
		    }

			// Function to move the snowflakes
			// Angle will be an ongoing incremental flag. Sin and Cos functions will be applied to it to create vertical and horizontal movements of the flakes
			var angle = 0;

			function update() {
				angle += 0.01;
				for (var i = 0; i < mp; i++) {
					var p = particles[i];
					// Updating X and Y coordinates
					// We will add 1 to the cos function to prevent negative values which will lead flakes to move upwards
					// Every particle has its own density which can be used to make the downward movement different for each flake
					// Lets make it more random by adding in the radius
					p.y += Math.cos(angle + p.d) + 1 + p.r / 7;
					p.x += Math.sin(angle) * 1 + confettiDirection;

					// Sending flakes back from the top when it exits
					// Lets make it a bit more organic and let flakes enter from the left and right also.
					if (p.x > W + 5 || p.x < -5 || p.y > H) {
						// 66.67% of the flakes
						if (i % 3 > 0) {
							particles[i] = {
							    x: Math.random() * W,
							    y: -10,
							    r: p.r,
							    d: p.d,
							    color: p.color,
							    tilt: p.tilt
							};
						} else {
							// If the flake is exitting from the right
							if (Math.sin(angle) > 0) {
							    // Enter from the left
							    particles[i] = {
							        x: Math.random()*50,
							        y: Math.random() * H,
							        r: p.r,
							        d: p.d,
							        color: p.color,
							        tilt: p.tilt
							    };
							} else {
								// Enter from the right
								particles[i] = {
		                            x: W - Math.random()*50,
		                            y: Math.random() * H,
		                            r: p.r,
		                            d: p.d,
		                            color: p.color,
		                            tilt: p.tilt
		                        };
							}
						}
					}
				}

				confettiAnimation = setTimeout(draw, 50);
			}

			// animation loop
			// confettiAnimation = setInterval(draw, 50);
			draw();
			var lastposition = 0;
			window.onmousemove = function(e){
				if (e.pageX >lastposition){
					confettiDirection = 2;
				} else if (e.pageX<lastposition) {
					confettiDirection =-2;
				} else {
					confettiDirection = 0;
				}
				lastposition = e.pageX;
			};
		};
	}

	/*
	* Race Car Animation
	*/
	var racingCar = function(){
		var car = $('div.raceCar');


		var racing = function(){
			car.animate({
				left : '+=3000'
			},{
				duration : 3000
				,easing : 'swing'
				, complete : function(){
					//out of screen
					if (car.offset().left + 300) {
						car.css('left', '-300px');
					}
				}
			});
		};

		raceCarAnimation = setInterval(racing, 5000);
	};


	/*
	* Controls all animation ('PAUSE' / 'RESUME')
	*/
	var allAnimations = function (action) {
		switch (action) {
			case 'RESUME' :
				floatingClouds.pauseResume();
				break;

			case 'PAUSE' :
				break;

			case null :
				break;

			default :
				floatingClouds.pauseResume();
				iframe_video[0].contentWindow.postMessage('{"event" : "command", "func" : "pauseVideo", "arg" : ""}','*');
				return;
		}
	};

	floatingClouds.start();

	if(autoPlay) {
		allAnimations('RESUME');
	}

	if(!oldie) { fallingConfetti(); }

	racingCar();

	if ( -1 === window.navigator.userAgent.indexOf('MSIE') ) {
		setTimeout(updateIframes, 10);
	} else {
		setTimeout(updateIframes, 600);
	}
	mainPanel.css('height', winHeight-80).addClass('loaded');

});

})(jQuery, window.KapitallPageController);