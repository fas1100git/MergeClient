const fs = require('fs');
const archiver = require('archiver');

const date = new Date();

function formatDate(date = new Date()) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);

    return `${day}.${month}.${year}`;
}

const outputZipFile = `${__dirname}/dst/merge-client_${formatDate()}.zip`;

console.log(outputZipFile);

const output = fs.createWriteStream(outputZipFile);
const archive = archiver('zip', {
    zlib: { level: 1 } // Максимальная степень сжатия
});

output.on('close', function () {
    console.log(archive.pointer() + ' total bytes');
    console.log('Archiver has been finalized and the output file descriptor has closed.');
});

archive.on('error', function (err) {
    throw err;
});

// Начинаем архивирование
archive.pipe(output);
archive.glob('**/*', {
    cwd: `${__dirname}/dst/`, // Укажите путь к директории, которую хотите архивировать
    ignore: ['eruda.js', '*.zip', 'bundle.js.LICENSE.txt'] // Укажите файлы и директории для исключения
});
archive.finalize();