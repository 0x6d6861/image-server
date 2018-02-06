const express = require('express');
const multer = require('multer');
const router = express.Router();

const fs = require('fs');
const path = require('path');

// setup
const Util = require('./utils/util');
const DB_NAME = Util.options.DB_NAME;
const COLLECTION_NAME = Util.options.COLLECTION_NAME;
const loadCollection = Util.loadCollection;
const db = Util.db;
const UPLOAD_PATH = Util.options.UPLOAD_PATH;


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
        res.json(col.data);
    } catch (err) {
        res.status(400)
        	.json({
        		'message': 'Nothing returned',
        		'error': err.message
        	});
    }
})

router.get('/images/:id', async (req, res) => {
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