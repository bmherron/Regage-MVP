Template[getTemplate('posts_list')].helpers({
   avatarLink: function(){
     if(Meteor.user())
      return !!Meteor.user().profile.fileName ? "" + Meteor.user().profile.fileName : "/img/avatar.png";
  },
  profileUrl: function(){
    // note: we don't want the post to be re-rendered every time user properties change
    var user = Meteor.user();
    if(user)
         return 'users/' + slugify(getUserName(user));
  },
  
    firstTime: function(){
    
      return Session.get('firstFlag') == 'yes';
      
  },
  
  
  
  
  upvoted: function(){
    return Meteor.user() && _.include(this.upvoters, Meteor.user()._id);
  },
  downvoted: function(){
    return Meteor.user() && _.include(this.downvoters, Meteor.user()._id);
  },
  
  toggleTop: function(){
   (url.indexOf('/top') !== -1);
  },
  secondaryNav: function () {
    return secondaryNav;
  },
    getTemplate: function () {
    return getTemplate(this);
  },
  post_item: function () {
    return getTemplate('post_item');
  },
  post_featured: function () {
    return getTemplate('post_featured');
  },
  posts : function () {
    if(this.postsList){ // XXX
      this.postsList.rewind();    
      var posts = this.postsList.map(function (post, index, cursor) {
        post.rank = index;
        return post;
      });

      return posts;
    }
  },
  
    postsFeatured : function () {
      return this.postsFeatured;
  },
  
  
  notFirst: function () {

    return this.rank > 0;
  },
  postsLoadMore: function () {
    return getTemplate('postsLoadMore');
  },
  postsListIncoming: function () {
    return getTemplate('postsListIncoming');
  },
  isProject: function () {
    return Session.get('feed') == 2;
  },
  
  checkedIssue: function(){
    return Session.get('feed') == '1' ? 'checked' : '' ;
  },
  checkedProject: function(){
    return Session.get('feed') == '2' ? 'checked' : '' ;
  },
  
    projectTitle: function () {
   return getTemplate('postsListIncoming');
  },  
  feedButtonStyle: function (type) {
    if (type==1) return  Session.get('feed') == 1 ? 'border-color: #d1d9e2; color: white; height:50px; background-color: #e74c3c !important;' : '';
    if (type==2) return  Session.get('feed') == 2 ? 'border-color: #d1d9e2; color: white; height:50px; background-color: #e74c3c !important;' : '';
    return '';
  },  
    commButtonStyle: function (type) {
    if (type==1) return  Session.get('commLevel') == 'mycommunity' ? 'border-color: #7d6e63; background-color: #e64d3d !important;' : '';
    if (type==2) return  Session.get('commLevel') == 'myarea' ? 'border-color: #7d6e63; background-color: #e64d3d !important;' : '';
    if (type==3) return  Session.get('commLevel') == 'mystate' ? 'border-color: #7d6e63; background-color: #e64d3d !important;' : '';
    if (type==4) return  Session.get('commLevel') == 'mypeers' ? 'border-color: #7d6e63; background-color: #e64d3d !important;' : '';
    return '';
  }, 
    viewButtonStyle: function (type) {
    if (type==1) return  Session.get('view') == 'top' ? 'background-color: #f4f6f8; color: #1f2429; border: none;' : '';
    if (type==2) return  Session.get('view') == 'new' ? 'background-color: #f4f6f8; color: #1f2429; border: none;' : '';
    return '';
  },
  community: function () {
    type = Session.get('commLevel');
    if (type==='mycommunity') return 'My Community';
    if (type==='myarea') return 'My Area';
    if (type==='mystate') return 'My State';
    if (type==='mypeers') return 'My Peers';
    return 'My Community';
  }, 
  posts_list_search: function () {
    return getTemplate('posts_list_search');
  }
});

Template[getTemplate('posts_list')].created = function() {
   resetListPopulatedAt();
  
};


Template[getTemplate('posts_list')].rendered = function(){
  console.log('rendered '+Session.get('view'))
  if ( Session.get('view') == 'top'){
     $('#top1').css("background-color","#e74c3c"); 
     $('#new1').css("background-color","white");       
  }else{
     $('#new1').css("background-color","#e74c3c"); 
     $('#top1').css("background-color","white");       
  }
  
  if(Session.get('firstFlag') == 'yes' && this.data.postsCount >5){
  
bootbox.alert( '<img src="/img/re-beta.svg" id="bootbox_regage" style="height:150px; margin-left:auto; margin-right:auto; display:block"> <span style="float:right; text-align:center; font-size:18px"> Welcome to Regage! Click below to Continue.</span> <br/><br/>')
      
      
      
    }

   if(Session.get('firstFlag') == 'yes' && this.data.postsCount <= 5){
  
bootbox.alert( '<img src="/img/re-beta.svg" id="bootbox_regage" style="height:150px; margin-left:auto; margin-right:auto; display:block"> <span style="float:right; text-align:center; font-size:18px"> Welcome to Regage! We currently are working to reach your area, take a look around and let us know if you have any questions!</span> <br/><br/>')
      
      
      
    }






};


Template[getTemplate('posts_list')].events({
  
  
  
   'click #top1': function (e) {
     e.preventDefault();
     Router.go("/top")
     $('#top1').css("background-color","#e74c3c"); 
     $('#new1').css("background-color","white"); 
    }, 
  
    'click #new1': function (e) {  
      e.preventDefault();
     Router.go("/new")
    $('#new1').css("background-color","#e74c3c");  
     $('#top1').css("background-color","white");
     },  
   

  'click .dropdown-top-level': function (e) {
    e.preventDefault();
    $(e.currentTarget).next().slideToggle('fast');
  },
  'click #comm1': function (e, i) {
    e.preventDefault();
    Session.set('commLevel', 'mycommunity');
    $('#comm-menu').hide();
  },
  'click #comm2': function (e, i) {
    e.preventDefault();
    Session.set('commLevel', 'myarea');
    $('#comm-menu').hide();
  },
  'click #comm3': function (e, i) {
    e.preventDefault();
    Session.set('commLevel', 'mystate');
    $('#comm-menu').hide();
  },
  'click #comm4': function (e, i) {
    e.preventDefault();
    Session.set('commLevel', 'mypeers');
    $('#comm-menu').hide();
  },
  'click #engagelink': function (e, i) {
    e.preventDefault();
    Session.set('feed',"1");
    
    //Router.go("/");
    //$('#submit').html('add this');
  },
  
    'change input[name=feed]': function (e, i) {
    e.preventDefault();
    Session.set('feed',e.currentTarget.value);
    
    //Router.go("/");
    //$('#submit').html('add this');
  },
  
  
  'click #crowdfundlink': function (e, i) {
    e.preventDefault();
    Session.set('feed', "2");
    //Router.go("/");
    //$('#submit').html('add this');
  },
  
    'click .engagelink1': function (e, i) {
      trackEvent("toggleengage");
      
      console.log(3333)
    e.preventDefault();
    Session.set('feed',"1");
    
    //Router.go("/");
    //$('#submit').html('add this');
  },
  
  'click .crowdfundlink1': function (e, i) {
    trackEvent("crowdfund");
    console.log(4444)
    e.preventDefault();
    Session.set('feed', "2");
    //Router.go("/");
    //$('#submit').html('add this');
  },
  
  'click #mycommmunity': function (e, i) {
    e.preventDefault();
    Session.set('commLevel', "mycommunity");
  },
  'click #myarea': function (e, i) {
    e.preventDefault();
    Session.set('commLevel', "myarea");
  },
  'click #mystate': function (e, i) {
    e.preventDefault();
    Session.set('commLevel', "mystate");
  },
   'click #mypeers': function (e, i) {
    e.preventDefault();
    Session.set('commLevel', "mypeers");
  },
 'click #titleInput': function (e, i) {
    $(".share-tool-bar").removeClass("hidden");
  },

  'change #uploadBtn': function (e, i) {
    $("#uploadFile").removeClass("hidden");
    $("#uploadFile").val($(e.target).val())  ;
  },
  
  
  'click #savePost': function(e, instance){
    e.preventDefault();
    $(e.target).addClass('disabled');

    // ------------------------------ Checks ------------------------------ //

    if(!Meteor.user()){
      throwError(i18n.t('You must be logged in.'));
      return false;
    }

    // ------------------------------ Properties ------------------------------ //

    // Basic Properties

    var properties = {
      title: $('#titleInput').val(),
      body: $('#descInput').val(),

      commList: ['city/US/'+Meteor.user().profile.state+'/'+Meteor.user().profile.city,'county/US/'+Meteor.user().profile.state+'/'+Meteor.user().profile.county, 'state/US/'+Meteor.user().profile.state],

      nonProfit: $('#nonProfit').is(':checked'),
      nonProfitApproved: $('#nonProfitApproved').is(':checked'),
      sticky: false,
      userId: Meteor.user()._id,
      status: 2
    };

    var postType = '1';
    properties.postType = postType;
    properties.parentPostId = this.parentPostId;

    properties.fundingFlag = false;
    //console.log (properties);
    
    // PostedAt

    var $postedAtDate = $('#postedAtDate');
    var $postedAtTime = $('#postedAtTime');
    var setPostedAt = false;
    var postedAt = new Date(); // default to current browser date and time
    var postedAtDate = $postedAtDate.datepicker('getDate');
    var postedAtTime = $postedAtTime.val();

    if ($postedAtDate.exists() && postedAtDate != "Invalid Date"){ // if custom date is set, use it
      postedAt = postedAtDate;
      setPostedAt = true;
    }

    if ($postedAtTime.exists() && postedAtTime.split(':').length==2){ // if custom time is set, use it
      var hours = postedAtTime.split(':')[0];
      var minutes = postedAtTime.split(':')[1];
      postedAt = moment(postedAt).hour(hours).minute(minutes).toDate();
      setPostedAt = true;
    }

    if(setPostedAt) // if either custom date or time has been set, pass result to properties
      properties.postedAt = postedAt;


    

    // ------------------------------ Callbacks ------------------------------ //

    // run all post submit client callbacks on properties object successively
    properties = postSubmitClientCallbacks.reduce(function(result, currentFunction) {
        return currentFunction(result);
    }, properties);

    
    // -------------------------------- Photo -------------------------------- //
    var fileInput = document.getElementById('uploadBtn');
    var files = fileInput.files; // FileList object
    var fileObj
    //console.log('filecount ' + files.length);
    if (files.length > 0){
        file = files[0];
        fileObj =  Images.insert(file, function (err, fileObj) {
          //Inserted new doc with ID fileObj._id, and kicked off the data upload using HTTP
          });
	      //var fileName = 'images-' + fileObj._id + '-' + fileObj.name();
	      var fileName = fileObj.getFileRecord().url();
	      properties.fileName = fileName
    }else{
	      properties.fileName = '';
    }
    // console.log(properties)

    
    // ------------------------------ Insert ------------------------------ //
    //insertRecord(properties, e, fileObj)
    setTimeout(insertRecord, 3000,  properties, e, fileObj);

  },
  
  
});




var insertRecord = function (properties, e, fileObj) {
 
   if (properties.fileName == null){
	   var fileName = fileObj.getFileRecord().url();
	   properties.fileName = fileName;
   }

	 
   if (properties.fileName === null){
      setTimeout(insertRecord, 2000,  properties, e, fileObj);

   }else{
	   if (properties) {
	      Meteor.call('post', properties, function(error, post) {
            if(error){
              throwError(error.reason);
              clearSeenErrors();
              $(e.target).removeClass('disabled');
              if(error.error == 603)
                Router.go('/posts/'+error.details);
            }else{
              trackEvent("new post", {'postId': post._id});
              if(post.status === STATUS_PENDING)
                throwError('Thanks, your post is awaiting approval.');
              console.log('postid ' + post._id)
              console.log('properties.parentPostId ' + properties.parentPostId)
              if (properties.parentPostId){
                console.log('properties.parentPostId ' + properties.parentPostId)
                Posts.update(properties.parentPostId, {$inc: {related2Count: 1}})
                //Router.go('/posts/'+properties.parentPostId+'/posttype/2');
              }else{
                console.log('postid ' + post._id)
                //Router.go('/posts/'+post._id);        
              }
            }
            $("#uploadFile").addClass("hidden");
            $("#uploadFile").val('') ;
            $("#uploadBtn").val('') ;
            $('#titleInput').val(''),
            $('#descInput').val(''),
            $(".share-tool-bar").addClass("hidden");
            $(e.target).removeClass('disabled');  
           setTimeout(resetListStart, 1000);
            console.log('end of Insert')


         

	      });
   
	    }

      
   }


};

var resetListStart = function(){
      resetListPopulatedAt();
}
