Template[getTemplate('postsListIncoming')].events({
  'click .show-new': function(e, instance) {
      resetListPopulatedAt();
  }
});