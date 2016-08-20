Rvoe = new Mongo.Collection("rvoe");

Rvoe.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});