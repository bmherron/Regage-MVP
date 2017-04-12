Template[getTemplate('landing_new')].rendered = function(){


		$(".loader").delay(800).fadeOut("slow");

	
	$window = $(window);
	if( $window .width() > 800){
		$('.parallax-scroll1').parallax("50%", 0.5);
		$('.parallax-scroll2').parallax("50%", 0.5);
		$('.parallax-scroll3').parallax("50%", 0.5);
		$('.parallax-scroll4').parallax("50%", 0.5);
		$('.parallax-scroll5').parallax("50%", 0.5);
	}
	
	
	$('.main-navigation').onePageNav({
		
		filter: ':not(.external)',
	    currentClass: 'current',
		scrollOffset: 85,
	    scrollSpeed: 1000,
	    scrollThreshold: 0.5 ,
	    easing: 'easeInOutExpo'
	   
	});
	
	wow = new WOW(
	    {
	      boxClass:     'wow',      // default
	      animateClass: 'animated', // default
	      offset:       0,          // default
	      mobile:       false,       // default
	      live:         true        // default
	    }
	);
	
	wow.init();
	
	//--- fixed header on scroll
	var test = 0;
	
	var $navbar = $('.navbar');
	var $white_logo_img = $('.white-logo-img');
	var $dark_logo_img = $('.dark-logo-img');
	
	function scrolled(test){
		
		if(test === 0){
			$navbar.stop().addClass("sticky-navbar");
			$white_logo_img.fadeOut();
			$dark_logo_img.fadeIn();
		}else{
			$navbar.stop().removeClass("sticky-navbar");
			$dark_logo_img.fadeOut();
			$white_logo_img.fadeIn();
		}
	}
	
	if($(window).scrollTop() > 50){
		scrolled(test);
	}
	
	$(window).scroll(function() {
		if ($(document).scrollTop() > 50) {
	    	if(test===0){
	    		scrolled(test);
	    	}
	    	test=1;
	    } else {
	    	if(test===1){
	        	scrolled(test);        	
	        }
	        test = 0;
	    }
	}); 
	//--- end scroll
	
	// $('.curved-text').circleType({radius:200});
	
	$('.video-link').magnificPopup({
		type : 'iframe',
		closeBtnInside : false,
		mainClass: 'mfp-fade',
		removalDelay: 160
	});
	
	$("#features-slider").owlCarousel({
		items : 3,
		itemsDesktop : [1199,3],
	});
	
	$("#team-slider").owlCarousel({
		items : 3,
		itemsDesktop : [1199,3],
		itemsDesktopSmall : [996,2],
		itemsTablet: [600,1],
		itemsMobile : false
	});
	
	$("#gallery-slider").owlCarousel({
		singleItem: true,
		slideSpeed : 400,
		navigation : true,
		pagination: false,
		navigationText : ["<i class='fa fa-angle-left'></i>","<i class='fa fa-angle-right'></i>"],
	});
	
	$("#testi-slider").owlCarousel({
		singleItem: true,
		slideSpeed : 400
	});
	
//	$('#plan-select').selectpicker();
  
  		$('#footer').waypoint(function() {
			setTimeout(function(){$('.footer-nav').addClass('animated fadeInDown')},400);
            setTimeout(function(){$('#footer_copy').addClass('animated fadeInUp')},400);
            setTimeout(function(){$('#footer_icons').addClass('animated fadeInDown')},400);
			setTimeout(function(){$('#subscribe-form').addClass('animated fadeInDown')},400);
			setTimeout(function(){$('#newsletter-paragraph').addClass('animated fadeInUp')},400);
		}, { offset: '94%' });
  
  	/*----------------------------------------------------*/
	/*	Register Form Validation
	/*----------------------------------------------------*/
	
	$(document).ready(function(){
	
		"use strict";

		$(".form_register form").validate({
			rules:{ 
			email:{
					required: true,
					email: true
					},
					//email:{
					//	required: true,
					//	email: true,
					//},
					zipcode:{
						required: true,
						digits: true,
					},	
					//message:{
					//	required: true,
					//	minlength: 2,
					//	}
					},
					messages:{
							email:{
								required: "We need your email address",
								email: "Your email address must be in the format of name@domain.com"
							}, 
							zipcode:{
								required: "Please provide your zip code so we can identify your local community",
								digits: "Please enter a valid number"
							}, 

						}
		});			
		
	});

  
}


Template[getTemplate('landing_new')].created = function(){

  
  console.log('created')
  $("link").attr("href","");
  console.log('created')
  loadCSS("LandingNew/css/animate.css");
  loadCSS("LandingNew/css/bootstrap-select.min.css");
  loadCSS("LandingNew/css/bootstrap.min.css");
  loadCSS("LandingNew/css/magnific-popup.css");
  loadCSS("LandingNew/css/owl.carousel.css");
  loadCSS("LandingNew/css/owl.theme.css");
  loadCSS("LandingNew/css/barometer.css");
  loadCSS("LandingNew/css/style-switch.css");
  loadCSS("LandingNew/css/style.css");
  loadCSS("http://fonts.googleapis.com/css?family=Merriweather:400,400italic,700,700italic,300,300italic");
  loadCSS("http://fonts.googleapis.com/css?family=Montserrat:400,700");
  loadCSS("http://fonts.googleapis.com/css?family=Open+Sans:400,300,600,700,800");
  loadCSS("http://fonts.googleapis.com/css?family=Noto+Sans:400,700");
  loadCSS("http://maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css");
  loadCSS("LandingNew/css/skins/orange.css");
  
  
}
 loadCSS = function(href) {
     var cssLink = $("<link rel='stylesheet' type='text/css' href='"+href+"'>");
     $("head").append(cssLink); 
 };






Template[getTemplate('landing_new')].events({
  'click #pledgebutton': function(e, instance){
     console.log("aaaaaaa")
    e.preventDefault();
 //   var stripeAmount = $("#amount").val();
  //  var postId = this._id;
 //   var post = this;
 //   var title = post.title ? post.title : 'Campaign Pledge'
 //   var email = Meteor.user().profile.email ? Meteor.user().profile.email : ''
//    console.log(postId)
 //   console.log(post)
 //   console.log(email)
    var handler = StripeCheckout.configure({
          key: 'pk_test_LjMIf8e56jqSYCz9W2AXOCup',
          image: '/img/re-logo.gif',
          token: function(token) {
            //console.log(token)
            var obj = {
              token: token,
              amount: stripeAmount,
              postId: postId
            }
            console.log(obj)
            Meteor.call('addPledge', obj, function(error, pledge) {
              console.log('addpledge finished')
              throwError(i18n.t('Thank you for your pledge.'));
              $("#amount").val("");
           //   Router.go('/posts/'+postId);
             // Use the token to create the charge with a server-side script.
            // You can access the token ID with `token.id`
          })
          }
        });
    
    
    // Open Checkout with further options
    handler.open({
  //    name: title,
  //    description: '',
  //    amount: stripeAmount * 100,
   //   email: email,
      'allow-remember-me': true,
      'panel-label': 'Pledge {{amount}}',
      image: '/img/re-logo.gif'
    })
    
  // Close Checkout on page navigation
  $(window).on('popstate', function() {
    handler.close();
  });
  }
})