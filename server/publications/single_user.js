// Publish a single user

Meteor.publish('singleUser', function(userId) {
    return Meteor.users.find({_id: userId});

});


Meteor.publish('followedUsers', function() {
    var userFollowedUsers = Follows.find({followeeId: this.userId});
    var userFollowedUserIds = _.pluck(userFollowedUsers.fetch(), 'userId');
    return Meteor.users.find({_id: {$in: userFollowedUserIds}})
});


