Prospectos 						= new Mongo.Collection("prospectos");
Prospectos.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});