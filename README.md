# Image Server
Image upload backend service with crop, compressing and performing other image operations with caching support

**Setup**
```sh
git clone https://github.com/heriagape/image-server.git
cd image-server
npm install
npm start
```

**Endpoints**
```sh
GET /api/images/:id/resize/100/100/?crop=1&grey=1/image.png
GET /api/images/:id/resize/100/100/1/?grey=1/image.png
GET /api/images # Get link of all images on the server
GET /images/:id/image.png # Get singe image with no operation
GET /upload # Image upload html route
```
```
POST /upload
POST /upload/multiple
```
