// Publish a list of type 1 posts

Meteor.publish('postsList', function(terms) {
  if(canViewById(this.userId)){
    var parameters = getPostsParameters(terms);
    parameters.find = _.omit(parameters.find, 'postedAt')
    parameters.find.postType = '1';   
    var posts = Posts.find(parameters.find, parameters.options);
     console.log('//-------- postsList Subscription Parameters:');
     console.log(parameters.find);
     console.log(parameters.options);
     console.log('Found '+posts.fetch().length+ ' posts:');
     posts.rewind();
    // console.log(_.pluck(posts.fetch(), 'title'));
    return posts;
  }
  return [];
});

// Publish a list of type 2 posts

Meteor.publish('postsList2', function(terms) {
  if(canViewById(this.userId)){
    var parameters = getPostsParameters(terms);
    parameters.find.postType = '2';  
    parameters.find = _.omit(parameters.find, 'postedAt')
    var posts = Posts.find(parameters.find, parameters.options);

     //console.log('//-------- postsList2 Subscription Parameters:');
     //console.log(parameters.find);
     //console.log(parameters.options);
     //console.log('Found '+posts.fetch().length+ ' posts:');
    // posts.rewind();
    // console.log(_.pluck(posts.fetch(), 'title'));
    return posts;
  }
  return [];
});

// Publish the featured posts

Meteor.publish('postsFeatured', function(terms) {

  if(canViewById(this.userId)){
     var parameters = getPostsParameters(terms)
     parameters.find.sticky = true
     parameters.find.postType = '2'
     parameters.options.limit = 1
     parameters.find = _.omit(parameters.find, '$or')
     parameters.find = _.omit(parameters.find, 'commlist')
     parameters.find = _.omit(parameters.find, 'endorsements.userId')

     var posts = Posts.find(parameters.find, parameters.options);

     //console.log('//-------- postsFeatured Subscription Parameters:');
     //console.log(parameters.find);
     //console.log(parameters.options);
     //console.log('Found '+posts.fetch().length+ ' posts:');
    // posts.rewind();
    // console.log(_.pluck(posts.fetch(), 'title'));
    return posts;
  }
  return [];
});
// Publish all the users that have posted the currently displayed list of posts

Meteor.publish('postsListUsers', function(terms) {
  if(canViewById(this.userId)){
    var parameters = getPostsParameters(terms);
    parameters.find.postType = '1';  
    var posts = Posts.find(parameters.find, parameters.options);
    var userIds = _.pluck(posts.fetch(), 'userId');
    return Meteor.users.find({_id: {$in: userIds}}, {fields: privacyOptions, multi: true});
  }
  return [];
});

// Publish all the users that have posted the currently displayed list of posts

Meteor.publish('postsListUsers2', function(terms) {
  if(canViewById(this.userId)){
    var parameters = getPostsParameters(terms);
    parameters.find.postType = '2';  
    var posts = Posts.find(parameters.find, parameters.options);
    var userIds = _.pluck(posts.fetch(), 'userId');
    return Meteor.users.find({_id: {$in: userIds}}, {fields: privacyOptions, multi: true});
  }
  return [];
});

// Publish a list oflanding page posts

Meteor.publish('regagePosts', function() {
    console.log('regagePosts publish')
    var posts = Posts.find({useCode: 'landing'});
    return posts;

});