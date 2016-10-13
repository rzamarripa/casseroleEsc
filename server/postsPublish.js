Meteor.publish("posts",function (options, params) {
	console.log("options", options);
	console.log("params", params);
	Counts.publish(this, 'numberOfPosts', Posts.find(params), {noReady: true});
	return Posts.find(params, options);
});
