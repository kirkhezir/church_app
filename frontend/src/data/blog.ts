/**
 * Blog/News static data
 *
 * Centralized blog post data for Blog and BlogDetail pages.
 * TODO: Replace with API call to blogService.getAll() when backend is ready.
 */

export interface BlogPost {
  id: string;
  title: string;
  titleThai: string;
  excerpt: string;
  excerptThai: string;
  content: string;
  contentThai: string;
  author: string;
  date: string;
  category: string;
  categoryThai: string;
  image: string;
  featured?: boolean;
  readTime: number;
}

export const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Youth Camp 2026 Registration Now Open!',
    titleThai: 'เปิดลงทะเบียนค่ายเยาวชน 2026 แล้ว!',
    excerpt:
      'Join us for an unforgettable weekend of spiritual growth, fellowship, and adventure. Early bird registration is available until March 1st.',
    excerptThai:
      'ร่วมสุดสัปดาห์ที่ไม่มีวันลืมของการเติบโตฝ่ายจิตวิญญาณ สามัคคีธรรม และการผจญภัย ลงทะเบียนล่วงหน้าถึงวันที่ 1 มีนาคม',
    content: `Join us for an unforgettable weekend of spiritual growth, fellowship, and adventure at Youth Camp 2026! This year's theme is "Rooted in Faith" based on Colossians 2:6-7.

Early bird registration is available until March 1st with a special discounted rate. The camp will feature inspiring speakers, worship sessions, outdoor adventures, and team-building activities designed to strengthen your faith and build lasting friendships.

**What to Expect:**
- Dynamic worship sessions with live music
- Inspiring messages from guest speakers
- Outdoor adventures including hiking and team challenges
- Small group Bible studies
- Fellowship meals and bonfire nights
- Creative workshops and talent show

**Registration Details:**
- Early Bird (before March 1): ฿500 per person
- Regular (March 1-15): ฿700 per person
- Family discount: 10% off for 3+ family members

Space is limited to 60 participants, so register early to secure your spot! Contact Brother Prasert or the Youth Ministry team for more information.`,
    contentThai: `ร่วมสุดสัปดาห์ที่ไม่มีวันลืมของการเติบโตฝ่ายจิตวิญญาณ สามัคคีธรรม และการผจญภัยที่ค่ายเยาวชน 2026! ธีมของปีนี้คือ "หยั่งรากในความเชื่อ" จากโคโลสี 2:6-7

ลงทะเบียนล่วงหน้าถึงวันที่ 1 มีนาคม พร้อมส่วนลดพิเศษ ค่ายจะมีวิทยากรที่สร้างแรงบันดาลใจ การนมัสการ การผจญภัยกลางแจ้ง และกิจกรรมสร้างทีมที่ออกแบบมาเพื่อเสริมสร้างความเชื่อและมิตรภาพที่ยั่งยืน

**สิ่งที่คาดหวัง:**
- การนมัสการแบบไดนามิกพร้อมดนตรีสด
- ข่าวสารที่สร้างแรงบันดาลใจจากวิทยากรรับเชิญ
- การผจญภัยกลางแจ้งรวมถึงการเดินป่าและความท้าทายของทีม
- การศึกษาพระคัมภีร์กลุ่มเล็ก
- อาหารสามัคคีธรรมและคืนกองไฟ
- เวิร์กช็อปสร้างสรรค์และการแสดงความสามารถ

**รายละเอียดการลงทะเบียน:**
- ล่วงหน้า (ก่อน 1 มีนาคม): ฿500 ต่อคน
- ปกติ (1-15 มีนาคม): ฿700 ต่อคน
- ส่วนลดครอบครัว: ลด 10% สำหรับสมาชิก 3+ คน

จำนวนจำกัด 60 คน ลงทะเบียนล่วงหน้าเพื่อรับรองที่นั่ง! ติดต่อบราเดอร์ประเสริฐหรือทีมแผนกเยาวชนสำหรับข้อมูลเพิ่มเติม`,
    author: 'Youth Ministry',
    date: '2026-01-28',
    category: 'Announcement',
    categoryThai: 'ประกาศ',
    image: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800&q=80',
    featured: true,
    readTime: 3,
  },
  {
    id: '2',
    title: 'Testimony: How God Changed My Life',
    titleThai: 'คำพยาน: พระเจ้าเปลี่ยนแปลงชีวิตฉันอย่างไร',
    excerpt:
      'Sister Nok shares her powerful testimony of how she found Jesus and experienced transformation through His love and grace.',
    excerptThai:
      'ซิสเตอร์นกแบ่งปันคำพยานอันทรงพลังของเธอว่าเธอพบพระเยซูและประสบการเปลี่ยนแปลงผ่านความรักและพระคุณของพระองค์อย่างไร',
    content: `Sister Nok shares her powerful testimony of how she found Jesus and experienced transformation through His love and grace.

Growing up in a small village in northern Thailand, Nok never imagined her life would take such a dramatic turn. "I was searching for meaning," she recalls, "going through the motions of life without any real purpose."

It was through a friend's invitation to a Bible study group that everything changed. "The words of Scripture spoke directly to my heart," Nok says. "For the first time, I felt truly loved and accepted."

After months of studying the Bible and attending church services, Nok made the decision to be baptized. "It was the best decision I've ever made," she says with tears of joy. "God has completely transformed my life — my relationships, my outlook, my purpose."

Today, Nok is an active member of our church family, serving in the Women's Ministry and helping to organize community outreach programs. Her story is a powerful reminder that God's love can reach anyone, anywhere.

"If you're searching for something more in life," Nok encourages, "I invite you to give Jesus a chance. He changed my life, and He can change yours too."`,
    contentThai: `ซิสเตอร์นกแบ่งปันคำพยานอันทรงพลังของเธอว่าเธอพบพระเยซูและประสบการเปลี่ยนแปลงผ่านความรักและพระคุณของพระองค์อย่างไร

เติบโตในหมู่บ้านเล็กๆ ในภาคเหนือของประเทศไทย นกไม่เคยคิดว่าชีวิตของเธอจะเปลี่ยนแปลงอย่างมาก "ฉันกำลังค้นหาความหมาย" เธอเล่า "ใช้ชีวิตไปวันๆ โดยไม่มีจุดมุ่งหมายที่แท้จริง"

มันเป็นการเชิญชวนจากเพื่อนไปกลุ่มศึกษาพระคัมภีร์ที่ทุกอย่างเปลี่ยนไป "พระวจนะพูดตรงเข้าหัวใจฉัน" นกบอก "ครั้งแรกที่ฉันรู้สึกว่าได้รับความรักและการยอมรับอย่างแท้จริง"

หลังจากศึกษาพระคัมภีร์หลายเดือนและเข้าร่วมพิธีนมัสการ นกตัดสินใจรับบัพติศมา "มันเป็นการตัดสินใจที่ดีที่สุดที่ฉันเคยทำ" เธอพูดด้วยน้ำตาแห่งความยินดี "พระเจ้าเปลี่ยนแปลงชีวิตฉันทั้งหมด — ความสัมพันธ์ มุมมอง จุดมุ่งหมาย"

วันนี้ นกเป็นสมาชิกที่กระตือรือร้นของครอบครัวโบสถ์ รับใช้ในแผนกสตรีและช่วยจัดโปรแกรมเข้าถึงชุมชน เรื่องราวของเธอเป็นเครื่องเตือนใจอันทรงพลังว่าความรักของพระเจ้าสามารถเข้าถึงทุกคน ทุกที่

"ถ้าคุณกำลังค้นหาอะไรบางอย่างมากขึ้นในชีวิต" นกให้กำลังใจ "ฉันเชิญคุณให้โอกาสพระเยซู พระองค์เปลี่ยนชีวิตฉัน และพระองค์สามารถเปลี่ยนชีวิตคุณได้เช่นกัน"`,
    author: 'Sister Nok',
    date: '2026-01-25',
    category: 'Testimony',
    categoryThai: 'คำพยาน',
    image: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=800&q=80',
    featured: true,
    readTime: 5,
  },
  {
    id: '3',
    title: 'Mission Report: Thailand Mission Field Update',
    titleThai: 'รายงานมิชชั่น: อัปเดตสนามมิชชั่นประเทศไทย',
    excerpt:
      'Read about the progress of our mission work in northern Thailand and how your prayers and offerings are making a difference.',
    excerptThai:
      'อ่านเกี่ยวกับความก้าวหน้าของงานมิชชั่นในภาคเหนือของประเทศไทยและคำอธิษฐานและเงินถวายของคุณสร้างความแตกต่างอย่างไร',
    content: `Read about the progress of our mission work in northern Thailand and how your prayers and offerings are making a difference.

Our mission team recently returned from a two-week outreach program in Chiang Rai province, where they conducted health screenings, Bible studies, and community service projects.

**Key Highlights:**
- Over 200 community members received free health screenings
- 15 Bible study groups were established in 3 villages
- A new community garden project was launched to help families grow nutritious food
- Educational materials were distributed to local schools
- 8 individuals expressed interest in learning more about the Adventist faith

The team also helped repair a local school building damaged during the rainy season and provided food supplies to families in need.

"The people were so welcoming and eager to learn," reports Team Leader Brother Wichai. "We saw God working in powerful ways throughout the entire trip."

Your continued prayers and financial support make these mission trips possible. If you'd like to support our next mission project or join the team, please contact the Mission Department.`,
    contentThai: `อ่านเกี่ยวกับความก้าวหน้าของงานมิชชั่นในภาคเหนือของประเทศไทยและคำอธิษฐานและเงินถวายของคุณสร้างความแตกต่างอย่างไร

ทีมมิชชั่นของเราเพิ่งกลับจากโปรแกรมเข้าถึงสองสัปดาห์ในจังหวัดเชียงราย ซึ่งพวกเขาจัดการตรวจสุขภาพ กลุ่มศึกษาพระคัมภีร์ และโครงการบริการชุมชน

**ไฮไลท์สำคัญ:**
- สมาชิกชุมชนมากกว่า 200 คนได้รับการตรวจสุขภาพฟรี
- จัดตั้งกลุ่มศึกษาพระคัมภีร์ 15 กลุ่มใน 3 หมู่บ้าน
- เปิดตัวโครงการสวนชุมชนเพื่อช่วยครอบครัวปลูกอาหารที่มีคุณค่าทางโภชนาการ
- แจกจ่ายสื่อการศึกษาให้โรงเรียนท้องถิ่น
- 8 คนแสดงความสนใจในการเรียนรู้เพิ่มเติมเกี่ยวกับความเชื่อแอดเวนติสต์

ทีมยังช่วยซ่อมแซมอาคารโรงเรียนท้องถิ่นที่เสียหายในช่วงฤดูฝนและจัดหาเสบียงอาหารให้ครอบครัวที่ต้องการ

"ผู้คนให้การต้อนรับอย่างดีและกระตือรือร้นที่จะเรียนรู้" บราเดอร์วิชัยหัวหน้าทีมรายงาน "เราเห็นพระเจ้าทำงานอย่างทรงพลังตลอดทั้งทริป"

คำอธิษฐานและการสนับสนุนทางการเงินของคุณทำให้ทริปมิชชั่นเหล่านี้เป็นไปได้ หากคุณต้องการสนับสนุนโครงการมิชชั่นต่อไปหรือเข้าร่วมทีม กรุณาติดต่อแผนกมิชชั่น`,
    author: 'Mission Department',
    date: '2026-01-22',
    category: 'Missions',
    categoryThai: 'มิชชั่น',
    image: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800&q=80',
    readTime: 7,
  },
  {
    id: '4',
    title: 'Health Tips: Starting Your Plant-Based Journey',
    titleThai: 'เคล็ดลับสุขภาพ: เริ่มต้นการกินอาหารจากพืช',
    excerpt:
      'Discover the benefits of a plant-based diet and get practical tips for transitioning to healthier eating habits.',
    excerptThai:
      'ค้นพบประโยชน์ของอาหารจากพืชและรับเคล็ดลับปฏิบัติสำหรับการเปลี่ยนไปสู่นิสัยการกินที่ดีต่อสุขภาพ',
    content: `Discover the benefits of a plant-based diet and get practical tips for transitioning to healthier eating habits.

Seventh-day Adventists have long been advocates of a healthy lifestyle, and research consistently shows that a plant-based diet can lead to longer, healthier lives.

**Benefits of Plant-Based Eating:**
- Lower risk of heart disease and diabetes
- Better weight management
- Improved digestive health
- More energy and better sleep
- Environmental sustainability

**Getting Started:**
1. Start with one plant-based meal per day
2. Explore Thai vegetarian dishes — many are naturally plant-based
3. Stock your kitchen with whole grains, legumes, and fresh produce
4. Try new recipes each week
5. Don't aim for perfection — every plant-based meal counts

**Easy Thai Plant-Based Recipes to Try:**
- Pad Thai with tofu
- Green curry with vegetables
- Som Tam (papaya salad)
- Tom Kha (coconut soup) with mushrooms
- Mango sticky rice (a delicious dessert!)

The Health Ministry will be hosting a plant-based cooking class next month. Stay tuned for details!`,
    contentThai: `ค้นพบประโยชน์ของอาหารจากพืชและรับเคล็ดลับปฏิบัติสำหรับการเปลี่ยนไปสู่นิสัยการกินที่ดีต่อสุขภาพ

เซเว่นเดย์แอดเวนติสต์เป็นผู้สนับสนุนวิถีชีวิตสุขภาพดีมายาวนาน และการวิจัยแสดงให้เห็นอย่างสม่ำเสมอว่าอาหารจากพืชสามารถนำไปสู่ชีวิตที่ยืนยาวและมีสุขภาพดีขึ้น

**ประโยชน์ของการกินอาหารจากพืช:**
- ลดความเสี่ยงของโรคหัวใจและเบาหวาน
- จัดการน้ำหนักได้ดีขึ้น
- สุขภาพทางเดินอาหารดีขึ้น
- มีพลังงานมากขึ้นและนอนหลับดีขึ้น
- ความยั่งยืนของสิ่งแวดล้อม

**เริ่มต้น:**
1. เริ่มด้วยมื้ออาหารจากพืชหนึ่งมื้อต่อวัน
2. สำรวจอาหารมังสวิรัติไทย — หลายเมนูเป็นอาหารจากพืชตามธรรมชาติ
3. เติมครัวของคุณด้วยธัญพืชเต็มเมล็ด ถั่ว และผักผลไม้สด
4. ลองสูตรใหม่ทุกสัปดาห์
5. อย่ามุ่งหวังความสมบูรณ์แบบ — ทุกมื้ออาหารจากพืชมีค่า

**สูตรอาหารไทยจากพืชที่ง่าย:**
- ผัดไทยเต้าหู้
- แกงเขียวหวานผัก
- ส้มตำ (สลัดมะละกอ)
- ต้มข่าเห็ด
- ข้าวเหนียวมะม่วง (ของหวานอร่อย!)

แผนกสุขภาพจะจัดชั้นเรียนทำอาหารจากพืชในเดือนหน้า รอติดตามรายละเอียด!`,
    author: 'Health Ministry',
    date: '2026-01-20',
    category: 'Health',
    categoryThai: 'สุขภาพ',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80',
    readTime: 6,
  },
  {
    id: '5',
    title: 'Baptism Sabbath: Celebrating New Members',
    titleThai: 'สะบาโตบัพติศมา: ฉลองสมาชิกใหม่',
    excerpt:
      'We rejoice with three new members who publicly declared their faith through baptism last Sabbath.',
    excerptThai:
      'เราชื่นชมยินดีกับสมาชิกใหม่สามคนที่ประกาศความเชื่อต่อสาธารณะผ่านบัพติศมาเมื่อวันสะบาโตที่แล้ว',
    content: `We rejoice with three new members who publicly declared their faith through baptism last Sabbath. It was a beautiful celebration of God's transforming power.

The three new members — Brother Somchai, Sister Ploy, and Brother Krit — each shared their personal testimony before their baptism, moving the congregation to tears of joy.

Brother Somchai, a retired teacher, shared how studying the Sabbath School lessons brought him closer to God. Sister Ploy, a university student, told of finding a church family that accepts and loves her unconditionally. Brother Krit, a local business owner, spoke of how prayer changed his perspective on life and business.

Pastor Reben officiated the beautiful ceremony, reminding us all that baptism is a public declaration of our faith and commitment to follow Jesus.

After the baptism, the church family celebrated with a fellowship lunch prepared by the Deaconesses' Ministry. It was a day filled with joy, love, and spiritual renewal for everyone present.

Welcome to the family, Brother Somchai, Sister Ploy, and Brother Krit! We praise God for your decision and look forward to growing together in faith.`,
    contentThai: `เราชื่นชมยินดีกับสมาชิกใหม่สามคนที่ประกาศความเชื่อต่อสาธารณะผ่านบัพติศมาเมื่อวันสะบาโตที่แล้ว เป็นการเฉลิมฉลองที่สวยงามของพลังการเปลี่ยนแปลงของพระเจ้า

สมาชิกใหม่ทั้งสาม — บราเดอร์สมชาย ซิสเตอร์พลอย และบราเดอร์กฤษณ์ — แต่ละคนแบ่งปันคำพยานส่วนตัวก่อนบัพติศมา ทำให้ชุมชนซาบซึ้งจนหลั่งน้ำตาแห่งความชื่นชมยินดี

บราเดอร์สมชาย ครูเกษียณ แบ่งปันว่าการศึกษาบทเรียนโรงเรียนสะบาโตนำเขาเข้าใกล้พระเจ้ามากขึ้น ซิสเตอร์พลอย นักศึกษามหาวิทยาลัย เล่าเรื่องการค้นพบครอบครัวโบสถ์ที่ยอมรับและรักเธออย่างไม่มีเงื่อนไข บราเดอร์กฤษณ์ เจ้าของธุรกิจท้องถิ่น พูดถึงการอธิษฐานเปลี่ยนมุมมองของเขาต่อชีวิตและธุรกิจ

ศจ. รีเบ็นเป็นประธานพิธีอันสวยงาม เตือนเราทุกคนว่าบัพติศมาคือการประกาศความเชื่อและการอุทิศตัวเพื่อติดตามพระเยซูต่อสาธารณะ

หลังบัพติศมา ครอบครัวโบสถ์เฉลิมฉลองด้วยอาหารกลางวันสามัคคีธรรมที่เตรียมโดยแผนกมัคนายิกา เป็นวันที่เต็มไปด้วยความชื่นชมยินดี ความรัก และการฟื้นฟูจิตวิญญาณสำหรับทุกคนที่อยู่

ยินดีต้อนรับสู่ครอบครัว บราเดอร์สมชาย ซิสเตอร์พลอย และบราเดอร์กฤษณ์! เราสรรเสริญพระเจ้าสำหรับการตัดสินใจของคุณและตื่นเต้นที่จะเติบโตด้วยกันในความเชื่อ`,
    author: 'Church Clerk',
    date: '2026-01-18',
    category: 'News',
    categoryThai: 'ข่าว',
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80',
    readTime: 4,
  },
  {
    id: '6',
    title: "Sabbath School: This Week's Lesson Overview",
    titleThai: 'โรงเรียนสะบาโต: ภาพรวมบทเรียนสัปดาห์นี้',
    excerpt:
      "A summary of this week's Adult Sabbath School lesson with discussion questions and key takeaways.",
    excerptThai: 'สรุปบทเรียนโรงเรียนสะบาโตผู้ใหญ่สัปดาห์นี้พร้อมคำถามอภิปรายและประเด็นสำคัญ',
    content: `A summary of this week's Adult Sabbath School lesson with discussion questions and key takeaways.

**This Week's Lesson: "The Promise of Rest"**
Memory Text: "Come to me, all you who are weary and burdened, and I will give you rest." — Matthew 11:28

**Key Points:**
1. God's rest is more than physical — it is spiritual peace and assurance
2. The Sabbath is a weekly reminder of God's promise of rest
3. True rest comes from trusting God completely with our lives
4. Rest in God frees us from anxiety about the future

**Discussion Questions:**
- What does "rest" mean to you in your daily life?
- How does keeping the Sabbath provide rest in a busy world?
- What areas of your life do you need to surrender to God for true rest?
- How can we share the gift of rest with others who are struggling?

**Practical Application:**
This week, try to identify one area of worry or stress in your life and intentionally give it to God in prayer. Practice resting in His promises throughout the week.

Join us this Sabbath at 9:00 AM for a deeper discussion of these themes in our Sabbath School classes.`,
    contentThai: `สรุปบทเรียนโรงเรียนสะบาโตผู้ใหญ่สัปดาห์นี้พร้อมคำถามอภิปรายและประเด็นสำคัญ

**บทเรียนสัปดาห์นี้: "สัญญาแห่งการหยุดพัก"**
ข้อท่องจำ: "จงมาหาเรา ท่านทุกคนที่เหนื่อยล้าและแบกภาระหนัก และเราจะให้ท่านพักผ่อน" — มัทธิว 11:28

**ประเด็นสำคัญ:**
1. การพักผ่อนของพระเจ้ามากกว่าทางกายภาพ — เป็นสันติสุขและความมั่นใจฝ่ายจิตวิญญาณ
2. วันสะบาโตเป็นเครื่องเตือนใจรายสัปดาห์ถึงสัญญาการพักผ่อนของพระเจ้า
3. การพักผ่อนที่แท้จริงมาจากการไว้วางใจพระเจ้าอย่างสมบูรณ์กับชีวิตของเรา
4. การพักผ่อนในพระเจ้าปลดปล่อยเราจากความวิตกกังวลเกี่ยวกับอนาคต

**คำถามอภิปราย:**
- "การพักผ่อน" หมายความว่าอย่างไรในชีวิตประจำวันของคุณ?
- การรักษาวันสะบาโตให้การพักผ่อนในโลกที่ยุ่งวุ่นอย่างไร?
- คุณต้องมอบด้านไหนของชีวิตให้พระเจ้าเพื่อการพักผ่อนที่แท้จริง?
- เราจะแบ่งปันของขวัญแห่งการพักผ่อนกับผู้อื่นที่กำลังดิ้นรนได้อย่างไร?

**การประยุกต์ใช้จริง:**
สัปดาห์นี้ ลองระบุหนึ่งด้านของความกังวลหรือความเครียดในชีวิตและตั้งใจมอบให้พระเจ้าในการอธิษฐาน ฝึกพักผ่อนในสัญญาของพระองค์ตลอดสัปดาห์

ร่วมกับเราในวันสะบาโตนี้เวลา 9:00 น. สำหรับการอภิปรายเชิงลึกในชั้นเรียนโรงเรียนสะบาโต`,
    author: 'Sabbath School',
    date: '2026-01-15',
    category: 'Education',
    categoryThai: 'การศึกษา',
    image: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=800&q=80',
    readTime: 8,
  },
];

export const blogCategories = [
  { id: 'all', name: 'All', nameThai: 'ทั้งหมด' },
  { id: 'Announcement', name: 'Announcements', nameThai: 'ประกาศ' },
  { id: 'Testimony', name: 'Testimonies', nameThai: 'คำพยาน' },
  { id: 'Missions', name: 'Missions', nameThai: 'มิชชั่น' },
  { id: 'News', name: 'News', nameThai: 'ข่าว' },
  { id: 'Education', name: 'Education', nameThai: 'การศึกษา' },
];
