Template[getTemplate('userMenu')].helpers({
  isLoggedIn: function () {
    return !!Meteor.user();
  },
  name: function () {
    return getDisplayName(Meteor.user());
  },
  profileUrl: function () {
    var user = Meteor.user();
    if(user)
      return '/users/' + slugify(getUserName(user));
  },
});
