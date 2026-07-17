const fileStorage = (function () {
    let fileHandle = null;

    async function openFile() {
        if (window.showOpenFilePicker) {
            const [handle] = await window.showOpenFilePicker({
                types: [{
                    description: 'JSON bestand',
                    accept: { 'application/json': ['.json'] }
                }],
                excludeAcceptAllOption: false,
                multiple: false
            });
            fileHandle = handle;
            const file = await handle.getFile();
            const text = await file.text();
            return text ? JSON.parse(text) : {};
        }
        throw new Error('File System Access API niet ondersteund in deze browser.');
    }

    async function saveFile(json) {
        const dataStr = JSON.stringify(json, null, 2);

        if (fileHandle && fileHandle.createWritable) {
            const writable = await fileHandle.createWritable();
            await writable.write(dataStr);
            await writable.close();
            return;
        }

        if (window.showSaveFilePicker) {
            const handle = await window.showSaveFilePicker({
                suggestedName: 'reservations.json',
                types: [{
                    description: 'JSON bestand',
                    accept: { 'application/json': ['.json'] }
                }]
            });
            const writable = await handle.createWritable();
            await writable.write(dataStr);
            await writable.close();
            fileHandle = handle;
            return;
        }

        // Fallback: download
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'reservations.json';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }

    return {
        openFile,
        saveFile
    };
})();

 
