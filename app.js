if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Modo Offline Activado.', reg.scope))
            .catch(err => console.error('Error al activar Modo Offline:', err));
    });
}
