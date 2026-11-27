/**
 * Space held for a future ad: an empty dashed frame reading `ads`, at a
 * fixed height so an ad that loads later never moves the page. A prototype
 * for choosing positions; see "Ad slot" in `docs/documents/quiz.md`.
 */
export function AdSlot() {
  return (
    <aside
      aria-label="โฆษณา"
      className="mt-10 flex h-[100px] items-center justify-center rounded-stock border border-dashed border-[color-mix(in_oklch,var(--color-rule)_60%,var(--color-muted))] font-mono text-xs text-muted sm:h-[120px]"
    >
      <span aria-hidden="true">ads</span>
    </aside>
  );
}
