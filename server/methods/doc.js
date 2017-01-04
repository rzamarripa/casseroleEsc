Meteor.methods({
  pruebaDoc: function (usuario, rol) {


		var fs = require('fs');
		var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		
		var content = fs
		    .readFileSync(__dirname+"/input.docx","binary");
		
		var zip = new JSZip(content);
		var doc = new Docxtemplater().loadZip(zip);
		
		doc.setData({
		    "name":"John",
		    "lastName":"Doe"
		});
		
		doc.render();
		
		var buf = doc.getZip()
		             .generate({type:"nodebuffer"});
		
		fs.writeFileSync(__dirname+"/output.docx",buf);
		
	}
});