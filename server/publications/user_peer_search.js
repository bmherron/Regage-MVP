Meteor.publish('userPeerSearch', function(comm, query, limit) {
    var find = {};
   query = query ? query : '';
   if( query !== ''){
    find = {
      $or: [
        {username: {$regex: query, $options: 'i'}},
        {'profile.name': {$regex: query, $options: 'i'}},
        {'profile.bio': {$regex: query, $options: 'i'}}
      ]
    }
   }
   //console.log('userPeerSearch ' + comm)
   
   var user;
   var commFind = {};
   if (comm && comm !== '')
     user = Meteor.users.findOne({_id: this.userId});
   if (comm=='mycommunity'){
     city = user.profile.city
     state = user.profile.state
     find = {
      $and: [
        {'profile.city': city},
        {'profile.state': state},
        find
      ]
     } 
   }
   if (comm=='mystate'){
     state = user.profile.state
     find = {
      $and: [
        {'profile.state': state},
        find
      ]
     }
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
  
    return [
       Meteor.users.find(find, {limit: limit}),
 
       Follows.find({followeeId: this.userId})
    ];

  
  
});