export type Risk = "ALTA" | "MEDIA" | "BAJA";

export type Patient = {
  id: string;
  name: string;
  age: number;
  lastVisit: string; // ISO date
  risk: Risk;
  tags: string[];
  specialty: string;
};

export const patients: Patient[] = [
  { id: "p-0001", name: "María Salazar Echeverri", age: 42, lastVisit: "2026-04-08", risk: "MEDIA", tags: ["HTA", "Sobrepeso"], specialty: "Medicina interna" },
  { id: "p-0002", name: "Rodrigo Castaño Pineda", age: 58, lastVisit: "2026-05-02", risk: "ALTA", tags: ["Diabetes", "Postoperatorio"], specialty: "Cirugía general" },
  { id: "p-0003", name: "Valentina Ruiz Henao", age: 27, lastVisit: "2026-04-29", risk: "BAJA", tags: ["Migraña"], specialty: "Neurología" },
  { id: "p-0004", name: "Ernesto Vélez Ocampo", age: 71, lastVisit: "2026-05-10", risk: "ALTA", tags: ["EPOC", "HTA"], specialty: "Medicina interna" },
  { id: "p-0005", name: "Camila Arboleda Restrepo", age: 33, lastVisit: "2026-05-11", risk: "MEDIA", tags: ["Gastritis"], specialty: "Gastroenterología" },
  { id: "p-0006", name: "Daniel Quintero Gómez", age: 49, lastVisit: "2026-03-22", risk: "MEDIA", tags: ["Anemia"], specialty: "Medicina interna" },
  { id: "p-0007", name: "Isabela Tobón Marín", age: 19, lastVisit: "2026-02-14", risk: "BAJA", tags: ["Asma"], specialty: "Neumología" },
  { id: "p-0008", name: "Felipe Cárdenas Soto", age: 36, lastVisit: "2026-05-13", risk: "BAJA", tags: [], specialty: "Medicina general" },
  { id: "p-0009", name: "Antonia Pérez Gallego", age: 64, lastVisit: "2026-04-19", risk: "MEDIA", tags: ["Arritmia"], specialty: "Cardiología" },
  { id: "p-0010", name: "Luciano Estrada Ríos", age: 52, lastVisit: "2026-05-05", risk: "ALTA", tags: ["IRC", "HTA"], specialty: "Nefrología" },
  { id: "p-0011", name: "Sara Lopera Cardona", age: 24, lastVisit: "2026-05-08", risk: "BAJA", tags: ["Tos crónica"], specialty: "Neumología" },
  { id: "p-0012", name: "Tomás Aristizábal Mejía", age: 67, lastVisit: "2026-05-03", risk: "ALTA", tags: ["Diabetes"], specialty: "Endocrinología" },
  { id: "p-0013", name: "Manuela Jaramillo Vélez", age: 31, lastVisit: "2026-03-30", risk: "BAJA", tags: ["Embarazo 22 sem"], specialty: "Ginecología" },
  { id: "p-0014", name: "Sebastián Ramírez Holguín", age: 45, lastVisit: "2026-04-12", risk: "MEDIA", tags: ["Dislipidemia"], specialty: "Medicina interna" },
  { id: "p-0015", name: "Lucía Bustamante Toro", age: 78, lastVisit: "2026-04-26", risk: "ALTA", tags: ["Demencia", "HTA"], specialty: "Geriatría" },
  { id: "p-0016", name: "Mateo Hincapié Sánchez", age: 14, lastVisit: "2026-04-02", risk: "BAJA", tags: ["Control crecimiento"], specialty: "Pediatría" },
  { id: "p-0017", name: "Laura Posada Naranjo", age: 38, lastVisit: "2026-05-09", risk: "MEDIA", tags: ["Tiroides"], specialty: "Endocrinología" },
  { id: "p-0018", name: "Andrés Betancur Zapata", age: 55, lastVisit: "2026-01-18", risk: "MEDIA", tags: ["Lumbalgia"], specialty: "Ortopedia" },
  { id: "p-0019", name: "Paula Andrea Cano Rivera", age: 29, lastVisit: "2026-05-07", risk: "BAJA", tags: ["Ansiedad"], specialty: "Psiquiatría" },
  { id: "p-0020", name: "Gabriel Restrepo Londoño", age: 60, lastVisit: "2026-04-30", risk: "ALTA", tags: ["IAM previo"], specialty: "Cardiología" },
  { id: "p-0021", name: "Renata Giraldo Bedoya", age: 41, lastVisit: "2026-02-27", risk: "BAJA", tags: ["Dermatitis"], specialty: "Dermatología" },
  { id: "p-0022", name: "Nicolás Madrid Sierra", age: 22, lastVisit: "2026-05-11", risk: "BAJA", tags: ["Lesión deportiva"], specialty: "Ortopedia" },
  { id: "p-0023", name: "Helena Correa Ospina", age: 47, lastVisit: "2026-03-08", risk: "MEDIA", tags: ["Migraña crónica"], specialty: "Neurología" },
  { id: "p-0024", name: "Esteban Yepes Vásquez", age: 35, lastVisit: "2026-04-22", risk: "BAJA", tags: [], specialty: "Medicina general" },
  { id: "p-0025", name: "Carolina Bedoya Franco", age: 53, lastVisit: "2026-05-06", risk: "MEDIA", tags: ["Osteoporosis"], specialty: "Reumatología" },
  { id: "p-0026", name: "Joaquín Patiño Álvarez", age: 12, lastVisit: "2026-04-15", risk: "BAJA", tags: ["Asma controlada"], specialty: "Pediatría" },
  { id: "p-0027", name: "Ana María Duque Castro", age: 88, lastVisit: "2026-05-04", risk: "ALTA", tags: ["ACV previo", "HTA"], specialty: "Geriatría" },
];

export const specialties = [
  "Medicina general",
  "Medicina interna",
  "Cardiología",
  "Neurología",
  "Endocrinología",
  "Gastroenterología",
  "Neumología",
  "Ortopedia",
  "Pediatría",
  "Geriatría",
  "Dermatología",
  "Ginecología",
  "Psiquiatría",
  "Reumatología",
  "Nefrología",
  "Cirugía general",
];