Meteor.publish("bitacora",function (options, params) {
  	
	Counts.publish(this, 'numberOfBitacora', Bitacora.find(params), {noReady: true});
	return Bitacora.find(params, options);
});
