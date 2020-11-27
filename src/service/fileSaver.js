
/**
 * Open a handle to an existing file on the local file system.
 *
 * @return {!Promise<FileSystemFileHandle>} Handle to the existing file.
 */
export function getFileHandle() {
    // For Chrome 86 and later...
    if ('showOpenFilePicker' in window) {
        return window.showOpenFilePicker().then((handles) => handles[0]);
    }
    // For Chrome 85 and earlier...
    return window.chooseFileSystemEntries();
}

export async function open() {
    const fileHandle = await getFileHandle()
    const file = await fileHandle.getFile()
    const text = await file.text()
    return { fileHandle, file, text }
}


/**
 * Create a handle to a new (text) file on the local file system.
 *
 * @return {!Promise<FileSystemFileHandle>} Handle to the new file.
 */
export function getNewFileHandle() {
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
    if (typeof contents != 'string') {
        contents=JSON.stringify(contents,null,2)
    }
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

export async function write(fileHandler, content) {
    if (!fileHandler) {
        fileHandler = getNewFileHandle()
    }
    return writeFile(fileHandler, content)
}


/**
 * Verify the user has granted permission to read or write to the file, if
 * permission hasn't been granted, request permission.
 *
 * @param {FileSystemFileHandle} fileHandle File handle to check.
 * @param {boolean} withWrite True if write permission should be checked.
 * @return {boolean} True if the user has granted read/write permission.
 */
export async function verifyPermission(fileHandle, withWrite) {
    const opts = {};
    if (withWrite) {
      opts.writable = true;
      // For Chrome 86 and later...
      opts.mode = 'readwrite';
    }
    // Check if we already have permission, if so, return true.
    if (await fileHandle.queryPermission(opts) === 'granted') {
      return true;
    }
    // Request permission to the file, if the user grants permission, return true.
    if (await fileHandle.requestPermission(opts) === 'granted') {
      return true;
    }
    // The user did nt grant permission, return false.
    return false;
  }

export default {
    open: getFileHandle,
    write,
    verifyPermission
}