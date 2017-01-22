ComentariosAlumnos 						= new Mongo.Collection("comentariosAlumnos");
ComentariosAlumnos.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});