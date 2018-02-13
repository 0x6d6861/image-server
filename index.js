var cluster = require('cluster');

if (cluster.isMaster) {

    var cpuCount = require('os').cpus().length;
    for (var i = 0; i < cpuCount; i += 1) {
        cluster.fork();
	}

	cluster.on('exit', function (worker) {

		console.log('Worker %d died :(', worker.id);
		cluster.fork();
	
	});
	
} else {

const express = require('express');
const cors = require('cors');
const app = express();
const api = express.Router();


app.use(cors());
app.use(express.static('images/uploads'));

const uploader = require('./modules/uploader');



api.use('/api', uploader);

app.use(api);

app.get('/', (req, res) => {
	res.status(200)
	 .json({
	 	"message": "Hello world"
	 });
});

app.get('/upload', (req, res) => {
	res.sendFile(__dirname + "/views/upload.html");
})

app.get('/test', function(req, res){
  res.send('id: ' + req.query.id);
});


app.use("*",function(req,res){
  res.status(404)
   .json({
   	"status": 404,
   	"message": "Resource not found"
   });
});

app.listen(process.env.PORT || 3000, () => console.log('Worker %d running!', cluster.worker.id));

}