import type { Metadata } from "next";
import { UniversityGame } from "./university-game";

export const metadata: Metadata = {
  title: "ทายมหาวิทยาลัย · byou",
  description: "ตอบเรื่องรับน้อง การเดินทาง ที่กิน และงานในมหาวิทยาลัย แล้วเกมจะทายมหาวิทยาลัยของคุณครั้งเดียว",
};

export default function Page() {
  return <UniversityGame />;
}
