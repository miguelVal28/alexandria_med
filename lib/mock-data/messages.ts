export type Message = {
  id: string;
  from: "me" | "them";
  text: string;
  time: string; // HH:mm
};

export type Conversation = {
  id: string;
  with: string;
  role: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  messages: Message[];
};

export const conversations: Conversation[] = [
  {
    id: "c-1",
    with: "Dra. Catalina Restrepo",
    role: "Medicina interna",
    lastMessage: "Perfecto, nos vemos el lunes.",
    lastTime: "10:42",
    unread: 0,
    messages: [
      { id: "m-1", from: "them", text: "Hola María, ¿cómo te has sentido con los nuevos medicamentos?", time: "10:21" },
      { id: "m-2", from: "me", text: "Buenas, doctora. Mucho mejor — la presión bajó a 130/85 esta semana.", time: "10:27" },
      { id: "m-3", from: "them", text: "Excelente. Mantén la dosis y traemos los exámenes el lunes.", time: "10:31" },
      { id: "m-4", from: "me", text: "Listo. ¿Necesito venir en ayunas?", time: "10:35" },
      { id: "m-5", from: "them", text: "Sí, mínimo 8 horas. Agua sí puedes tomar.", time: "10:38" },
      { id: "m-6", from: "me", text: "Perfecto, nos vemos el lunes.", time: "10:42" },
    ],
  },
  {
    id: "c-2",
    with: "Dr. Andrés Ocampo",
    role: "Dermatología",
    lastMessage: "Adjunta una foto del lunar para revisarla antes de la cita.",
    lastTime: "Ayer",
    unread: 1,
    messages: [
      { id: "m-7", from: "me", text: "Doctor, sigo viendo cambios en el lunar del hombro.", time: "16:02" },
      { id: "m-8", from: "them", text: "Hola María. ¿Te creció, cambió de color, o ha sangrado?", time: "16:18" },
      { id: "m-9", from: "me", text: "Creo que se oscureció un poco en una orilla.", time: "16:25" },
      { id: "m-10", from: "them", text: "Adjunta una foto del lunar para revisarla antes de la cita.", time: "16:31" },
    ],
  },
  {
    id: "c-3",
    with: "Dra. Luisa Fernanda Mejía",
    role: "Nutrición",
    lastMessage: "Recuerda registrar el almuerzo en el diario.",
    lastTime: "Mar",
    unread: 0,
    messages: [
      { id: "m-11", from: "them", text: "¿Cómo vas con el plan de la semana?", time: "09:00" },
      { id: "m-12", from: "me", text: "Bien, salvo el postre del domingo 😅", time: "09:14" },
      { id: "m-13", from: "them", text: "Tranquila. Lo importante es la consistencia.", time: "09:16" },
      { id: "m-14", from: "them", text: "Recuerda registrar el almuerzo en el diario.", time: "09:17" },
    ],
  },
  {
    id: "c-4",
    with: "Recepción Alexandria",
    role: "Administrativo",
    lastMessage: "Tu cita del 18 de mayo fue confirmada.",
    lastTime: "Lun",
    unread: 0,
    messages: [
      { id: "m-15", from: "them", text: "Hola María, te escribimos desde Alexandria.", time: "08:00" },
      { id: "m-16", from: "them", text: "Tu cita del 18 de mayo fue confirmada.", time: "08:00" },
      { id: "m-17", from: "me", text: "Gracias por avisar.", time: "08:11" },
    ],
  },
];