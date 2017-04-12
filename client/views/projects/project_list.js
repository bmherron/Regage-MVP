Template[getTemplate('project_list')].created = function(){
  postObject = this.data;

};


Template[getTemplate('project_list')].helpers({
    post_item: function () {
    return getTemplate('post_item');
  },
  
    hasProject: function(){
    return this.related2Count > 0
  },
  
    relatedcount: function(){
    return this.related2Count ? this.related2Count : 0;
  },
  
  child_projects: function(){
    var post = this;
    var posts = Posts.find({postType: '2', parentPostId: post._id}, {sort: {score: -1, postedAt: -1}});
    return posts;
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

  isIssue: function () {
    return Session.get('feed') == 1;
  },
    postMeta: function () {
    return postMeta;
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
      return getProfileUrl(user);
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
  postLink: function(){
    //return !!this.url ? getOutgoingUrl(this.url) : "/posts/"+this._id;
    return "/posts/"+this._id;
  },
  tagLine: function(){
    //return !!this.url ? getOutgoingUrl(this.url) : "/posts/"+this._id;
   // console.log('tagLine');
   // console.log(this);
    return this.tagLine;
  },
   fundingGoalFormatted: function(){
    return this.fundingGoal ? "$" + this.fundingGoal.toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")  : '0';
  },
  fundingTotalFormatted: function(){
    return this.fundingTotal ? "$" + this.fundingTotal.toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") : '$0';
  },
    authorName: function(){
    return getAuthorName(this);
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
  authorName: function(){
    return getAuthorName(this);
  },

});


Template[getTemplate('project_list')].rendered = function(){
  setTimeout(createCarousel, 500); 
      
   //console.log('rendered');
   var $bars = $('.barometer') ;
   //console.log($bars);
	 $bars.each( function() {
        //console.log('initsub')
        //console.log($(this))
				initBarometer( $(this) );
			});					

  
}

var createCarousel = function () {
  
    $('.owl-carousel').owlCarousel({
    loop:false,
    margin:10,
    nav:true,
    responsive:{
        0:{
            items:1
        },
        600:{
            items:2
        },
        1000:{
            items:3
        }
    }
})
}