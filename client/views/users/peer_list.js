Template[getTemplate('peer_list')].helpers({
  follows: function () {
    console.log('follows')
    console.log(this)
    var userFollowedUsers = Follows.find({followeeId: this._id});
    var userFollowedUserIds = _.pluck(userFollowedUsers.fetch(), 'userId');  
    console.log(userFollowedUserIds)
    return  Meteor.users.find({_id: {$in: userFollowedUserIds}})
  }, 
  photoLink: function(){
    return !!this.profile.fileName ? "" + this.profile.fileName : "/img/avatar.png";
  },
  profileUrl: function(){
    // note: we don't want the post to be re-rendered every time user properties change
    var user = this; // Meteor.users.findOne(this.userId, {reactive: false});
    if(user)
         return 'users/' + slugify(getUserName(user));
  },
  
  
});