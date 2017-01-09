Meteor.publish("planPagos", function(options){
	return PlanPagos.find(options, {sort : {fechaPago : 1}});
});