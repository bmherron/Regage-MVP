Template[getTemplate('post_page')].created = function () {
  postUser = Meteor.users.findOne(this.data.userId,{reactive: false});
};



Template[getTemplate('post_page')].helpers({
  comment_item: function () {
    return getTemplate('comment_item');
  },
  child_comments: function(){
    var post = this;
    var comments = Comments.find({postId: post._id, parentCommentId: null}, {sort: {score: -1, postedAt: -1}});
    return comments;
  },
  post_user_bio: function () {
    return postUser.profile.bio;
  },
  profileUrl: function(){
    // note: we don't want the post to be re-rendered every time user properties change
     if(postUser)
      return getProfileUrl(postUser);
  },
  getTwitter: function(){
    return getTwitterName(postUser) || "";
  },  
  post_user_site: function(){
    return postUser.profile.site;
  },
  post_page_item: function () {
    return getTemplate('post_page_item');
  },
  post_body: function () {
    return getTemplate('post_body');
  },
  comment_form: function () {
    return getTemplate('comment_form');
  },
  comment_list: function () {
    return getTemplate('comment_list');
  },
  project_list: function () {
    return getTemplate('project_list');
  },
  
    project_title: function () {
    return getTemplate('post_title');
  },
    
    isIssue: function () {
    return this.postType == 1;
  },
  relposttype: function () {
    return Session.get('showrelposttype') ;
  },
  isProjectList: function () {
    return Session.get('showrelposttype') == '2' ;
  },
  photoLink: function(){
    var placeholder = this.postType == 2 ? "/img/project.jpg" : "/img/placeholder.jpeg" 
    return !!this.fileName ? "" + this.fileName : placeholder;
  },
  postLink: function(){
    //return !!this.url ? getOutgoingUrl(this.url) : "/posts/"+this._id;
    return "/posts/"+this._id;
  },
  
   fundingGoalFormatted: function(){
    return this.fundingGoal ? "$" + this.fundingGoal.toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")  : '0';
  },
  fundingTotalFormatted: function(){
    return this.fundingTotal ? "$" + this.fundingTotal.toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") : '$0';
  },
  backers: function(){
    return this.fundingCount;
  },
  
  can_edit: function(){
    if(this.userId && Meteor.userId())
      return isAdmin(Meteor.user()) || (Meteor.userId() === this.userId);
    else
      return false;
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

  authorName: function(){
    return getAuthorName(this);
  },
  daysLeft: function(){
    var postDate = this.postedAt;
    var today = new Date();
    
    var millisecondsinday = 86400000;	
    var age = Math.floor((today-postDate)/millisecondsinday)
    var duration = this.fundingDuration;	
    if(!!!duration || duration === 0 ){
      return 0; 
    }
    if (age>duration){
      return 0;
    }else{
      return duration - age;
    }
  
  },
  isNonProfit: function(){
    return this.nonProfitApproved;
  },  
  
});

Template[getTemplate('post_page')].rendered = function(){
  $('body').scrollTop(0);
  if(this.data) // XXX
    document.title = $(".post-title").text();
 

    $("#amount").on("input", function() {
        // allow numbers, a comma or a dot
        $(this).val($(this).val().replace(/[^0-9,\.]+/, ''));
    });
  
      var postDate = this.data.postedAt;
    var today = new Date();
    
    var millisecondsinday = 86400000;	
    var age = Math.floor((today-postDate)/millisecondsinday)
    var duration = this.data.fundingDuration;	
    //console.log('countdown')
    //console.log(postDate)
    //console.log(duration)
    //console.log(age)
    if (!!!duration || duration < 1 ){
      //console.log('aaa')
      duration = -1;   
    }
    if (age>duration){
      //console.log('bbb')
      postDate = today;
      //console.log(postDate)
      $('#countdownx').countdown({until: postDate, format: 'dHMS'});	
    }else{
      postDate.setTime( postDate.getTime() + duration * 86400000 );
      //console.log(postDate)
      $('#countdownx').countdown({until: postDate, format: 'dHMS'});	
      //$('#countdownx').countdown({until: new Date(2015, 0, 26), format: 'dHMS'});	
    }
   
      initBarometer( $('#barometer1') ); 
  

};




//console.log('rendered')

//console.log($('#barometer1'))

  


Template[getTemplate('post_page')].events({
   'click #pledgebutton': function(e, instance){
     console.log("aaaaaaa")
    e.preventDefault();
    var stripeAmount = $("#amount").val();
    var postId = this._id;
    var post = this;
    var title = post.title ? post.title : 'Campaign Pledge'
    var email = Meteor.user().profile.email ? Meteor.user().profile.email : ''
    console.log(postId)
    console.log(post)
    console.log(email)
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
      name: title,
      description: '',
      amount: stripeAmount * 100,
      email: email,
      'allow-remember-me': true,
      'panel-label': 'Pledge {{amount}}',
      image: '/img/re-logo.gif'
    })
    
  // Close Checkout on page navigation
  $(window).on('popstate', function() {
    handler.close();
  });

  },
  
  
  'submit form': function(e, instance){
    e.preventDefault();
    $(e.target).addClass('disabled');
    clearSeenErrors();
    var content = $('#comment').val();
    if(getCurrentTemplate() == 'comment_reply'){
      // child comment
      var parentComment = this.comment;
      Meteor.call('comment', parentComment.postId, parentComment._id, content, function(error, newComment){
        if(error){
          console.log(error);
          throwError(error.reason);
        }else{
          trackEvent("newComment", newComment);
          Router.go('/posts/'+parentComment.postId+'/comment/'+newComment._id);
        }
      });
      
    }else{
      // root comment
      var post = this;

      Meteor.call('comment', post._id, null, content, function(error, newComment){
        if(error){
          console.log(error);
          throwError(error.reason);
        }else{
          trackEvent("newComment", newComment);
          Session.set('scrollToCommentId', newComment._id);
           $('#comment').val('');
          //instance.editor.importFile('editor', '');
        }
      });
    }
  }
  

});