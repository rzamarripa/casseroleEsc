TipoPublicidad 						= new Mongo.Collection("tipoPublicidad");
TipoPublicidad.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});