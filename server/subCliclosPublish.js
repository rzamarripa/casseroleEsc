Meteor.publish("subCiclos", function(params){
	return SubCiclos.find(params);
}); 

