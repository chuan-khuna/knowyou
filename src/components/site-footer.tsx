/** The home page's footer: one line crediting the game that inspired byou. */
export function SiteFooter() {
  return (
    <footer className="site-footer mt-16 text-sm text-muted">
      แรงบันดาลใจจาก{" "}
      <a href="https://kepigame.com/games/nenrei.html" target="_blank" rel="noopener noreferrer" className="site-footer-link">
        あなたの年齢を当てます
      </a>{" "}
      ของ KEPIGAME
    </footer>
  );
}
