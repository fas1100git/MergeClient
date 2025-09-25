import './style/main.css';

import MainManager from "./manager/MainManager";

addEventListener('gesturestart', (e) => e.preventDefault(), false);
addEventListener('contextmenu', (e) => e.preventDefault(), false);
addEventListener('dragstart', (e) => e.preventDefault(), false);
addEventListener('dblclick', (e) => e.preventDefault(), false);

addEventListener('load', (e) => MainManager.init());

document.addEventListener('dblclick', (e) => e.preventDefault(), false);

let t = 0;
addEventListener('touchstart', e => {
    const n = Date.now();
    if (n - t < 500) e.preventDefault();
    t = n;
}, { passive: false });

// #!if target === 'debug'

addEventListener("dragenter", function (e) {
    e.preventDefault();
});

addEventListener("dragover", function (e) {
    e.preventDefault();
});

addEventListener("dragleave", function (e) {
    e.preventDefault();
});

addEventListener('drop', (e) => {
    e.preventDefault();

    const file = e.dataTransfer.files[0];
    if (file && file.type.match('image.*')) {
        const reader = new FileReader();

        reader.onload = (event) => {
            document.body.style.backgroundImage = `url(${event.target.result})`;
        };

        reader.readAsDataURL(file);
    } else {
        alert('Пожалуйста, перетащите файл изображения (JPEG, PNG, GIF и т.д.)');
    }
});
// #!endif
