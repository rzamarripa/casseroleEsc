Cuentas 						= new Mongo.Collection("cuentas");
Cuentas.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});