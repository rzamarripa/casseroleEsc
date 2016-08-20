Civiles						= new Mongo.Collection("civiles");
Civiles.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});