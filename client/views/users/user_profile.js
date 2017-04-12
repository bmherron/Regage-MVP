Template[getTemplate('user_profile')].created = function () {
  Session.set('postsShown', 5);
  Session.set('upvotedPostsShown', 5);
  Session.set('downvotedPostsShown', 5);
  Session.set('commentsShown', 5);
  Session.set('feed', '1')
};

Template[getTemplate('user_profile')].helpers({
  post_item: function () {
    return getTemplate('post_item');
  },
  postsLoadMore: function () {
    return getTemplate('postsLoadMore');
  },
  
follows: function () {
    var userFollowedUsers = Follows.find({followeeId: this._id});
    var userFollowedUserIds = _.pluck(userFollowedUsers.fetch(), 'userId');  
    console.log(userFollowedUserIds)
    return  Meteor.users.find({_id: {$in: userFollowedUserIds}})
},  
isFollowed: function() {
  var userId = this._id

  var followee = Follows.findOne({followeeId: Meteor.userId(), userId: userId});
  if (followee) {
    return true;
  } else {
    return false;
  }
  },
   
followText: function () {
  var userId = this._id

  var followee = Follows.findOne({followeeId: Meteor.userId(), userId: userId});
  if (followee) {
    return 'unfollow';
  } else {
    return 'follow';
  }
},
thisisnotme: function() {
     return Meteor.user() && Meteor.user()._id != this._id ;
},  
 thisisme: function() {
     return Meteor.user() && Meteor.user()._id == this._id ;
},   
  profileUrl: function(){
    // note: we don't want the post to be re-rendered every time user properties change
    var user = this; // Meteor.users.findOne(this.userId, {reactive: false});
    console.log(user)
    console.log('users/' + slugify(getUserName(user)))
    if(user)
         return 'users/' + slugify(getUserName(user));
  },
  
  canEditProfile: function() {
    var currentUser = Meteor.user();
    return currentUser && (this._id == currentUser._id || isAdmin(currentUser));
  },
  createdAtFormatted: function() {
    return this.createdAt;
  },
  commprofileInfo: function() {
  if (!this.commList){
    return ""
  }
  if (!this.commList[0]){
    return ""
  }
  var commKey = this.commList[0];
  var keys = commKey.split("/");
  if (keys[0] == "city") {
    return ', '+keys[3]+", "+keys[2];
  } else {
    return "";  
    
  } 
    
  },
  
    authorName: function(){
    return getAuthorName(this);
  },
  
  canInvite: function() {
    // if the user is logged in, the target user hasn't been invited yet, invites are enabled, and user is not viewing their own profile
    return Meteor.user() && Meteor.user()._id != this._id && !isInvited(this) && invitesEnabled() && canInvite(Meteor.user());
  },
  inviteCount: function() {
    return Meteor.user().inviteCount;
  },
  getTwitterName: function () {
    return getTwitterName(this);
  },
  getGitHubName: function () {
    return getGitHubName(this);
  },
  posts: function () {
    return Posts.find({$or: [{userId: this.user._id}, {'endorsements.userId': this.user._id}], postType: Session.get('feed')}, {limit: Session.get('postsShown')});
  },
  hasMorePosts: function () {
    return Posts.find({userId: this._id}).count() > Session.get('postsShown');
  },
  upvotedPosts: function () {
    // extend upvotes with each upvoted post
    if(!!this.votes.upvotedPosts){
      var extendedVotes = this.votes.upvotedPosts.map(function (item) {
        var post = Posts.findOne(item.itemId);
        return _.extend(item, post);
      });
      return _.first(extendedVotes, Session.get('upvotedPostsShown'));
    }
  },
  hasMoreUpvotedPosts: function () {
    return !!this.votes.upvotedPosts && this.votes.upvotedPosts.length > Session.get('upvotedPostsShown');
  },
  downvotedPosts: function () {
    // extend upvotes with each upvoted post
    if(!!this.votes.downvotedPosts){
      var extendedVotes = this.votes.downvotedPosts.map(function (item) {
        var post = Posts.findOne(item.itemId);
        return _.extend(item, post);
      });
      return _.first(extendedVotes, Session.get('downvotedPostsShown'));
    }
  },
  hasMoreDownvotedPosts: function () {
    return !!this.votes.downvotedPosts && this.votes.downvotedPosts.length > Session.get('downvotedPostsShown');
  },
  comments: function () {
    var comments = Comments.find({userId: this._id}, {limit: Session.get('commentsShown')});
    if(!!comments){
      // extend comments with each commented post
      var extendedComments = comments.map(function (comment) {
        var post = Posts.findOne(comment.postId);
        if(post) // post might not be available anymore
          comment.postTitle = post.title;
        return comment;
      });
      return extendedComments;
    }
  },
  hasMoreComments: function () {
    return Comments.find({userId: this._id}).count() > Session.get('commentsShown');
  },
  photoLink: function(){
    return !!this.profile.fileName ? "" + this.profile.fileName : "/img/avatar.png";
  },
  isProject: function () {
    return Session.get('feed') == 2;
  },
  
});

Template[getTemplate('user_profile')].events({

  //Follow Users//
  'click .follow_icon': function(event, template) {
  var isFollowed, theClickedUserId = this._id,
      followsRecord = Follows.findOne({userId: theClickedUserId, followeeId: Meteor.userId()});
    isFollowed = followsRecord ? true : false;

 
  if (!isFollowed) {
    Follows.insert({
      userId: theClickedUserId,
      followeeId: Meteor.userId()
    });
  } else {
    Follows.remove({_id: followsRecord._id });
  }
},
  
  
   'click .engagelink1': function (e, i) {
      console.log(3333)
    e.preventDefault();
    Session.set('feed',"1");
    
    //Router.go("/");
    //$('#submit').html('add this');
  },
  
  'click .crowdfundlink1': function (e, i) {
    console.log(4444)
    e.preventDefault();
    Session.set('feed', "2");

    //Router.go("/");
    //$('#submit').html('add this');
  },
  
  'click #addPeers': function (e, i) {
    e.preventDefault();
    $("body").addClass("modal-open");
    bootbox.dialog({
                title: "",
      message: '<iframe style="width:100%; height:400px;overflow:hidden;" src="/peersearch"></iframe>',
                buttons: {
                    success: {
                        label: "Close",
                        className: "btn-success",
                        callback: function () {
                           console.log('leave modal')
                            $("body").removeClass("modal-open");
                           Meteor.subscribe('followedUsers')
                            
                        }
                    }
                }
            }
        );
    // Blaze.renderWithData(Template.peer_list, this, $("#dialogNode")[0]);
    //UI.insert(UI.renderWithData(Template.peer_list, this), $("#dialogNode")[0])
  },

  'click .invite-link': function(e, instance){
    Meteor.call('inviteUser', instance.data.user._id);
    throwError('Thanks, user has been invited.');
  },
  'click .posts-more': function (e) {
    e.preventDefault();
    var postsShown = Session.get('postsShown');
    Session.set('postsShown', postsShown + 10);
  },
  'click .upvotedposts-more': function (e) {
    e.preventDefault();
    var upvotedPostsShown = Session.get('upvotedPostsShown');
    Session.set('upvotedPostsShown', upvotedPostsShown + 10);
  },
  'click .downvotedposts-more': function (e) {
    e.preventDefault();
    var downvotedPostsShown = Session.get('downvotedPostsShown');
    Session.set('downvotedPostsShown', downvotedPostsShown + 10);
  },
  'click .comments-more': function (e) {
    e.preventDefault();
    var commentsShown = Session.get('commentsShown');
    Session.set('commentsShown', commentsShown + 10);
  }
});

