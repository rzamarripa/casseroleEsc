CategoriasForos 						= new Mongo.Collection("categoriasForos");
CategoriasForos.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});