Curriculas 						= new Mongo.Collection("curriculas");
Curriculas.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});