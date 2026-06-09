import React, { useMemo, useState } from "react";
import { Building2, UsersRound } from "lucide-react";
import "./ALSStructurePage.css";

const REGIONAL_STRUCTURE = [
  { position: "Regional Director", unit: "DepEd National Capital Region", name: "Jocelyn DR Andaya" },
  {
    position: "Assistant Regional Director",
    unit: "DepEd National Capital Region",
    name: "Rita E. Riddle, CESO V",
  },
  {
    position: "Chief Education Supervisor",
    unit: "DepEd National Capital Region",
    name: "Micah G. Pacheco",
  },
  {
    position: "Regional ALS Focal Person / ALS Supervisor",
    unit: "DepEd National Capital Region",
    name: "Charito A. Villanueva",
  },
];

const DIVISION_STRUCTURE_ROLES = [
  "Schools Division Superintendent",
  "Assistant Schools Division Superintendent",
  "CID Chief",
  "Division ALS Focal Person",
  "Division ALS Coordinator",
];

const getInitials = (label) =>
  String(label || "ALS")
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

const StructurePersonCard = ({ person, index }) => (
  <article className="structure-person-card" style={{ "--structure-index": index }}>
    <div className="structure-photo-placeholder" aria-hidden="true">
      <span>{getInitials(person.role)}</span>
    </div>
    <div>
      <strong>{person.name}</strong>
      <span>{person.role}</span>
    </div>
  </article>
);

const RegionalOrgCard = ({ person, index }) => (
  <article className="regional-org-card" style={{ "--structure-index": index }}>
    <header>{person.name}</header>
    <div className="regional-org-card-body">
      <div className="regional-org-photo" aria-hidden="true">
        <span>{getInitials(person.position)}</span>
      </div>
      <dl>
        <div>
          <dt>Position</dt>
          <dd>{person.position}</dd>
        </div>
        <div>
          <dt>Office</dt>
          <dd>{person.unit}</dd>
        </div>
      </dl>
    </div>
  </article>
);

const RegionalStructureChart = ({ people }) => (
  <div className="regional-org-chart">
    {people.map((person, index) => (
      <React.Fragment key={person.position}>
        <RegionalOrgCard person={person} index={index} />
        {index < people.length - 1 ? (
          <div className="regional-org-connector" aria-hidden="true">
            <span />
          </div>
        ) : null}
      </React.Fragment>
    ))}
  </div>
);

const StructureFlow = ({ people }) => (
  <div className="structure-flow">
    {people.map((person, index) => (
      <React.Fragment key={`${person.role}-${index}`}>
        <StructurePersonCard person={person} index={index} />
        {index < people.length - 1 ? <span className="structure-flow-line" aria-hidden="true" /> : null}
      </React.Fragment>
    ))}
  </div>
);

const DivisionTeacherCard = ({ teacher }) => {
  const name = teacher?.name || "Name pending";
  const position = teacher?.position || "ALS Teacher / Implementer";

  return (
    <article className="division-teacher-card">
      <div className="division-teacher-photo" aria-hidden="true">
        <span>{getInitials(name)}</span>
      </div>
      <div>
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
    () =>
      DIVISION_STRUCTURE_ROLES.map((role) => ({
        role,
        name: "Name pending",
        division: activeDivision,
      })),
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
              <StructureFlow people={divisionStructure} />

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
                    <span>Teacher placeholders will appear once records are available.</span>
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
