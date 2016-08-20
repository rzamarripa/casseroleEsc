Archivos 						= new Mongo.Collection("archivos");
Archivos.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});

