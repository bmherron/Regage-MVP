var filteredModules = function (group) {
  // return the modules whose positions start with group
  return _.filter(postModules, function(module){return module.position.indexOf(group) == 0});
};

var post = {};

Template[getTemplate('post_featured')].created = function () {
  post = this.data;
};

Template[getTemplate('post_featured')].helpers({
  isIssue: function () {
    return Session.get('feed') == 1;
  },
  leftPostModules: function () {
    return filteredModules('left');
  },
  centerPostModules: function () {
    return filteredModules('center');
  },
  rightPostModules: function () {
    return filteredModules('right');
  },
  getTemplate: function () {
    return getTemplate(this.template);
  },
  moduleContext: function () { // not used for now
    var module = this;
    module.templateClass = camelToDash(this.template) + ' ' + this.position + ' cell';
    module.post = post;
    return module;
  },
  moduleClass: function () {
    return camelToDash(this.template) + ' ' + this.position + ' cell';
  },
  classSuffix: function() {
    return  this.postType == '1' ? '' : this.postType;
  },
  photoLink: function(){
    var placeholder = this.postType == 2 ? "/img/project.jpg" : "/img/placeholder.jpeg" 
    return !!this.fileName ? "" + this.fileName : placeholder;
  },
  postLink: function(){
    //return !!this.url ? getOutgoingUrl(this.url) : "/posts/"+this._id;
    return "/posts/"+this._id;
  },
  tagLine: function(){
    //return !!this.url ? getOutgoingUrl(this.url) : "/posts/"+this._id;
   // console.log('tagLine');
   // console.log(this);
  if (this.bodyWhat)
    return this.bodyWhat.substring(0,140)
  if (this.body)
    return this.body.substring(0,140)
  },
  
   fundingGoalFormatted: function(){
    return this.fundingGoal ? "$" + this.fundingGoal.toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")  : '0';
  },
  fundingTotalFormatted: function(){
    return this.fundingTotal ? "$" + this.fundingTotal.toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") : '0';
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
  backers: function(){
    return this.fundingCount;
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
  
  } ,
  isNonProfit: function(){
    return this.nonProfitApproved;
  },  

  
  
});

Template[getTemplate('post_featured')].events({
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

Template[getTemplate('post_featured')].rendered = function(){

    $("#amount").on("input", function() {
        // allow numbers, a comma or a dot
        $(this).val($(this).val().replace(/[^0-9,\.]+/, ''));
    });
}
                    

                    

