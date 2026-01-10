/**
 * Diagnostic utilities for debugging File System Access API issues
 * TEMPORARY - Used for discovery phase only
 */

/**
 * Recursively log directory contents to console
 * @param {FileSystemDirectoryHandle} dirHandle - Directory to inspect
 * @param {number} depth - How deep to recurse (default: 2)
 * @param {string} indent - Internal: current indentation
 * @param {string} path - Internal: current path
 */
export async function logDirectoryContents(dirHandle, depth = 2, indent = '', path = '') {
  if (depth < 0) return;

  console.log(`[DEBUG] ${indent}📁 ${dirHandle.name}/ (kind: ${dirHandle.kind})`);

  try {
    for await (const entry of dirHandle.values()) {
      const entryPath = path ? `${path}/${entry.name}` : entry.name;

      if (entry.kind === 'file') {
        // Get file size for additional info
        try {
          const file = await entry.getFile();
          console.log(`[DEBUG] ${indent}  📄 ${entry.name} (${file.size} bytes)`);
        } catch (err) {
          console.log(`[DEBUG] ${indent}  📄 ${entry.name} (size unknown)`);
        }
      } else if (entry.kind === 'directory') {
        // Recurse into subdirectories
        if (depth > 0) {
          await logDirectoryContents(entry, depth - 1, indent + '  ', entryPath);
        } else {
          console.log(`[DEBUG] ${indent}  📁 ${entry.name}/ (not expanded)`);
        }
      }
    }
  } catch (error) {
    console.error(`[DEBUG] ${indent}  ❌ Error reading directory:`, error.message);
  }
}

/**
 * Search for KoboReader.sqlite across all directories (including hidden)
 * @param {FileSystemDirectoryHandle} dirHandle - Root directory to search
 * @param {string} path - Internal: current path
 * @returns {Promise<{found: boolean, path: string|null, handle: FileSystemFileHandle|null}>}
 */
export async function findKoboDatabase(dirHandle, path = '') {
  console.log(`[DEBUG] Searching for KoboReader.sqlite in ${dirHandle.name}...`);

  try {
    for await (const entry of dirHandle.values()) {
      const entryPath = path ? `${path}/${entry.name}` : entry.name;

      if (entry.kind === 'file' && entry.name === 'KoboReader.sqlite') {
        console.log(`[DEBUG] ✅ Found KoboReader.sqlite at: ${entryPath}`);
        return {
          found: true,
          path: entryPath,
          handle: entry,
        };
      } else if (entry.kind === 'directory') {
        // Recurse into all directories, including hidden ones (.kobo)
        const result = await findKoboDatabase(entry, entryPath);
        if (result.found) {
          return result;
        }
      }
    }
  } catch (error) {
    console.error(`[DEBUG] ❌ Error searching directory:`, error.message);
  }

  if (!path) {
    console.log(`[DEBUG] ❌ KoboReader.sqlite not found in directory tree`);
  }

  return {
    found: false,
    path: null,
    handle: null,
  };
}

/**
 * Test path navigation step-by-step with detailed logging
 * @param {FileSystemDirectoryHandle} dirHandle - Root directory
 * @param {string} path - Path to navigate (e.g., ".kobo/KoboReader.sqlite")
 * @returns {Promise<{success: boolean, error: string|null, stoppedAt: string|null}>}
 */
export async function testPathNavigation(dirHandle, path) {
  console.log(`[DEBUG] Testing path navigation: "${path}"`);
  console.log(`[DEBUG] Starting from: ${dirHandle.name}`);

  const parts = path.split('/');
  console.log(`[DEBUG] Path parts:`, parts);

  let current = dirHandle;
  let currentPath = '';

  try {
    // Navigate through directories
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      currentPath += (currentPath ? '/' : '') + part;

      console.log(`[DEBUG] Step ${i + 1}: Navigating to directory "${part}"`);

      // Try to get the directory
      try {
        current = await current.getDirectoryHandle(part);
        console.log(`[DEBUG]   ✅ Found directory: ${part} (kind: ${current.kind})`);

        // List what's inside for debugging
        console.log(`[DEBUG]   Contents of ${part}:`);
        for await (const entry of current.values()) {
          console.log(`[DEBUG]     - ${entry.kind === 'file' ? '📄' : '📁'} ${entry.name}`);
        }
      } catch (err) {
        console.error(`[DEBUG]   ❌ Failed to access directory "${part}":`, err.message);
        console.error(`[DEBUG]   Error name:`, err.name);
        console.error(`[DEBUG]   Error code:`, err.code);

        // List what IS available at this level
        console.log(`[DEBUG]   Available entries at current level:`);
        for await (const entry of current.values()) {
          console.log(`[DEBUG]     - ${entry.kind === 'file' ? '📄' : '📁'} ${entry.name}`);
        }

        return {
          success: false,
          error: `Directory not found: ${part}`,
          stoppedAt: currentPath,
        };
      }
    }

    // Try to get the file
    const fileName = parts[parts.length - 1];
    console.log(`[DEBUG] Final step: Getting file "${fileName}"`);

    try {
      const fileHandle = await current.getFileHandle(fileName);
      console.log(`[DEBUG]   ✅ Found file: ${fileName}`);

      const file = await fileHandle.getFile();
      console.log(`[DEBUG]   File size: ${file.size} bytes`);
      console.log(`[DEBUG]   File type: ${file.type || 'unknown'}`);
      console.log(`[DEBUG]   Last modified: ${file.lastModified}`);

      return {
        success: true,
        error: null,
        stoppedAt: null,
      };
    } catch (err) {
      console.error(`[DEBUG]   ❌ Failed to access file "${fileName}":`, err.message);
      console.error(`[DEBUG]   Error name:`, err.name);

      // List available files
      console.log(`[DEBUG]   Available files in ${currentPath}:`);
      for await (const entry of current.values()) {
        if (entry.kind === 'file') {
          console.log(`[DEBUG]     - 📄 ${entry.name}`);
        }
      }

      return {
        success: false,
        error: `File not found: ${fileName}`,
        stoppedAt: currentPath,
      };
    }
  } catch (error) {
    console.error(`[DEBUG] ❌ Unexpected error during navigation:`, error);
    return {
      success: false,
      error: error.message,
      stoppedAt: currentPath,
    };
  }
}
