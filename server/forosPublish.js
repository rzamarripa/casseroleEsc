Meteor.publish("foros", function(options){
	return Foros.find(options);
});