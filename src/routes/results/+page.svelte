<script>
  import { onMount } from 'svelte';
  import { base } from '$app/paths';
  import { t, locale, loc } from '$lib/i18n/index.js';
  import { quiz } from '$lib/stores/quiz.js';
  import { scoreAndRank } from '$lib/utils/scoring.js';
  import { decodeState, buildShareUrl } from '$lib/utils/urlState.js';
  import ScoreBar from '$lib/components/ScoreBar.svelte';

  let loading = true;
  /** @type {import('$lib/utils/scoring.js').ScoredSolution[]} */
  let ranked = [];
  let criteria = [];
  let showExplanation = false;
  let shareCopied = false;
  /** @type {Set<string>} */
  let expandedDetails = new Set();

  let answers = {};
  let weights = {};
  quiz.answers.subscribe((v) => (answers = v));
  quiz.weights.subscribe((v) => (weights = v));

  onMount(async () => {
    // Load state from URL hash if present (shared link)
    const hashState = decodeState(window.location.hash);
    if (hashState) {
      quiz.loadState(hashState);
    }

    // Fetch criteria + all solutions
    const [criteriaRes, indexRes] = await Promise.all([
      fetch(`${base}/data/criteria.json`),
      fetch(`${base}/data/solutions/index.json`)
    ]);
    const criteriaData = await criteriaRes.json();
    const { solutions: solutionIds } = await indexRes.json();
    criteria = criteriaData.criteria;

    const solutionData = await Promise.all(
      solutionIds.map((id) => fetch(`${base}/data/solutions/${id}.json`).then((r) => r.json()))
    );

    ranked = scoreAndRank(solutionData, criteria, answers, weights);
    loading = false;
  });

  $: visible = ranked.filter((r) => !r.excluded);
  $: excluded = ranked.filter((r) => r.excluded);

  function toggleDetails(id) {
    const next = new Set(expandedDetails);
    next.has(id) ? next.delete(id) : next.add(id);
    expandedDetails = next;
  }

  async function share() {
    const url = buildShareUrl({ answers, weights }, base);
    await navigator.clipboard.writeText(url);
    shareCopied = true;
    setTimeout(() => (shareCopied = false), 2000);
  }

  function criterionLabel(id) {
    const c = criteria.find((c) => c.id === id);
    return c ? loc(c.label, $locale) : id;
  }

  function optionLabel(criterionId, value) {
    const c = criteria.find((c) => c.id === criterionId);
    const opt = c?.options.find((o) => o.value === value);
    return opt ? loc(opt.label, $locale) : value;
  }

  const weightLabel = { 1: '○', 2: '●', 3: '★' };
  const weightName = { 1: 'importanceLow', 2: 'importanceMedium', 3: 'importanceHigh' };
</script>

<svelte:head>
  <title>Ergebnisse – Leih-Finder</title>
</svelte:head>

<div class="max-w-2xl mx-auto px-4 py-8">
  {#if loading}
    <div class="text-center py-20 text-gray-400">{$t('common.loading')}</div>
  {:else}
    <!-- Header -->
    <div class="flex items-start justify-between mb-6 gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{$t('results.title')}</h1>
        <p class="text-sm text-gray-400 mt-1">{$t('results.subtitle')}</p>
      </div>
      <div class="flex gap-2 shrink-0">
        <a href="{base}/quiz" class="btn-ghost text-sm">← {$t('results.editAnswers')}</a>
        <button class="btn-secondary text-sm" on:click={share}>
          {shareCopied ? $t('results.shareCopied') : $t('results.share')}
        </button>
      </div>
    </div>

    <!-- Score explanation toggle -->
    <button
      class="w-full text-left text-xs text-gray-400 flex items-center gap-1 mb-6 hover:text-gray-600 transition-colors"
      on:click={() => (showExplanation = !showExplanation)}
    >
      <svg class="w-3.5 h-3.5 shrink-0 transition-transform" class:rotate-90={showExplanation} viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
      </svg>
      {$t('results.scoreExplanation')}
    </button>
    {#if showExplanation}
      <div class="bg-brand-50 border border-brand-100 rounded-xl p-4 mb-6 text-sm text-brand-800">
        {$t('results.scoreExplanationText')}
      </div>
    {/if}

    <!-- No results -->
    {#if visible.length === 0}
      <div class="card p-8 text-center mb-6">
        <div class="text-3xl mb-3">😕</div>
        <p class="font-semibold text-gray-700">{$t('results.noResults')}</p>
        <p class="text-sm text-gray-400 mt-1">{$t('results.noResultsHint')}</p>
        <a href="{base}/quiz" class="btn-primary mt-4 inline-block">{$t('results.editAnswers')}</a>
      </div>
    {:else}
      <!-- Ranked solutions -->
      <div class="flex flex-col gap-4 mb-8">
        {#each visible as result, i}
          {@const s = result.solution}
          <div class="card overflow-hidden">
            <!-- Rank badge + name -->
            <div class="px-5 pt-5 pb-4 flex items-start gap-4">
              <div class="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                {i === 0 ? 'bg-brand-700 text-white' : 'bg-gray-100 text-gray-500'}">
                {i + 1}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <h2 class="font-bold text-gray-900 text-lg">{s.name}</h2>
                  {#if s.properties.open_source}
                    <span class="text-xs font-medium px-2 py-0.5 rounded-full bg-brand-50 text-brand-700">
                      {$t('common.openSourceBadge')}
                    </span>
                  {/if}
                  {#each s.properties.hosting as h}
                    <span class="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      {h === 'self_hosted' ? $t('results.selfHosted') : $t('results.cloud')}
                    </span>
                  {/each}
                </div>
                <p class="text-sm text-gray-500 mt-1">{loc(s.tagline, $locale)}</p>
              </div>
            </div>

            <!-- Score bar -->
            <div class="px-5 pb-3">
              <div class="text-xs text-gray-400 mb-1.5">{$t('results.matchScore')}</div>
              <ScoreBar value={result.score} />
            </div>

            <!-- Description (collapsed) -->
            <div class="px-5 pb-4 text-sm text-gray-600">
              {loc(s.description, $locale)}
            </div>

            <!-- Detail breakdown (toggle) -->
            {#if expandedDetails.has(s.id)}
              <div class="border-t border-gray-50 px-5 py-4 bg-gray-50">
                <p class="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide">
                  {$t('results.showDetails')}
                </p>
                <div class="flex flex-col gap-2">
                  {#each result.breakdown as b}
                    <div class="flex items-center gap-2 text-xs">
                      <span class="w-4 text-center shrink-0">{weightLabel[b.weight]}</span>
                      <span class="text-gray-500 w-28 shrink-0">{criterionLabel(b.criterionId)}</span>
                      <span class="text-gray-400 flex-1">{b.answer ? optionLabel(b.criterionId, b.answer) : '—'}</span>
                      <ScoreBar value={b.rawScore / 3} size="sm" />
                    </div>
                  {/each}
                </div>
              </div>
            {/if}

            <!-- Actions -->
            <div class="border-t border-gray-100 px-5 py-3 flex items-center gap-3">
              <a href="{base}/solution/{s.id}" class="btn-ghost text-sm">
                {$t('results.learnMore')}
              </a>
              <button
                class="btn-ghost text-sm text-gray-400"
                on:click={() => toggleDetails(s.id)}
              >
                {expandedDetails.has(s.id) ? $t('results.hideDetails') : $t('results.showDetails')}
              </button>
              <div class="flex-1" />
              <a
                href={s.website}
                target="_blank"
                rel="noopener"
                class="btn-primary text-sm py-2"
              >
                {$t('results.visitWebsite')} ↗
              </a>
            </div>
          </div>
        {/each}
      </div>
    {/if}

    <!-- Excluded solutions -->
    {#if excluded.length > 0}
      <details class="mb-4">
        <summary class="text-sm text-gray-400 cursor-pointer hover:text-gray-600 select-none">
          {excluded.length} {$t('results.excluded')}
        </summary>
        <div class="mt-3 flex flex-col gap-2">
          {#each excluded as result}
            <div class="card px-4 py-3 flex items-center gap-3 opacity-50">
              <span class="font-medium text-sm text-gray-700">{result.solution.name}</span>
              <span class="text-xs text-gray-400">
                → {criterionLabel(result.excludedBy)}
              </span>
            </div>
          {/each}
        </div>
      </details>
    {/if}
  {/if}
</div>
