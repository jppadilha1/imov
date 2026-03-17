# ProspectHome — Tela de Autenticação (Login / Registro)

> Tela única para login e registro. Formulário centralizado, sem bottom navigation.

## Login

```html
<!DOCTYPE html>
<html lang="pt-BR"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>ProspectHome - Login</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&amp;family=Roboto:wght@300;400;500;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
    tailwind.config = {
        darkMode: "class",
        theme: {
            extend: {
                colors: {
                    "primary": "#2e7d32",
                    "background-light": "#f6f8f6",
                    "background-dark": "#141e15",
                },
                fontFamily: {
                    "display": ["Roboto", "Inter", "sans-serif"]
                },
                borderRadius: {"DEFAULT": "0.5rem", "lg": "1rem", "xl": "1.5rem", "full": "9999px"},
            },
        },
    }
</script>
<style>
    body { font-family: 'Roboto', sans-serif; min-height: max(884px, 100dvh); }
    .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
</style>
</head>
<body class="bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center p-6">
<div class="w-full max-w-[480px] flex flex-col items-center gap-6">
<!-- Icon Section -->
<div class="flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-2">
<div class="relative flex items-center justify-center">
<span class="material-symbols-outlined text-primary text-[48px]">home</span>
<span class="material-symbols-outlined text-primary text-[24px] absolute -right-1 -bottom-1 bg-background-light dark:bg-background-dark rounded-full p-0.5">search</span>
</div>
</div>
<!-- Header Section -->
<div class="text-center space-y-2">
<h1 class="text-slate-900 dark:text-slate-100 text-[32px] font-bold tracking-tight font-display">ProspectHome</h1>
<p class="text-slate-500 dark:text-slate-400 text-base font-normal">Prospecte imóveis com agilidade</p>
</div>
<!-- Form Section -->
<div class="w-full space-y-6 mt-4">
<div class="flex flex-col gap-2">
<label class="relative flex flex-col group">
<div class="flex items-center border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-transparent focus-within:border-primary transition-colors h-16 px-4">
<span class="material-symbols-outlined text-slate-400 group-focus-within:text-primary mr-3">mail</span>
<input class="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-lg p-0" placeholder="E-mail" type="email"/>
</div>
</label>
</div>
<div class="flex flex-col gap-2">
<label class="relative flex flex-col group">
<div class="flex items-center border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-transparent focus-within:border-primary transition-colors h-16 px-4">
<span class="material-symbols-outlined text-slate-400 group-focus-within:text-primary mr-3">lock</span>
<input class="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-lg p-0" placeholder="Senha" type="password"/>
<button class="text-slate-400 hover:text-primary transition-colors" type="button">
<span class="material-symbols-outlined">visibility</span>
</button>
</div>
</label>
</div>
<button class="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-lg text-base tracking-widest transition-all shadow-md active:scale-[0.98]">
ENTRAR
</button>
</div>
<!-- Footer Section -->
<div class="mt-4">
<a class="text-primary font-medium hover:underline text-base" href="#">
Não tem conta? <span class="font-bold">Criar conta</span>
</a>
</div>
</div>
<div class="fixed inset-0 -z-10 opacity-5 pointer-events-none">
<div class="grid grid-cols-4 gap-4 p-4 h-full w-full">
<div class="bg-primary/20 rounded-xl aspect-square" data-alt="Abstract green geometric pattern background"></div>
<div class="bg-primary/10 rounded-xl aspect-square" data-alt="Faded house icon background pattern"></div>
<div class="bg-primary/20 rounded-xl aspect-square" data-alt="Minimalist real estate icon pattern"></div>
<div class="bg-primary/10 rounded-xl aspect-square" data-alt="Subtle green architectural lines"></div>
</div>
</div>
</body></html>
```

## Notas

- **Sem bottom navigation** — tela de autenticação (não logado)
- A tela de **Registro** segue o mesmo layout, adicionando campos "Nome" e "Confirmar Senha"
- Link "Criar conta" / "Já tem conta?" alterna entre os dois estados
