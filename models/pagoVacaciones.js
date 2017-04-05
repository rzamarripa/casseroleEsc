PagoVacaciones 						= new Mongo.Collection("pagoVacaciones");
PagoVacaciones.allow({
  insert: function (userId, doc) { return true; },
  update: function (userId, doc) { return true; },
  remove: function (userId, doc) { return !Roles.userIsInRole(userId, 'alumno'); }
});