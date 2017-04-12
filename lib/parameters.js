// getPostsParameters gives an object containing the appropriate find and options arguments for the subscriptions's Posts.find()

getPostsParameters = function (terms) {

   console.log(terms)

  // note: using jquery's extend() with "deep" parameter set to true instead of shallow _.extend()
  // see: http://api.jquery.com/jQuery.extend/
 var postedAt
 if(Meteor.isClient){
   postedAt =  Session.get('listPopulatedAt')
 }else{
   postedAt = new Date();
 }
  var baseParameters = {
    find: {
      status: STATUS_APPROVED,
      postedAt: {$lte: postedAt}
    },
    options: {
      limit: 10
    }
  };
  var commList = terms.commList;
  var followedUserIdList = terms.followedUserIdList;
  var commLevel = terms.commLevel;
  var query = terms.query;
  //var commList = []
  //if (terms.commKey !== "" && Meteor.isServer){

  //  if (terms.commKey.substring(0,5)=='group'){
  ///    var group = commGroups.findOne({commKey: terms.commKey});
      //console.log(group)
   //   if (group){
   //     commList = group.commList
   //   }else
   //     commList = []
   //   }
   // }else{
   // commList.push(terms.commKey)
   // }   
  //console.log(commList);  
  //}
  if (commLevel === 'mypeers'){
    //console.log(followedUserIdList);
    baseParameters = {
    find: {
      status: STATUS_APPROVED,
      postedAt: {$lte: postedAt},
      'endorsements.userId': {$in: followedUserIdList}
    },
    options: {
      limit: 10
    }
    };
  }else{
    if (commList.length > 0){
      //console.log(commList);
      baseParameters.find.commList = {$in: commList};
    }
  }

  var parameters = baseParameters;
  var view = !!terms.view ? dashToCamel(terms.view) : 'top'; // if view is not defined, default to "top"

  // get query parameters according to current view
  if(typeof viewParameters[view] !== 'undefined')
    parameters = deepExtend(true, baseParameters, viewParameters[view](terms));
  
  
  // want to use search query to filter all other lists
  if(view !== 'search' && query !== ''){
    //console.log('found query options ' + query)
    parameters = deepExtend(true, baseParameters, {
    find: {
      $or: [
        {title: {$regex: query, $options: 'i'}},
        {url: {$regex: query, $options: 'i'}},
        {body: {$regex: query, $options: 'i'}},
        {bodyWho: {$regex: query, $options: 'i'}},
        {bodyWhere: {$regex: query, $options: 'i'}},
        {bodyWhat: {$regex: query, $options: 'i'}}
      ]
    }
  }); 
  //console.log(parameters);  
  }

  // sort by _id to break ties
  deepExtend(true, parameters, {options: {sort: {_id: -1}}});

  if(typeof terms.limit != 'undefined' && !!terms.limit)
    _.extend(parameters.options, {limit: parseInt(terms.limit)});

  //console.log('parameters')
  //console.log(parameters)

  return parameters;
};

getUsersParameters = function(filterBy, sortBy, limit) {
  var find = {},
      sort = {createdAt: -1};

  switch(filterBy){
    case 'invited':
      // consider admins as invited
      find = {$or: [{isInvited: true}, adminMongoQuery]};
      break;
    case 'uninvited':
      find = {$and: [{isInvited: false}, notAdminMongoQuery]};
      break;
    case 'admin':
      find = adminMongoQuery;
      break;
  }

  switch(sortBy){
    case 'username':
      sort = {username: 1};
      break;
    case 'karma':
      sort = {karma: -1};
      break;
    case 'postCount':
      sort = {postCount: -1};
      break;
    case 'commentCount':
      sort = {commentCount: -1};
    case 'invitedCount':
      sort = {invitedCount: -1};
  }
  return {
    find: find, 
    options: {sort: sort, limit: limit}
  };
};
