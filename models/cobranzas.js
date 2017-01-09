Cobranza 						= new Mongo.Collection("cobranza");
Cobranza.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});

