PlanPagos 						= new Mongo.Collection("planPagos");
PlanPagos.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});