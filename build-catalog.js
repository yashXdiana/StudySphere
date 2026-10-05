const fs = require('fs');
const path = require('path');

// Define the root data directory and output file path
const dataDir = path.join(__dirname, 'data');
const outputFile = path.join(__dirname, 'data', 'catalog.json');

// Helper function to recursively read all files in a directory
function walkDir(dir, callback) {
    if (!fs.existsSync(dir)) {
        console.warn(`Directory not found: ${dir}`);
        return;
    }
    
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
    });
}

const catalog = [];

console.log('Scanning for quiz JSON files...');

// Traverse the data directory
walkDir(dataDir, (filePath) => {
    // Only process .json files and ignore the catalog itself if it exists
    if (filePath.endsWith('.json') && !filePath.endsWith('catalog.json')) {
        try {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const quizData = JSON.parse(fileContent);
            
            // Format the file path for web URLs (replace Windows backslashes with forward slashes)
            // Example: 'data/prelims/History/quiz_1.json'
            const relativePath = path.relative(__dirname, filePath).split(path.sep).join('/');

            // Push only the necessary metadata to the catalog
            if (quizData.quizId && quizData.titleMr) {
                catalog.push({
                    quizId: quizData.quizId,
                    titleMr: quizData.titleMr,
                    titleEn: quizData.title || "",
                    subject: quizData.subjectNameMr || "General",
                    chapter: quizData.chapterNameMr || "Mixed",
                    marks: quizData.totalMarks || 0,
                    time: quizData.durationMinutes || 0,
                    difficulty: quizData.difficulty || "Medium",
                    fileUrl: relativePath
                });
            }
        } catch (err) {
            console.error(`[Error] Failed to parse JSON in file: ${filePath}`, err);
        }
    }
});

// Write the accumulated catalog to a single JSON file
try {
    // Ensure the data directory exists before writing
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(outputFile, JSON.stringify(catalog, null, 2));
    console.log(`Success! Catalog generated with ${catalog.length} quizzes.`);
    console.log(`Output saved to: ${outputFile}`);
} catch (err) {
    console.error('[Error] Failed to write catalog.json:', err);
}