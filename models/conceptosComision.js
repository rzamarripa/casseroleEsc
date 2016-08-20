ConceptosComision 						= new Mongo.Collection("conceptosComision");
ConceptosComision.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});