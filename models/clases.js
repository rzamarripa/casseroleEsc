Clases 						= new Mongo.Collection("clases");
Clases.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});