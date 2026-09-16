<script>
  import { base } from '$app/paths';
  import { t } from '$lib/i18n/index.js';
  import { quiz } from '$lib/stores/quiz.js';
  import { derived } from 'svelte/store';

  // Check whether the user already has answers from a previous session
  const hasAnswers = derived(quiz.answers, ($a) => Object.keys($a).length > 0);
</script>

<svelte:head>
  <title>Leih-Finder</title>
</svelte:head>

<div class="max-w-2xl mx-auto px-4 py-10">
  <!-- Hero -->
  <div class="text-center mb-12">
    <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-700 text-white mb-6 shadow-md">
      <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
      </svg>
    </div>
    <h1 class="text-3xl font-bold text-gray-900 mb-4 leading-tight">
      {$t('home.title')}
    </h1>
    <p class="text-lg text-gray-500 max-w-md mx-auto">
      {$t('home.subtitle')}
    </p>
  </div>

  <!-- CTA -->
  <div class="flex flex-col items-center gap-3 mb-16">
    <a href="{base}/quiz" class="btn-primary text-base px-8 py-4 w-full max-w-xs text-center">
      {$hasAnswers ? $t('home.ctaResume') : $t('home.cta')}
    </a>
    {#if $hasAnswers}
      <a href="{base}/results" class="btn-ghost text-sm">
        Direkt zu den Ergebnissen →
      </a>
    {/if}
  </div>

  <!-- How it works -->
  <div class="mb-8">
    <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider text-center mb-6">
      {$t('home.howItWorks')}
    </h2>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {#each [
        { num: '1', title: $t('home.step1Title'), desc: $t('home.step1Desc'), icon: '❓' },
        { num: '2', title: $t('home.step2Title'), desc: $t('home.step2Desc'), icon: '⚖️' },
        { num: '3', title: $t('home.step3Title'), desc: $t('home.step3Desc'), icon: '✅' }
      ] as step}
        <div class="card p-5 text-center">
          <div class="text-2xl mb-3">{step.icon}</div>
          <div class="text-xs font-bold text-brand-600 mb-1">Schritt {step.num}</div>
          <div class="font-semibold text-gray-800 text-sm mb-1">{step.title}</div>
          <div class="text-xs text-gray-500">{step.desc}</div>
        </div>
      {/each}
    </div>
  </div>
</div>
