/**
 * The home page's footer: the credits. One line for the game that inspired
 * byou, one for Sakuga VFX, whose drawn controls and effects byou's look and
 * effects are forked from (`docs/documents/drawn-effects.md`).
 */
export function SiteFooter() {
  return (
    <footer className="site-footer mt-16 space-y-1 text-sm text-muted">
      <p>
        แรงบันดาลใจจาก{" "}
        <a href="https://kepigame.com/games/nenrei.html" target="_blank" rel="noopener noreferrer" className="site-footer-link">
          あなたの年齢を当てます
        </a>{" "}
        ของ KEPIGAME
      </p>
      <p>
        สไตล์อนิเมะจาก{" "}
        <a href="https://sakuga-vfx.vercel.app/gallery/" target="_blank" rel="noopener noreferrer" className="site-footer-link">
          Sakuga VFX
        </a>{" "}
        <span className="whitespace-nowrap">ของ Justin Finkelman</span>
      </p>
    </footer>
  );
}
