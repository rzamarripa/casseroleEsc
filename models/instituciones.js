Instituciones = new Mongo.Collection("instituciones");

Instituciones.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});