Campus					= new Mongo.Collection("campus");
Campus.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});