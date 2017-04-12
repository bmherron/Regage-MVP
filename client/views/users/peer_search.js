Template[getTemplate('peer_search')].helpers({
  users: function () {
    //console.log('peer_search')


    var query = Session.get('userSearchQuery')
    query = query ? query : ''
    var find = {};
   if( query !== ''){
    find = {
      $or: [
        {username: {$regex: query, $options: 'i'}},
        {'profile.name': {$regex: query, $options: 'i'}},
        {'profile.bio': {$regex: query, $options: 'i'}}
      ]
    }
   }
    
   var comm = Session.get('peerSearchComm') ? Session.get('peerSearchComm') : '';
   var user;
   var commFind = {};
   if (comm && comm !== '')
     user = Meteor.user();
   if (comm=='mycommunity'){
     city = user.profile.city
     state = user.profile.state
     find = {
      $and: [
        {'profile.city': city},
        {'profile.state': state},
        find
      ]
     }; 
   }
   if (comm=='mystate'){
     state = user.profile.state
     find = {
      $and: [
        {'profile.state': state},
        find
      ]
     };
   }   
   if (comm=='myarea'){  
    var userCommKey = 'group/countiesregion/US/'+user.profile.state+'/'+ user.profile.county; 
    var group = commGroups.findOne({commKey: userCommKey});
    var commList = []
    if (group){
      commList = group.commList
      find = {$and: [{$or: [ ]},find]};
      _.each(commList, function(item){
          //console.log(item);
          items = item.split('/');
        find.$and[0].$or.push({$and:    [ {'profile.state': items[2], 'profile.county': items[3]}   ]  })
      });
      
      //console.log(JSON.stringify(find))
    }  
   }       
    
    
   //console.log(find)
   return  Meteor.users.find(find, {limit: 20})
    
  }, 
  community: function () {
    type = Session.get('commLevel');
    if (type==='mycommunity') return 'My Community';
    if (type==='myarea') return 'My Area';
    if (type==='mystate') return 'My State';
    if (type==='mypeers') return 'My Peers';
    return 'My Community';
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
  
isFollowed: function() {
  var userId = this._id

  var followee = Follows.findOne({followeeId: Meteor.userId(), userId: userId});
  if (followee) {
    return true;
  } else {
    return false;
  }
  },
thisisnotme: function() {
     return Meteor.user() && Meteor.user()._id != this._id ;
},    
followTitle: function() {
  var userId = this._id
  var followee = Follows.findOne({followeeId: Meteor.userId(), userId: userId});
  if (followee) {
    return 'Click to un-follow';
  } else {
    return 'Click to follow';
  }
},  
  
  searchQuery: function () {
    return Session.get("userSearchQuery");
  },
  searchQueryEmpty: function () {
    return !!Session.get("userSearchQuery") ? '' : 'empty';
  },

  
  
  selectedComm: function (level) {
    type = Session.get('userSearchQuery');
    if (type==='mycommunity') return (level == 1) ? 'selected' : '';
    if (type==='myarea') return (level == 2) ? 'selected' : '';
    if (type==='mystate') return (level == 3) ? 'selected' : '';
    if (type==='global') return (level == 5) ? 'selected' : '';
    return (level == 5) ? 'selected' : '';
  }, 
});


Template[getTemplate('peer_search')].events({

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
   'keyup, search .search-fieldpl': function(e){
      e.preventDefault();
     //console.log('keyup')
      var val = $(e.target).val(),
          $search = $('.searchpl'); 
     //console.log(val)
      if(val==''){
        // if search field is empty, just do nothing and show an empty template 
        $search.addClass('empty');
        Session.set('userSearchQuery', '');
        //Router.go('/search', null, {replaceState: true});
      }else{
        // if search field is not empty, add a delay to avoid firing new searches for every keystroke 
        delay(function(){
          Session.set('userSearchQuery', val);
          $search.removeClass('empty');

 

        }, 700 );
      }
     //console.log(Session.get('userSearchQuery'))
    },
 
  
  'change #comm': function (e, i) {
    //console.log('input comm')
    //console.log($('#comm').val())
    Session.set('peerSearchComm', $('#comm').val());
    //console.log(Session.get('peerSearchComm'))
  },


});

Template[getTemplate('peer_search')].rendered = function(){

    if ($('.profile_clearfix').length > 19 ){
      $('#overflowMessage').html('Additional users may exist.  Narrow search.')
    }

  
  
};

// see: http://stackoverflow.com/questions/1909441/jquery-keyup-delay
var delay = (function(){
  var timer = 0;
  return function(callback, ms){
    clearTimeout (timer);
    timer = setTimeout(callback, ms);
  };
})();