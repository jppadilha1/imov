# ProspectHome — Confirmar Prospecto

> Modal/tela de confirmação após tirar foto. Mostra preview, timestamp, GPS e campo de descrição. Tab **Captura** ativa.

```html
<!DOCTYPE html>
<html class="light" lang="pt-br"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
    tailwind.config = {
        darkMode: "class",
        theme: {
            extend: {
                colors: {
                    "primary": "#2e7d32",
                    "background-light": "#ffffff",
                    "background-dark": "#141e15",
                },
                fontFamily: {
                    "display": ["Roboto", "sans-serif"],
                    "sans": ["Roboto", "sans-serif"]
                },
                borderRadius: {"DEFAULT": "0.5rem", "lg": "1rem", "xl": "1.5rem", "full": "9999px"},
            },
        },
    }
</script>
<title>Confirmar Prospecto - ProspectHome</title>
<style>
    body { font-family: 'Roboto', sans-serif; min-height: max(884px, 100dvh); }
    .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
    .material-symbols-filled { font-family: 'Material Symbols Outlined'; font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
</style>
</head>
<body class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased overflow-hidden">
<div class="relative flex h-screen w-full flex-col overflow-hidden max-w-md mx-auto border-x border-slate-100 dark:border-slate-800">
<!-- Top App Bar -->
<header class="flex items-center h-16 px-4 bg-background-light dark:bg-background-dark border-b border-slate-100 dark:border-slate-800 shrink-0">
<button class="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
<span class="material-symbols-outlined text-slate-700 dark:text-slate-300">arrow_back</span>
</button>
<h1 class="ml-4 text-xl font-medium text-slate-900 dark:text-slate-100">Confirmar Prospecto</h1>
</header>
<!-- Main Content -->
<main class="flex-1 overflow-y-auto px-6 py-6">
<!-- Photo Preview -->
<div class="w-full aspect-[4/3] rounded-xl overflow-hidden mb-6 ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm">
<div class="w-full h-full bg-center bg-cover" data-alt="Close up of a house entrance and front yard" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuBOvtmFKn6i8xRlPHbC6sEOgGmGyyN14ASojrwpp8ZrHUSAp0Vc4iMSxK9nXqLCQRO6Fk6NpUqmHjEOI8F9Clbv0LFzMXNeuddMx1yhcUp6aFZIOGz_7f9tglK2LoLzNt-hcJ3EyyDIM-JusDuD2E6gXipa4C8FNFVCTtexv2IRElL0VttB1C8X2rGeQYHEVwY0pxWjVai6XzB4G_XynTH-bEp2rUrF-NP43StfCdZVizwHHL78LiV2cuKAygL2c55URcwuO-xHTjEt');"></div>
</div>
<!-- Metadata -->
<div class="flex flex-col gap-3 mb-8 text-sm text-slate-600 dark:text-slate-400">
<div class="flex items-center gap-3">
<span class="material-symbols-outlined text-xl text-slate-400">schedule</span>
<span>11/03/2026 14:32</span>
</div>
<div class="flex items-center gap-3">
<span class="material-symbols-outlined text-xl text-slate-400">location_on</span>
<span>-23.5505, -46.6333</span>
</div>
</div>
<!-- Form -->
<div class="space-y-4 mb-10">
<div class="relative">
<label class="block text-xs font-bold text-primary mb-1.5 ml-1" for="description">DESCRIÇÃO DO PROSPECTO</label>
<textarea class="w-full rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:ring-primary focus:border-primary dark:text-slate-100 text-sm placeholder:text-slate-400 p-4" id="description" placeholder="Adicione notas sobre o imóvel..." rows="3"></textarea>
</div>
</div>
<!-- Actions -->
<div class="flex flex-col gap-3 pb-8">
<button class="w-full bg-primary hover:opacity-90 text-white font-bold py-4 rounded-full flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]">
<span class="material-symbols-outlined">check</span>
SALVAR PROSPECTO
</button>
<button class="w-full bg-transparent border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 font-bold py-4 rounded-full flex items-center justify-center transition-colors">
DESCARTAR
</button>
</div>
</main>
<!-- ===== BOTTOM NAVIGATION (Captura Active) ===== -->
<nav class="flex h-20 border-t border-slate-100 dark:border-slate-800 bg-background-light dark:bg-background-dark px-2 shrink-0">
<a class="flex flex-1 flex-col items-center justify-center gap-1 group" href="#">
<div class="flex items-center justify-center h-8 w-16 rounded-full group-hover:bg-slate-100 dark:group-hover:bg-slate-800 transition-colors">
<span class="material-symbols-outlined text-slate-600 dark:text-slate-400">location_on</span>
</div>
<span class="text-xs font-medium text-slate-600 dark:text-slate-400">Mapa</span>
</a>
<a class="flex flex-1 flex-col items-center justify-center gap-1 group" href="#">
<div class="flex items-center justify-center h-8 w-16 rounded-full bg-primary/20 transition-colors">
<span class="material-symbols-filled text-primary">photo_camera</span>
</div>
<span class="text-xs font-bold text-slate-900 dark:text-slate-100">Captura</span>
</a>
<a class="flex flex-1 flex-col items-center justify-center gap-1 group" href="#">
<div class="flex items-center justify-center h-8 w-16 rounded-full group-hover:bg-slate-100 dark:group-hover:bg-slate-800 transition-colors">
<span class="material-symbols-outlined text-slate-600 dark:text-slate-400">description</span>
</div>
<span class="text-xs font-medium text-slate-600 dark:text-slate-400">Lista</span>
</a>
</nav>
<div class="h-1 bg-background-light dark:bg-background-dark flex justify-center pb-2">
<div class="w-32 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
</div>
</div>
</body></html>
```
