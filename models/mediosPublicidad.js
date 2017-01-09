MediosPublicidad = new Mongo.Collection("mediosPublicidad");

MediosPublicidad.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});