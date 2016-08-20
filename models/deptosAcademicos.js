DeptosAcademicos 						= new Mongo.Collection("deptosAcademicos");
DeptosAcademicos.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});
