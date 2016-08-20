Nacionalidades 						= new Mongo.Collection("nacionalidades");
Nacionalidades.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});