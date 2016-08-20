Meteor.publish("deptosAcademicos", function(params){
	return DeptosAcademicos.find(params);
});