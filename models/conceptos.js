Conceptos 						= new Mongo.Collection("conceptos");
Conceptos.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});