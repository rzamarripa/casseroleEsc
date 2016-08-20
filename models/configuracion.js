Configuracion 						= new Mongo.Collection("configuracion");
Configuracion.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});