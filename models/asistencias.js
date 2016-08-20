Asistencias 						= new Mongo.Collection("asistencias");
Asistencias.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});