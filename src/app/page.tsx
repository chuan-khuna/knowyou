import { GameLink } from "@/components/game-link";
import { SiteFooter } from "@/components/site-footer";
import { SoundToggle } from "@/components/sound-toggle";

interface Card {
  readonly href: string;
  readonly title: string;
  readonly blurb: string;
  readonly ready: boolean;
}

/** Games guess a hidden value about the player. In href order. */
const GAMES: readonly Card[] = [
  { href: "/anime-age", title: "ทายอายุจากการ์ตูน", blurb: "ตอบว่าคุณรู้จักการ์ตูนเรื่องไหนบ้าง แล้วเกมจะทายอายุคุณ", ready: true },
  { href: "/province", title: "ทายจังหวัด", blurb: "ตอบเรื่องภาษา อาหาร และประเพณีแถวบ้าน แล้วเกมจะทายจังหวัดคุณ", ready: true },
  { href: "/university", title: "ทายมหาวิทยาลัย", blurb: "ตอบเรื่องรับน้อง การเดินทาง ที่กิน และงานในมหาวิทยาลัย แล้วเกมจะทายว่าคุณเรียนที่ไหน", ready: true },
];

/** Quizzes ask about one title and end in a score. In href order. */
const QUIZZES: readonly Card[] = [
  { href: "/dragon-ball", title: "คุณรู้จัก Dragon Ball ดีแค่ไหน", blurb: "ตอบคำถามแล้วดูว่าคุณเป็นนักสู้ระดับไหน", ready: true },
  { href: "/kuroko-no-basket", title: "คุณรู้จัก Kuroko no Basket ดีแค่ไหน", blurb: "ตอบคำถามแล้วดูว่าคุณเป็นผู้เล่นระดับไหน", ready: true },
  { href: "/naruto", title: "คุณรู้จัก Naruto ดีแค่ไหน", blurb: "ตอบคำถามแล้วดูว่าคุณเป็นนินจาระดับไหน", ready: true },
  { href: "/prince-of-tennis", title: "คุณรู้จัก Prince of Tennis ดีแค่ไหน", blurb: "ตอบคำถามแล้วดูว่าคุณเป็นแฟนระดับไหน", ready: true },
  { href: "/reborn", title: "คุณรู้จัก Reborn ดีแค่ไหน", blurb: "ตอบคำถามแล้วดูว่าคุณอยู่ระดับไหนในแฟมิลี่", ready: true },
];

export default function Home() {
  return (
    <main className="shell">
      <header className="topbar">
        <span className="wordmark">KnowYou</span>
        <SoundToggle />
      </header>

      {/* The page still needs a top heading for screen readers; it just isn't shown. */}
      <h1 className="sr-only">KnowYou</h1>

      <CardSection heading="ทายตัวคุณ" line="เกมจะถามไปเรื่อย ๆ จนมั่นใจ แล้วทายเรื่องของคุณครั้งเดียว" cards={GAMES} />
      <CardSection heading="ควิซ" line="ตอบคำถามเรื่องที่คุณชอบ แล้วดูว่าคุณรู้จักดีแค่ไหน" cards={QUIZZES} />

      <SiteFooter />
    </main>
  );
}

function CardSection({ heading, line, cards }: { heading: string; line: string; cards: readonly Card[] }) {
  return (
    <section className="mt-12">
      <h2 className="text-2xl">{heading}</h2>
      <p className="mt-1 text-muted">{line}</p>
      <ul className="mt-5 grid gap-5">
        {cards.map((card) =>
          card.ready ? (
            <li key={card.href}>
              <GameLink href={card.href} className="stock game-card">
                <span className="font-display text-2xl font-semibold">{card.title}</span>
                <span>{card.blurb}</span>
              </GameLink>
            </li>
          ) : (
            <li key={card.href} className="rounded-card bg-paper-2 p-6" aria-disabled="true">
              <span className="flex flex-wrap items-baseline gap-x-3">
                <span className="font-display text-xl font-semibold text-muted">{card.title}</span>
                <span className="text-sm text-muted">เร็ว ๆ นี้</span>
              </span>
              <span className="mt-1 block text-muted">{card.blurb}</span>
            </li>
          ),
        )}
      </ul>
    </section>
  );
}
