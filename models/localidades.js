Localidades 						= new Mongo.Collection("localidades");
Localidades.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});