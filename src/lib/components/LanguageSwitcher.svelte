<script>
  import { locale } from '$lib/i18n/index.js';
</script>

<div class="flex items-center gap-1 text-sm font-medium">
  <button
    class="px-2 py-1 rounded transition-colors"
    class:text-brand-700={$locale === 'de'}
    class:font-bold={$locale === 'de'}
    class:text-gray-400={$locale !== 'de'}
    on:click={() => ($locale = 'de')}
    aria-pressed={$locale === 'de'}
  >
    DE
  </button>
  <span class="text-gray-300">/</span>
  <button
    class="px-2 py-1 rounded transition-colors"
    class:text-brand-700={$locale === 'en'}
    class:font-bold={$locale === 'en'}
    class:text-gray-400={$locale !== 'en'}
    on:click={() => ($locale = 'en')}
    aria-pressed={$locale === 'en'}
  >
    EN
  </button>
</div>
