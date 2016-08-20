Planeaciones 						= new Mongo.Collection("planeaciones");
Planeaciones.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});