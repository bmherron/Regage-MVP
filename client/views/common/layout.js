Template[getTemplate('layout')].helpers({
  mobile_nav: function () {
    return getTemplate('mobile_nav');
  },
  sessionFeed: function () {
    return Session.get('feed');
  },
    new_nav: function () {
    return getTemplate('new_nav');
  },
  nav: function () {
    return getTemplate('nav');
  },
  error: function () {
    return getTemplate('error');
  },
  notifications: function () {
    return getTemplate('notifications');
  },
  footer: function () {
    return getTemplate('footer');
  },
  isIssue: function () {
    return Session.get('feed') == 1;
  },
  pageName : function(){
    return getCurrentTemplate();
  },
  css: function () {
    return getTemplate('css');
  },
  heroModules: function () {
    return heroModules;
  },
  getTemplate: function () {
    return getTemplate(this.template);
  },
  getUserInfo: function () {
    var user = Meteor.user()
    return 'sign out ' + user.username + ' ' + user.profile.name + ' ' + user.profile.city + ' ' + user.profile.state;
  }
});

Template[getTemplate('layout')].created = function(){
  Session.set('currentScroll', null);
};

Template[getTemplate('layout')].rendered = function(){
  if(currentScroll=Session.get('currentScroll')){
    $('body').scrollTop(currentScroll);
    Session.set('currentScroll', null);
  }
};

Template[getTemplate('layout')].events({
  'click .mobile-menu-button': function(e){
    e.preventDefault();
    $('body').toggleClass('mobile-nav-open');
  }
});