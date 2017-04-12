Template[getTemplate('submitButton')].helpers({
  sessionFeed: function () {
    return Session.get('feed');
  },
  sessionFeedLabel: function(){
    if (Session.get('feed') == 1){
      return i18n.t('Issue');
    }
    if (Session.get('feed') == 2){
      return i18n.t('Project');
    }
    return 'Post';
  },  

});