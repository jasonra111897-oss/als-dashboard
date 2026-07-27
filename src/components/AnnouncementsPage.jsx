import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./AnnouncementsPage.css";

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
    return "Open the announcement to read the full update.";
  }

  if (normalized.length <= 220) {
    return normalized;
  }

  return `${normalized.slice(0, 217).trimEnd()}...`;
};

const DEPED_ANNOUNCEMENTS = [
  {
    source: "DepEd NCR",
    type: "School-Based Feeding Program 2026-2027",
    title:
      "NATIONAL KICK-OFF OF THE SCHOOL-BASED FEEDING PROGRAM FOR SCHOOL YEAR 2026-2027 \"NUTRISYON AT KALIKASAN, ATING PANGALAGAAN\"",
    date: "July 6, 2026",
    summary:
      "📢 SAVE THE DATE! Ngayong Hulyo 6, samahan ang Department of Education sa paglulunsad ng School-Based Feeding Program (SBFP) for SY 2026–2027. Layunin ng inisyatibang ito na mapabuti ang nutrisyon, kalusugan, at overall well-being ng mga batang mag-aaral, lalo na sa kanilang kritikal na taon ng paglaki. Bahagi rin ito ng mas malawak na hangarin ng pamahalaan na tugunan ang kakulangan sa early childhood care at nutrisyon, lalo na sa mga underserved communities. Abangan ang pagbubukas ng programa dito sa DepEd Philippines ngayong Lunes. Tara, simulan ang hakbang para sa mas malusog na kinabukasan ng bawat batang Pilipino!",
    image: "/feedingprogram/734039332_1400205745304137_5244462390655031016_n.jpg",
    gallery: ["/feedingprogram/734039332_1400205745304137_5244462390655031016_n.jpg"],
  },
  {
    source: "DepEd NCR",
    type: "Flag Ceremony Update",
    title: "HONORING EVERYDAY HEROES: DEPED NCR CELEBRATES FATHER'S DAY IN MONDAY FLAG CEREMONY",
    date: "June 22, 2026",
    summary:
      "EARLIER TODAY: DepEd National Capital Region commenced the week with a solemn yet meaningful flag-raising ceremony earlier today, led by the Records Section, General Services Unit, and Procurement Unit. The event, held at the DepEd NCR grounds, carried the heartfelt theme, \"Celebrating Fatherhood: Honoring Our Everyday Heroes.\" DepEd NCR Assistant Regional Director Rita E. Riddle, echoing the recent Father's Day celebration observed last June 21, 2026. In her message, ARD Riddle emphasized the profound impact of fathers in shaping the nation's future through their dedication and love, embodying the spirit as everyday heroes through hard work and excellence. The ceremony concluded with segments of announcements, reinforcing the agency's unwavering commitment to service and nation-building. #OneNCRStrongerTogether #DepEdNCR",
    image: "/Honoringfathersday/726380982_1504590830603127_900802355375602969_n.jpg",
    gallery: [
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
    ],
  },
  {
    source: "DepEd NCR",
    type: "Daily Bulletin",
    title: "GROUNDWORK FOR RESILIENCE: DEPED NCR LEADS BY EXAMPLE IN NATIONWIDE EARTHQUAKE DRILL",
    date: "June 20, 2026",
    summary:
      "IN PHOTOS: As the clock struck the designated hour, a synchronized wave of preparedness swept through the DepEd National Capital Region. In full support of the 2nd Quarter National Simultaneous Earthquake Drill (NSED) last June 18, 2026, Regional Office Personnel transitioned from their daily routines to become students of survival, practicing the \"Drop, Cover, and Hold\" protocol with precision. Beyond the physical act of ducking under desks, the drill served as a critical audit of our emergency response systems. The exercise was a testament to the agency’s proactive stance on disaster risk reduction, demonstrating that institutional readiness is a muscle that must be exercised regularly. By simulating high-stress scenarios, employees honed the muscle memory necessary to protect lives during a real seismic event, ensuring that administrative functions are backed by robust safety frameworks. This active participation underscores a core philosophy: a resilient education system hinges on a culture of preparedness. When DepEd NCR personnel master safety protocols, they set a standard for the region's schools and communities. This drill was more than a checklist; it was a reinforcement of our collective commitment to safeguarding every learner and employee. One coordinated move today creates a domino effect for tomorrow. Through discipline, awareness, and unity, we transform potential panic into measured action—ensuring that when the ground shakes, our resolve stands firm. #OneNCRStrongerTogether #DepEdNCR",
    image: "/groundworkforresilience/725214260_1349754967106430_8415455198178305156_n.jpg",
    gallery: [
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
    ],
  },
];

const ALS_ANNOUNCEMENTS = [
  {
    source: "ALS NCR",
    type: "ALS Activity",
    title: "UPSKILLING AND TRAINING OF EPS II-ALS ON INSTRUCTIONAL SUPERVISION",
    date: "June 25, 2026",
    summary:
      "This ALS activity highlights the upskilling and training of EPS II-ALS on instructional supervision, focusing on strengthening field support, coaching practices, and quality monitoring across NCR divisions.",
    image: "/Upskilling2025/533409194_1466797124589585_4653236427255118533_n.jpg",
    gallery: [
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
    ],
  },
  {
    source: "ALS NCR",
    type: "ALS Information Desk",
    title: "ALS PROGRAM AREAS AND FLEXIBLE LEARNING PATHWAYS IN NCR",
    date: "June 25, 2026",
    summary:
      "ALS in NCR supports literacy recovery, equivalency pathways, and mapped learning access points so learners can continue education through practical, flexible, and community-based delivery.",
    image: "/images_aboutals/als-program-areas.webp",
    gallery: ["/images_aboutals/als-program-areas.webp"],
  },
  {
    source: "ALS NCR",
    type: "ALS Learners",
    title: "WHO ALS SERVES IN COMMUNITIES ACROSS THE NATIONAL CAPITAL REGION",
    date: "June 25, 2026",
    summary:
      "ALS serves out-of-school youth, adult returnees, and learners in communities where alternative and modular delivery is the most practical route back into education.",
    image: "/images_aboutals/who-als-serves.webp",
    gallery: ["/images_aboutals/who-als-serves.webp"],
  },
  {
    source: "ALS NCR",
    type: "Regional Delivery",
    title: "REGIONAL DELIVERY POINTS AND SHARED MONITORING FOR ALS NCR",
    date: "June 25, 2026",
    summary:
      "Regional delivery points connect division planning, school and community-based learning sites, flexible schedules, and dashboard-supported monitoring into one shared ALS NCR coordination flow.",
    image: "/images_aboutals/regional-delivery-points.webp",
    gallery: ["/images_aboutals/regional-delivery-points.webp"],
  },
];

const normalizeStory = (item, index) => ({
  ...item,
  id: item.id || `${item.type || "announcement"}-${index}`,
  gallery: Array.isArray(item.gallery) && item.gallery.length ? item.gallery : item.image ? [item.image] : [],
});

const AnnouncementsPage = () => {
  const [selectedStory, setSelectedStory] = useState(null);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);

  const depedStories = useMemo(() => DEPED_ANNOUNCEMENTS.map(normalizeStory), []);
  const alsStories = useMemo(() => ALS_ANNOUNCEMENTS.map(normalizeStory), []);

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
    <div className="announcements-page">
      <section className="announcements-hero">
        <span className="section-kicker">Official Updates</span>
        <h1>Announcements Center</h1>
        <p>
          Browse curated DepEd NCR and ALS announcements in one dedicated page with title, photo, caption,
          and gallery view.
        </p>
      </section>

      <section className="announcements-section">
        <div className="announcements-section-heading">
          <span className="section-kicker">DepEd NCR</span>
          <h2>DepEd NCR announcements</h2>
          <p>Regional bulletins, ceremonies, advisories, and campaign launches for the NCR office.</p>
        </div>

        <div className="announcements-grid">
          {depedStories.map((story) => (
            <button
              key={story.id}
              type="button"
              className="announcement-card"
              onClick={() => openStoryGallery(story)}
            >
              <div className="announcement-card-media">
                <img src={story.image} alt={story.title} loading="lazy" decoding="async" />
              </div>
              <div className="announcement-card-copy">
                <div className="announcement-card-meta">
                  <span>{story.type}</span>
                  <small>{formatStoryDate(story.date)}</small>
                </div>
                <strong>{story.title}</strong>
                <p>{buildStorySummary(story.summary)}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="announcements-section">
        <div className="announcements-section-heading">
          <span className="section-kicker">ALS NCR</span>
          <h2>ALS announcements and activity desk</h2>
          <p>ALS activities, program notes, learner guidance, and delivery updates in a focused newsroom view.</p>
        </div>

        <div className="announcements-grid announcements-grid-als">
          {alsStories.map((story) => (
            <button
              key={story.id}
              type="button"
              className="announcement-card"
              onClick={() => openStoryGallery(story)}
            >
              <div className="announcement-card-media">
                <img src={story.image} alt={story.title} loading="lazy" decoding="async" />
              </div>
              <div className="announcement-card-copy">
                <div className="announcement-card-meta">
                  <span>{story.type}</span>
                  <small>{formatStoryDate(story.date)}</small>
                </div>
                <strong>{story.title}</strong>
                <p>{buildStorySummary(story.summary)}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {selectedStory ? (
        <div className="announcements-gallery-modal" role="dialog" aria-modal="true" aria-label={selectedStory.title}>
          <button
            type="button"
            className="announcements-gallery-backdrop"
            aria-label="Close gallery"
            onClick={closeStoryGallery}
          />
          <div className="announcements-gallery-shell">
            <button
              type="button"
              className="announcements-gallery-close"
              aria-label="Close gallery"
              onClick={closeStoryGallery}
            >
              ×
            </button>

            <div className="announcements-gallery-copy">
              <span className="section-kicker">Announcement Gallery</span>
              <h3>{selectedStory.title}</h3>
              <p>{selectedStory.summary}</p>
              <small>{formatStoryDate(selectedStory.date)}</small>
            </div>

            <div className="announcements-gallery-stage">
              {selectedStory.gallery.length > 1 ? (
                <button
                  type="button"
                  className="announcements-gallery-arrow"
                  aria-label="Previous photo"
                  onClick={() =>
                    setActiveGalleryIndex(
                      (current) => (current - 1 + selectedStory.gallery.length) % selectedStory.gallery.length
                    )
                  }
                >
                  <ChevronLeft aria-hidden="true" />
                </button>
              ) : null}

              <div className="announcements-gallery-image-frame">
                <img
                  src={selectedStory.gallery[activeGalleryIndex]}
                  alt={`${selectedStory.title} photo ${activeGalleryIndex + 1}`}
                />
              </div>

              {selectedStory.gallery.length > 1 ? (
                <button
                  type="button"
                  className="announcements-gallery-arrow"
                  aria-label="Next photo"
                  onClick={() => setActiveGalleryIndex((current) => (current + 1) % selectedStory.gallery.length)}
                >
                  <ChevronRight aria-hidden="true" />
                </button>
              ) : null}
            </div>

            <div className="announcements-gallery-thumbs">
              {selectedStory.gallery.map((image, index) => (
                <button
                  key={`${selectedStory.id}-photo-${index}`}
                  type="button"
                  className={`announcements-gallery-thumb ${activeGalleryIndex === index ? "active" : ""}`}
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
    </div>
  );
};

export default AnnouncementsPage;
