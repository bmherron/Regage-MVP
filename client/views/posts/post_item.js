var filteredModules = function (group) {
  // return the modules whose positions start with group
  return _.filter(postModules, function(module){return module.position.indexOf(group) == 0});
};

var post = {};

Template[getTemplate('post_item')].created = function () {
  post = this.data;
};
Template[getTemplate('post_item')].helpers({
  avatarLink: function(){
    var user = Meteor.users.findOne(this.userId, {reactive: false});
    if(user)
      return !!user.profile.fileName ? "" + user.profile.fileName : "/img/avatar.png";
  },
  profileUrl: function(){
    // note: we don't want the post to be re-rendered every time user properties change
    var user = Meteor.users.findOne(this.userId, {reactive: false});
    if(user)
         return 'users/' + slugify(getUserName(user));
  },
  
   upvoted: function(){
    return Meteor.user() && _.include(this.upvoters, Meteor.user()._id);
  },
  downvoted: function(){
    return Meteor.user() && _.include(this.downvoters, Meteor.user()._id);
  },
  
  isIssue: function () {
    return Session.get('feed') == 1;
  },
    postMeta: function () {
    return postMeta;
  },
  
    commInfo: function() {
  if (!this.commList){
    return ""
  }
  if (!this.commList[0]){
    return ""
  }
  var commKey = this.commList[0];
  var keys = commKey.split("/");
  if (keys[0] == "city") {
    return ' '+keys[3]+", "+keys[2];
  } else {
    return "";  
    
  } 
    
  },
   realScore: function () {    
   var score = this.baseScore;
     return score
  },
  
  
  pointsUnitDisplayText: function(){
    return this.upvotes == 1 ? i18n.t('point') : i18n.t('points');
  },
  can_edit: function(){
    return canEdit(Meteor.user(), this);
  },
  authorName: function(){
    return getAuthorName(this);
  },
  ago: function(){
    // if post is approved show submission time, else show creation time. 
    time = this.status == STATUS_APPROVED ? this.postedAt : this.createdAt;
    return moment(time).fromNow();
  },
  profileUrl: function(){
    // note: we don't want the post to be re-rendered every time user properties change
    var user = Meteor.users.findOne(this.userId, {reactive: false});
    if(user)
      return 'users/' + slugify(getUserName(user));
    
  },
  leftPostModules: function () {
    return filteredModules('left');
  },
  centerPostModules: function () {
    return filteredModules('center');
  },
  rightPostModules: function () {
    return filteredModules('right');
  },
  getTemplate: function () {
    return getTemplate(this.template);
  },
  moduleContext: function () { // not used for now
    var module = this;
    module.templateClass = camelToDash(this.template) + ' ' + this.position + ' cell';
    module.post = post;
    return module;
  },
  moduleClass: function () {
    return camelToDash(this.template) + ' ' + this.position + ' cell';
  },
  classSuffix: function() {
    return  this.postType == '1' ? '' : this.postType;
  },
  photoLink: function(){
    var placeholder = this.postType == 2 ? "/img/project.jpg" : "/img/placeholder.jpeg" 
    return !!this.fileName ? "" + this.fileName : placeholder;
  },
   hasPhotoLink: function(){
    var placeholder = this.postType == 2 ? "/img/project.jpg" : "/img/placeholder.jpeg" 
    return !!this.fileName ? true : false;
  },
  postLink: function(){
    //return !!this.url ? getOutgoingUrl(this.url) : "/posts/"+this._id;
    return "/posts/"+this._id+"/posttype/2";
  },
  tagLine: function(){
    //return !!this.url ? getOutgoingUrl(this.url) : "/posts/"+this._id;
   // console.log('tagLine');
   // console.log(this);
  if (this.bodyWhat)
    return this.bodyWhat.substring(0,140)
  if (this.body)
    return this.body.substring(0,140)
  },
  
  expandMore: function(){
    //return !!this.url ? getOutgoingUrl(this.url) : "/posts/"+this._id;
   // console.log('tagLine');
   // console.log(this);
  if (this.bodyWhat)
    return this.bodyWhat.length > 140 ? true : false
  else 
    return this.body.length > 140 ? true : false
  },
  
  
   fundingGoalFormatted: function(){
    return this.fundingGoal ? "$" + this.fundingGoal.toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")  : '0';
  },
  fundingTotalFormatted: function(){
    return this.fundingTotal ? "$" + this.fundingTotal.toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") : '$0';
  },
    post_body: function () {
    return getTemplate('post_body');
  },
    upvoted: function(){
    return Meteor.user() && _.include(this.upvoters, Meteor.user()._id);
  },
    downvoted: function(){
    return Meteor.user() && _.include(this.downvoters, Meteor.user()._id);
  },
  
    createdAtFormatted: function(){
    return this.createdAt ? moment(this.createdAt).fromNow() : '–';
  },
  displayName: function(){
    return getDisplayName(this);
  },
    
  fundingProgress: function () {
    var pct
    if(this.fundingTotal) {
      pct= this.fundingTotal/this.fundingGoal;
      pct= Math.round(Math.min(pct, 1)*100) + '%';    
    } else {
      
     pct= "0%"
    }
      
    return pct;
  },
  
  
   fundingTotalAmount: function () {
   var pct
    if(this.fundingTotal) {
      pct= this.fundingTotal/this.fundingGoal;
      pct= Math.round(pct*100) + '%';   
    } else {
      
     pct= "0%"
    }
      
    return pct;
  },
  
   fundingTotalPercent: function () {
   var pct
    if(this.fundingTotal) {
      pct= this.fundingTotal/this.fundingGoal;
      pct= Math.round(pct*100) ;   
    } else {
      
     pct= "0"
    }
      
    return pct;
  },
  fundingDaysLeft: function(){
    var postDate = this.postedAt;
    var today = new Date();
    
    var millisecondsinday = 86400000;	
    var age = Math.floor((today-postDate)/millisecondsinday)
    var duration = this.fundingDuration;	
    if(!!!duration || duration === 0 ){
      return 0; 
    }
    if (age>duration){
      return 0;
    }else{
      return duration - age;
    }
  
  } ,

  isNonProfit: function(){
    return this.nonProfitApproved;
  }, 


});

Template[getTemplate('post_item')].events({
  'click #expandMore' : function(e, instance){
     e.preventDefault();
    console.log($(e.target))
    console.log($(e.target).html())
    if( $(e.target).html() == '[+]') {
      $(e.target).html("[-]");
        if (this.bodyWhat)
        $(e.target).parents('#textstuff').find('#expandExtra').html(this.bodyWhat.substring(140, 3000)); 
        else 
        $(e.target).parents('#textstuff').find('#expandExtra').html(this.body.substring(140, 3000)); 
    } else {
        $(e.target).html("[+]");
        $(e.target).parents('#textstuff').find('#expandExtra').html(''); 
                        
    }                     
  },
  
  
    'click .grid_feed-block' : function(e, instance){

     $(e.target).find('#expandMore').click();             
  },
    
    
  'click .downvote': function(e, instance){
    console.log("downvote")
    
    var post = this;
    e.preventDefault();
    if(!Meteor.user()){
      Router.go(getSigninUrl());
      throwError(i18n.t("Please log in first"));
    }
    Meteor.call('downvotePost', post, function(error, result){
      trackEvent("post downvoted", {'_id': post._id});
    });
  },
    'click .upvote': function(e, instance){
      console.log("upvote")
    var post = this;
    e.preventDefault();
    if(!Meteor.user()){
      Router.go(getSigninUrl());
      throwError(i18n.t("Please log in first"));
    }
    Meteor.call('upvotePost', post, function(error, result){
      trackEvent("post upvoted", {'_id': post._id});
    });
  }
});




Template[getTemplate('post_item')].rendered = function(){

   //console.log('rendered');
   var $bars = $('.barometer') ;
   //console.log($bars);
	 $bars.each( function() {
        //console.log('initsub')
        //console.log($(this))
				initBarometer( $(this) );
			});					

  
  
};