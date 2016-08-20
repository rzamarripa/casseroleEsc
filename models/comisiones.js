Comisiones					= new Mongo.Collection("comisiones");
Comisiones.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});