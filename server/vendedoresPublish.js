Meteor.publish("vendedoresGerentes", function(options){
	return Meteor.users.find(options)
});