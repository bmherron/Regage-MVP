Template[getTemplate('post_fund')].helpers({
  categoriesEnabled: function(){
    return Categories.find().count();
  }
  
});

Template[getTemplate('post_fund')].rendered = function(){
  // run all post submit rendered callbacks
  var instance = this;
  postSubmitRenderedCallbacks.forEach(function(callback) {
    callback(instance);
  });


};

Template[getTemplate('post_fund')].events({
  'click input[id=charge]': function(e, instance){
    e.preventDefault();
    var stripeAmount = $("input#amount").val();
    var postId = this.fundPostId;
    var post = Posts.findOne(postId);
    var title = post.title ? post.title : 'Campaign Pledge'
    var email = Meteor.user().profile.email ? Meteor.user().profile.email : ''
    //console.log(postId)
    //console.log(post)
    //console.log(email)
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
              Router.go('/posts/'+postId);
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



  
// ------------------------------ Cancel ------------------------------ //

  'click input[id=cancel]': function(e, instance){
    e.preventDefault();
    Router.go('/posts/'+this.fundPostId);
  }

});


