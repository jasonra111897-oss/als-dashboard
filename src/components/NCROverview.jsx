import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  getDivisionBadge,
  getDivisionDisplayName,
  getDivisionLogoClassName,
  getDivisionLogoSrc,
} from "../constants/divisions";
import { fetchDepedNews } from "../services/dataService";
import "./NCROverview.css";

const formatStoryDate = (value) => {
  if (!value) {
    return "Latest update";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const buildStorySummary = (value = "") => {
  const normalized = String(value).trim();

  if (!normalized) {
    return "Open the official story to read the full update.";
  }

  if (normalized.length <= 170) {
    return normalized;
  }

  return `${normalized.slice(0, 167).trimEnd()}...`;
};

const HONORING_FATHERS_DAY_GALLERY = [
  "/Honoringfathersday/726380982_1504590830603127_900802355375602969_n.jpg",
  "/Honoringfathersday/727083959_2063879117568729_560219167064017442_n.jpg",
  "/Honoringfathersday/727287757_1032909639085614_8579340092073770805_n.jpg",
  "/Honoringfathersday/727449555_1543260694042276_3488490305029441069_n.jpg",
  "/Honoringfathersday/727479477_930845456644086_7204626859095820789_n.jpg",
  "/Honoringfathersday/727572278_1380564664132926_2407132139371404738_n.jpg",
  "/Honoringfathersday/727642099_2013378892605809_7027084627115443307_n.jpg",
  "/Honoringfathersday/727671492_908735545588455_6239022575449179611_n.jpg",
  "/Honoringfathersday/728020839_984903774390905_510252302406302283_n.jpg",
  "/Honoringfathersday/728094411_1455852556563147_5613469989848509887_n.jpg",
  "/Honoringfathersday/728196321_1723666245729181_8541640828152614854_n.jpg",
  "/Honoringfathersday/728305795_1738273467593686_5872754271719358707_n.jpg",
  "/Honoringfathersday/728504026_1539105664280931_7521275997503249937_n.jpg",
  "/Honoringfathersday/728544025_899821419812659_4066986521524238983_n.jpg",
  "/Honoringfathersday/728580742_2034453033863850_2394762322006009133_n.jpg",
  "/Honoringfathersday/728607549_1202528569608015_944193203900685075_n.jpg",
  "/Honoringfathersday/728772548_1023591693440834_8606225632738816384_n.jpg",
  "/Honoringfathersday/728783794_26759965693682620_4792748590036651395_n.jpg",
  "/Honoringfathersday/728913109_1333808115500422_7244175443065483072_n.jpg",
  "/Honoringfathersday/729186215_818652561185537_7130779567543121076_n.jpg",
];

const GROUNDWORK_FOR_RESILIENCE_GALLERY = [
  "/groundworkforresilience/725214260_1349754967106430_8415455198178305156_n.jpg",
  "/groundworkforresilience/725627050_955396944147363_1979685533678529119_n.jpg",
  "/groundworkforresilience/725838998_1027993572903580_4387277568693124087_n.jpg",
  "/groundworkforresilience/726270089_3166823166844790_6234316655041944830_n.jpg",
  "/groundworkforresilience/726373212_2824680301224452_3292292775655415602_n.jpg",
  "/groundworkforresilience/726432654_1636463714091172_6892171362384361890_n.jpg",
  "/groundworkforresilience/726955239_2252681192209218_8627446067726144608_n.jpg",
  "/groundworkforresilience/726988836_1740200773783138_7736495484499464324_n.jpg",
  "/groundworkforresilience/727158771_1354901496740958_276409240214025497_n.jpg",
  "/groundworkforresilience/727159771_2625582407857794_5826906342933039134_n.jpg",
  "/groundworkforresilience/727190410_1536319668082778_7893762050400860732_n.jpg",
  "/groundworkforresilience/727243682_1550146316623807_7842789322850824724_n.jpg",
  "/groundworkforresilience/727268510_3452126878280073_1442665417029403845_n.jpg",
  "/groundworkforresilience/727314336_1759622081865146_6439669651870853379_n.jpg",
  "/groundworkforresilience/727323162_988116280499649_757780275314677163_n.jpg",
  "/groundworkforresilience/727394388_1653367305723135_2351993873428974978_n.jpg",
  "/groundworkforresilience/727737417_1305713094883213_5986049117430824488_n.jpg",
  "/groundworkforresilience/727773619_2804619756578706_9093127729190516084_n.jpg",
  "/groundworkforresilience/728070512_1520678766274314_6576930642142656383_n.jpg",
  "/groundworkforresilience/728152509_1480604060417576_6577242718885400678_n.jpg",
  "/groundworkforresilience/728213163_1537956757820721_1145987263994206977_n.jpg",
  "/groundworkforresilience/728399832_1366762755332763_89610006486415117_n.jpg",
  "/groundworkforresilience/728463257_1047999294568626_6280199404604967497_n.jpg",
  "/groundworkforresilience/728828241_1732152321297758_4836453153760409151_n.jpg",
];

const PALARONG_PAMBANSA_2026_GALLERY = [
  "/2026palarongpambansa/724831988_1654658345825268_95529195957875420_n.jpg",
  "/2026palarongpambansa/725173153_2419705155165945_1064880031150101960_n.jpg",
  "/2026palarongpambansa/725518670_1721290839024076_3480954207374287784_n.jpg",
  "/2026palarongpambansa/725574156_2108365746689101_6806807825641082704_n.jpg",
  "/2026palarongpambansa/725626659_27310344218584587_4197278112927099263_n.jpg",
  "/2026palarongpambansa/725689909_1318681633723900_116643651738431436_n.jpg",
  "/2026palarongpambansa/725714384_2502043303574596_6178930709278080195_n.jpg",
  "/2026palarongpambansa/725756365_1829861217976342_4890262207171034613_n.jpg",
  "/2026palarongpambansa/726002171_857906584048977_684383240725155853_n.jpg",
  "/2026palarongpambansa/726061573_27850998841185152_786892768579049573_n.jpg",
  "/2026palarongpambansa/726247580_1733534318091399_6261323132201628464_n.jpg",
  "/2026palarongpambansa/726294989_1000002072744715_9173303484493346971_n.jpg",
  "/2026palarongpambansa/726307549_2075504653395494_4077700247825477255_n.jpg",
  "/2026palarongpambansa/726307984_1872244653732783_6548780656468459258_n.jpg",
  "/2026palarongpambansa/726307992_1015541814293713_1071815119632714969_n.jpg",
  "/2026palarongpambansa/726316060_1175511301406168_4323131965409497010_n.jpg",
  "/2026palarongpambansa/726350034_2203429320404275_3221895203241605671_n.jpg",
  "/2026palarongpambansa/726367620_2798903940496692_1726495892356287303_n.jpg",
  "/2026palarongpambansa/726432454_874130425156896_1665308957125508148_n.jpg",
  "/2026palarongpambansa/726440625_940296655697563_800163342096991510_n.jpg",
  "/2026palarongpambansa/726517082_2222910308498188_9188890158137813864_n.jpg",
  "/2026palarongpambansa/726527368_1020347823880598_8767821645325531554_n.jpg",
  "/2026palarongpambansa/726576412_1019699807122814_3566267033161143899_n.jpg",
  "/2026palarongpambansa/726576414_1535467238035750_867984380765573256_n.jpg",
  "/2026palarongpambansa/726622630_2027712324784530_4214649460075690639_n.jpg",
  "/2026palarongpambansa/726645507_1595170648797802_7907273390649295998_n.jpg",
  "/2026palarongpambansa/726645507_3960143764127611_894741086452238176_n.jpg",
  "/2026palarongpambansa/726660371_1331899921615169_8880219104782801006_n.jpg",
  "/2026palarongpambansa/726660373_1888322859205445_7168910602898877833_n.jpg",
  "/2026palarongpambansa/726955241_882284684282284_2545934562951548316_n.jpg",
  "/2026palarongpambansa/727268506_968306766023823_903301810848575517_n.jpg",
  "/2026palarongpambansa/727268510_1705066203957460_1694679968534573834_n.jpg",
  "/2026palarongpambansa/727276639_4451061881888023_1793588179609151034_n.jpg",
  "/2026palarongpambansa/727314341_997120259843888_3876463339897492356_n.jpg",
  "/2026palarongpambansa/727365616_2173219330131090_3927059356606077922_n.jpg",
  "/2026palarongpambansa/727365620_1670549850847490_3650799179814073418_n.jpg",
  "/2026palarongpambansa/727457689_1591552375723726_8123675960961195936_n.jpg",
  "/2026palarongpambansa/727940809_1377753981068534_3949259991656701519_n.jpg",
];

const DAILY_INFORMATION_FEED = [
  {
    source: "DepEd NCR",
    type: "Daily Bulletin",
    title: "GROUNDWORK FOR RESILIENCE: DEPED NCR LEADS BY EXAMPLE IN NATIONWIDE EARTHQUAKE DRILL",
    date: "June 20, 2026",
    summary:
      "IN PHOTOS: As the clock struck the designated hour, a synchronized wave of preparedness swept through the DepEd National Capital Region. In full support of the 2nd Quarter National Simultaneous Earthquake Drill (NSED) last June 18, 2026, Regional Office Personnel transitioned from their daily routines to become students of survival, practicing the \"Drop, Cover, and Hold\" protocol with precision. Beyond the physical act of ducking under desks, the drill served as a critical audit of our emergency response systems. The exercise was a testament to the agency’s proactive stance on disaster risk reduction, demonstrating that institutional readiness is a muscle that must be exercised regularly. By simulating high-stress scenarios, employees honed the muscle memory necessary to protect lives during a real seismic event, ensuring that administrative functions are backed by robust safety frameworks. This active participation underscores a core philosophy: a resilient education system hinges on a culture of preparedness. When DepEd NCR personnel master safety protocols, they set a standard for the region's schools and communities. This drill was more than a checklist; it was a reinforcement of our collective commitment to safeguarding every learner and employee. One coordinated move today creates a domino effect for tomorrow. Through discipline, awareness, and unity, we transform potential panic into measured action—ensuring that when the ground shakes, our resolve stands firm. #OneNCRStrongerTogether #DepEdNCR",
    image: GROUNDWORK_FOR_RESILIENCE_GALLERY[0],
    gallery: GROUNDWORK_FOR_RESILIENCE_GALLERY,
  },
  {
    source: "DepEd NCR",
    type: "Flag Ceremony Update",
    title: "HONORING EVERYDAY HEROES: DEPED NCR CELEBRATES FATHER'S DAY IN MONDAY FLAG CEREMONY",
    date: "June 22, 2026",
    summary:
      "EARLIER TODAY: DepEd National Capital Region commenced the week with a solemn yet meaningful flag-raising ceremony earlier today, led by the Records Section, General Services Unit, and Procurement Unit. The event, held at the DepEd NCR grounds, carried the heartfelt theme, \"Celebrating Fatherhood: Honoring Our Everyday Heroes.\" DepEd NCR Assistant Regional Director Rita E. Riddle, echoing the recent Father's Day celebration observed last June 21, 2026. In her message, ARD Riddle emphasized the profound impact of fathers in shaping the nation's future through their dedication and love, embodying the spirit as everyday heroes through hard work and excellence. The ceremony concluded with segments of announcements, reinforcing the agency's unwavering commitment to service and nation-building. #OneNCRStrongerTogether #DepEdNCR",
    image: HONORING_FATHERS_DAY_GALLERY[0],
    gallery: HONORING_FATHERS_DAY_GALLERY,
  },
];

const HOME_SPOTLIGHT_STORIES = [
  {
    source: "DepEd NCR",
    type: "Brigada Balik Eskwela 2026",
    title: "Brigada Balik Eskwela 2026 strengthens school readiness and community support across NCR.",
    date: "June 25, 2026",
    summary:
      "The 2026 Brigada Balik Eskwela drive highlights school preparation, volunteer participation, and coordinated support for learners as the region readies classrooms, facilities, and education services for the incoming school year.",
    image: "/balikeskwela2026/716610766_1611698557218238_6046429074280679972_n.png",
    gallery: [
      "/balikeskwela2026/716610766_1611698557218238_6046429074280679972_n.png",
      "/balikeskwela2026/715494809_1011015995030691_2421120421880201039_n.jpg",
      "/balikeskwela2026/716886181_1675330720274743_3470471279602070410_n.jpg",
      "/balikeskwela2026/717418992_1529603415336326_7707363445419391749_n.jpg",
      "/balikeskwela2026/718238410_2010262623191677_3061243508925091546_n.jpg",
      "/balikeskwela2026/718777228_4385749555003028_867688270242693817_n.jpg",
      "/balikeskwela2026/719126420_1690477875201936_2447610541213841525_n.jpg",
      "/balikeskwela2026/719252473_1478963146725601_7348488088184001441_n.jpg",
      "/balikeskwela2026/719519799_1001096285869051_6747638024943502917_n.jpg",
      "/balikeskwela2026/719919442_1346362190724965_5218224914929280004_n.jpg",
    ],
  },
  {
    source: "DepEd NCR",
    type: "Reading Nooks Launch 2026",
    title: "DIVISION LAUNCH OF READING NOOKS FOR KINDER TO GRADE 3",
    date: "June 25, 2026",
    summary:
      "The Reading Nooks Launch 2026 highlights learner-friendly reading spaces for Kinder to Grade 3, supporting early literacy, reading engagement, and classroom-based learning enrichment across the division.",
    image: "/readingnookslaunch2026/715098626_1003285835399858_2745985948808011356_n.jpg",
    gallery: [
      "/readingnookslaunch2026/715098626_1003285835399858_2745985948808011356_n.jpg",
      "/readingnookslaunch2026/716610658_1003285775399864_8818322337109739721_n.jpg",
      "/readingnookslaunch2026/716630670_1013630461133383_8475703218854314719_n.jpg",
      "/readingnookslaunch2026/719940026_1003285678733207_5949048354782520545_n.jpg",
    ],
  },
];

const DIRECTORS_CORNER = {
  office: "Office of the Regional Director",
  name: "JOCELYN DR ANDAYA",
  position:
    "Regional Director, NCR Concurrent Officer-in-Charge, Office of the Assistant Secretary for Operations",
  photo: "/leadership/JOCELYN-DR.-ANDAYA.png",
};

const ALS_INFORMATION_IMAGES = {
  programs: "/images_aboutals/als-program-areas.webp",
  learners: "/images_aboutals/who-als-serves.webp",
  delivery: "/images_aboutals/regional-delivery-points.webp",
};

const ALS_ACTIVITY_UPSKILLING_GALLERY = [
  "/Upskilling2025/533409194_1466797124589585_4653236427255118533_n.jpg",
  "/Upskilling2025/540610457_2344693989321572_2729520224893925734_n.jpg",
  "/Upskilling2025/540621969_1095482536127237_5018332349113831150_n.jpg",
  "/Upskilling2025/540621969_735867929296265_2987844128406831383_n.jpg",
  "/Upskilling2025/540634140_754300440922729_9190412372400368844_n.jpg",
  "/Upskilling2025/540711236_2181037895693264_71315471897511135_n.jpg",
  "/Upskilling2025/540730407_633825226459050_2700399432317454919_n.jpg",
  "/Upskilling2025/540732072_1121843412629042_8959301805964133370_n.jpg",
  "/Upskilling2025/540736997_1989889648495889_6819870437150457982_n.jpg",
  "/Upskilling2025/540987455_1245837993983319_6184872480880613748_n.jpg",
  "/Upskilling2025/541179805_2740233699517294_9158327193360998298_n.jpg",
  "/Upskilling2025/541206026_1409778900097255_6354871391038686827_n.jpg",
  "/Upskilling2025/545365264_1369893208476660_726530327610420642_n.jpg",
  "/Upskilling2025/545438933_633941533111236_6752251518833922626_n.jpg",
  "/Upskilling2025/545484361_1083805550628361_7458148460160897277_n.jpg",
  "/Upskilling2025/545571840_1172741698005797_1728481547740133662_n.jpg",
  "/Upskilling2025/546266608_1118520736902363_108637005204979156_n.jpg",
  "/Upskilling2025/546268959_1319475362859946_7340094078529095320_n.jpg",
  "/Upskilling2025/547372575_1205844588253280_7456035575006454740_n.jpg",
];

const ALS_INFO_STORIES = [
  {
    source: "ALS NCR",
    type: "ALS Activity",
    title: "UPSKILLING AND TRAINING OF EPS II-ALS ON INSTRUCTIONAL SUPERVISION",
    date: "June 25, 2026",
    summary:
      "This ALS activity highlights the upskilling and training of EPS II-ALS on instructional supervision, focusing on strengthening field support, coaching practices, and quality monitoring across NCR divisions.",
    image: ALS_ACTIVITY_UPSKILLING_GALLERY[0],
    gallery: ALS_ACTIVITY_UPSKILLING_GALLERY,
  },
  {
    source: "ALS NCR",
    type: "ALS Information Desk",
    title: "ALS PROGRAM AREAS AND FLEXIBLE LEARNING PATHWAYS IN NCR",
    date: "June 25, 2026",
    summary:
      "ALS in NCR supports literacy recovery, equivalency pathways, and mapped learning access points so learners can continue education through practical, flexible, and community-based delivery.",
    image: ALS_INFORMATION_IMAGES.programs,
    gallery: [ALS_INFORMATION_IMAGES.programs],
  },
  {
    source: "ALS NCR",
    type: "ALS Learners",
    title: "WHO ALS SERVES IN COMMUNITIES ACROSS THE NATIONAL CAPITAL REGION",
    date: "June 25, 2026",
    summary:
      "ALS serves out-of-school youth, adult returnees, and learners in communities where alternative and modular delivery is the most practical route back into education.",
    image: ALS_INFORMATION_IMAGES.learners,
    gallery: [ALS_INFORMATION_IMAGES.learners],
  },
  {
    source: "ALS NCR",
    type: "Regional Delivery",
    title: "REGIONAL DELIVERY POINTS AND SHARED MONITORING FOR ALS NCR",
    date: "June 25, 2026",
    summary:
      "Regional delivery points connect division planning, school and community-based learning sites, flexible schedules, and dashboard-supported monitoring into one shared ALS NCR coordination flow.",
    image: ALS_INFORMATION_IMAGES.delivery,
    gallery: [ALS_INFORMATION_IMAGES.delivery],
  },
];

const normalizeStory = (item, index) => {
  const gallery = Array.isArray(item.gallery) && item.gallery.length
    ? item.gallery
    : item.image
      ? [item.image]
      : [];

  return {
    ...item,
    id: item.id || `${item.type || "story"}-${index}`,
    gallery,
  };
};

const ORBIT_DOTS = [
  { angle: -18, radius: "var(--orbit-radius-outer)", size: 7, color: "#f4c25f", speed: "44s", direction: "normal" },
  { angle: 18, radius: "var(--orbit-radius-inner)", size: 5, color: "#5aa9ff", speed: "36s", direction: "reverse" },
  { angle: 42, radius: "var(--orbit-radius-outer)", size: 6, color: "#35d07f", speed: "48s", direction: "normal" },
  { angle: 76, radius: "var(--orbit-radius-inner)", size: 4, color: "#ff4f6d", speed: "34s", direction: "reverse" },
  { angle: 118, radius: "var(--orbit-radius-outer)", size: 6, color: "#f4c25f", speed: "46s", direction: "normal" },
  { angle: 148, radius: "var(--orbit-radius-inner)", size: 5, color: "#5aa9ff", speed: "38s", direction: "reverse" },
  { angle: 186, radius: "var(--orbit-radius-outer)", size: 7, color: "#35d07f", speed: "50s", direction: "normal" },
  { angle: 214, radius: "var(--orbit-radius-inner)", size: 4, color: "#f4c25f", speed: "35s", direction: "reverse" },
  { angle: 248, radius: "var(--orbit-radius-outer)", size: 5, color: "#ff4f6d", speed: "42s", direction: "normal" },
  { angle: 282, radius: "var(--orbit-radius-inner)", size: 6, color: "#35d07f", speed: "37s", direction: "reverse" },
  { angle: 314, radius: "var(--orbit-radius-outer)", size: 4, color: "#5aa9ff", speed: "47s", direction: "normal" },
  { angle: 338, radius: "var(--orbit-radius-inner)", size: 5, color: "#f4c25f", speed: "39s", direction: "reverse" },
  { angle: 96, radius: "var(--orbit-radius-core)", size: 4, color: "#5aa9ff", speed: "28s", direction: "normal" },
  { angle: 272, radius: "var(--orbit-radius-core)", size: 4, color: "#35d07f", speed: "31s", direction: "reverse" },
  { angle: 8, radius: "var(--orbit-radius-far)", size: 4, color: "#5aa9ff", speed: "58s", direction: "reverse" },
  { angle: 32, radius: "var(--orbit-radius-far)", size: 5, color: "#f4c25f", speed: "62s", direction: "reverse" },
  { angle: 64, radius: "var(--orbit-radius-mid)", size: 4, color: "#35d07f", speed: "52s", direction: "normal" },
  { angle: 132, radius: "var(--orbit-radius-mid)", size: 5, color: "#ff4f6d", speed: "54s", direction: "normal" },
  { angle: 166, radius: "var(--orbit-radius-far)", size: 4, color: "#f4c25f", speed: "60s", direction: "reverse" },
  { angle: 232, radius: "var(--orbit-radius-mid)", size: 5, color: "#5aa9ff", speed: "56s", direction: "normal" },
  { angle: 300, radius: "var(--orbit-radius-far)", size: 4, color: "#35d07f", speed: "64s", direction: "reverse" },
  { angle: 326, radius: "var(--orbit-radius-mid)", size: 5, color: "#f4c25f", speed: "53s", direction: "normal" },
];

const NCROverview = ({ allData, onSelectDivision }) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [depedNewsItems, setDepedNewsItems] = useState([]);
  const [depedNewsError, setDepedNewsError] = useState("");
  const [isDepedNewsLoading, setIsDepedNewsLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState(null);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);

  const hasData = allData && allData.length > 0;
  const divisionLogos = (hasData ? allData : []).map((division, index, divisions) => {
    const divisionName = division.division;

    return {
      division: divisionName,
      badge: getDivisionBadge(divisionName),
      displayName: getDivisionDisplayName(divisionName),
      logoSrc: getDivisionLogoSrc(divisionName),
      logoClassName: getDivisionLogoClassName(divisionName),
      angle: (360 / Math.max(divisions.length, 1)) * index - 90,
      radius: index % 2 === 0 ? "var(--orbit-radius-outer)" : "var(--orbit-radius-inner)",
    };
  });

  const readingNooksStory = useMemo(() => normalizeStory(HOME_SPOTLIGHT_STORIES[1], 1), []);
  const palarongSpotlightStory = useMemo(
    () =>
      normalizeStory(
        {
          source: "DepEd NCR",
          type: "Regional Spotlight",
          title: "BEHIND THE GOLD: DEPED NCR CELEBRATES THE ARCHITECTS OF ATHLETIC EXCELLENCE IN 2026 PALARONG PAMBANSA",
          date: "June 19, 2026",
          summary:
            "IN PHOTOS: DepEd National Capital Region held its Post-Palaro Appreciation Program last June 17, 2026, at Luxent Hotel in Quezon City to recognize the dedication, hard work, and outstanding contributions of the Regional Coaches, Assistant Coaches, and Division Sports Officers. The event was spearheaded by DepEd NCR Regional Director and concurrent Officer-in-Charge of the Office of the Assistant Secretary for Operations, Asec. Jocelyn DR Andaya, together with OIC-ARD Rita E. Riddle. Their leadership and support served as an inspiration to the entire delegation and reflected the region’s continued commitment to excellence in school sports. This meaningful gathering celebrated the successful defense of the championship title of the NCR Athletic Delegation during the 2026 Palarong Pambansa. It served as a tribute to the commitment, teamwork, and excellence of all sports officials and coaches who played a vital role in maintaining NCR’s legacy of athletic supremacy. #OneNCRStrongerTogether #DepEdNCR",
          image: PALARONG_PAMBANSA_2026_GALLERY[0],
          gallery: PALARONG_PAMBANSA_2026_GALLERY,
        },
        "palarong-spotlight"
      ),
    []
  );
  const activeFeed = useMemo(
    () => [
      HOME_SPOTLIGHT_STORIES[0],
      ...(depedNewsItems.length ? depedNewsItems : DAILY_INFORMATION_FEED),
    ].map(normalizeStory),
    [depedNewsItems]
  );
  const featuredStory = activeFeed[activeSlide] || activeFeed[0] || null;
  const trendingStories = activeFeed.slice(0, 4);
  const directorsCornerStory = palarongSpotlightStory;

  useEffect(() => {
    let ignore = false;

    const loadDepedFeed = async () => {
      try {
        setIsDepedNewsLoading(true);
        setDepedNewsError("");
        const payload = await fetchDepedNews({ limit: 6 });
        const items = Array.isArray(payload?.items) ? payload.items : [];

        if (!ignore) {
          setDepedNewsItems(items);
        }
      } catch (error) {
        if (!ignore) {
          setDepedNewsError(error.message || "Unable to load DepEd official news.");
          setDepedNewsItems([]);
        }
      } finally {
        if (!ignore) {
          setIsDepedNewsLoading(false);
        }
      }
    };

    loadDepedFeed();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (activeFeed.length <= 1) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % activeFeed.length);
    }, 5500);

    return () => window.clearInterval(timer);
  }, [activeFeed]);

  const handlePreviousSlide = () => {
    if (!activeFeed.length) {
      return;
    }

    setActiveSlide((current) => (current - 1 + activeFeed.length) % activeFeed.length);
  };

  const handleNextSlide = () => {
    if (!activeFeed.length) {
      return;
    }

    setActiveSlide((current) => (current + 1) % activeFeed.length);
  };

  const openStoryGallery = (story) => {
    if (!story?.gallery?.length) {
      return;
    }

    setSelectedStory(story);
    setActiveGalleryIndex(0);
  };

  const closeStoryGallery = () => {
    setSelectedStory(null);
    setActiveGalleryIndex(0);
  };

  const handlePreviousGalleryImage = () => {
    if (!selectedStory?.gallery?.length) {
      return;
    }

    setActiveGalleryIndex((current) => (current - 1 + selectedStory.gallery.length) % selectedStory.gallery.length);
  };

  const handleNextGalleryImage = () => {
    if (!selectedStory?.gallery?.length) {
      return;
    }

    setActiveGalleryIndex((current) => (current + 1) % selectedStory.gallery.length);
  };

  useEffect(() => {
    if (!selectedStory) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeStoryGallery();
      } else if (event.key === "ArrowLeft") {
        setActiveGalleryIndex((current) => (current - 1 + selectedStory.gallery.length) % selectedStory.gallery.length);
      } else if (event.key === "ArrowRight") {
        setActiveGalleryIndex((current) => (current + 1) % selectedStory.gallery.length);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedStory]);

  return (
    <div className="ncr-overview-container">
      <section className="overview-hero">
        <div className="overview-hero-side">
          <div className="division-orbit" aria-label="NCR division shortcuts">
            <span className="division-orbit-ring division-orbit-ring-outer" aria-hidden="true" />
            <span className="division-orbit-ring division-orbit-ring-middle" aria-hidden="true" />
            <span className="division-orbit-ring division-orbit-ring-inner" aria-hidden="true" />
            {ORBIT_DOTS.map((dot, index) => (
              <span
                key={`${dot.angle}-${index}`}
                className="orbit-dot"
                style={{
                  "--dot-angle": `${dot.angle}deg`,
                  "--dot-end-angle": `${dot.angle + 360}deg`,
                  "--dot-reverse-end-angle": `${dot.angle - 360}deg`,
                  "--dot-radius": dot.radius,
                  "--dot-size": `${dot.size}px`,
                  "--dot-color": dot.color,
                  "--dot-speed": dot.speed,
                }}
                data-direction={dot.direction}
                aria-hidden="true"
              />
            ))}

            <div className="division-orbit-core">
              <img src="/als.png" alt="ALS NCR" />
            </div>

            {divisionLogos.map((division, index) => (
              <button
                key={division.division}
                type="button"
                className="division-orbit-item"
                style={{
                  "--angle": `${division.angle}deg`,
                  "--angle-end": `${division.angle + 360}deg`,
                  "--counter-angle": `${-division.angle}deg`,
                  "--counter-angle-end": `${-(division.angle + 360)}deg`,
                  "--radius": division.radius,
                  "--entrance-delay": `${0.18 + index * 0.11}s`,
                }}
                onClick={() => onSelectDivision?.(division.division)}
                title={division.displayName}
                aria-label={`Open ${division.displayName}`}
              >
                <span className="division-orbit-content">
                  {division.logoSrc ? (
                    <img
                      src={division.logoSrc}
                      alt=""
                      className={division.logoClassName}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <span>{division.badge}</span>
                  )}
                  <small>{division.displayName}</small>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="overview-info-grid" aria-label="ALS information and advisories">
        <aside className="overview-info-panel overview-trending-panel">
          <div className="overview-panel-heading">
            <span className="section-kicker">Trending Now</span>
            <h2>Current DepEd and ALS updates</h2>
            <p>Quick-read official stories and home-page updates from the live DepEd bulletin feed.</p>
          </div>

          {isDepedNewsLoading ? (
            <div className="overview-feed-status">Loading DepEd official news...</div>
          ) : null}

          {depedNewsError ? (
            <div className="overview-feed-status overview-feed-status-warning">
              Live DepEd news is temporarily unavailable. Showing the local daily bulletin instead.
            </div>
          ) : null}

          <div className="overview-trending-stack">
            {trendingStories.map((item, index) => (
              <button
                key={`${item.type}-${item.title}`}
                type="button"
                className={`overview-trending-item ${activeSlide === index ? "active" : ""}`}
                onClick={() => {
                  setActiveSlide(index);
                  openStoryGallery(item);
                }}
              >
                <div className="overview-trending-copy">
                  <div className="overview-trending-meta">
                    <strong>{item.type}</strong>
                    <small>{formatStoryDate(item.date || item.publishedAt)}</small>
                  </div>
                  <div className="overview-trending-item-media">
                    <img src={item.image} alt={item.title} loading="lazy" decoding="async" />
                  </div>
                  <span className="overview-trending-title">{item.title}</span>
                  <p className="overview-trending-summary">{buildStorySummary(item.summary)}</p>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <article className="overview-info-panel overview-news-panel">
          <div className="overview-panel-heading">
            <span className="section-kicker">Featured Story</span>
            <h2>DepEd NCR information desk</h2>
            <p>Highlighted education story with a large photo, summary, and direct official source link.</p>
          </div>

          {featuredStory ? (
            <article className="overview-news-feature">
              <button
                type="button"
                className="overview-news-media overview-news-media-button"
                onClick={() => openStoryGallery(featuredStory)}
              >
                <img src={featuredStory.image} alt={featuredStory.title} loading="lazy" decoding="async" />
                <div className="overview-news-overlay">
                  <div className="overview-news-card-top">
                    <span>{featuredStory.type}</span>
                    <small>{formatStoryDate(featuredStory.date || featuredStory.publishedAt)}</small>
                  </div>
                  <strong>{featuredStory.title}</strong>
                  <p>{buildStorySummary(featuredStory.summary)}</p>
                  {featuredStory.link ? (
                    <a
                      className="overview-news-link"
                      href={featuredStory.link}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(event) => event.stopPropagation()}
                    >
                      Open official story
                    </a>
                  ) : null}
                </div>
              </button>

              <div className="overview-news-controls">
                <button
                  type="button"
                  className="overview-slide-arrow"
                  onClick={handlePreviousSlide}
                  aria-label="Previous update"
                >
                  <ChevronLeft aria-hidden="true" />
                </button>

                <div className="overview-slide-dots" aria-label="Slideshow position">
                  {activeFeed.map((item, index) => (
                    <button
                      key={`${item.title}-${index}`}
                      type="button"
                      className={`overview-slide-dot ${activeSlide === index ? "active" : ""}`}
                      aria-label={`View slide ${index + 1}`}
                      onClick={() => setActiveSlide(index)}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  className="overview-slide-arrow"
                  onClick={handleNextSlide}
                  aria-label="Next update"
                >
                  <ChevronRight aria-hidden="true" />
                </button>
              </div>

              {readingNooksStory ? (
                <button
                  type="button"
                  className="overview-secondary-story"
                  onClick={() => openStoryGallery(readingNooksStory)}
                >
                  <div className="overview-secondary-story-media">
                    <img
                      src={readingNooksStory.image}
                      alt={readingNooksStory.title}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="overview-secondary-story-copy">
                    <div className="overview-news-card-top">
                      <span>{readingNooksStory.type}</span>
                      <small>{formatStoryDate(readingNooksStory.date || readingNooksStory.publishedAt)}</small>
                    </div>
                    <strong>{readingNooksStory.title}</strong>
                    <p>{buildStorySummary(readingNooksStory.summary)}</p>
                  </div>
                </button>
              ) : null}
            </article>
          ) : null}
        </article>

        <aside className="overview-info-panel overview-corner-panel">
          <div className="overview-panel-heading">
            <span className="section-kicker">Director's Corner</span>
            <h2>Regional leadership spotlight</h2>
            <p>Official leadership profile beside a current regional spotlight story.</p>
          </div>

          <div className="overview-corner-card">
            <div className="overview-corner-portrait">
              <img
                src={DIRECTORS_CORNER.photo}
                alt={DIRECTORS_CORNER.name}
                loading="lazy"
                decoding="async"
              />
            </div>

            <div className="overview-corner-copy">
              <small>{DIRECTORS_CORNER.office}</small>
              <strong>{DIRECTORS_CORNER.name}</strong>
              <p>{DIRECTORS_CORNER.position}</p>
            </div>
          </div>

          {directorsCornerStory ? (
            <div
              className="overview-corner-spotlight overview-corner-spotlight-button"
              role="button"
              tabIndex={0}
              onClick={() => openStoryGallery(directorsCornerStory)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openStoryGallery(directorsCornerStory);
                }
              }}
            >
              <div className="overview-corner-spotlight-media">
                <img
                  src={directorsCornerStory.image}
                  alt={directorsCornerStory.title}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <span>Regional spotlight</span>
              <strong>{directorsCornerStory.title}</strong>
              <small>{formatStoryDate(directorsCornerStory.date || directorsCornerStory.publishedAt)}</small>
              <p>{buildStorySummary(directorsCornerStory.summary)}</p>
              {directorsCornerStory.link ? (
                <a
                  className="overview-news-link overview-corner-link"
                  href={directorsCornerStory.link}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(event) => event.stopPropagation()}
                >
                  View official post
                </a>
              ) : null}
            </div>
          ) : null}
        </aside>
      </section>

      {selectedStory ? (
        <div className="overview-gallery-modal" role="dialog" aria-modal="true" aria-label={selectedStory.title}>
          <button
            type="button"
            className="overview-gallery-backdrop"
            aria-label="Close gallery"
            onClick={closeStoryGallery}
          />
          <div className="overview-gallery-shell">
            <button
              type="button"
              className="overview-gallery-close"
              aria-label="Close gallery"
              onClick={closeStoryGallery}
            >
              ×
            </button>

            <div className="overview-gallery-copy">
              <span className="section-kicker">Photo Gallery</span>
              <h3>{selectedStory.title}</h3>
              <p>{selectedStory.summary}</p>
              <small>{formatStoryDate(selectedStory.date || selectedStory.publishedAt)}</small>
            </div>

            <div className="overview-gallery-stage">
              {selectedStory.gallery.length > 1 ? (
                <button
                  type="button"
                  className="overview-gallery-arrow overview-gallery-arrow-left"
                  aria-label="Previous photo"
                  onClick={handlePreviousGalleryImage}
                >
                  <ChevronLeft aria-hidden="true" />
                </button>
              ) : null}

              <div className="overview-gallery-image-frame">
                <img
                  src={selectedStory.gallery[activeGalleryIndex]}
                  alt={`${selectedStory.title} photo ${activeGalleryIndex + 1}`}
                />
              </div>

              {selectedStory.gallery.length > 1 ? (
                <button
                  type="button"
                  className="overview-gallery-arrow overview-gallery-arrow-right"
                  aria-label="Next photo"
                  onClick={handleNextGalleryImage}
                >
                  <ChevronRight aria-hidden="true" />
                </button>
              ) : null}
            </div>

            <div className="overview-gallery-thumbs">
              {selectedStory.gallery.map((image, index) => (
                <button
                  key={`${selectedStory.id}-photo-${index}`}
                  type="button"
                  className={`overview-gallery-thumb ${activeGalleryIndex === index ? "active" : ""}`}
                  onClick={() => setActiveGalleryIndex(index)}
                  aria-label={`View photo ${index + 1}`}
                >
                  <img src={image} alt="" loading="lazy" decoding="async" />
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <div className="overview-section-divider" aria-hidden="true">
        <span />
        <strong>Alternative Learning System Information Desk</strong>
        <span />
      </div>

      <section className="als-info-desk" aria-label="Alternative Learning System information desk">
        <div className="als-news-grid">
          <aside className="overview-info-panel als-news-list-panel">
            <div className="overview-panel-heading">
              <span className="section-kicker">ALS Highlights</span>
              <h2>Alternative Learning System updates</h2>
              <p>Clickable ALS stories with photo, title, and caption for quick orientation.</p>
            </div>

            <div className="overview-trending-stack">
              {ALS_INFO_STORIES.slice(1, 3).map((story) => (
                <button
                  key={story.title}
                  type="button"
                  className="overview-trending-item"
                  onClick={() => openStoryGallery(normalizeStory(story, story.title))}
                >
                  <div className="overview-trending-copy">
                    <div className="overview-trending-meta">
                      <strong>{story.type}</strong>
                      <small>{formatStoryDate(story.date)}</small>
                    </div>
                    <div className="overview-trending-item-media">
                      <img src={story.image} alt={story.title} loading="lazy" decoding="async" />
                    </div>
                    <span className="overview-trending-title">{story.title}</span>
                    <p className="overview-trending-summary">{buildStorySummary(story.summary)}</p>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          <article className="overview-info-panel als-news-main-panel">
            <div className="overview-panel-heading">
              <span className="section-kicker">ALS Information Desk</span>
              <h2>Alternative Learning System (ALS) Information Desk</h2>
              <p>Photo-led ALS stories that explain program direction, learner reach, and regional delivery.</p>
            </div>

            <article className="overview-news-feature">
              <button
                type="button"
                className="overview-news-media overview-news-media-button"
                onClick={() => openStoryGallery(normalizeStory(ALS_INFO_STORIES[0], "als-featured"))}
              >
                <img
                  src={ALS_INFO_STORIES[0].image}
                  alt={ALS_INFO_STORIES[0].title}
                  loading="lazy"
                  decoding="async"
                />
                <div className="overview-news-overlay">
                  <div className="overview-news-card-top">
                    <span>{ALS_INFO_STORIES[0].type}</span>
                    <small>{formatStoryDate(ALS_INFO_STORIES[0].date)}</small>
                  </div>
                  <strong>{ALS_INFO_STORIES[0].title}</strong>
                  <p>{buildStorySummary(ALS_INFO_STORIES[0].summary)}</p>
                </div>
              </button>
            </article>
          </article>

          <aside className="overview-info-panel als-news-spotlight-panel">
            <div className="overview-panel-heading">
              <span className="section-kicker">ALS Spotlight</span>
              <h2>Regional delivery and learner reach</h2>
              <p>Focused ALS newsroom cards that can be expanded into gallery view.</p>
            </div>

            <div
              className="overview-corner-spotlight overview-corner-spotlight-button"
              role="button"
              tabIndex={0}
              onClick={() => openStoryGallery(normalizeStory(ALS_INFO_STORIES[3], "als-spotlight"))}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openStoryGallery(normalizeStory(ALS_INFO_STORIES[3], "als-spotlight"));
                }
              }}
            >
              <div className="overview-corner-spotlight-media">
                <img
                  src={ALS_INFO_STORIES[3].image}
                  alt={ALS_INFO_STORIES[3].title}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <span>{ALS_INFO_STORIES[3].type}</span>
              <strong>{ALS_INFO_STORIES[3].title}</strong>
              <small>{formatStoryDate(ALS_INFO_STORIES[3].date)}</small>
              <p>{buildStorySummary(ALS_INFO_STORIES[3].summary)}</p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
};

export default NCROverview;
