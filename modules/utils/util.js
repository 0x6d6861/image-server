const del = require('del');
const multer = require('multer');
const Loki = require('lokijs');

const UPLOAD_PATH = __dirname + '/../../images/uploads/';
const DB_NAME = 'db.json';
const COLLECTION_NAME = 'images';
const db = new Loki(`${UPLOAD_PATH}/${DB_NAME}`, { persistenceMethod: 'fs' });


const loadCollection = function (colName, db){
	// console.log(db);
    return new Promise(resolve => {
        db.loadDatabase({}, () => {
            const _collection = db.getCollection(colName) || db.addCollection(colName);
            resolve(_collection);
        })
    });
}

const imageFilter = function (req, file, cb, res) {
    // accept image only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {    	
    	return cb(null, false);
        // return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_PATH)
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname)
  }
});

const cleanFolder = function (folderPath) {
    // delete files inside folder but not the folder itself
    del.sync([`${folderPath}/**`, `!${folderPath}`]);
};


const Util = {
	'loadCollection': loadCollection,
	'imageFilter': imageFilter,
	'storage': storage,
	'db': db,
	'cleanFolder': cleanFolder,
	'options': {
		'UPLOAD_PATH': UPLOAD_PATH,
		'DB_NAME': DB_NAME,
		'COLLECTION_NAME': COLLECTION_NAME
	}
}

module.exports = Util;