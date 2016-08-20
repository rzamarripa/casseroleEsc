Meteor.publish("gastos",function(options){
 	return Gastos.find(options);
});