Pizarrones 						= new Mongo.Collection("pizarrones");
Pizarrones.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});