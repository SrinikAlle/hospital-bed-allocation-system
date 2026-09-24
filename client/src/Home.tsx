import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BedDouble,
  Check,
  ChevronRight,
  ClipboardList,
  Filter,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Plus,
  Search,
  ShieldCheck,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { toast } from "sonner";

type BedStatus = "Available" | "Occupied" | "Reserved" | "Maintenance";

type Bed = {
  id: string;
  ward: string;
  type: string;
  gender: "Any" | "Male" | "Female";
  status: BedStatus;
  icu: boolean;
  isolation: boolean;
  patient?: string;
};

type Patient = {
  id: string;
  name: string;
  age: string;
  gender: "Male" | "Female" | "Other";
  ward: string;
  priority: "Normal" | "Critical" | "Emergency";
  icu: boolean;
  isolation: boolean;
  bed?: string;
  status: "Waiting" | "Admitted" | "Discharged";
};

const initialBeds: Bed[] = [
  { id: "ICU-01", ward: "ICU", type: "ICU", gender: "Any", status: "Occupied", icu: true, isolation: false, patient: "R. Mehta" },
  { id: "ICU-02", ward: "ICU", type: "ICU", gender: "Any", status: "Available", icu: true, isolation: false },
  { id: "ICU-03", ward: "ICU", type: "ICU", gender: "Any", status: "Reserved", icu: true, isolation: true },
  { id: "MW-12", ward: "Medical", type: "General", gender: "Female", status: "Available", icu: false, isolation: false },
  { id: "MW-13", ward: "Medical", type: "General", gender: "Male", status: "Occupied", icu: false, isolation: false, patient: "A. Khan" },
  { id: "MW-14", ward: "Medical", type: "General", gender: "Any", status: "Maintenance", icu: false, isolation: false },
  { id: "SW-04", ward: "Surgical", type: "General", gender: "Female", status: "Available", icu: false, isolation: false },
  { id: "SW-05", ward: "Surgical", type: "General", gender: "Male", status: "Available", icu: false, isolation: true },
  { id: "SW-06", ward: "Surgical", type: "General", gender: "Any", status: "Occupied", icu: false, isolation: false, patient: "P. Nair" },
  { id: "IS-02", ward: "Isolation", type: "Isolation", gender: "Any", status: "Available", icu: false, isolation: true },
  { id: "IS-03", ward: "Isolation", type: "Isolation", gender: "Any", status: "Occupied", icu: false, isolation: true, patient: "M. Joseph" },
  { id: "PW-07", ward: "Pediatric", type: "Pediatric", gender: "Any", status: "Available", icu: false, isolation: false },
];

const initialPatients: Patient[] = [
  { id: "PT-2048", name: "R. Mehta", age: "64", gender: "Male", ward: "ICU", priority: "Critical", icu: true, isolation: false, bed: "ICU-01", status: "Admitted" },
  { id: "PT-2047", name: "A. Khan", age: "52", gender: "Male", ward: "Medical", priority: "Normal", icu: false, isolation: false, bed: "MW-13", status: "Admitted" },
  { id: "PT-2046", name: "P. Nair", age: "38", gender: "Female", ward: "Surgical", priority: "Critical", icu: false, isolation: false, bed: "SW-06", status: "Admitted" },
  { id: "PT-2045", name: "M. Joseph", age: "71", gender: "Female", ward: "Isolation", priority: "Emergency", icu: false, isolation: true, bed: "IS-03", status: "Admitted" },
];

const emptyForm = {
  name: "",
  age: "",
  gender: "Female" as Patient["gender"],
  ward: "Medical",
  priority: "Normal" as Patient["priority"],
  icu: false,
  isolation: false,
};

function canUseBed(patient: Patient, bed: Bed) {
  const available = bed.status === "Available";
  const gender = bed.gender === "Any" || bed.gender === patient.gender;
  const ward = patient.icu
    ? bed.icu
    : bed.ward === patient.ward || (patient.isolation && bed.isolation);
  const icu = !patient.icu || bed.icu;
  const isolation = !patient.isolation || bed.isolation;
  return available && gender && ward && icu && isolation;
}

export default function Home() {
  const [beds, setBeds] = useState(initialBeds);
  const [patients, setPatients] = useState(initialPatients);
  const [search, setSearch] = useState("");
  const [ward, setWard] = useState("All wards");
  const [selectedPatient, setSelectedPatient] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [logs, setLogs] = useState([
    "Constraint engine ready - 5 rules loaded",
    "Bed board initialized with demo data",
    "Isolation bed IS-02 ready for allocation",
  ]);

  const counts = useMemo(() => {
    return {
      total: beds.length,
      available: beds.filter(b => b.status === "Available").length,
      occupied: beds.filter(b => b.status === "Occupied").length,
      attention: beds.filter(b => b.status === "Reserved" || b.status === "Maintenance").length,
    };
  }, [beds]);

  const filteredBeds = beds.filter(b => {
    const wardMatch = ward === "All wards" || b.ward === ward;
    const text = (b.id + " " + b.ward + " " + (b.patient || "")).toLowerCase();
    return wardMatch && text.includes(search.toLowerCase());
  });

  const waitingPatients = patients.filter(p => p.status === "Waiting" && !p.bed);

  function allocate() {
    const patient = patients.find(p => p.id === selectedPatient);
    if (!patient) return;

    const bed = beds.find(b => canUseBed(patient, b));
    if (!bed) {
      toast.error("No compatible bed found");
      setLogs(old => ["Allocation blocked for " + patient.name, ...old]);
      return;
    }

    setBeds(old =>
      old.map(item =>
        item.id === bed.id
          ? { ...item, status: "Occupied" as const, patient: patient.name }
          : item
      )
    );
    setPatients(old =>
      old.map(item =>
        item.id === patient.id
          ? { ...item, bed: bed.id, status: "Admitted" as const }
          : item
      )
    );
    setSelectedPatient("");
    setLogs(old => [patient.name + " allocated to " + bed.id + " - 5/5 rules satisfied", ...old]);
    toast.success("Allocated " + bed.id + " to " + patient.name);
  }

  function releaseBed(bed: Bed) {
    setBeds(old =>
      old.map(item =>
        item.id === bed.id
          ? { ...item, status: "Available" as const, patient: undefined }
          : item
      )
    );
    setPatients(old =>
      old.map(item =>
        item.bed === bed.id
          ? { ...item, bed: undefined, status: "Discharged" as const }
          : item
      )
    );
    setLogs(old => [bed.id + " released and marked available", ...old]);
    toast.success(bed.id + " is now available");
  }

  function registerPatient() {
    if (!form.name.trim() || !form.age.trim()) {
      toast.error("Enter patient name and age");
      return;
    }

    const patient: Patient = {
      ...form,
      id: "PT-" + (2050 + patients.length),
      name: form.name.trim(),
      age: form.age.trim(),
      status: "Waiting",
    };

    setPatients(old => [patient, ...old]);
    setSelectedPatient(patient.id);
    setForm(emptyForm);
    setShowForm(false);
    setLogs(old => [patient.name + " registered and added to the queue", ...old]);
    toast.success("Patient registered");
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <span className="brandIcon"><BedDouble size={21} /></span>
          <div><strong>WARDFLOW</strong><small>Bed allocation system</small></div>
        </div>

        <p className="navLabel">Operations</p>
        <button className="nav active"><LayoutDashboard size={18} /> Dashboard</button>
        <button className="nav"><BedDouble size={18} /> Bed board <em>{counts.available}</em></button>
        <button className="nav"><UsersRound size={18} /> Patients</button>
        <button className="nav"><ClipboardList size={18} /> Allocation log</button>

        <div className="systemCard">
          <span className="liveDot" />
          Constraint engine online
          <small>Local student demo</small>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div><span>Operations</span><ChevronRight size={14} /><strong>Dashboard</strong></div>
          <span className="status"><span className="liveDot" /> Demo data active</span>
        </header>

        <div className="content">
          <section className="hero">
            <div>
              <p className="eyebrow"><Activity size={14} /> Hospital operations demo</p>
              <h1>Bed allocation, <em>made clearer.</em></h1>
              <p>Track capacity, register patients, and demonstrate rule-based matching from one dashboard.</p>
            </div>
            <button className="primary" onClick={() => setShowForm(true)}>
              <Plus size={17} /> Register patient
            </button>
          </section>

          <section className="metrics">
            <Metric label="Total beds" value={counts.total} note="Across five wards" icon={<BedDouble />} />
            <Metric label="Available" value={counts.available} note="Ready for allocation" icon={<Check />} />
            <Metric label="Occupied" value={counts.occupied} note="Current admissions" icon={<HeartPulse />} />
            <Metric label="Needs attention" value={counts.attention} note="Reserved or maintenance" icon={<AlertTriangle />} />
          </section>

          <section className="layout">
            <div className="panel bedsPanel">
              <PanelTitle eyebrow="Live inventory" title="Bed board" />
              <div className="filters">
                <label className="search">
                  <Search size={16} />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search bed or patient"
                  />
                </label>
                <label className="selectWrap">
                  <Filter size={15} />
                  <select value={ward} onChange={e => setWard(e.target.value)}>
                    <option>All wards</option>
                    <option>ICU</option>
                    <option>Medical</option>
                    <option>Surgical</option>
                    <option>Isolation</option>
                    <option>Pediatric</option>
                  </select>
                </label>
              </div>

              <div className="bedGrid">
                {filteredBeds.map(bed => (
                  <article className={"bedCard " + bed.status.toLowerCase()} key={bed.id}>
                    <div className="bedTop">
                      <strong>{bed.id}</strong>
                      <span>{bed.status}</span>
                    </div>
                    <p>{bed.ward} · {bed.type}</p>
                    <div className="tags">
                      {bed.icu && <span>ICU</span>}
                      {bed.isolation && <span>Isolation</span>}
                      {bed.gender !== "Any" && <span>{bed.gender}</span>}
                    </div>
                    {bed.patient ? (
                      <div className="patientLine">
                        <UserRound size={14} />
                        <span>{bed.patient}</span>
                        <button title="Release bed" onClick={() => releaseBed(bed)}>
                          <LogOut size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="emptyBed"><BedDouble size={14} /> No patient assigned</div>
                    )}
                  </article>
                ))}
              </div>
            </div>

            <div className="sideStack">
              <div className="panel">
                <PanelTitle eyebrow="Constraint-based placement" title="Allocation queue" />
                <p className="muted">Select a waiting patient and run the matching rules.</p>
                {waitingPatients.length === 0 ? (
                  <div className="emptyState"><ShieldCheck size={23} /> No patients waiting</div>
                ) : (
                  waitingPatients.map(patient => (
                    <button
                      key={patient.id}
                      className={"queueItem " + (selectedPatient === patient.id ? "selected" : "")}
                      onClick={() => setSelectedPatient(patient.id)}
                    >
                      <span className="avatar">{patient.name.slice(0, 2).toUpperCase()}</span>
                      <span className="queueName">
                        <strong>{patient.name}</strong>
                        <small>{patient.ward} · {patient.priority}</small>
                      </span>
                    </button>
                  ))
                )}
                <button className="secondary full" disabled={!selectedPatient} onClick={allocate}>
                  <ShieldCheck size={16} /> Run allocation
                </button>
              </div>

              <div className="panel darkPanel">
                <PanelTitle eyebrow="Matching logic" title="Five hard constraints" />
                {["Bed availability", "Ward compatibility", "Gender compatibility", "ICU requirement", "Isolation requirement"].map(rule => (
                  <div className="rule" key={rule}><Check size={14} /> {rule}<span>Active</span></div>
                ))}
              </div>

              <div className="panel">
                <PanelTitle eyebrow="Recent activity" title="Allocation log" />
                {logs.slice(0, 4).map((log, index) => (
                  <div className="log" key={log + index}>
                    <span />
                    <p>{log}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="panel patientPanel">
            <PanelTitle eyebrow="Patient registry" title="Current patients" />
            <div className="tableWrap">
              <table>
                <thead>
                  <tr><th>Patient</th><th>Ward</th><th>Priority</th><th>Bed</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {patients.slice(0, 7).map(patient => (
                    <tr key={patient.id}>
                      <td><strong>{patient.name}</strong><small>{patient.id} · {patient.age} yrs</small></td>
                      <td>{patient.ward}</td>
                      <td><span className={"priority " + patient.priority.toLowerCase()}>{patient.priority}</span></td>
                      <td>{patient.bed || "Awaiting"}</td>
                      <td>{patient.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <footer>CSP-inspired student prototype · Not for clinical use</footer>
        </div>
      </main>

      {showForm && (
        <div className="modalBackdrop" onMouseDown={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal">
            <div className="modalHead">
              <div><p className="eyebrow">New admission</p><h2>Register patient</h2></div>
              <button className="iconButton" onClick={() => setShowForm(false)}><X size={18} /></button>
            </div>
            <div className="formGrid">
              <label>Name<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Patient name" /></label>
              <label>Age<input type="number" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} placeholder="Age" /></label>
              <label>Gender<select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value as Patient["gender"] })}><option>Female</option><option>Male</option><option>Other</option></select></label>
              <label>Ward<select value={form.ward} onChange={e => setForm({ ...form, ward: e.target.value })}><option>Medical</option><option>Surgical</option><option>Isolation</option><option>Pediatric</option></select></label>
              <label>Priority<select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as Patient["priority"] })}><option>Normal</option><option>Critical</option><option>Emergency</option></select></label>
            </div>
            <div className="checks">
              <label><input type="checkbox" checked={form.icu} onChange={e => setForm({ ...form, icu: e.target.checked })} /> ICU required</label>
              <label><input type="checkbox" checked={form.isolation} onChange={e => setForm({ ...form, isolation: e.target.checked })} /> Isolation required</label>
            </div>
            <div className="modalActions">
              <button className="secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="primary" onClick={registerPatient}><UserRound size={16} /> Register</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, note, icon }: { label: string; value: number; note: string; icon: React.ReactNode }) {
  return (
    <article className="metric">
      <span className="metricIcon">{icon}</span>
      <div><small>{label}</small><strong>{value}</strong><p>{note}</p></div>
    </article>
  );
}

function PanelTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return <div className="panelTitle"><p>{eyebrow}</p><h2>{title}</h2></div>;
}
