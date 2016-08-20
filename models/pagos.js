Pagos 						= new Mongo.Collection("pagos");
Pagos.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});