const express = require('express');
const multer = require('multer');
const router = express.Router();

var mcache = require('memory-cache');

const fs = require('fs');
const path = require('path');

const sharp = require('sharp');

// setup
const Util = require('./utils/util');
const DB_NAME = Util.options.DB_NAME;
const COLLECTION_NAME = Util.options.COLLECTION_NAME;
const loadCollection = Util.loadCollection;
const db = Util.db;
const UPLOAD_PATH = Util.options.UPLOAD_PATH;
const cache = Util.cache;


const uploading = multer({
	storage: Util.storage, 
	fileFilter: Util.imageFilter
});



router.post('/upload', uploading.single('pic'), async (req, res) => {
	
	try {		  
        	const col = await loadCollection(COLLECTION_NAME, db);
        	// console.log( typeof req );
        	const data = col.insert(req.file);
        	db.saveDatabase();

        	res.json({ id: data.$loki, fileName: data.filename, originalName: data.originalname });
    	
    	} catch (err) {
    		// console.log(err);
        	res.status(500)
	      		.json({
	      		"message": "Uplaod faild",
	      		"error": err.message
	      	});
    }

})

router.post('/upload/multiple', uploading.array('images', 12), async (req, res) => {
    try {
        const col = await loadCollection(COLLECTION_NAME, db)
        let data = [].concat(col.insert(req.files));

        db.saveDatabase();
        res.send(data.map(x => ({ id: x.$loki, fileName: x.filename, originalName: x.originalname })));
    } catch (err) {
		// console.log(err);
    	res.status(500)
      		.json({
      		"message": "Uplaod faild",
      		"error": err.message
      	});
    }
});


router.get('/images', async (req, res) => {
    try {
        const col = await loadCollection(COLLECTION_NAME, db);
        const result = col.data.map(data => {
        	data.link = `${req.protocol}://${req.headers.host}${req.originalUrl}/${data.$loki}`
        	return data;
        });
        res.json(result);
    } catch (err) {
        res.status(400)
        	.json({
        		'message': 'Nothing returned',
        		'error': err.message
        	});
    }
})


router.get('/images/:id/resize/:width/:height/:crop*?', cache(100), async (req, res) => {
    try {
        const col = await loadCollection(COLLECTION_NAME, db);
        const result = col.get(req.params.id);

        // const width = +req.query.width;
        // const height = +req.query.height;
        // const crop = +req.query.crop;

        const width = +req.params.width;
        const height = +req.params.height;
        const crop = +req.params.crop;

        if (!result) {
            res.status(404)
            	.json({
            		'message': 'No image found'
            	});
            return;
        };
        
        
        // res.setHeader('Content-Type', result.mimetype);
        res.setHeader('Content-Type', 'image/webp');
        
        var image = sharp(path.join(UPLOAD_PATH, result.filename))
        .resize(width,height, {
                 kernel: sharp.kernel.nearest
            })
        .embed();

            if(crop){
                image.crop(sharp.strategy.entropy);
            }

        
        image.toFormat(sharp.format.webp)
        .toBuffer().then( data => {
            res.end(data, 'binary');
        }).catch( err => {
            console.log(err);
        });
  

    } catch (err) {
    	res.setHeader('Content-Type', 'application/json');
        res.status(400)
        	.json({
        		'message': 'Bad request',
        		'error': err.message
        	});
    }
})


router.get('/images/:id', cache(100), async (req, res) => {
    try {
        const col = await loadCollection(COLLECTION_NAME, db);
        const result = col.get(req.params.id);

        if (!result) {
            res.status(404)
            	.json({
            		'message': 'No image found'
            	});
            return;
        };
        // console.log(result);
        res.setHeader('Content-Type', result.mimetype);
        fs.createReadStream(path.join(UPLOAD_PATH, result.filename)).pipe(res);
  

    } catch (err) {
    	res.setHeader('Content-Type', 'application/json');
        res.status(400)
        	.json({
        		'message': 'Bad request',
        		'error': err.message
        	});
    }
})


router.get('/deleteAll', (req, res) => {
	Util.cleanFolder(UPLOAD_PATH);
})


module.exports = router