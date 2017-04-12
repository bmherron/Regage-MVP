Template[getTemplate('post_fund_collect')].created = function () {

  Session.set('fundMessage', '');
  if (this.data.state === '')
     return;
  var stat = authStatusCalc(this.data.post);
  if(stat === 'AUTH'){
     //Session.set('fundMessage','Your collection account has been authorized.  You can collect pledged funds by clicking the button below.');
    return;
  }
  if(stat === 'WAIT'){
     //Session.set('fundMessage','Your campaign is not yet ready for pledge collections.');
    return;
  }  
  if (this.data.error !== ''){
    Session.set('fundMessage',this.data.errordescription);
  }
  if (this.data.code !== ''){
    Session.set('fundMessage', 'Please wait while your authorization token is established.');
    Meteor.call('payAccountToken', this.data.code, this.data.post._id, function(err,result){
      //console.log(result)
      console.log(err)
      if (err){
        Session.set('fundMessage',  err.errordescription);

      }
      if (result === 'success'){
        Session.set('fundMessage', 'Authorization is successful. You can now collect pledged funds by clicking the button below.');

      }else{
        Session.set('fundMessage', result);

      }
    })
  }
  //console.log(post);
  //console.log(this.data.fundPostId);
  //console.log(this.data.error);
  //console.log(this.data.errordescription);
  //console.log(this.data.state);
  //console.log(this.data.code);
};

Template[getTemplate('post_fund_collect')].helpers({

   fundingGoalFormatted: function(){
    return this.post.fundingGoal ? "$" + this.post.fundingGoal.toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")  : '0';
  },
  fundingTotalFormatted: function(){
    return this.post.fundingTotal ? "$" + this.post.fundingTotal.toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") : '$0';
  },
  
  fundingProgress: function () {
    var pct
    if(this.fundingTotal) {
      pct= this.fundingTotal/this.fundingGoal;
      pct= Math.round(Math.min(pct, 1)*100) + '%';    
    } else {
      
     pct= "0%"
    }
      
    return pct;
  },
  
  
   fundingTotalAmount: function () {
   var pct
    if(this.fundingTotal) {
      pct= this.fundingTotal/this.fundingGoal;
      pct= Math.round(pct*100) + '%';   
    } else {
      
     pct= "0%"
    }
      
    return pct;
  },
  
   fundingTotalPercent: function () {
   var pct
    if(this.fundingTotal) {
      pct= this.fundingTotal/this.fundingGoal;
      pct= Math.round(pct*100) ;   
    } else {
      
     pct= "0"
    }
      
    return pct;
  },
  backers: function(){
    return this.post.fundingCount;
  },
  
   photoLink: function(){
    var placeholder = this.postType == 2 ? "/img/project.jpg" : "/img/placeholder.jpeg" 
    return !!this.fileName ? "" + this.fileName : placeholder;
  },
  postLink: function(){
    //return !!this.url ? getOutgoingUrl(this.url) : "/posts/"+this._id;
    return "/posts/"+this._id;
  },
  
  
  
  
  fundingDuration: function(){
    return this.post.fundingDuration;
  },
  fundingStartDate: function(){
    return this.post.postedAt.toLocaleDateString();
  },
  ago: function(){
    return moment(this.post.postedAt).fromNow();
  },
  
  name: function () {
    return getDisplayName(Meteor.user());
  },
  authReady: function(){
    return authStatusCalc(this.post) === 'READY' ? true : false;
  },
  authStatus: function(){
    return authStatusCalc(this.post);
  }, 
  includeAuthButton: function(){
    if (this.post.payAuthTokenExists)
      return false;
    var stat = authStatusCalc(this.post);
    return (stat == 'READY')
  },  
  includeCollectButton: function(){
    if (!this.post.payAuthTokenExists)
      return false;
    var stat = authStatusCalc(this.post);

    if (this.post.fundingTotal > ((this.post.payCollectedAmt ? this.post.payCollectedAmt: 0)))
      return true;
    return false;
  },
  messageText: function(){
    return Session.get('fundMessage');
  }, 
  payCollectedAmt: function(){
    return this.post.payCollectedAmt ? "$" + this.post.payCollectedAmt.toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") : '$0';
  },
  payRejectedAmt: function(){
    return this.post.payRejectedAmt ? "$" + this.post.payRejectedAmt.toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") : '$0';
  },
  payFeeAmt: function(){
    var amt = this.post.payProcFee ? this.post.payProcFee : 0
    amt = amt + (this.post.payAppFee ? this.post.payAppFee : 0)
    return amt ? "$" + amt.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") : '$0';
  },
  payUntriedAmt: function(){
    var amt = this.post.fundingTotal ? this.post.fundingTotal : 0
    amt = amt - (this.post.payCollectedAmt ? this.post.payCollectedAmt : 0)
    amt = amt - (this.post.payRejectedAmt ? this.post.payRejectedAmt : 0)
    return amt ? "$" + amt.toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") : '$0';
  },
  campaignStatus: function(){
    var payAuthTokenExists = this.post.payAuthTokenExists ? this.post.payAuthTokenExists : false;
    var daysRemaining = daysLeft(this.post);
    var goal = this.post.fundingGoal
    var pledged = this.post.fundingTotal
    var status = ''
    var stat = authStatusCalc(this.post);
    
    status = status + ((daysRemaining <= 0) ? 'Completion date reached. ' : 'Completion date not yet met. ');
    status = status + ((pledged >= goal) ? 'Campaign goal reached. ' : 'Campaign goal not yet met. ');
    status = (stat === 'AUTH') ? 'Authorized for collections. ' :  status;
    status = status + ((stat === 'WAIT') ? 'Not yet eligible to authorize. ' : '');
    status = status + ((stat === 'READY') ? 'Click button below to request authorization. ' : '');
    if (stat === 'AUTH'){
      if (!this.post.payCollectedAmt || this.post.payCollectedAmt === 0)
          status = status + 'No pledges collected yet. '
      else
          if (this.post.fundingTotal > this.post.payCollectedAmt )
               status = status + 'Pledges partially collected. '
          else
               status = status + 'Pledges fully collected. ';
    }
    if (stat === 'AUTH'){
      if (this.post.payRejectedAmt > 0)
          status = status + 'Some pledges failed to collect. ';
    }
    return status;
  },
  title: function(){
    return this.post.title;
  },
  
});

Template[getTemplate('post_fund_collect')].rendered = function(){
  // run all post submit rendered callbacks
  var instance = this;
  postSubmitRenderedCallbacks.forEach(function(callback) {
    callback(instance);
  });
   //console.log('rendered');
   var $bars = $('.barometer') ;
   //console.log($bars);
	 $bars.each( function() {
        //console.log('initsub')
        //console.log($(this))
				initBarometer( $(this) );
			});					


};

Template[getTemplate('post_fund_collect')].events({
// ------------------------------ Collect ------------------------------ //
  'click input[id=collect]': function(e, instance){
    e.preventDefault();
    

    $(e.target).addClass('disabled');

    if(!Meteor.user()){
      throwError(i18n.t('You must be logged in.'));
      return false;
    }



    Session.set('fundMessage', 'Please wait while the pledge amounts are collected.');

     Meteor.call('pledgeCollect', this.post._id, function(err,result){
      if (err){
        Session.set('fundMessage',  err.errordescription);

      }else{
         rejectedAmt = "$" + result.payRejectedAmt.toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
         collectedAmt = "$" + result.payCollectedAmt.toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
         collectedNowAmt = "$" + result.payCollectedNowAmt.toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
         Session.set('fundMessage', 'On this attempt, ' + collectedNowAmt + ' collected, ' + rejectedAmt + ' rejected.');
        
      }

    })

	  $(e.target).removeClass('disabled'); 

  },
  
// ------------------------------ Authorize ------------------------------ //
  'click input[id=auth]': function(e, instance){
    e.preventDefault();
    $(e.target).addClass('disabled');
    var postId = this.fundPostId;
    Meteor.call('payStripeConnectAppClientId',  function(err,result){
        Router.go('https://connect.stripe.com/oauth/authorize?response_type=code&scope=read_write&client_id=' + result + '&state='+postId);
        //ca_5QNgvnLLJlTRNHGLai5Os0tdo1AfVEyT
    });
    
  },  
  
// ------------------------------ Cancel ------------------------------ //
  'click input[id=cancel]': function(e, instance){
    e.preventDefault();
    $(e.target).addClass('disabled');
    Router.go('/posts/'+this.fundPostId);
  }


});


var authStatusCalc = function(post){
    var payAuthTokenExists = post.payAuthTokenExists ? post.payAuthTokenExists : false;
    var daysRemaining = daysLeft(post);
    var goal = post.fundingGoal
    var pledged = post.fundingTotal
    //console.log('goal='+goal + ' pledged=' + pledged + ' daysremaining=' + daysRemaining + ' payAuthTokenExists=' + payAuthTokenExists)
    if (payAuthTokenExists) return 'AUTH';
    if (daysRemaining <= 0 && pledged >= goal) return 'READY'
    return 'WAIT';
  };


var  daysLeft = function(post){
    var postDate = post.postedAt;
    var today = new Date();
    
    var millisecondsinday = 86400000;	
    var age = Math.floor((today-postDate)/millisecondsinday)
    var duration = post.fundingDuration;	
    if(!!!duration || duration === 0 ){
      return 0; 
    }
    if (age>duration){
      return 0;
    }else{
      return duration - age;
    }
  
  } ;





