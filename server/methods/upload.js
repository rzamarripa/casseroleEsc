import hash from 'object-hash';
Meteor.methods({
  saveFile: function (file) {


  		//var hash = md5(filename);
  		
  	
  		var huella =hash.MD5(file);
		var registro = Archivos.findOne({hash:huella});
		if(registro)
			return registro.filename;

    	var filename="./files/"+(new Meteor.Collection.ObjectID())._str
	    if (!fs.existsSync("./files/")){
	    	fs.mkdirSync("./files/");
		}
	    fs.writeFileSync(filename, file, 'binary')
	    Archivos.insert({hash:huella,filename:filename})
	   	return filename;


  },
  loadFile:function (fileName){
  		var  x = fs.readFileSync(fileName, "binary");
  		return x;
  } 
});

