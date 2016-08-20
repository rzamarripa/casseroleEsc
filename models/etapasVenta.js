EtapasVenta 						= new Mongo.Collection("etapasVenta");
EtapasVenta.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});