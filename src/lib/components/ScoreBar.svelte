<script>
  /** @type {number} 0–1 */
  export let value = 0;
  /** @type {'sm'|'md'} */
  export let size = 'md';

  $: pct = Math.round(value * 100);
  $: color = pct >= 70 ? 'bg-brand-600' : pct >= 40 ? 'bg-yellow-400' : 'bg-gray-300';
</script>

<div class="flex items-center gap-3">
  <div
    class="flex-1 rounded-full bg-gray-100 overflow-hidden"
    class:h-2={size === 'sm'}
    class:h-3={size === 'md'}
  >
    <div
      class="h-full rounded-full transition-all duration-500 {color}"
      style="width: {pct}%"
    />
  </div>
  <span
    class="tabular-nums font-semibold text-gray-700 shrink-0"
    class:text-xs={size === 'sm'}
    class:text-sm={size === 'md'}
  >
    {pct} %
  </span>
</div>
