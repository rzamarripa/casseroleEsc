Foros 						= new Mongo.Collection("foros");
Foros.allow({
  insert: function (userId, doc) { return true; },
  update: function (userId, doc) { return true; },
  remove: function (userId, doc) { return !Roles.userIsInRole(userId, 'alumno'); }
});