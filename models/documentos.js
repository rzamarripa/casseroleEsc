Documentos 						= new Mongo.Collection("documentos");
Documentos.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});