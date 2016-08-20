Aulas 						= new Mongo.Collection("aulas");
Aulas.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});