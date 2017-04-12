Meteor.startup(function () {
  Template[getTemplate('postShareIcon')].helpers({
    sourceLink: function(){
      return !!this.url ? this.url : getSiteUrl() + "posts/"+this._id;
    },
    viaTwitter: function () {
      return !!getSetting('twitterAccount') ? 'via='+getSetting('twitterAccount') : '';
    }
  });

  Template[getTemplate('postShareIcon')].events({
    'click .share-link': function(e){
       console.log('share-link')
       console.log(e.currentTarget)
      var $this = $(e.currentTarget);
      console.log($this.parent())
      var $share = $this.parent().find('.share-options');
      e.preventDefault();
      //$('.share-link').not($this).removeClass("active");
      //$(".share-options").not($share).addClass("hidden");
      $this.toggleClass("active");
      $share.toggleClass("hidden");
    },
   'click .mt-regage': function (e, i) {
      console.log(3333)
    e.preventDefault();
    Meteor.call('post_endorse', this._id);

    }
    
  });
});