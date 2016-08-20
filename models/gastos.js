Gastos 						= new Mongo.Collection("gastos");
Gastos.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});