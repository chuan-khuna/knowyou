import Link from "next/link";
import { AdsNightMarket, AdsRamen } from "@/components/ads";
import { GameLink } from "@/components/game-link";
import { SiteFooter } from "@/components/site-footer";
import { SoundToggle } from "@/components/sound-toggle";
import { ThemeToggle } from "@/components/theme-toggle";

interface Card {
  readonly href: string;
  readonly title: string;
  readonly blurb: string;
  readonly ready: boolean;
}

/** Games guess a hidden value about the player. In href order. */
const GAMES: readonly Card[] = [
  { href: "/anime-age", title: "ทายอายุจากการ์ตูน", blurb: "การ์ตูนที่เจ้าเคยดูคือรอยจารึกแห่งกาลเวลา ข้าจะอ่านมันแล้วทายอายุของเจ้า", ready: true },
  { href: "/province", title: "ทายจังหวัด", blurb: "ภาษา อาหาร และประเพณีแถวบ้านจะทรยศเจ้า ข้าจะรู้ว่าเจ้ามาจากจังหวัดใด", ready: true },
  { href: "/university", title: "ทายมหาวิทยาลัย", blurb: "รับน้อง การเดินทาง ที่กิน และงานในรั้วมหาวิทยาลัยจะทิ้งร่องรอย ข้าจะรู้ว่าเจ้าเคยร่ำเรียนที่ใด", ready: true },
];

/** Quizzes ask about one title and end in a score. In href order. */
const QUIZZES: readonly Card[] = [
  { href: "/bleach", title: "คุณรู้จัก Bleach ดีแค่ไหน", blurb: "จงปลดปล่อยความรู้ของเจ้า แล้วดูว่าเจ้าคือยมทูตระดับใด", ready: true },
  { href: "/dragon-ball", title: "คุณรู้จัก Dragon Ball ดีแค่ไหน", blurb: "รวบรวมพลังให้ถึงขีดสุด แล้วดูว่าเจ้าคือนักสู้ระดับใด", ready: true },
  { href: "/haikyu", title: "คุณรู้จัก Haikyu!! ดีแค่ไหน", blurb: "จงทะยานข้ามกำแพงตรงหน้า แล้วดูว่าเจ้าคือนักตบระดับใด", ready: true },
  { href: "/kuroko-no-basket", title: "คุณรู้จัก Kuroko no Basket ดีแค่ไหน", blurb: "ก้าวลงสนามแห่งปาฏิหาริย์ แล้วดูว่าเจ้าคือผู้เล่นระดับใด", ready: true },
  { href: "/naruto", title: "คุณรู้จัก Naruto ดีแค่ไหน", blurb: "ประสานอินให้มั่น แล้วดูว่าเจ้าคือนินจาระดับใด", ready: true },
  { href: "/prince-of-tennis", title: "คุณรู้จัก Prince of Tennis ดีแค่ไหน", blurb: "จงลงสนามด้วยความหยิ่งทะนง แล้วดูว่าเจ้าคือแฟนระดับใด", ready: true },
  { href: "/reborn", title: "คุณรู้จัก Reborn ดีแค่ไหน", blurb: "จุดไฟดับเครื่องชนในตัวเจ้า แล้วดูว่าเจ้ายืนอยู่ตรงไหนในแฟมิลี่", ready: true },
  { href: "/solo-leveling", title: "คุณรู้จัก Solo Leveling ดีแค่ไหน", blurb: "จงลุกขึ้นจากเงามืด แล้วดูว่าเจ้าคือฮันเตอร์แรงก์ใด", ready: true },
];

export default function Home() {
  return (
    <main className="shell">
      <header className="topbar">
        <Link href="/" className="wordmark" aria-current="page">
          byou
        </Link>
        <div className="topbar-end">
          <ThemeToggle />
          <SoundToggle />
        </div>
      </header>

      {/* The page still needs a top heading for screen readers; it just isn't shown. */}
      <h1 className="sr-only">byou</h1>

      <CardSection heading="ทายตัวคุณ" line="ข้าจะถามจนกว่าม่านแห่งความลับจะเปิดออก แล้วเผยตัวตนของเจ้าเพียงครั้งเดียว" cards={GAMES} />
      <AdsRamen />
      <CardSection heading="ควิซ" line="พิสูจน์ความภักดีต่อเรื่องที่เจ้ารัก แล้วรับฉายาที่สมควรแก่เจ้า" cards={QUIZZES} />
      <AdsNightMarket />

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
