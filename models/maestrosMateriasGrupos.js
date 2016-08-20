MaestrosMateriasGrupos 						= new Mongo.Collection("maestrosMateriasGrupos");
MaestrosMateriasGrupos.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});