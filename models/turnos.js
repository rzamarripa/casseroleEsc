Turnos 						= new Mongo.Collection("turnos");
Turnos.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});