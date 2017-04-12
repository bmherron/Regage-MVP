Template[getTemplate('mobile_nav')].helpers({
  
  userMenu: function () {
    return getTemplate('userMenu');
  },
  
  search: function () {
    return getTemplate('search');
  },
  
  primaryNav: function () {
    return primaryNav;
  },
  hasPrimaryNav: function () {
    return !!primaryNav.length;
  },
  secondaryNav: function () {
    return secondaryNav;
  },
  hasSecondaryNav: function () {
    return !!secondaryNav.length;
  },
  dropdownClass: function () {
    return getThemeSetting('useDropdowns', true) ? 'has-dropdown' : 'no-dropdown';
  },
  getTemplate: function () {
    return getTemplate(this);
  },
  site_title: function(){
    return getSetting('title');
  },
  logo_url: function(){
    return getSetting('logoUrl');
  },
  logo_top: function(){
    return Math.floor((70-getSetting('logoHeight'))/2);
  },  
  logo_offset: function(){
    return -Math.floor(getSetting('logoWidth')/2);
  },
  intercom: function(){
    return !!getSetting('intercomId');
  },
  canPost: function(){
    return canPost(Meteor.user());
  },
  requirePostsApproval: function(){
    return getSetting('requirePostsApproval');
  },
  currentFeed: function(){
    return Session.get('feed') ;
  },
  name: function () {
    return getDisplayName(Meteor.user());
  },
  profileUrl: function () {
    var user = Meteor.user();
    if(user)
      return '/users/' + slugify(getUserName(user));
  },
  
  checkedIssue: function(){
    return Session.get('feed') == '1' ? 'checked' : '' ;
  },
  checkedProject: function(){
    return Session.get('feed') == '2' ? 'checked' : '' ;
  },
  
  notificationItem: function () {
    return getTemplate('notificationItem');
  },
  notifications: function(){
    return Herald.collection.find({userId: Meteor.userId(), read: false}, {sort: {timestamp: -1}});
  },
  hasNotifications: function () {
    return !!Herald.collection.find({userId: Meteor.userId(), read: false}, {sort: {timestamp: -1}}).count();    
  },
  notification_count: function(){
    var notifications=Herald.collection.find({userId: Meteor.userId(), read: false}).fetch();
    if(notifications.length==0){
      return i18n.t('No notifications');
    }else if(notifications.length==1){
      return i18n.t('1 notification');
    }else{
      return notifications.length+' '+i18n.t('notifications');
    }
  },
  notification_class: function(){
    var notifications=Herald.collection.find({userId: Meteor.userId(), read: false}).fetch();
    if(notifications.length==0)
      return 'no-notifications';
  }
});



Template[getTemplate('mobile_nav')].rendered = function () {
  $('.mobile-nav .dropdown-menu').hide();
  
  if(!Meteor.loggingIn() && !Meteor.user()){
    $('.login-link-text').text("Sign Up/Sign In");
  }
};

Template[getTemplate('mobile_nav')].events({
  'click .dropdown-sub-level': function () {
    $('body').toggleClass('mobile-nav-open');
  },
  'click .mobile-menu-button': function(e){
    e.preventDefault();
    $('body').toggleClass('mobile-nav-open');
  },
  'click .dropdown-top-level': function (e) {
    e.preventDefault();
    $(e.currentTarget).next().slideToggle('fast');
  },
  'click .mobile-nav a': function (e) {
    if (e.target.className.indexOf('dropdown-top-level') == -1){
      $('body').removeClass('mobile-nav-open');
    }
  },
   'click .login-header': function(e){
    e.preventDefault();
    Router.go('/account');
  },
  'click #login-name-link': function(){
    if(Meteor.user() && !$('account-link').exists()){
      var $loginButtonsLogout = $('#login-buttons-logout');
      $loginButtonsLogout.before('<a href="/users/'+Meteor.user().slug+'" class="account-link button">View Profile</a>');
      $loginButtonsLogout.before('<a href="/account" class="account-link button">Edit Account</a>');
    }
  },
  'change input[name=feed]': function (e, i) {
    Session.set('feed',e.currentTarget.value);
    Router.go("/");
    //$('#submit').html('add this');
  },
  'click #logout': function(e){
    e.preventDefault();
    Meteor.logout();
  },
  'click .notifications-toggle': function(e){
    e.preventDefault();
    $('body').toggleClass('notifications-open');
  },
  'click .mark-as-read': function(){
    Meteor.call('markAllNotificationsAsRead', 
      function(error, result){
        error && console.log(error);
      }
    );
  }
});