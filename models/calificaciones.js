Calificaciones					= new Mongo.Collection("calificaciones");
Calificaciones.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});