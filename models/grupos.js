Grupos 						= new Mongo.Collection("grupos");
Grupos.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});
