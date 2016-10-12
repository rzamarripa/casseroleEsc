Foros 						= new Mongo.Collection("foros");
Foros.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});