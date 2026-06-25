import React, { useMemo, useState } from "react";
import { Building2, UsersRound } from "lucide-react";
import "./ALSStructurePage.css";

const REGIONAL_STRUCTURE = [
  {
    position: "Regional Director, NCR Concurrent Officer-in-Charge, Office of the Assistant Secretary for Operations",
    unit: "DepEd National Capital Region",
    office: "Office of the Regional Director",
    name: "JOCELYN DR ANDAYA",
    photo: "/leadership/JOCELYN-DR.-ANDAYA.png",
    photoFit: "cover",
    photoPosition: "50% 8%",
  },
  {
    position: "Chief Education Supervisor, ESSD Concurrent Officer-in-Charge, Office of the Assistant Regional Director",
    unit: "DepEd National Capital Region",
    office: "Office of the Assistant Regional Director",
    name: "RITA E. RIDDLE, CESO V",
    photo: "/leadership/RITA E RIDDLE.jpg",
    photoFit: "contain",
    photoPosition: "center top",
  },
  {
    position: "Chief Education Supervisor",
    unit: "DepEd National Capital Region",
    office: "Curriculum and Learning Management Division",
    name: "MICAH G. PACHECO",
    photo: "/leadership/MICAH-G-PACHECO.jpg",
    photoFit: "contain",
    photoPosition: "center top",
  },
  {
    position: "Education Program Supervisor\nRegional ALS Focal Person",
    unit: "DepEd National Capital Region",
    office: "Curriculum and Learning Management Division",
    name: "CHARITO A. VILLANUEVA",
    photo: "/leadership/CHARITO-A-VILLANUEVA.jpg",
    photoFit: "contain",
    photoPosition: "center top",
  },
];

const DEFAULT_DIVISION_STRUCTURE = [
  { role: "Schools Division Superintendent", name: "NAME PENDING", position: "Schools Division Superintendent" },
  {
    role: "Assistant Schools Division Superintendent",
    name: "NAME PENDING",
    position: "Assistant Schools Division Superintendent",
  },
  { role: "CID Chief", name: "NAME PENDING", position: "CID Chief" },
  { role: "Division ALS Supervisor", name: "NAME PENDING", position: "Division ALS Supervisor" },
  { role: "Education Program Specialist II", name: "NAME PENDING", position: "Education Program Specialist II" },
];

const DIVISION_LEADERSHIP = {
  CALOOCAN: [
    {
      role: "Schools Division Superintendent",
      name: "DR. CECILLE G. CARANDANG, CESO V",
      position: "Schools Division Superintendent",
      photo: "/caloocan-leadership/Dr. Cecille G. Carandang, CESO V.png",
      photoFit: "contain",
      photoPosition: "center top",
    },
    {
      role: "Assistant Schools Division Superintendent",
      name: "DR. BRIAN E. ILAN, CESO VI",
      position: "Assistant Schools Division Superintendent",
      photo: "/caloocan-leadership/Dr. Brian E. Ilan, CESO VI.png",
      photoFit: "contain",
      photoPosition: "center top",
    },
    {
      role: "Assistant Schools Division Superintendent",
      name: "DR. WARREN A. RAMOS, CESE",
      position: "Assistant Schools Division Superintendent",
      photo: "/caloocan-leadership/Dr. Warren A. Ramos, CESO VI.png",
      photoFit: "contain",
      photoPosition: "center top",
    },
    {
      role: "CID Chief",
      name: "DR. JOCELYN M. ALIÑAB",
      position: "CID, Chief Education Supervisor",
      photo: "/caloocan-leadership/Dr. Jocelyn M. Aliñab.png",
      photoFit: "contain",
      photoPosition: "center top",
    },
    {
      role: "Division ALS Supervisor",
      name: "DR. JOHN PATRICK A. PALAD",
      position: "Education Program Supervisor\nDivision ALS Focal Person",
      photo: "/caloocan-leadership/PALAD, JOHN PATRICK.png",
      photoFit: "contain",
      photoPosition: "center top",
    },
    {
      role: "Education Program Specialist II",
      name: "MR. JENNY P. PABLICO",
      position: "Education Program Specialist II",
      photo: "/caloocan-leadership/PABLICO, JENNY.png",
      photoFit: "contain",
      photoPosition: "center top",
    },
    {
      role: "Education Program Specialist II",
      name: "MS. MARIVAL C. SAPAD",
      position: "Education Program Specialist II",
      photo: "/caloocan-leadership/SAPAD, MARIVAL.png",
      photoFit: "contain",
      photoPosition: "center top",
    },
    {
      role: "Education Program Specialist II",
      name: "MS. JOSELDA B. DELFINADO",
      position: "Education Program Specialist II",
      photo: "/caloocan-leadership/DELFIÑADO, JOSELDA.png",
      photoFit: "contain",
      photoPosition: "center top",
    },
    {
      role: "Education Program Specialist II",
      name: "MS. VILLA A. CABRERA",
      position: "Education Program Specialist II",
      photo: "/caloocan-leadership/CABRERA, VILLA.png",
      photoFit: "contain",
      photoPosition: "center top",
    },
    {
      role: "Education Program Specialist II",
      name: "MR. ARSENIO G. DACUYA JR.",
      position: "Education Program Specialist II",
      photo: "/caloocan-leadership/DACUYA, ARSENIO.png",
      photoFit: "contain",
      photoPosition: "center top",
    },
  ],
  "LAS PIÑAS": [
    {
      role: "Schools Division Superintendent",
      name: "MELODY P. CRUZ, CESO VI",
      position: "Schools Division Superintendent",
      photo: "/laspiñas-leadership/MELODY P CRUZ.png",
      photoFit: "contain",
      photoPosition: "center top",
    },
    {
      role: "Assistant Schools Division Superintendent",
      name: "MARIAN A. SORIANO, CESE",
      position: "Assistant Schools Division Superintendent",
      photo: "/laspiñas-leadership/MARIAN A SORIANO.jpg",
      photoFit: "contain",
      photoPosition: "center top",
    },
    {
      role: "CID Chief",
      name: "RAQUEL M. AUSTERO",
      position: "CID, Chief Education Supervisor",
    },
    {
      role: "Division ALS Supervisor",
      name: "ROSELLE R. SABIDO",
      position: "Education Program Supervisor\nDivision ALS Focal Person",
    },
    {
      role: "Education Program Specialist II",
      name: "MARIBEL P. PANGANIBAN",
      position: "Education Program Specialist II",
    },
    {
      role: "Education Program Specialist II",
      name: "JOHN CARL P. CABARLES",
      position: "Education Program Specialist II",
    },
  ],
  "QUEZON CITY": [
    {
      role: "Schools Division Superintendent",
      name: "CARLEEN S. SEDILLA, CESO V",
      position: "Schools Division Superintendent",
      photo: "/quezoncity-leadership/CARLEEN S. SEDILLA.png",
      photoFit: "cover",
      photoPosition: "center 18%",
    },
    {
      role: "Assistant Schools Division Superintendent",
      name: "ISABELLE S. SIBAYAN, CESE",
      position: "Assistant Schools Division Superintendent",
      photo: "/quezoncity-leadership/ISABELLE S. SIBAYAN.png",
      photoFit: "cover",
      photoPosition: "center 18%",
    },
    {
      role: "Assistant Schools Division Superintendent",
      name: "REGINALDO A. REYES",
      position: "OIC-Assistant Schools Division Superintendent",
      photo: "/quezoncity-leadership/REGINALDO A. REYES.png",
      photoFit: "cover",
      photoPosition: "center 16%",
    },
    {
      role: "CID Chief",
      name: "HEIDEE F. FERRER",
      position: "CID, Chief Education Supervisor",
      photo: "/quezoncity-leadership/HEIDEE F. FERRER.png",
      photoFit: "cover",
      photoPosition: "center 18%",
    },
    {
      role: "SGOD Chief",
      name: "EDERLINA D. BALEÑA",
      position: "OIC - Chief Education Supervisor, SGOD",
      photo: "/quezoncity-leadership/EDERLINA D. BALEÑA.png",
      photoFit: "cover",
      photoPosition: "center 18%",
    },
    {
      role: "Education Program Specialist II",
      name: "JENNILYN G. CHING",
      position: "Education Program Specialist II",
      photo: "/quezoncity-leadership/JENNILYN G. CHING.png",
      photoFit: "cover",
      photoPosition: "center 18%",
    },
    {
      role: "Education Program Specialist II",
      name: "DENNIS G. MAÑO",
      position: "Education Program Specialist II",
      photo: "/quezoncity-leadership/DENNIS G. MAÑO.png",
      photoFit: "cover",
      photoPosition: "center 18%",
    },
    {
      role: "Education Program Specialist II",
      name: "GEMMA P. ABANILLA",
      position: "Education Program Specialist II",
      photo: "/quezoncity-leadership/GEMMA P. ABANILLA.png",
      photoFit: "cover",
      photoPosition: "center 18%",
    },
    {
      role: "Education Program Specialist II",
      name: "VICTORIA M. DELA CRUZ",
      position: "Education Program Specialist II",
      photo: "/quezoncity-leadership/VICTORIA M. DELA CRUZ.png",
      photoFit: "cover",
      photoPosition: "center 18%",
    },
    {
      role: "Education Program Specialist II",
      name: "RIA V. HERJAS",
      position: "Education Program Specialist II",
      photo: "/quezoncity-leadership/RIA V. HERJAS.png",
      photoFit: "cover",
      photoPosition: "center 18%",
    },
  ],
  "SAN JUAN": [
    {
      role: "Schools Division Superintendent",
      name: "NERISSA L. LOSARIA",
      position: "Schools Division Superintendent",
    },
    {
      role: "Assistant Schools Division Superintendent",
      name: "DOMINIQUE T. RIVERA",
      position: "Assistant Schools Division Superintendent",
    },
    {
      role: "CID Chief",
      name: "JOSEFINO C. POGOY JR.",
      position: "CID, Chief Education Supervisor",
    },
  ],
};

const getInitials = (label) =>
  String(label || "ALS")
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

const PortraitMedia = ({
  photo,
  label,
  size = "medium",
  className = "",
  photoPosition = "",
  photoFit = "",
}) => {
  const hasPhoto = Boolean(String(photo || "").trim());

  return (
    <div className={`structure-portrait-shell structure-portrait-shell-${size} ${className}`.trim()}>
      {hasPhoto ? (
        <img
          src={photo}
          alt={label}
          className="structure-portrait-image"
          style={{
            ...(photoPosition ? { objectPosition: photoPosition } : {}),
            ...(photoFit ? { objectFit: photoFit } : {}),
          }}
        />
      ) : (
        <div className="structure-portrait-fallback" aria-hidden="true">
          <span>{getInitials(label)}</span>
        </div>
      )}
    </div>
  );
};

const StructurePersonCard = ({ person, index }) => (
  <article className="regional-org-card division-org-card" style={{ "--structure-index": index }}>
    <PortraitMedia
      photo={person.photo}
      label={person.name || person.role}
      className="regional-org-portrait division-org-portrait"
      size="large"
      photoPosition={person.photoPosition}
      photoFit={person.photoFit}
    />

    <div className="regional-org-card-copy">
      <strong>{person.name}</strong>
      <span>{person.position || "Profile pending assignment"}</span>
    </div>
  </article>
);

const RegionalOrgCard = ({ person, index }) => (
  <article className="regional-org-card regional-org-card-portrait" style={{ "--structure-index": index }}>
    <div className="regional-org-card-top">
      <span className="section-kicker">{person.office || "Regional Leadership"}</span>
    </div>

    <PortraitMedia
      photo={person.photo}
      label={person.name || person.position}
      className="regional-org-portrait"
      size="large"
      photoPosition={person.photoPosition}
      photoFit={person.photoFit}
    />

    <div className="regional-org-card-copy">
      <strong>{person.name}</strong>
      <span>{person.position}</span>
    </div>
  </article>
);

const RegionalStructureChart = ({ people }) => (
  <div className="regional-org-chart" role="list" aria-label="Regional leadership organizational chart">
    {people.map((person, index) => {
      const isLast = index === people.length - 1;

      return (
        <div
          key={person.position}
          className={`regional-org-node regional-org-node-${index + 1}`}
          role="listitem"
        >
          <RegionalOrgCard person={person} index={index} />
          {!isLast ? <div className="regional-org-connector" aria-hidden="true" /> : null}
        </div>
      );
    })}
  </div>
);

const StructureFlow = ({ people }) => (
  <div className="structure-flow">
    {people.map((person, index) => (
      <StructurePersonCard key={`${person.role}-${index}`} person={person} index={index} />
    ))}
  </div>
);

const DivisionTeacherCard = ({ teacher }) => {
  const name = teacher?.name || "Name pending";
  const position = teacher?.position || "ALS Teacher / Implementer";
  const photo = teacher?.photo || "";

  return (
    <article className="division-teacher-card">
      <PortraitMedia
        photo={photo}
        label={name}
        className="division-teacher-photo"
        size="small"
        photoPosition={teacher?.photoPosition}
        photoFit={teacher?.photoFit}
      />
      <div className="division-teacher-copy">
        <span className="structure-role-kicker">ALS Teacher / Implementer</span>
        <strong>{name}</strong>
        <span>{position}</span>
      </div>
    </article>
  );
};

const ALSStructurePage = ({ divisions = [], currentDivision = "" }) => {
  const divisionNames = useMemo(
    () => divisions.map((division) => division.division).filter(Boolean),
    [divisions]
  );
  const [selectedDivision, setSelectedDivision] = useState(currentDivision || "");
  const activeDivision = selectedDivision || divisionNames[0] || "";
  const activeDivisionData = useMemo(
    () => divisions.find((division) => division.division === activeDivision) || null,
    [activeDivision, divisions]
  );
  const divisionTeachers = activeDivisionData?.teacherList || [];

  const divisionStructure = useMemo(
    () => {
      const divisionKey = String(activeDivision || "").toUpperCase();
      const configuredStructure = DIVISION_LEADERSHIP[divisionKey] || DEFAULT_DIVISION_STRUCTURE;

      return configuredStructure.map((person) => ({
        ...person,
        division: activeDivision,
        photo: person.photo || "",
      }));
    },
    [activeDivision]
  );

  return (
    <div className="als-structure-page">
      <section className="als-structure-hero">
        <div className="als-structure-hero-copy">
          <span className="section-kicker section-kicker-light">ALS Governance</span>
          <h2>ALS Structure</h2>
        </div>
      </section>

      <section className="structure-section structure-section-regional" aria-label="Regional ALS structure">
        <div className="structure-block-heading">
          <span className="section-kicker">Regional Governance</span>
          <h3>REGIONAL LEADERSHIP</h3>
          <p>Leadership roles are displayed as official profile cards so future uploaded portraits can be shown clearly.</p>
        </div>

        <RegionalStructureChart people={REGIONAL_STRUCTURE} />
      </section>

      <section className="structure-section structure-section-division" aria-label="Division ALS structure">
        <div className="structure-control-panel">
          <div className="structure-section-heading">
            <div className="structure-heading-icon" aria-hidden="true">
              <Building2 size={30} />
            </div>
            <div>
              <span className="section-kicker">Division Structure</span>
              <h3>{activeDivision || "Select Division"}</h3>
            </div>
          </div>

          <label className="structure-division-select-shell" htmlFor="als-structure-division">
            <span>Choose Division</span>
            <select
              id="als-structure-division"
              value={activeDivision}
              onChange={(event) => setSelectedDivision(event.target.value)}
            >
              {divisionNames.map((divisionName) => (
                <option key={divisionName} value={divisionName}>
                  {divisionName}
                </option>
              ))}
            </select>
          </label>
        </div>

        {activeDivision ? (
          <div className="division-structure-panel">
            <div className="division-structure-summary">
              <div className="structure-heading-icon structure-heading-icon-soft" aria-hidden="true">
                <UsersRound size={30} />
              </div>
              <div>
                <strong>{activeDivision}</strong>
                <span>{divisionTeachers.length} ALS teachers / implementers listed</span>
              </div>
            </div>

            <div className="division-org-chart">
              <section className="division-leadership-panel" aria-label={`${activeDivision} leadership roles`}>
                <div className="division-panel-heading">
                  <span className="section-kicker">Division Leadership</span>
                  <strong>Portrait-ready role cards</strong>
                </div>

                <StructureFlow people={divisionStructure} />
              </section>

              <div className="division-teacher-connector" aria-hidden="true">
                <span />
              </div>

              <section className="division-teacher-group" aria-label={`${activeDivision} ALS teachers`}>
                <div className="division-teacher-heading">
                  <span className="section-kicker">ALS Teachers / Implementers</span>
                  <strong>{divisionTeachers.length} personnel</strong>
                </div>

                {divisionTeachers.length ? (
                  <div className="division-teacher-grid">
                    {divisionTeachers.map((teacher, index) => (
                      <DivisionTeacherCard
                        key={`${teacher?.name || "teacher"}-${teacher?.position || "position"}-${index}`}
                        teacher={teacher}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="structure-empty-state structure-empty-state-compact">
                    <strong>No teacher records found</strong>
                    <span>Teacher portraits and names will appear here once records are available.</span>
                  </div>
                )}
              </section>
            </div>
          </div>
        ) : (
          <div className="structure-empty-state">
            <strong>Select a division</strong>
            <span>Division structure placeholders will appear here.</span>
          </div>
        )}
      </section>
    </div>
  );
};

export default ALSStructurePage;
