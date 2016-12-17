Meteor.publish("planPagos", function(options){
	return PlanPagos.find(options);
});