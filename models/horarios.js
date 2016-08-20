Horarios 						= new Mongo.Collection("horarios");
Horarios.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});