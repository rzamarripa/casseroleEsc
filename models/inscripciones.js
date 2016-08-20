Inscripciones 						= new Mongo.Collection("inscripciones");
Inscripciones.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});