<script>
  import '../app.css';
  import { base } from '$app/paths';
  import { page } from '$app/stores';
  import { t } from '$lib/i18n/index.js';
  import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte';
</script>

<div class="min-h-screen flex flex-col">
  <!-- Header -->
  <header class="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
    <div class="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
      <a href="{base}/" class="flex items-center gap-2 text-brand-700 font-bold text-base">
        <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
        </svg>
        Leih-Finder
      </a>
      <LanguageSwitcher />
    </div>
  </header>

  <!-- Main content -->
  <main class="flex-1">
    <slot />
  </main>

  <!-- Footer -->
  <footer class="border-t border-gray-100 bg-gray-50 mt-12">
    <div class="max-w-2xl mx-auto px-4 py-6 text-xs text-gray-400 flex flex-col sm:flex-row items-center justify-between gap-2">
      <span>{$t('footer.poweredBy')} <a href="https://allerleih.org" target="_blank" rel="noopener" class="text-brand-700 hover:underline">AllerLeih</a></span>
      <a href="https://github.com/allerleih/leih-finder" target="_blank" rel="noopener" class="text-brand-700 hover:underline">
        {$t('footer.contribute')} →
      </a>
    </div>
  </footer>
</div>
