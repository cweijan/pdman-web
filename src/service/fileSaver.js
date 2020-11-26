/**
 * Create a handle to a new (text) file on the local file system.
 *
 * @return {!Promise<FileSystemFileHandle>} Handle to the new file.
 */
function getNewFileHandle() {
    // For Chrome 86 and later...
    if ('showSaveFilePicker' in window) {
        const opts = {
            types: [{
                description: 'Project Path',
                accept: { 'application/json': ['.json'] },
            }],
        };
        return window.showSaveFilePicker(opts);
    }
    // For Chrome 85 and earlier...
    const opts = {
        type: 'Save Project',
        accepts: [{
            description: 'Project Path',
            extensions: ['json'],
            mimeTypes: ['application/json'],
        }],
    };
    return window.chooseFileSystemEntries(opts);
}


/**
* Writes the contents to disk.
*
* @param {FileSystemFileHandle} fileHandle File handle to write to.
* @param {string} contents Contents to write.
*/
async function writeFile(fileHandle, contents) {
    // Support for Chrome 82 and earlier.
    if (fileHandle.createWriter) {
        // Create a writer (request permission if necessary).
        const writer = await fileHandle.createWriter();
        // Write the full length of the contents
        await writer.write(0, contents);
        // Close the file and write the contents to disk
        await writer.close();
        return;
    }
    // For Chrome 83 and later.
    // Create a FileSystemWritableFileStream to write to.
    const writable = await fileHandle.createWritable();
    // Write the contents of the file to the stream.
    await writable.write(contents);
    // Close the file and write the contents to disk.
    await writable.close();
}

export default async (fileHandler, content) => {
    if (!fileHandler) {
        fileHandler = getNewFileHandle()
    }
    return writeFile(fileHandler, content)
}