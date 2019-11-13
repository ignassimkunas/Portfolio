const express = require("express");
const app = express();
const fileUpload = require('express-fileupload');
const mongoose = require("mongoose");
const bodyParser = require("body-parser")
const {Firestore} = require('@google-cloud/firestore');
const {Storage} = require('@google-cloud/storage');
const bucketName = "gabijagusevaiteportfolio.appspot.com";
const storage = new Storage({
  projectId: 'gabijagusevaiteportfolio',
  keyFilename: './key.json',
});
const firestore = new Firestore({
  projectId: 'gabijagusevaiteportfolio',
  keyFilename: './key.json',
});
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.use(fileUpload());
app.set("view engine", "ejs");
app.set('trust proxy', true);

async function listFiles(){
	const [files] = await storage.bucket(bucketName).getFiles();
	console.log('Files:');
	files.forEach(file => {
	  console.log(file.name);
	});
}

app.get("/", function(req, res){
	listFiles()
	res.render("portfolio");
	
});

async function uploadFile(path) {
	var bucket = storage.bucket(bucketName)
	await bucket.upload(path, {
   		gzip: true,
    	metadata: {
    	cacheControl: 'public, max-age=31536000',
    	},
  	});

  console.log(`${path} uploaded to ${bucketName}.`);
}
app.post("/post_image", function(req, res){
	let file = req.files.pic;
	let path = './to_upload/'+req.body.name + '.jpg';
	file.mv(path, function(err){
		if (err) return res.status(500).send(err);
		console.log("File moved to directory");
	});
	uploadFile(path);
	res.redirect("/");
});
app.get("/admin", function(req, res){
	res.render("admin");
})
app.get("/aboutme", function(req, res){
	res.render("aboutme");
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, function(){
	console.log("Serving on port 3000");
});