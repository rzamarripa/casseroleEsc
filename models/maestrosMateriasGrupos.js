MaestrosMateriasGrupos 						= new Mongo.Collection("maestrosMateriasGrupos");
MaestrosMateriasGrupos.allow({
  insert: function (userId, doc) { return !Roles.userIsInRole(userId, 'alumno'); },
  update: function (userId, doc) { return !Roles.userIsInRole(userId, 'alumno'); },
  remove: function (userId, doc) { return !Roles.userIsInRole(userId, 'alumno'); }
});