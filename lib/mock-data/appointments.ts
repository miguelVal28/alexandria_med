export type AppointmentStatus = "Confirmada" | "Pendiente" | "Realizada";

export type Appointment = {
  id: string;
  doctor: string;
  specialty: string;
  date: string; // ISO date
  time: string; // HH:mm
  location: string;
  status: AppointmentStatus;
  reason: string;
};

export const appointments: Appointment[] = [
  {
    id: "a-1042",
    doctor: "Dra. Catalina Restrepo",
    specialty: "Medicina interna",
    date: "2026-05-18",
    time: "10:30",
    location: "Sede Laureles · Consultorio 304",
    status: "Confirmada",
    reason: "Control de presión arterial",
  },
  {
    id: "a-1043",
    doctor: "Dr. Andrés Ocampo",
    specialty: "Dermatología",
    date: "2026-05-22",
    time: "08:15",
    location: "Sede Centro · Consultorio 112",
    status: "Pendiente",
    reason: "Revisión de lunar",
  },
  {
    id: "a-1044",
    doctor: "Dra. Luisa Fernanda Mejía",
    specialty: "Nutrición",
    date: "2026-06-03",
    time: "15:00",
    location: "Telemedicina",
    status: "Confirmada",
    reason: "Seguimiento plan alimentario",
  },
  {
    id: "a-1045",
    doctor: "Dr. Juan Pablo Henao",
    specialty: "Cardiología",
    date: "2026-06-11",
    time: "09:45",
    location: "Sede Laureles · Consultorio 502",
    status: "Pendiente",
    reason: "Evaluación de palpitaciones",
  },
  {
    id: "a-1031",
    doctor: "Dra. Catalina Restrepo",
    specialty: "Medicina interna",
    date: "2026-04-08",
    time: "11:00",
    location: "Sede Laureles · Consultorio 304",
    status: "Realizada",
    reason: "Chequeo anual",
  },
  {
    id: "a-1024",
    doctor: "Dra. Sofía Marín",
    specialty: "Oftalmología",
    date: "2026-03-19",
    time: "16:30",
    location: "Sede Centro · Consultorio 207",
    status: "Realizada",
    reason: "Revisión de fórmula",
  },
  {
    id: "a-1018",
    doctor: "Dr. Mateo Gallego",
    specialty: "Ortopedia",
    date: "2026-02-04",
    time: "07:45",
    location: "Sede Laureles · Consultorio 410",
    status: "Realizada",
    reason: "Dolor lumbar persistente",
  },
  {
    id: "a-1011",
    doctor: "Dra. Luisa Fernanda Mejía",
    specialty: "Nutrición",
    date: "2026-01-20",
    time: "14:15",
    location: "Telemedicina",
    status: "Realizada",
    reason: "Primera consulta",
  },
];

// Subset used by the medic dashboard ("agenda de hoy" — pretend today is 2026-05-13).
export const todaysAppointments = [
  {
    time: "07:30",
    patient: "Rodrigo Castaño",
    reason: "Control postoperatorio",
  },
  { time: "08:15", patient: "Valentina Ruiz", reason: "Cefalea recurrente" },
  { time: "09:00", patient: "Ernesto Vélez", reason: "Resultados de laboratorio" },
  { time: "09:45", patient: "Camila Arboleda", reason: "Dolor abdominal" },
  { time: "10:30", patient: "María Salazar", reason: "Control de presión" },
  { time: "11:15", patient: "Daniel Quintero", reason: "Fatiga y mareo" },
  { time: "12:00", patient: "Isabela Tobón", reason: "Renovación de fórmula" },
  { time: "14:30", patient: "Felipe Cárdenas", reason: "Primer encuentro" },
  { time: "15:15", patient: "Antonia Pérez", reason: "Dolor torácico leve" },
  { time: "16:00", patient: "Luciano Estrada", reason: "Seguimiento crónico" },
  { time: "16:45", patient: "Sara Lopera", reason: "Tos prolongada" },
  { time: "17:30", patient: "Tomás Aristizábal", reason: "Control de glicemia" },
];