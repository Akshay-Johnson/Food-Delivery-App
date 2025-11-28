export const uploadImage = (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const fileUri = req.file.path || req.file.filename;

        res.json({ 
            message: "Image uploaded successfully",
            url: fileUri
        });
    } catch (error) {
        res.status(500).json({ message: 'Upload failed', error: error.message });
    }
};