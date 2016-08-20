Materias = new Mongo.Collection("materias");

Materias.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});
