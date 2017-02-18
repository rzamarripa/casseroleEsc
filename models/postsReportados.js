PostsReportados = new Mongo.Collection("postsReportados");

PostsReportados.allow({
  insert: function () { return true },
  update: function () { return true },
  remove: function () { return true }
});