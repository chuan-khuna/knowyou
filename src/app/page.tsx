import { GameLink } from "@/components/game-link";
import { SoundToggle } from "@/components/sound-toggle";

const GAMES = [
  { href: "/anime-age", title: "ทายอายุจากการ์ตูน", blurb: "ตอบว่าคุณรู้จักการ์ตูนเรื่องไหนบ้าง แล้วเกมจะทายอายุคุณ", ready: true },
  { href: "/prince-of-tennis", title: "คุณรู้จัก Prince of Tennis ดีแค่ไหน", blurb: "ตอบคำถาม 20 ข้อ แล้วดูว่าคุณเป็นแฟนระดับไหน", ready: true },
  { href: "/province", title: "ทายจังหวัด", blurb: "ตอบเรื่องภาษา อาหาร และประเพณีแถวบ้าน แล้วเกมจะทายจังหวัดคุณ", ready: true },
  { href: "/university", title: "ทายมหาวิทยาลัย", blurb: "เกมจะทายว่าคุณเรียนที่ไหน", ready: false },
] as const;

export default function Home() {
  return (
    <main className="shell">
      <header className="topbar">
        <span className="wordmark">KnowYou</span>
        <SoundToggle />
      </header>

      <h1 className="mt-10 text-3xl sm:text-[2.75rem]">ถามจนกว่าจะมั่นใจ แล้วทายครั้งเดียว</h1>

      <ul className="mt-10 grid gap-5">
        {GAMES.map((game) =>
          game.ready ? (
            <li key={game.href}>
              <GameLink href={game.href} className="stock game-card">
                <span className="font-display text-2xl font-semibold">{game.title}</span>
                <span>{game.blurb}</span>
              </GameLink>
            </li>
          ) : (
            <li key={game.href} className="rounded-card bg-paper-2 p-6" aria-disabled="true">
              <span className="flex flex-wrap items-baseline gap-x-3">
                <span className="font-display text-xl font-semibold text-muted">{game.title}</span>
                <span className="text-sm text-muted">เร็ว ๆ นี้</span>
              </span>
              <span className="mt-1 block text-muted">{game.blurb}</span>
            </li>
          ),
        )}
      </ul>
    </main>
  );
}
