MediosPublicidad = new Mongo.Collection("mediosPublicidad");

MediosPublicidad.allow({
  insert: function (userId, doc) { return !Roles.userIsInRole(userId, 'alumno'); },
  update: function (userId, doc) { return !Roles.userIsInRole(userId, 'alumno'); },
  remove: function (userId, doc) { return !Roles.userIsInRole(userId, 'alumno'); }
});