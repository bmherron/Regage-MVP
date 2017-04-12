/*

//--------------------------------------------------------------------------------------------------//
//---------------------------------------- Table Of Contents ---------------------------------------//
//--------------------------------------------------------------------------------------------------//

---------------------------------------------------------------
#                             Config                          #
---------------------------------------------------------------

//

---------------------------------------------------------------
#                            Filters                          #
---------------------------------------------------------------

isLoggedIn
isLoggedOut
isAdmin

canView
canPost
canEditPost
canEditComment

hasCompletedProfile

---------------------------------------------------------------
#                          Controllers                        #
---------------------------------------------------------------

PostsListController
PostPageController

---------------------------------------------------------------
#                             Routes                          #
---------------------------------------------------------------

1) Paginated Lists
----------------------
Top
New
Best
Pending
Categories

2) Digest
--------------------
Digest

3) Posts
--------------------
Post Page
Post Page (scroll to comment)
Post Edit
Post Submit

4) Comments
--------------------
Comment Page
Comment Edit
Comment Submit

5) Users
--------------------
User Profie
User Edit
Account
All Users
Unsubscribe (from notifications)

6) Misc Routes
--------------------
Settings
Categories
Toolbox

7) Server-side
--------------------
API
RSS

*/

// uncomment to disable FastRender
//var FastRender = {RouteController: RouteController, onAllRoutes: function() {}};

//--------------------------------------------------------------------------------------------------//
//--------------------------------------------- Config ---------------------------------------------//
//--------------------------------------------------------------------------------------------------//

preloadSubscriptions.push('settings');
preloadSubscriptions.push('currentUser');
preloadSubscriptions.push('currentUserCommGroup');

Router.configure({
  layoutTemplate: getTemplate('layout'),
  loadingTemplate: getTemplate('loading'),
  notFoundTemplate: getTemplate('notFound'),
  waitOn: function () {
    return _.map(preloadSubscriptions, function(sub){
      // can either pass strings or objects with subName and subArguments properties
      if (typeof sub === 'object'){
        Meteor.subscribe(sub.subName, sub.subArguments);
      }else{
        Meteor.subscribe(sub);
      }
    });
  }
});
// adding common subscriptions that's need to be loaded on all the routes
// notification does not included here since it is not much critical and
// it might have considerable amount of docs
if(Meteor.isServer) {
  FastRender.onAllRoutes(function() {
    var router = this;
    _.each(preloadSubscriptions, function(sub){
      router.subscribe(sub);
    });
  });
}
//--------------------------------------------------------------------------------------------------//
//--------------------------------------------- Filters --------------------------------------------//
//--------------------------------------------------------------------------------------------------//

Router._filters = {

  isReady: function() {
    if (!this.ready()) {
      // console.log('not ready')
      this.render(getTemplate('loading'));
    }else{
      this.next();
      // console.log('ready')
    }
  },

  clearSeenMessages: function () {
    clearSeenMessages();
    this.next();
  },
  
  clearSeenErrors: function () {
    clearSeenErrors();
    this.next();
  },

  resetScroll: function () {
    var scrollTo = window.currentScroll || 0;
    var $body = $('body');
    $body.scrollTop(scrollTo);
    $body.css("min-height", 0);
  },

  /*
  isLoggedIn: function() {
    if (!(Meteor.loggingIn() || Meteor.user())) {
      throwError(i18n.t('please_sign_in_first'));
      var current = getCurrentRoute();
      if (current){
        Session.set('fromWhere', current);
      }
      this.render('entrySignIn');
    } else {
      this.next();
    }
  },
  */
  //isLoggedIn: AccountsTemplates.ensureSignedIn,

  isLoggedOut: function() {
    if(Meteor.user()){
      this.render('already_logged_in');
    } else {
      this.next();
    }
  },

  isAdmin: function() {
    if(!this.ready()){
      this.next();
      return;
    } 
    if(!isAdmin()){
      this.render(getTemplate('no_rights'));
    } else {
      this.next();
    }
  },

  canView: function() {
    if(!this.ready() || Meteor.loggingIn()){
      this.render(getTemplate('loading'));
    } else if (!can.view()) {
      this.render(getTemplate('no_rights'));
    } else {
      this.next();
    }
  },

  canPost: function () {
    if(!this.ready() || Meteor.loggingIn()){
      this.render(getTemplate('loading'));
    } else if(!can.post()) {
      flashMessage(i18n.t("sorry_you_dont_have_permissions_to_add_new_items"), "error");
      this.render(getTemplate('no_rights'));
    } else {
      this.next();
    }
  },

  canEditPost: function() {
    if(!this.ready()) return;
    // Already subscribed to this post by route({waitOn: ...})
    var post = Posts.findOne(this.params._id);
    if(!can.currentUserEdit(post)){
      flashMessage(i18n.t("sorry_you_cannot_edit_this_post"), "error");
      this.render(getTemplate('no_rights'));
    } else {
      this.next();
    }
  },

  canEditComment: function() {
    if(!this.ready()) return;
    // Already subscribed to this comment by CommentPageController
    var comment = Comments.findOne(this.params._id);
    if(!can.currentUserEdit(comment)){
      flashMessage(i18n.t("sorry_you_cannot_edit_this_comment"), "error");
      this.render(getTemplate('no_rights'));
    } else {
      this.next();
    }
  },

  hasCompletedProfile: function() {
    if(!this.ready()) return;
    var user = Meteor.user();
    if (user && ! userProfileComplete(user)){
      this.render(getTemplate('user_email'));
    } else {
      this.next();
    }
  },

  setTitle: function() {
    // if getTitle is set, use it. Otherwise default to site title.
    var title = (typeof this.getTitle === 'function') ? this.getTitle() : getSetting("title", "Telescope");
    document.title = title;
  }

};


var filters = Router._filters;
var coreSubscriptions = new SubsManager({
  // cache recent 50 subscriptions
  cacheLimit: 50,
  // expire any subscription after 30 minutes
  expireIn: 30
});

if(Meteor.isClient){
   Session.set('feed',1)
   Session.set('commLevel','mycommunity')

  // Load Hooks

  Router.onBeforeAction( function () {
    Session.set('categorySlug', null);

    // if we're not on the search page itself, clear search query and field
    console.log('name of route = ' + Router.current().route.getName())
    if(Router.current().route.getName().indexOf('search') == -1){
      Session.set('searchQuery', '');
      $('.search-field').val('').blur();
    }
    this.next();
  });

  // Before Hooks

  // Router.onBeforeAction(filters.isReady);
  Router.onBeforeAction(filters.clearSeenErrors);
  Router.onBeforeAction(filters.canView, {except: ['atSignIn', 'atSignUp', 'atForgotPwd', 'atResetPwd', 'signOut']});
  Router.onBeforeAction(filters.hasCompletedProfile);
  //Router.onBeforeAction(filters.isLoggedIn, {only: ['post_submit','post_project','post_fund','post_fund_collect','posts_top','posts_best','posts_new','posts_pending','posts_digest','posts_page']});
  Router.plugin('ensureSignedIn', {only: ['post_submit','post_project','post_fund','post_fund_collect','posts_top','posts_best','posts_new','posts_pending','posts_digest','posts_page']});
  Router.onBeforeAction(filters.isLoggedOut, {only: []});
  Router.onBeforeAction(filters.canPost, {only: ['posts_pending', 'post_submit','post_project','post_fund','post_fund_collect']});
  Router.onBeforeAction(filters.canEditPost, {only: ['post_edit']});
  Router.onBeforeAction(filters.canEditComment, {only: ['comment_edit']});
  Router.onBeforeAction(filters.isAdmin, {only: ['posts_pending', 'all-users', 'settings', 'toolbox', 'logs']});

  // After Hooks

  // Router.onAfterAction(filters.resetScroll, {except:['posts_top', 'posts_new', 'posts_best', 'posts_pending', 'posts_category', 'all-users']});
  Router.onAfterAction(analyticsInit); // will only run once thanks to _.once()
  Router.onAfterAction(analyticsRequest); // log this request with mixpanel, etc
  Router.onAfterAction(filters.setTitle);


  // Unload Hooks

  //

}

//--------------------------------------------------------------------------------------------------//
//------------------------------------------- Controllers ------------------------------------------//
//--------------------------------------------------------------------------------------------------//


// Controller for all posts lists

PostsListController = RouteController.extend({
  template: getTemplate('posts_list'),
  waitOn: function () {
    console.log('PostsListController waitOn ' )
    // take the first segment of the path to get the view, unless it's '/' in which case the view default to 'top'
    // note: most of the time this.params.slug will be empty
    this._terms = {
      view: this.view,
      limit: this.params.limit || getSetting('postsPerPage', 10),
      category: this.params.slug
    };

    if(Meteor.isClient) {
      this._terms.query = Session.get("searchQuery");
    }
    //need to use community list in find parameters if a regional community is selected.
    //For a selection of peers, need to include postId list in find paramters.
   
    this._terms.commList = [];
    this._terms.followedUserIdList = [];
    this._terms.commLevel = '';
    commLevel = Session.get('commLevel');
    if (commLevel){
       this._terms.commLevel = commLevel;
       if (commLevel == 'mypeers'){
         this._terms.followedUserIdList = getFollowedUserIdList(Meteor.user());
       }else{
         this._terms.commList =  getUserCommList(Meteor.user());   
       }
    }

    //if (Meteor.user())
    //    if (Meteor.user().profile.defaultCommKey)
    //      this._terms.commKey = Meteor.user().profile.defaultCommKey;
    //console.log('AAAAA')
    //console.log(getUserCommList());
    this.postsListSub = coreSubscriptions.subscribe('postsList', this._terms);
    this.postsListSub2 = coreSubscriptions.subscribe('postsList2', this._terms);
    if (commLevel == 'mypeers'){
      this._terms.commLevel = 'myarea';
      this._terms.commList =  getUserCommList(Meteor.user());   
    }
    this.postsFeaturedSub = coreSubscriptions.subscribe('postsFeatured', this._terms);
    return [
      this.postsListSub,
      this.postsListSub2,
      this.postsFeaturedSub,
      coreSubscriptions.subscribe('postsListUsers', this._terms),
      coreSubscriptions.subscribe('postsListUsers2', this._terms)
    ];
  },
  data: function () {
    console.log('PostsListController data function')
    if (this.view == 'new')
         resetListPopulatedAt();
    this._terms = {
      view: this.view,
      limit: this.params.limit || getSetting('postsPerPage', 10),
      category: this.params.slug
    };

    if(Meteor.isClient) {
      this._terms.query = Session.get("searchQuery");
    }

    this._terms.commList = [];
    this._terms.followedUserIdList = [];
    this._terms.commLevel = '';
    commLevel = Session.get('commLevel');
    if (commLevel){
       this._terms.commLevel = commLevel;
       if (commLevel == 'mypeers'){
         this._terms.followedUserIdList = getFollowedUserIdList(Meteor.user());
       }else{
         this._terms.commList =  getUserCommList(Meteor.user());   
       }
    }
    
    
    var parameters = getPostsParameters(this._terms)
    parameters.find.postType = Session.get('feed').toString();
    parameters.find.sticky = false
    var postsCount = Posts.find(parameters.find, parameters.options).count();


    parameters.find.createdAt = { $lte: Session.get('listPopulatedAt') };
    var posts = Posts.find(parameters.find, parameters.options);
    
    // Incoming posts
    parameters.find.createdAt = { $gt: Session.get('listPopulatedAt') };
    var postsIncoming = Posts.find(parameters.find, parameters.options);

   
    
    Session.set('postsLimit', this._terms.limit);
         
    if (commLevel == 'mypeers'){
      this._terms.commLevel = 'myarea';
      this._terms.commList =  getUserCommList(Meteor.user());   
    }
    var parameters = getPostsParameters(this._terms)
    parameters.find.postType = '2'
    parameters.find.createdAt = { $lte: Session.get('listPopulatedAt') };
    parameters.find.sticky = true
    parameters.find = _.omit(parameters.find, '$or')
    parameters.find = _.omit(parameters.find, 'commlist')
    parameters.find = _.omit(parameters.find, 'endorsements.userId');
    var postsFeatured = Posts.find(parameters.find, parameters.options);  
    

    return {
      postsFeatured: postsFeatured,
      incoming: postsIncoming,
      postsList: posts,
      postsCount: postsCount,
      ready: this.postsListSub.ready
    };
  },
  onAfterAction: function() {
    Session.set('view', this.view);
    Session.set('firstFlag', this.firstFlag ? this.firstFlag : "no");
  },
  fastRender: true
});

PostsBestController = PostsListController.extend({
  view: 'best'
});

PostsNewController = PostsListController.extend({
  view: 'new'
});

PostsTopFirstController = PostsListController.extend({
  view: 'top',
  firstFlag: 'yes'
});

PostsTopController = PostsListController.extend({
  view: 'top'
});

PostsPendingController = PostsListController.extend({
  view: 'pending'
});

// Controller for post digest

PostsDigestController = RouteController.extend({
  template: getTemplate('posts_digest'),
  waitOn: function() {
    // if day is set, use that. If not default to today
    var currentDate = this.params.day ? new Date(this.params.year, this.params.month-1, this.params.day) : new Date(),
        terms = {
          view: 'digest',
          after: moment(currentDate).startOf('day').toDate(),
          before: moment(currentDate).endOf('day').toDate()
        };
    return [
      coreSubscriptions.subscribe('postsList', terms),
      coreSubscriptions.subscribe('postsListUsers', terms)
    ];
  },
  data: function() {
    var currentDate = this.params.day ? new Date(this.params.year, this.params.month-1, this.params.day) : Session.get('today'),
        terms = {
          view: 'digest',
          after: moment(currentDate).startOf('day').toDate(),
          before: moment(currentDate).endOf('day').toDate()
        },
        parameters = getPostsParameters(terms);
    Session.set('currentDate', currentDate);

    parameters.find.createdAt = { $lte: Session.get('listPopulatedAt') };
    parameters.find.postType = Session.get('feed').toString();
    var posts = Posts.find(parameters.find, parameters.options);

    // Incoming posts
    parameters.find.createdAt = { $gt: Session.get('listPopulatedAt') };
    var postsIncoming = Posts.find(parameters.find, parameters.options);

    return {
      incoming: postsIncoming,
      posts: posts
    };
  },
  fastRender: true
});

// Controller for post pages

PostPageController = RouteController.extend({
  waitOn: function() {
    this.postSubscription = coreSubscriptions.subscribe('singlePost', this.params._id);
    this.postUsersSubscription = coreSubscriptions.subscribe('postUsers', this.params._id);
    this.commentSubscription = coreSubscriptions.subscribe('postComments', this.params._id);
    this.projectSubscription = coreSubscriptions.subscribe('postProjects', this.params._id);
  },

  post: function() {
    return Posts.findOne(this.params._id);
  },

  onBeforeAction: function() {
    if (! this.post()) {
      if (this.postSubscription.ready()) {
        this.render(getTemplate('not_found'));
      }else{
        this.next();
      }

      this.render(getTemplate('loading'));
    }else{
        this.next();
    }
  },

  data: function() {
    // Incoming posts
    //parameters.find.createdAt = { $gt: Session.get('listPopulatedAt') };
    //var postsIncoming = Posts.find(parameters.find, parameters.options);
    Session.set('showrelposttype', !!this.params._posttype ? this.params._posttype : '1');
    postHolder = this.post();
    //postHolder.displayMode = 'single';
    //console.log('AAAAAAAAA'+postHolder.displayMode)
    return postHolder;
  
  },
  fastRender: true
});

// Controller for post pages

FundCollectController = RouteController.extend({
  waitOn: function() {
    this.postSubscription = coreSubscriptions.subscribe('singlePost', this.params._id ? this.params._id : this.params.state);
    this.postUsersSubscription = coreSubscriptions.subscribe('postUsers', this.params._id ? this.params._id : this.params.state);
  },

  post: function() {
    return Posts.findOne(this.params._id ? this.params._id : this.params.state);
  },

  onBeforeAction: function() {
    if (! this.post()) {
      if (this.postSubscription.ready()) {
        this.render(getTemplate('not_found'));
        this.next();
        return ;
      }

      this.render(getTemplate('loading'));
    }
    this.next();
  },

  data: function() {
    // Incoming posts
    //parameters.find.createdAt = { $gt: Session.get('listPopulatedAt') };
    //var postsIncoming = Posts.find(parameters.find, parameters.options);
    postHolder = this.post();
    //postHolder.displayMode = 'single';

    return {post: postHolder,
            fundPostId: this.params._id ? this.params._id : this.params.state,
            error: this.params.error ? this.params.error : '',
            errordescription: this.params.errordescription ? this.params.errordescription : '',
            code: this.params.code ? this.params.code : '',
            state: this.params.state ? this.params.state : ''};
  
  },
  fastRender: true
});

// Controller for comment pages

CommentPageController = RouteController.extend({
  waitOn: function() {
    return [
      coreSubscriptions.subscribe('singleComment', this.params._id),
      coreSubscriptions.subscribe('commentUser', this.params._id),
      coreSubscriptions.subscribe('commentPost', this.params._id)
    ];
  },
  data: function() {
    return {
      comment: Comments.findOne(this.params._id)
    };
  },
  onAfterAction: function () {
    window.queueComments = false;
  },
  fastRender: true
});

// Controller for user pages

UserPageController = RouteController.extend({
  waitOn: function() {
    return [
      coreSubscriptions.subscribe('userProfile', this.params._idOrSlug)
    ]
  },
  data: function() {
    var findById = Meteor.users.findOne(this.params._idOrSlug);
    var findBySlug = Meteor.users.findOne({slug: this.params._idOrSlug});
    if(typeof findById !== "undefined"){
      // redirect to slug-based URL
      Router.go(getProfileUrl(findById), {replaceState: true});
    }else{
      return {
        user: (typeof findById == "undefined") ? findBySlug : findById,
        ready: true
      };
    }
  },
  fastRender: true
});

// Controller for user account editing

AccountController = RouteController.extend({
  waitOn: function() {
    return coreSubscriptions.subscribe('invites');
  },
  data: function() {
    return {
      user : Meteor.user(),
      invites: Invites.find({invitingUserId:Meteor.userId()})
    };
  },
  fastRender: true
});

var getDefaultViewController = function () {
  var defaultView = getSetting('defaultView', 'top');
  defaultView = defaultView.charAt(0).toUpperCase() + defaultView.slice(1);
  return eval("Posts"+defaultView+"Controller");
};

//--------------------------------------------------------------------------------------------------//
//--------------------------------------------- Routes ---------------------------------------------//
//--------------------------------------------------------------------------------------------------//
Meteor.startup(function () {

    Router.route('/old', {
      name: 'landing/',
        layoutTemplate: getTemplate('landingpage'),
        loadingTemplate: getTemplate('landingpage'),
         onBeforeAction: function() {
         Router.go('/Landing/index.html');
         this.next();
 

      }
    });
  
  
  
      Router.route('/', {
      name: 'landingnew/',
        layoutTemplate: getTemplate('landingpage'),
        loadingTemplate: getTemplate('landingpage'),
         template: getTemplate('landing_new'),
    //    waitOn: function () {
     //    return [
     //     coreSubscriptions.subscribe('regagePosts')
    //     ];
    //    },
    //    data: function() {
    //      console.log('datafunction')
    //     return {
    //      posts: Posts.find({useCode: 'landing'})
    //     };
    //    }     

    });
    // User Logout

    Router.route('/sign-out', {
      name: 'signOut',
      onBeforeAction: function() {
        console.log('signOut onverforeaction')
        Meteor.logout(function() {
          return Router.go('/');
          
        });
        this.next();
 
   
      }
    });  
  Router.map(function() {

    // -------------------------------------------- Post Lists -------------------------------------------- //

   // this.route('posts_default', {
    //  path: '/',
     // controller: getDefaultViewController()
  //  });  
    

    
    
    this.route('welcomemodal',{
      layoutTemplate: getTemplate('welcomemodal'),
      path: '/welcomemodal',
     
    });

    this.route('posts_top', {
      path: '/top/:limit?',
      controller: PostsTopController
    });
    
    // Restricted
    
    this.route('posts_topfirst', {
      path: '/topfirsttime',
      controller: PostsTopFirstController
    });

    // New

    this.route('posts_new', {
      path: '/new/:limit?',
      controller: PostsNewController
    });

    // Best

    this.route('posts_best', {
      path: '/best/:limit?',
      controller: PostsBestController
    });

    // Pending

    this.route('posts_pending', {
      path: '/pending/:limit?',
      controller: PostsPendingController
    });



    // TODO: enable /category/new, /category/best, etc. views


    // Digest

    this.route('posts_digest', {
      path: '/digest/:year/:month/:day',
      controller: PostsDigestController
    });



    // -------------------------------------------- Post -------------------------------------------- //


    // Post Page

    this.route('post_page', {
      template: getTemplate('post_page'),
      path: '/posts/:_id',
      controller: PostPageController
    });

    this.route('post_page2', {
      template: getTemplate('post_page'),
      path: '/posts/:_id/comment/:commentId',
      controller: PostPageController,
      onAfterAction: function () {
        // TODO: scroll to comment position
      }
    });

    this.route('post_page3', {
      template: getTemplate('post_page'),
      path: '/posts/:_id/posttype/:_posttype',
      controller: PostPageController,
      onAfterAction: function () {
        // TODO: scroll to comment position
      }
    });
    
    // Post Edit

    this.route('post_edit', {
      template: getTemplate('post_edit'),
      path: '/posts/:_id/edit',
      waitOn: function () {
        return [
          coreSubscriptions.subscribe('singlePost', this.params._id),
          coreSubscriptions.subscribe('allUsersAdmin')
        ];
      },
      data: function() {
        return {
          postId: this.params._id,
          post: Posts.findOne(this.params._id)
        };
      },
      fastRender: true
    });

    // Post Submit

    this.route('post_submit', {
      template: getTemplate('post_submit'),
      path: '/submit/:postType?/:_id?',
      data: function() {
        return {
          parentPostId: this.params._id,
          postTypeIn: this.params.postType
        };
      },
    });
    
    
    
    
    this.route('contactform', {
      template: getTemplate('contactform'),
      layoutTemplate: getTemplate('contactform'),
      path: '/contactform/'
    });
    
    
      this.route('register_modal', {
      template: getTemplate('register_modal'),
      layoutTemplate: getTemplate('landingpage'),
      path: '/registermodal/:zipcode?/:email?',
      // waitOn: function() {
      //  console.log("xxxxxxx");
      //  Meteor.call('getCity', this.params.zipcode, function(error, zipobj1) {
      //  zipobj = zipobj1;
      //  console.log("xxxxxxx");
      //  console.log(zipobj);   
       // console.log(zipobj.primary_city);
      //  });
      //  return zipobj;
     // },   
       data: function() {
        return {
          zipcode: this.params.zipcode,
          email: this.params.email
          //zipobjGlobal: zipobj
        };
      },  
        
      
      }
    );

    this.route('peer_search', {
      waitOn: function() {
      this._terms = {
        limit: 20
       };  
       if(Meteor.isClient) {
          this._terms.query = Session.get("userSearchQuery");
        }
       var peerSearchComm;
       if(Meteor.isClient) {
         this._terms.peerSearchComm = '';
         peerSearchComm = Session.get('peerSearchComm');
         if (peerSearchComm){
           this._terms.peerSearchComm = peerSearchComm;
         }
       }
        console.log('router')
        console.log(peerSearchComm)
        return [
          coreSubscriptions.subscribe('userPeerSearch', this._terms.peerSearchComm, this._terms.query, this._terms.limit)
        ]
      },      
      template: getTemplate('peer_search'),
      layoutTemplate: getTemplate('landingpage'),
      path: '/peersearch/:comm?/:query?',
      data: function() {
        return {
          comm: this._terms.peerSearchComm,
          query: this._terms.query,
          ready: true
        };
      },  
      fastRender: true        
      
    });

    
        //Welcome Modal
    
    this.route('welcomeModal', {
      template: getTemplate('welcomeModal'),
      path: '/welcomeModal'

    });

        // Post Project

    this.route('post_project', {
      template: getTemplate('post_project'),
      path: '/project'

    });
    
    
        // Post Fund

    this.route('post_fund', {
      template: getTemplate('post_fund'),
      path: '/fund/:_id',
      data: function() {
        return {
          fundPostId: this.params._id
        };
      },
    });
    
    this.route('post_fund_collect', {
      template: getTemplate('post_fund_collect'),
      path: '/fundcollect/:_id?',
      controller: FundCollectController
    });

    
    // -------------------------------------------- Comment -------------------------------------------- //

    // Comment Reply

    this.route('comment_reply', {
      template: getTemplate('comment_reply'),
      path: '/comments/:_id',
      controller: CommentPageController,
      onAfterAction: function() {
        window.queueComments = false;
      }
    });

    // Comment Edit

    this.route('comment_edit', {
      template: getTemplate('comment_edit'),
      path: '/comments/:_id/edit',
      controller: CommentPageController,
      onAfterAction: function() {
        window.queueComments = false;
      }
    });

    // -------------------------------------------- Users -------------------------------------------- //



    // User Profile

    this.route('user_profile', {
      template: getTemplate('user_profile'),
      path: '/users/:_idOrSlug',
      controller: UserPageController
    });

    // User Edit

    this.route('user_edit', {
      template: getTemplate('user_edit'),
      path: '/users/:_idOrSlug/edit',
      controller: UserPageController
    });

    // Account

    this.route('account', {
      template: getTemplate('user_edit'),
      path: '/account',
      controller: AccountController
    });

    // All Users

    this.route('all-users', {
      template: getTemplate('users'),
      path: '/all-users/:limit?',
      waitOn: function() {
        var limit = parseInt(this.params.limit) || 20;
        return coreSubscriptions.subscribe('allUsers', this.params.filterBy, this.params.sortBy, limit);
      },
      data: function() {
        var limit = parseInt(this.params.limit) || 20,
            parameters = getUsersParameters(this.params.filterBy, this.params.sortBy, limit),
            filterBy = (typeof this.params.filterBy === 'string') ? this.params.filterBy : 'all',
            sortBy = (typeof this.params.sortBy === 'string') ? this.params.sortBy : 'createdAt';
        Session.set('usersLimit', limit);
        return {
          users: Meteor.users.find(parameters.find, parameters.options),
          filterBy: filterBy,
          sortBy: sortBy
        };
      },
      fastRender: true
    });

    // Unsubscribe (from notifications)

    this.route('unsubscribe', {
      template: getTemplate('unsubscribe'),
      path: '/unsubscribe/:hash',
      data: function() {
        return {
          hash: this.params.hash
        };
      }
    });

    // -------------------------------------------- Other -------------------------------------------- //



    // Settings

    this.route('settings', {
      template: getTemplate('settings'),
      data: function () {
        // we only have one set of settings for now
        return {
          hasSettings: !!Settings.find().count(),
          settings: Settings.findOne()
        }
      }
    });

   // Loading (for testing purposes)

    this.route('loading', {
      template: getTemplate('loading')
    });

    // Toolbox

    this.route('toolbox',{
      template: getTemplate('toolbox')
    });

    
    this.route('howitworks',{
      template: getTemplate('howitworks')
    });

    this.route('aboutus',{
      template: getTemplate('aboutus')
    });   
    
    this.route('land',{
      layoutTemplate: getTemplate('landingpage'),
     
    });
    // -------------------------------------------- Server-Side -------------------------------------------- //

    // Link Out

    this.route('out', {
      where: 'server',
      path: '/out',
      action: function(){
        var query = this.request.query;
        if(query.url){
          var decodedUrl = decodeURIComponent(query.url);
          var post = Posts.findOne({url: decodedUrl});
          if(post){
            Posts.update(post._id, {$inc: {clicks: 1}});
          }
          this.response.writeHead(302, {'Location': query.url});
          this.response.end();
        }
      }
    });

    // Notification email

    this.route('notification', {
      where: 'server',
      path: '/email/notification/:id?',
      action: function() {
        var notification = Notifications.findOne(this.params.id);
        var notificationContents = buildEmailNotification(notification);
        this.response.write(notificationContents.html);
        this.response.end();
      }
    });

    // New user email

    this.route('newUser', {
      where: 'server',
      path: '/email/new-user/:id?',
      action: function() {
        var user = Meteor.users.findOne(this.params.id);
        var emailProperties = {
          profileUrl: getProfileUrl(user),
          username: getUserName(user)
        };
      console.log(Handlebars);

        console.log(Handlebars.templates);

        html = getEmailTemplate('emailNewUser')(emailProperties);
        this.response.write(buildEmailTemplate(html));
        this.response.end();
      }
    });

    // New post email

    this.route('newPost', {
      where: 'server',
      path: '/email/new-post/:id?',
      action: function() {
        var post = Posts.findOne(this.params.id);
        html = Handlebars.templates[getTemplate('emailNewPost')](getPostProperties(post));
        this.response.write(buildEmailTemplate(html));
        this.response.end();
      }
    });

    // Account approved email

    this.route('accountApproved', {
      where: 'server',
      path: '/email/account-approved/:id?',
      action: function() {
        var user = Meteor.users.findOne(this.params.id);
        var emailProperties = {
          profileUrl: getProfileUrl(user),
          username: getUserName(user),
          siteTitle: getSetting('title'),
          siteUrl: getSiteUrl()
        };
        html = Handlebars.templates[getTemplate('emailAccountApproved')](emailProperties);
        this.response.write(buildEmailTemplate(html));
        this.response.end();
      }
    });
  });
  

});



//https://github.com/meteor/meteor/issues/2536


if (Meteor.isServer) {
  Meteor.startup(function () {
     //process.env.MAIL_URL = 'smtp://grherron040%40gmail.com:gaqwerty@smtp.gmail.com:587';
     process.env.MAIL_URL = 'smtp://gherron%40marketrendsglobal.com:Gary0001@smtp.marketrendsglobal.com:587';
  });
}

if (Meteor.isClient) {
  Session.set('searchQuery', '');
  Blaze._allowJavascriptUrls();
}



