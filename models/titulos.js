Titulos 						= new Meteor.Collection("titulos");
Titulos.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});