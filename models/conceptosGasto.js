ConceptosGasto 						= new Mongo.Collection("conceptosGasto");
ConceptosGasto.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});