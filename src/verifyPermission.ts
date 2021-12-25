export default async function verifyPermission(fileHandle: FileSystemHandle) {
  // Check if permission was already granted. If so, return true.
  if ((await fileHandle.queryPermission({ mode: "readwrite" })) === "granted") {
    return true;
  }
  // Request permission. If the user grants permission, return true.
  if (
    (await fileHandle.requestPermission({ mode: "readwrite" })) === "granted"
  ) {
    return true;
  }
  // The user didn't grant permission, so return false.
  return false;
}
