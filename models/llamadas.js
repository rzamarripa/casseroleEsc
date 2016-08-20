Llamadas 						= new Mongo.Collection("llamadas");
Llamadas.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});