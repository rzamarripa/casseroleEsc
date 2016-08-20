Maestros 						= new Mongo.Collection("maestros");
Maestros.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});
