<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { base } from '$app/paths';
  import { t, locale, loc } from '$lib/i18n/index.js';
  import ScoreBar from '$lib/components/ScoreBar.svelte';

  let solution = null;
  let criteria = [];
  let loading = true;
  let error = false;

  onMount(async () => {
    const id = $page.params.id;
    try {
      const [solRes, critRes] = await Promise.all([
        fetch(`${base}/data/solutions/${id}.json`),
        fetch(`${base}/data/criteria.json`)
      ]);
      if (!solRes.ok) throw new Error('Not found');
      solution = await solRes.json();
      const data = await critRes.json();
      criteria = data.criteria.filter((c) => c.type === 'weighted');
    } catch {
      error = true;
    }
    loading = false;
  });

  function criterionLabel(id) {
    const c = criteria.find((c) => c.id === id);
    return c ? loc(c.label, $locale) : id;
  }

  /** Average score across all answer options for a criterion */
  function avgScore(criterionId) {
    const scores = solution?.criteria_scores?.[criterionId];
    if (!scores) return 0;
    const vals = Object.values(scores);
    return vals.reduce((a, b) => a + b, 0) / vals.length / 3;
  }
</script>

<svelte:head>
  <title>{solution?.name ?? 'Lösung'} – Leih-Finder</title>
</svelte:head>

<div class="max-w-2xl mx-auto px-4 py-8">
  {#if loading}
    <div class="text-center py-20 text-gray-400">{$t('common.loading')}</div>
  {:else if error || !solution}
    <div class="text-center py-20 text-gray-400">Lösung nicht gefunden.</div>
  {:else}
    <!-- Back -->
    <a href="{base}/results" class="btn-ghost text-sm mb-6 inline-flex">
      ← {$t('solution.backToResults')}
    </a>

    <!-- Header -->
    <div class="card p-6 mb-6">
      <div class="flex items-start justify-between gap-4 mb-4">
        <div>
          <div class="flex items-center gap-2 flex-wrap mb-1">
            <h1 class="text-2xl font-bold text-gray-900">{solution.name}</h1>
            {#if solution.properties.open_source}
              <span class="text-xs font-medium px-2 py-0.5 rounded-full bg-brand-50 text-brand-700">
                {$t('common.openSourceBadge')}
              </span>
            {:else}
              <span class="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                {$t('common.notOpenSource')}
              </span>
            {/if}
          </div>
          <p class="text-gray-500">{loc(solution.tagline, $locale)}</p>
        </div>
        <a
          href={solution.website}
          target="_blank"
          rel="noopener"
          class="btn-primary text-sm py-2 shrink-0"
        >
          {$t('solution.visitWebsite')} ↗
        </a>
      </div>

      <!-- Meta chips -->
      <div class="flex flex-wrap gap-2 text-xs mb-4">
        {#each solution.properties.hosting as h}
          <span class="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">
            {h === 'self_hosted' ? '🖥 ' + $t('results.selfHosted') : '☁️ ' + $t('results.cloud')}
          </span>
        {/each}
        {#if solution.license}
          <span class="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">
            {$t('results.license')}: {solution.license}
          </span>
        {/if}
        {#if solution.last_updated}
          <span class="px-2.5 py-1 rounded-full bg-gray-100 text-gray-400 font-medium">
            {$t('solution.lastUpdated')}: {solution.last_updated}
          </span>
        {/if}
      </div>

      <p class="text-sm text-gray-700 leading-relaxed">
        {loc(solution.description, $locale)}
      </p>
    </div>

    <!-- Features -->
    {#if solution.features?.length}
      <div class="card p-6 mb-6">
        <h2 class="font-semibold text-gray-800 mb-4">{$t('solution.features')}</h2>
        <ul class="flex flex-col gap-2">
          {#each solution.features as feature}
            <li class="flex items-start gap-2 text-sm text-gray-700">
              <span class="text-brand-600 mt-0.5 shrink-0">✓</span>
              {loc(feature, $locale)}
            </li>
          {/each}
        </ul>
      </div>
    {/if}

    <!-- Criteria breakdown -->
    <div class="card p-6 mb-6">
      <h2 class="font-semibold text-gray-800 mb-1">{$t('solution.criteriaBreakdown')}</h2>
      <p class="text-xs text-gray-400 mb-4">{$t('solution.scoreNote')}</p>
      <div class="flex flex-col gap-4">
        {#each criteria as criterion}
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-sm font-medium text-gray-700">{loc(criterion.label, $locale)}</span>
            </div>
            <ScoreBar value={avgScore(criterion.id)} size="sm" />
            <!-- Show per-answer scores -->
            <div class="mt-2 flex flex-col gap-1">
              {#each criterion.options as opt}
                {@const score = solution.criteria_scores[criterion.id]?.[opt.value] ?? 0}
                <div class="flex items-center gap-2 text-xs text-gray-400">
                  <span class="w-2/3 truncate">{loc(opt.label, $locale)}</span>
                  <div class="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div class="h-full bg-brand-300 rounded-full" style="width: {(score/3)*100}%" />
                  </div>
                  <span class="w-4 text-right">{score}/3</span>
                </div>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>
