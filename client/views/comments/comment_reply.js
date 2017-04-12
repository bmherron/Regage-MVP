Template[getTemplate('comment_reply')].helpers({
  post_item: function () {
    return getTemplate('post_item');
  },
  comment_item: function () {
    return getTemplate('comment_item');
  },
  comment_form: function () {
    return getTemplate('comment_form');
  },
    post_page_item: function () {
    return getTemplate('post_page_item');
  },
    relposttype: function () {
    return Session.get('showrelposttype') ;
  },
  isProjectList: function () {
    return Session.get('showrelposttype') == '2' ;
  },
  
    project_list: function () {
    return getTemplate('project_list');
  },
  post: function () {
    if(this.comment){ // XXX
      var post = Posts.findOne(this.comment.postId);
      return post;
    }
  }
});