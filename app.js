import Fastify from 'fastify';
import multipart from '@fastify/multipart';
import fs from 'fs';
import util from 'util';
import { pipeline } from 'stream';

const pump = util.promisify(pipeline)
export const app = Fastify({
    logger: true
})

app.register(multipart)

const validateFile = (part) => {
    // Array of allowed files
    const array_of_allowed_files = ['png', 'jpeg', 'jpg', 'gif'];
    const array_of_allowed_file_types = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];

    // Get the extension of the uploaded file
    const file_extension = part.filename.slice(
        ((part.filename.lastIndexOf('.') - 1) >>> 0) + 2
    );

    // Check if the uploaded file is allowed
    if (!array_of_allowed_files.includes(file_extension) || !array_of_allowed_file_types.includes(part.mimetype)) {
        throw Error('Invalid file');
    }
}
// For files less than 5 MB
app.post('/smallupload', async function (req, reply) {
    // file size validation
    const parts = req.parts({ limits: { fileSize: 5 * 1000 * 1000 } })
    
    for await (const part of parts) {
        validateFile(part) // type validation 
    
        // uploads and saves the file
        await pump(part.file, fs.createWriteStream(`./upload/${part.filename}`))
      }
        return { message: 'files uploaded' }
})
//  For files less than 100MB 
app.post('/bigupload', async function (req, reply) {
    //file size validation
    const parts = req.parts({ limits: { fileSize: 100 * 1000 * 1000 } })
    for await (const part of parts) {
        validateFile(part) // type validation 

        // uploads and saves the file
        await pump(part.file, fs.createWriteStream(`./upload/${part.filename}`))
    }
    return { message: 'files uploaded' }
})