Generaciones 						= new Mongo.Collection("generaciones");
Generaciones.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});