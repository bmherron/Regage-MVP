Follows = new Meteor.Collection("follows");


Follows.allow({
  insert: function(){ return true; },
  remove: function(){ return true; }
});


if (Meteor.isClient) {
  Meteor.subscribe("follows")
  
} else {
Meteor.publish('follows', function () {
  return Follows.find({});
});
  }