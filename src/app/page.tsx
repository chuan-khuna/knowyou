import Link from "next/link";

const GAMES = [
  { href: "/anime-age", title: "ทายอายุจากการ์ตูน", blurb: "ตอบว่าคุณรู้จักการ์ตูนเรื่องไหนบ้าง แล้วเกมจะทายอายุคุณ", ready: true },
  { href: "/province", title: "ทายจังหวัด", blurb: "เกมจะทายว่าคุณมาจากจังหวัดไหน", ready: false },
  { href: "/university", title: "ทายมหาวิทยาลัย", blurb: "เกมจะทายว่าคุณเรียนที่ไหน", ready: false },
] as const;

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-xl px-4 py-10 sm:py-16">
      <h1 className="text-3xl font-bold">Pinpoint</h1>
      <p className="mt-3 text-lg text-muted">ถามจนกว่าจะมั่นใจ แล้วทายครั้งเดียว</p>
      <ul className="mt-8 space-y-4">
        {GAMES.map((game) => (
          <li key={game.href}>
            {game.ready ? (
              <Link
                href={game.href}
                className="block rounded-2xl border border-line bg-card p-5 transition-colors hover:border-accent"
              >
                <span className="text-xl font-bold">{game.title}</span>
                <span className="mt-1 block text-muted">{game.blurb}</span>
              </Link>
            ) : (
              <div className="rounded-2xl border border-dashed border-line p-5 opacity-60" aria-disabled="true">
                <span className="text-xl font-bold">{game.title}</span>
                <span className="ml-2 rounded-full border border-line px-2 py-0.5 text-sm">เร็ว ๆ นี้</span>
                <span className="mt-1 block text-muted">{game.blurb}</span>
              </div>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
