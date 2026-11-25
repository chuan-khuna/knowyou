/**
 * The 77 provinces' facts, one typed table keyed by province id.
 *
 * Ported from the user-supplied prototype archive (id, name, region, capital,
 * dialect mix, terrain, coast, border, Muslim share), then retyped and
 * extended with culture tags and food, tradition and souvenir signatures.
 * Written from general knowledge, not verified sources; doubtful facts are
 * listed in `unsure`.
 */

import type { ProvinceId } from "./ids";
import type { Dialect, ProvinceFacts, Region, Signature } from "./schema";

const DEFAULT_DIALECT: Record<Region, Partial<Record<Dialect, number>>> = {
  north: { muang: 1 },
  northeast: { isan: 1 },
  central: { klang: 1 },
  east: { klang: 1 },
  west: { klang: 1 },
  south: { tai: 1 },
};

const food = (label: string): Signature => ({ label, kind: "food" });
const tradition = (label: string): Signature => ({ label, kind: "tradition" });
const souvenir = (label: string): Signature => ({ label, kind: "souvenir" });

type Extra = Partial<Omit<ProvinceFacts, "name" | "region" | "capital" | "signatures">>;

function province(
  name: string,
  region: Region,
  [lat, lng]: readonly [number, number],
  signatures: ProvinceFacts["signatures"],
  extra: Extra = {},
): ProvinceFacts {
  return {
    name,
    region,
    capital: { lat, lng },
    signatures,
    dialect: extra.dialect ?? DEFAULT_DIALECT[region],
    terrain: extra.terrain ?? 0,
    muslim: extra.muslim ?? 0.005,
    ...(extra.coast ? { coast: extra.coast } : {}),
    ...(extra.border ? { border: extra.border } : {}),
    ...(extra.tags ? { tags: extra.tags } : {}),
    ...(extra.unsure ? { unsure: extra.unsure } : {}),
  };
}

export const PROVINCES: Readonly<Record<ProvinceId, ProvinceFacts>> = {
  // ภาคเหนือ
  "chiang-mai": province("เชียงใหม่", "north", [18.79, 98.98], [tradition("ยี่เป็ง ปล่อยโคมลอย"), souvenir("ร่มบ่อสร้าง"), food("แคบหมูกับน้ำพริกหนุ่ม")], { terrain: 2, border: ["MM"], tags: ["hill-peoples"] }),
  "chiang-rai": province("เชียงราย", "north", [19.91, 99.83], [souvenir("ชาอู่หลงดอยแม่สลอง"), food("สับปะรดนางแล ภูแล"), souvenir("กาแฟดอยช้าง")], { terrain: 2, border: ["MM", "LA"], tags: ["hill-peoples"] }),
  lampang: province("ลำปาง", "north", [18.29, 99.49], [food("ข้าวแต๋นน้ำแตงโม"), souvenir("ชามตราไก่"), food("ขนมจ๊อกลำปาง")], { terrain: 2, unsure: ["signatures"] }),
  lamphun: province("ลำพูน", "north", [18.58, 99.01], [food("ลำไยอบแห้ง"), souvenir("ผ้าไหมยกดอกลำพูน")], { terrain: 1 }),
  "mae-hong-son": province("แม่ฮ่องสอน", "north", [19.3, 97.97], [tradition("ปอยส่างลอง"), food("ข้าวกั๊นจิ๊น"), food("ถั่วเน่าแผ่น")], { terrain: 2, border: ["MM"], tags: ["hill-peoples"] }),
  nan: province("น่าน", "north", [18.78, 100.78], [tradition("แข่งเรือยาวเมืองน่าน"), food("ส้มสีทองน่าน"), souvenir("เกลือภูเขาบ่อเกลือ")], { terrain: 2, border: ["LA"], tags: ["hill-peoples", "boat-race"] }),
  phayao: province("พะเยา", "north", [19.17, 99.9], [food("ปลาส้ม ปลาเผากว๊านพะเยา"), food("ข้าวหอมมะลิพะเยา")], { terrain: 2, border: ["LA"], tags: ["hill-peoples"], unsure: ["signatures"] }),
  phrae: province("แพร่", "north", [18.14, 100.14], [souvenir("เสื้อหม้อห้อม"), souvenir("ไม้สักแกะสลัก")], { terrain: 2 }),
  uttaradit: province("อุตรดิตถ์", "north", [17.62, 100.1], [food("ทุเรียนหลงลับแล"), food("หมี่พันลับแล"), food("ลางสาดลับแล")], { terrain: 1, border: ["LA"], dialect: { klang: 0.5, muang: 0.5 } }),

  // ภาคตะวันออกเฉียงเหนือ
  kalasin: province("กาฬสินธุ์", "northeast", [16.43, 103.51], [souvenir("ผ้าไหมแพรวา"), tradition("วงโปงลาง")], { terrain: 1 }),
  "khon-kaen": province("ขอนแก่น", "northeast", [16.43, 102.83], [food("ไก่ย่างเขาสวนกวาง"), souvenir("ผ้าไหมมัดหมี่ชนบท"), tradition("เทศกาลไหม ผูกเสี่ยว")]),
  chaiyaphum: province("ชัยภูมิ", "northeast", [15.81, 102.03], [tradition("เทศกาลดอกกระเจียว"), souvenir("ผ้าไหมบ้านเขว้า")], { terrain: 1, dialect: { isan: 0.85, klang: 0.15 } }),
  "nakhon-phanom": province("นครพนม", "northeast", [17.41, 104.78], [tradition("ไหลเรือไฟ"), food("อาหารญวน แหนมเนือง ปากหม้อ")], { border: ["LA"] }),
  "nakhon-ratchasima": province("นครราชสีมา", "northeast", [14.97, 102.1], [food("ผัดหมี่โคราช"), souvenir("ผ้าไหมปักธงชัย"), tradition("งานฉลองชัยชนะท้าวสุรนารี")], { terrain: 1, dialect: { klang: 0.5, isan: 0.5 }, tags: ["boat-race"] }),
  "bueng-kan": province("บึงกาฬ", "northeast", [18.36, 103.65], [tradition("บั้งไฟพญานาคริมโขง"), food("ปลาแม่น้ำโขงย่าง")], { terrain: 1, border: ["LA"], unsure: ["signatures"] }),
  buriram: province("บุรีรัมย์", "northeast", [14.99, 103.1], [tradition("ประเพณีขึ้นเขาพนมรุ้ง"), souvenir("ผ้าภูอัคนี ย้อมดินภูเขาไฟ")], { border: ["KH"], dialect: { isan: 0.55, khmer: 0.45 } }),
  "maha-sarakham": province("มหาสารคาม", "northeast", [16.18, 103.3], [tradition("งานนมัสการพระธาตุนาดูน"), souvenir("หมอนขิด เสื่อกก")], { unsure: ["signatures"] }),
  mukdahan: province("มุกดาหาร", "northeast", [16.54, 104.72], [tradition("ฟ้อนภูไท"), souvenir("ผ้าฝ้ายภูไท"), souvenir("ของจากตลาดอินโดจีน")], { terrain: 1, border: ["LA"] }),
  yasothon: province("ยโสธร", "northeast", [15.79, 104.15], [tradition("บุญบั้งไฟยโสธร"), souvenir("หมอนขวานผ้าขิด")]),
  "roi-et": province("ร้อยเอ็ด", "northeast", [16.05, 103.65], [food("ข้าวหอมมะลิทุ่งกุลาร้องไห้"), tradition("บุญผะเหวดร้อยเอ็ด")]),
  loei: province("เลย", "northeast", [17.49, 101.72], [tradition("ผีตาโขน ด่านซ้าย"), food("มะพร้าวแก้วเชียงคาน"), souvenir("ผ้าห่มนวมเชียงคาน")], { terrain: 2, border: ["LA"] }),
  sisaket: province("ศรีสะเกษ", "northeast", [15.12, 104.32], [food("ทุเรียนภูเขาไฟ"), food("หอมแดงศรีสะเกษ"), tradition("เทศกาลดอกลำดวน")], { border: ["KH"], dialect: { isan: 0.65, khmer: 0.35 } }),
  "sakon-nakhon": province("สกลนคร", "northeast", [17.16, 104.15], [souvenir("ผ้าย้อมคราม"), tradition("แห่ปราสาทผึ้ง"), food("เนื้อโคขุนโพนยางคำ")], { terrain: 1 }),
  surin: province("สุรินทร์", "northeast", [14.88, 103.49], [tradition("งานแสดงช้างสุรินทร์"), souvenir("ผ้าไหมสุรินทร์"), food("ข้าวหอมมะลิสุรินทร์")], { border: ["KH"], dialect: { khmer: 0.55, isan: 0.45 } }),
  "nong-khai": province("หนองคาย", "northeast", [17.88, 102.74], [food("แหนมเนืองหนองคาย"), tradition("บั้งไฟพญานาคออกพรรษา")], { border: ["LA"] }),
  "nong-bua-lamphu": province("หนองบัวลำภู", "northeast", [17.2, 102.44], [tradition("งานสมเด็จพระนเรศวรฯ หนองบัวลำภู"), souvenir("ผ้าฝ้ายทอมือหนองบัวลำภู")], { terrain: 1, unsure: ["signatures"] }),
  "amnat-charoen": province("อำนาจเจริญ", "northeast", [15.86, 104.63], [tradition("งานนมัสการพระมงคลมิ่งเมือง"), souvenir("เสื่อกกอำนาจเจริญ")], { border: ["LA"], unsure: ["signatures"] }),
  "udon-thani": province("อุดรธานี", "northeast", [17.42, 102.79], [food("แหนมเนือง ไข่กระทะอุดร"), souvenir("ผ้าขิดนาข่า"), tradition("งานทุ่งศรีเมือง")], { terrain: 1 }),
  "ubon-ratchathani": province("อุบลราชธานี", "northeast", [15.24, 104.85], [tradition("แห่เทียนพรรษา"), food("หมูยออุบล"), food("ข้าวเปียกเส้นอุบล")], { border: ["LA", "KH"] }),

  // ภาคกลาง
  bangkok: province("กรุงเทพมหานคร", "central", [13.75, 100.5], [food("สตรีทฟู้ดเยาวราช"), food("ผัดไทยประตูผี"), tradition("งานวัดภูเขาทอง")], { coast: "gulf", muslim: 0.05, tags: ["chinese"] }),
  "kamphaeng-phet": province("กำแพงเพชร", "central", [16.48, 99.52], [food("กล้วยไข่กำแพงเพชร"), tradition("งานสารทไทยกล้วยไข่")], { terrain: 1 }),
  "chai-nat": province("ชัยนาท", "central", [15.19, 100.13], [food("ส้มโอขาวแตงกวา"), tradition("งานหุ่นฟางนกชัยนาท")], { tags: ["suphan-accent"] }),
  "nakhon-nayok": province("นครนายก", "central", [14.21, 101.21], [food("มะปรางหวาน มะยงชิด"), tradition("งานวันมะปรางหวาน มะยงชิด")], { terrain: 1 }),
  "nakhon-pathom": province("นครปฐม", "central", [13.82, 100.06], [food("ส้มโอนครชัยศรี"), food("ข้าวหลามนครปฐม"), tradition("งานนมัสการองค์พระปฐมเจดีย์")], { tags: ["suphan-accent"] }),
  "nakhon-sawan": province("นครสวรรค์", "central", [15.7, 100.14], [tradition("แห่มังกรตรุษจีนปากน้ำโพ"), souvenir("ขนมโมจิปากน้ำโพ")], { tags: ["chinese"] }),
  nonthaburi: province("นนทบุรี", "central", [13.86, 100.51], [food("ทุเรียนนนท์"), souvenir("หม้อดินเผาเกาะเกร็ด")], { muslim: 0.03, tags: ["mon"] }),
  "pathum-thani": province("ปทุมธานี", "central", [14.02, 100.53], [tradition("ตักบาตรพระร้อยทางเรือ"), food("ข้าวแช่ ขนมแบบมอญ")], { muslim: 0.05, tags: ["mon"] }),
  ayutthaya: province("พระนครศรีอยุธยา", "central", [14.35, 100.57], [food("โรตีสายไหม"), food("กุ้งแม่น้ำเผา")], { muslim: 0.05, tags: ["boat-race"] }),
  phichit: province("พิจิตร", "central", [16.44, 100.35], [food("ส้มโอท่าข่อย"), tradition("แข่งเรือยาวพิจิตร")], { tags: ["boat-race"] }),
  phitsanulok: province("พิษณุโลก", "central", [16.82, 100.26], [food("ก๋วยเตี๋ยวห้อยขา"), souvenir("กล้วยตากบางกระทุ่ม")], { terrain: 1, border: ["LA"], tags: ["boat-race"] }),
  phetchabun: province("เพชรบูรณ์", "central", [16.42, 101.16], [food("มะขามหวานเพชรบูรณ์"), tradition("อุ้มพระดำน้ำ")], { terrain: 2, dialect: { klang: 0.6, isan: 0.4 }, tags: ["hill-peoples"] }),
  lopburi: province("ลพบุรี", "central", [14.8, 100.65], [tradition("โต๊ะจีนเลี้ยงลิง"), souvenir("ดินสอพองลพบุรี")], { terrain: 1 }),
  "samut-prakan": province("สมุทรปราการ", "central", [13.6, 100.6], [tradition("ประเพณีรับบัว บางพลี"), food("ปลาสลิดบางบ่อ")], { coast: "gulf", muslim: 0.05, tags: ["mon"] }),
  "samut-songkhram": province("สมุทรสงคราม", "central", [13.41, 100.0], [food("ปลาทูแม่กลอง"), souvenir("น้ำตาลมะพร้าวอัมพวา")], { coast: "gulf" }),
  "samut-sakhon": province("สมุทรสาคร", "central", [13.55, 100.27], [food("อาหารทะเลมหาชัย"), souvenir("กุ้งแห้ง ปลาเค็มมหาชัย")], { coast: "gulf", tags: ["chinese"] }),
  "sing-buri": province("สิงห์บุรี", "central", [14.89, 100.4], [food("ปลาช่อนแม่ลาเผา"), tradition("งานวีรชนค่ายบางระจัน")], { tags: ["suphan-accent"] }),
  sukhothai: province("สุโขทัย", "central", [17.01, 99.82], [food("ก๋วยเตี๋ยวสุโขทัย"), souvenir("ผ้าซิ่นตีนจกหาดเสี้ยว"), tradition("ลอยกระทง เผาเทียน เล่นไฟ")], { terrain: 1, dialect: { klang: 0.85, muang: 0.15 } }),
  "suphan-buri": province("สุพรรณบุรี", "central", [14.47, 100.12], [souvenir("ขนมสาลี่สุพรรณ"), tradition("เพลงอีแซว")], { tags: ["suphan-accent"] }),
  saraburi: province("สระบุรี", "central", [14.53, 100.91], [tradition("ตักบาตรดอกไม้"), food("นมวัวมวกเหล็ก")], { terrain: 1 }),
  "ang-thong": province("อ่างทอง", "central", [14.59, 100.45], [souvenir("ตุ๊กตาชาววังบางเสด็จ"), souvenir("กลองเอกราช")], { tags: ["suphan-accent"], unsure: ["tags"] }),
  "uthai-thani": province("อุทัยธานี", "central", [15.38, 100.02], [food("ปลาแรดสะแกกรัง"), tradition("ตักบาตรเทโว วัดสังกัสรัตนคีรี")], { terrain: 1, tags: ["suphan-accent"] }),

  // ภาคตะวันออก
  chanthaburi: province("จันทบุรี", "east", [12.61, 102.1], [food("ก๋วยเตี๋ยวเส้นจันท์ผัดปู"), food("ทุเรียน มังคุดจันท์"), souvenir("เสื่อจันทบูร")], { terrain: 1, coast: "gulf", border: ["KH"], tags: ["eastern-accent"] }),
  chachoengsao: province("ฉะเชิงเทรา", "east", [13.69, 101.07], [tradition("งานนมัสการหลวงพ่อโสธร"), food("ปลาช่อนแปดริ้ว"), food("มะม่วงแปดริ้ว")], { coast: "gulf", muslim: 0.05, tags: ["chinese"] }),
  "chon-buri": province("ชลบุรี", "east", [13.36, 100.98], [food("ข้าวหลามหนองมน"), tradition("ประเพณีวิ่งควาย")], { terrain: 1, coast: "gulf", tags: ["chinese", "buffalo-race", "eastern-accent"] }),
  trat: province("ตราด", "east", [12.24, 102.52], [food("ระกำหวาน สละ"), souvenir("กะปิ ปลาเค็มตราด")], { terrain: 1, coast: "gulf", border: ["KH"], tags: ["eastern-accent"], unsure: ["signatures"] }),
  "prachin-buri": province("ปราจีนบุรี", "east", [14.05, 101.37], [souvenir("ยาสมุนไพรอภัยภูเบศร"), food("ทุเรียนปราจีน")], { terrain: 1, dialect: { klang: 0.85, isan: 0.15 } }),
  rayong: province("ระยอง", "east", [12.68, 101.28], [souvenir("น้ำปลา กะปิระยอง"), food("ทุเรียนแกลง")], { terrain: 1, coast: "gulf", tags: ["eastern-accent"] }),
  "sa-kaeo": province("สระแก้ว", "east", [13.82, 102.06], [souvenir("ของจากตลาดโรงเกลือ"), food("มะม่วงส่งออกสระแก้ว")], { terrain: 1, border: ["KH"], dialect: { klang: 0.7, isan: 0.2, khmer: 0.1 }, unsure: ["signatures", "dialect"] }),

  // ภาคตะวันตก
  kanchanaburi: province("กาญจนบุรี", "west", [14.02, 99.53], [tradition("งานสะพานข้ามแม่น้ำแคว"), food("ขนมจีนน้ำยามอญสังขละ")], { terrain: 2, border: ["MM"], tags: ["suphan-accent", "hill-peoples", "mon"] }),
  tak: province("ตาก", "west", [16.88, 99.13], [tradition("ลอยกระทงสายไหลประทีปพันดวง"), food("อาหารพม่าแม่สอด")], { terrain: 2, border: ["MM"], dialect: { klang: 0.5, muang: 0.5 }, tags: ["hill-peoples"] }),
  "prachuap-khiri-khan": province("ประจวบคีรีขันธ์", "west", [11.81, 99.8], [food("สับปะรดสามร้อยยอด"), food("หมึกแดดเดียวหัวหิน"), food("มะพร้าวทับสะแก")], { terrain: 2, coast: "gulf", border: ["MM"], dialect: { klang: 0.9, tai: 0.1 } }),
  phetchaburi: province("เพชรบุรี", "west", [13.11, 99.94], [food("ขนมหม้อแกงเมืองเพชร"), tradition("ประเพณีวัวลาน")], { terrain: 1, coast: "gulf", border: ["MM"], tags: ["suphan-accent"] }),
  ratchaburi: province("ราชบุรี", "west", [13.54, 99.82], [souvenir("โอ่งมังกร"), souvenir("ผ้าจกคูบัว")], { terrain: 1, border: ["MM"], tags: ["suphan-accent", "chinese", "mon"] }),

  // ภาคใต้
  krabi: province("กระบี่", "south", [8.09, 98.91], [tradition("ลอยเรือชาวเล"), souvenir("ผ้าบาติกกระบี่")], { terrain: 2, coast: "andaman", muslim: 0.35, tags: ["jay-festival"] }),
  chumphon: province("ชุมพร", "south", [10.49, 99.18], [souvenir("กาแฟชุมพร"), food("กล้วยเล็บมือนางชุมพร")], { terrain: 1, coast: "gulf", border: ["MM"], dialect: { tai: 0.8, klang: 0.2 } }),
  trang: province("ตรัง", "south", [7.56, 99.61], [food("หมูย่างเมืองตรัง"), food("ติ่มซำร้านกาแฟตอนเช้า"), souvenir("ขนมเค้กเมืองตรัง")], { terrain: 1, coast: "andaman", muslim: 0.15, tags: ["chinese", "jay-festival", "dimsum-breakfast", "bullfight"] }),
  "nakhon-si-thammarat": province("นครศรีธรรมราช", "south", [8.43, 99.96], [tradition("แห่ผ้าขึ้นธาตุ"), tradition("สารทเดือนสิบเมืองคอน"), souvenir("เครื่องถมนคร")], { terrain: 1, coast: "gulf", muslim: 0.06, tags: ["bullfight"] }),
  narathiwat: province("นราธิวาส", "south", [6.43, 101.82], [food("ลองกองตันหยงมัส"), souvenir("เรือกอและ"), food("ปลากุเลาเค็มตากใบ")], { terrain: 1, coast: "gulf", border: ["MY"], muslim: 0.82, dialect: { malay: 0.8, tai: 0.2 }, tags: ["dove-contest", "boat-race"] }),
  pattani: province("ปัตตานี", "south", [6.87, 101.25], [food("ข้าวยำ ไก่กอและ"), tradition("งานสมโภชเจ้าแม่ลิ้มกอเหนี่ยว")], { coast: "gulf", muslim: 0.85, dialect: { malay: 0.75, tai: 0.25 }, tags: ["dove-contest"] }),
  "phang-nga": province("พังงา", "south", [8.45, 98.53], [food("กาหยู เม็ดมะม่วงหิมพานต์"), tradition("ถือศีลกินผักตะกั่วป่า")], { terrain: 2, coast: "andaman", muslim: 0.25, tags: ["jay-festival"], unsure: ["signatures"] }),
  phatthalung: province("พัทลุง", "south", [7.62, 100.08], [food("ข้าวสังข์หยด"), souvenir("กระจูดทะเลน้อย"), tradition("แข่งโพนลากพระ")], { terrain: 1, muslim: 0.1, tags: ["bullfight"] }),
  phuket: province("ภูเก็ต", "south", [7.88, 98.39], [food("หมี่ฮกเกี้ยน โอ้เอ๋ว"), tradition("ถือศีลกินผักภูเก็ต"), souvenir("ขนมเต้าส้อ")], { terrain: 1, coast: "andaman", muslim: 0.1, tags: ["chinese", "jay-festival", "dimsum-breakfast"] }),
  yala: province("ยะลา", "south", [6.54, 101.28], [food("ไก่เบตง"), food("บะหมี่หยกเบตง"), tradition("แข่งนกเขาชวาเสียงยะลา")], { terrain: 2, border: ["MY"], muslim: 0.75, dialect: { malay: 0.65, tai: 0.35 }, tags: ["dove-contest", "dimsum-breakfast", "chinese"], unsure: ["tags"] }),
  ranong: province("ระนอง", "south", [9.96, 98.64], [food("เม็ดกาหยูระนอง"), food("ขนมจีนแกงปูระนอง")], { terrain: 2, coast: "andaman", border: ["MM"], muslim: 0.15, dialect: { tai: 0.9, klang: 0.1 }, unsure: ["signatures"] }),
  songkhla: province("สงขลา", "south", [7.19, 100.6], [food("ไก่ทอดหาดใหญ่"), food("ปลากะพงทะเลสาบสงขลา")], { terrain: 1, coast: "gulf", border: ["MY"], muslim: 0.3, dialect: { tai: 0.9, malay: 0.1 }, tags: ["chinese", "dimsum-breakfast", "bullfight"] }),
  satun: province("สตูล", "south", [6.62, 100.07], [tradition("ลอยเรือชาวเลหลีเป๊ะ"), food("ข้าวหมกไก่ แกงแพะสตูล")], { terrain: 1, coast: "andaman", border: ["MY"], muslim: 0.75, dialect: { tai: 0.9, malay: 0.1 }, unsure: ["signatures"] }),
  "surat-thani": province("สุราษฎร์ธานี", "south", [9.14, 99.33], [food("หอยนางรมสุราษฎร์"), food("เงาะโรงเรียน"), tradition("ชักพระ ทอดผ้าป่า")], { terrain: 1, coast: "gulf", muslim: 0.04, tags: ["boat-race"] }),
};
