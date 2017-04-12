Meteor.startup(function () {
  Template[getTemplate('siteShare')].helpers({
    sourceLink: function(){
      return  getSiteUrl() ;
    },
    viaTwitter: function () {
      return !!getSetting('twitterAccount') ? 'via='+getSetting('twitterAccount') : '';
    }
  });

  Template[getTemplate('siteShare')].events({
    'click .share-link': function(e){

      var $this = $(e.target).parents('.post-share').find('.share-link');
      var $share = $this.parents('.post-share').find('.share-options');
      e.preventDefault();
      $('.share-link').not($this).removeClass("active");
      $(".share-options").not($share).addClass("hidden");
      $this.toggleClass("active");
      $share.toggleClass("hidden");
    }
    
  });
});