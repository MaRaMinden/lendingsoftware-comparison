<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import { t, locale, loc } from '$lib/i18n/index.js';
  import { quiz } from '$lib/stores/quiz.js';

  /** @type {import('$lib/utils/scoring.js').Criterion[]} */
  let criteria = [];
  let loading = true;
  let currentIndex = 0;

  // Local copies for reactivity
  let answers = {};
  let weights = {};

  quiz.answers.subscribe((v) => (answers = v));
  quiz.weights.subscribe((v) => (weights = v));

  onMount(async () => {
    const res = await fetch(`${base}/data/criteria.json`);
    const data = await res.json();
    criteria = data.criteria;
    loading = false;
  });

  $: criterion = criteria[currentIndex];
  $: isLast = currentIndex === criteria.length - 1;
  $: progress = criteria.length > 0 ? (currentIndex / criteria.length) * 100 : 0;

  function selectAnswer(value) {
    quiz.setAnswer(criterion.id, value);
  }

  function selectWeight(value) {
    quiz.setWeight(criterion.id, value);
  }

  function next() {
    if (isLast) {
      goto(`${base}/results`);
    } else {
      currentIndex += 1;
    }
  }

  function back() {
    if (currentIndex > 0) currentIndex -= 1;
  }

  const weightOptions = [
    { value: 1, labelKey: 'quiz.importanceLow' },
    { value: 2, labelKey: 'quiz.importanceMedium' },
    { value: 3, labelKey: 'quiz.importanceHigh' }
  ];
</script>

<svelte:head>
  <title>Fragebogen – Leih-Finder</title>
</svelte:head>

<div class="max-w-2xl mx-auto px-4 py-6">
  {#if loading}
    <div class="text-center py-20 text-gray-400">{$t('common.loading')}</div>
  {:else if criterion}
    <!-- Progress bar -->
    <div class="mb-6">
      <div class="flex justify-between text-xs text-gray-400 mb-2">
        <span>{$t('quiz.question')} {currentIndex + 1} {$t('quiz.of')} {criteria.length}</span>
        <span class="text-brand-600 font-medium">{loc(criterion.label, $locale)}</span>
      </div>
      <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          class="h-full bg-brand-600 rounded-full transition-all duration-300"
          style="width: {progress}%"
        />
      </div>
    </div>

    <!-- Card -->
    <div class="card p-6 mb-4">
      <!-- Type badge -->
      <div class="mb-4">
        <span class="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full
          {criterion.type === 'exclusion' ? 'bg-orange-50 text-orange-600' : 'bg-brand-50 text-brand-700'}">
          {criterion.type === 'exclusion' ? '🚫' : '⚖️'}
          {$t(criterion.type === 'exclusion' ? 'quiz.exclusionNote' : 'quiz.weightedNote')}
        </span>
      </div>

      <!-- Question -->
      <h2 class="text-xl font-bold text-gray-900 mb-2">
        {loc(criterion.question, $locale)}
      </h2>
      {#if criterion.description}
        <p class="text-sm text-gray-500 mb-6">
          {loc(criterion.description, $locale)}
        </p>
      {/if}

      <!-- Answer options -->
      <div class="flex flex-col gap-3 mb-6">
        {#each criterion.options as option}
          <button
            class="option-button"
            class:selected={answers[criterion.id] === option.value}
            on:click={() => selectAnswer(option.value)}
          >
            <div class="flex items-center gap-3">
              <div class="w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors
                {answers[criterion.id] === option.value
                  ? 'border-brand-700 bg-brand-700'
                  : 'border-gray-300'}">
                {#if answers[criterion.id] === option.value}
                  <div class="w-2 h-2 rounded-full bg-white" />
                {/if}
              </div>
              <span class="text-sm font-medium">{loc(option.label, $locale)}</span>
            </div>
          </button>
        {/each}
      </div>

      <!-- Importance selector (only for weighted criteria) -->
      {#if criterion.type === 'weighted'}
        <div class="border-t border-gray-100 pt-4">
          <p class="text-xs font-semibold text-gray-500 mb-3">{$t('quiz.importance')}</p>
          <div class="grid grid-cols-3 gap-2">
            {#each weightOptions as opt}
              <button
                class="py-2 px-3 rounded-lg border-2 text-xs font-medium transition-all
                  {(weights[criterion.id] ?? 2) === opt.value
                    ? 'border-brand-700 bg-brand-50 text-brand-800'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'}"
                on:click={() => selectWeight(opt.value)}
              >
                {$t(opt.labelKey)}
              </button>
            {/each}
          </div>
        </div>
      {/if}
    </div>

    <!-- Navigation -->
    <div class="flex gap-3">
      {#if currentIndex > 0}
        <button class="btn-ghost" on:click={back}>← {$t('quiz.back')}</button>
      {/if}
      <div class="flex-1" />
      <button class="btn-ghost text-gray-400" on:click={next}>
        {$t('quiz.skip')}
      </button>
      <button
        class="btn-primary"
        on:click={next}
        disabled={!answers[criterion.id]}
      >
        {isLast ? $t('quiz.finish') : $t('quiz.next')} →
      </button>
    </div>
  {/if}
</div>
