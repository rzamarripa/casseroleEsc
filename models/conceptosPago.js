ConceptosPago 						= new Mongo.Collection("conceptosPago");
ConceptosPago.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});