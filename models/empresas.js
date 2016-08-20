Empresas 						= new Mongo.Collection("empresas");
Empresas.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});