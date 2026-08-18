export interface ServiceCase {
  title: string;
  business: string;
  before: string;
  after: string;
  result: string;
}

export interface ServiceBenefit {
  label: string;
  value: string;
}

export interface Service {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  icon: 'zap' | 'smartphone' | 'bot' | 'chart';
  gradient: string;
  plainExplanation: string;
  analogy: string;
  forWhom: string[];
  includes: string[];
  notIncludes: string[];
  cases: ServiceCase[];
  benefits: ServiceBenefit[];
  tools: string[];
  toolsNote: string;
}

export const services: Service[] = [
  {
    id: 'automatizacion',
    name: 'Automatización de tareas repetitivas',
    shortName: 'Automatización',
    tagline: 'Un empleado digital que trabaja 24/7 sin equivocarse',
    icon: 'zap',
    gradient: 'from-amber-500 to-orange-600',
    plainExplanation:
      'Piensa en todas esas tareas que tú o tu equipo hacen todos los días de la misma manera: copiar datos de un correo a un Excel, enviar el mismo recordatorio a clientes, organizar facturas que llegan al correo, pedir aprobaciones por WhatsApp. La automatización hace que una "mano invisible" (un flujo automático) haga esas tareas por ti, siempre igual, sin cansarse y sin errores de digitación.',
    analogy:
      'Es como la línea de ensamblaje de una fábrica, pero para tu oficina: cada documento o dato entra por un lado y sale del otro ya clasificado, enviado y guardado, sin que nadie lo toque.',
    forWhom: [
      'Negocios donde alguien "quema" horas copiando datos entre correos, Excel y sistemas',
      'Empresas que pierden clientes por no responder o hacer seguimiento a tiempo',
      'Equipos que dependen de la memoria de una persona para recordar pagos y fechas',
      'Negocios que manejan facturas, pedidos o cotizaciones en papel o correos sueltos'
    ],
    includes: [
      'Registro automático de pedidos, cotizaciones o facturas que lleguen por correo',
      'Recordatorios automáticos de pagos, vencimientos y seguimientos a clientes',
      'Flujos de aprobación: solicitudes de vacaciones, compras o gastos con un clic',
      'Generación automática de documentos (cotizaciones, certificados, contratos)',
      'Conexión entre tus herramientas actuales: correo, Excel, formularios, WhatsApp Business',
      'Alertas al celular cuando pasa algo importante (una venta, un pago, un reclamo)'
    ],
    notIncludes: [
      'No reemplaza el criterio de las personas: las decisiones importantes las sigues tomando tú',
      'No exige cambiar de sistema: trabajamos sobre lo que ya usas',
      'No es un robot físico: es un programa que trabaja dentro de tu computador y la nube'
    ],
    cases: [
      {
        title: 'Los pedidos que se registran solos',
        business: 'Distribuidora de alimentos, 8 empleados',
        before:
          'Los pedidos llegaban por correo y WhatsApp. Una auxiliar los pasaba a mano a un Excel y luego llamaba a bodega. Se perdían pedidos y se despachaban cantidades equivocadas.',
        after:
          'Cada pedido que llega se registra solo en la lista de despachos, bodega recibe una alerta en el celular y el cliente recibe confirmación automática.',
        result: '2 horas diarias recuperadas y cero pedidos perdidos en el primer mes.'
      },
      {
        title: 'Facturas que se archivan y clasifican solas',
        business: 'Firma contable, 5 empleados',
        before:
          'Las facturas de proveedores llegaban al correo y alguien debía descargarlas, renombrarlas y guardarlas en carpetas por cliente. Al cierre de mes, nadie encontraba nada.',
        after:
          'Cada factura que llega se guarda automáticamente en la carpeta correcta, se registra en el control de gastos y se avisa al contador responsable.',
        result: 'El cierre contable pasó de 4 días a 1 día.'
      }
    ],
    benefits: [
      { label: 'Horas recuperadas por semana', value: '10–25' },
      { label: 'Menos errores de digitación', value: '~90%' },
      { label: 'Disponibilidad del proceso', value: '24/7' }
    ],
    tools: ['Microsoft Power Automate', 'n8n'],
    toolsNote:
      'Son las "cajas de herramientas" que usamos para construir tus flujos automáticos. Tú no necesitas aprenderlas: nosotros las configuramos y te entregamos todo funcionando.'
  },
  {
    id: 'apps',
    name: 'Aplicaciones de negocio a la medida',
    shortName: 'Apps a la medida',
    tagline: 'Reemplaza el papel, el cuaderno y el Excel desordenado',
    icon: 'smartphone',
    gradient: 'from-cyan-500 to-indigo-600',
    plainExplanation:
      'Muchas empresas manejan su operación con cuadernos, formatos en papel o archivos de Excel que se dañan, se duplican y nadie sabe cuál es la versión buena. Creamos aplicaciones sencillas, hechas a la medida de tu negocio, que funcionan en el celular o la tablet: registrar una venta, reportar una visita, controlar el inventario o hacer inspecciones con foto y firma. Todo queda guardado en un solo lugar, ordenado y disponible al instante.',
    analogy:
      'Es como cambiar el cuaderno de apuntes por un asistente que guarda todo en el momento, no deja campos vacíos, no pierde hojas y te muestra la información cuando la necesitas.',
    forWhom: [
      'Equipos de ventas o técnicos que trabajan en la calle y reportan en papel',
      'Negocios cuyo inventario vive "en la cabeza" de una sola persona',
      'Empresas con varios archivos de Excel contradictorios entre sí',
      'Negocios que necesitan evidencia con foto, firma o ubicación de cada trabajo'
    ],
    includes: [
      'Apps para celular o tablet según tu proceso: ventas, inventario, visitas, producción',
      'Formularios inteligentes que no dejan campos vacíos ni datos inválidos',
      'Evidencia fotográfica, firma digital y ubicación en cada registro',
      'Información centralizada: todos ven lo mismo, actualizado al instante',
      'Funciona con o sin internet en campo (sincroniza cuando hay señal)',
      'Reportes automáticos al final del día o de la semana'
    ],
    notIncludes: [
      'No es una tienda virtual ni una app para clientes finales (eso es otro tipo de proyecto)',
      'No requiere comprar servidores ni equipos costosos: funciona en los celulares que ya tienes'
    ],
    cases: [
      {
        title: 'Del formato en papel a la app de inspecciones',
        business: 'Empresa de servicios de aseo, 25 empleados',
        before:
          'Los supervisores llenaban formatos en papel en cada sitio atendido. Los formatos llegaban arrugados a la oficina días después y la información se transcribía a Excel.',
        after:
          'El supervisor registra cada visita en su celular con fotos de antes y después, firma del cliente y calificación. La oficina lo ve en tiempo real.',
        result: 'Los reclamos de clientes bajaron 60% al tener evidencia inmediata.'
      },
      {
        title: 'Inventario en el celular, no en la memoria',
        business: 'Ferretería familiar, 6 empleados',
        before:
          'El inventario se llevaba en un cuaderno y "más o menos en la cabeza del dueño". Compraban de más lo que no se vendía y se agotaban los productos estrella.',
        after:
          'Cada entrada y salida se registra escaneando o buscando el producto en la app. El dueño ve desde su casa qué se está agotando.',
        result: 'Recuperaron en 3 meses el dinero que tenían "atrapado" en productos sin rotación.'
      }
    ],
    benefits: [
      { label: 'Información disponible', value: 'Al instante' },
      { label: 'Tiempo de implementación', value: '2–6 sem' },
      { label: 'Capacitación necesaria', value: '1 hora' }
    ],
    tools: ['Microsoft Power Apps'],
    toolsNote:
      'Es la plataforma que permite crear apps de negocio sin escribir código desde cero, lo que las hace rápidas y económicas de construir y de modificar cuando tu proceso cambie.'
  },
  {
    id: 'agentes',
    name: 'Asistentes virtuales con Inteligencia Artificial',
    shortName: 'Agentes de IA',
    tagline: 'Un asesor que atiende a tus clientes y empleados todo el día',
    icon: 'bot',
    gradient: 'from-violet-500 to-purple-600',
    plainExplanation:
      'Imagina tener un empleado que conoce tu negocio a fondo, responde en segundos, nunca se molesta y atiende a muchas personas al mismo tiempo: "¿En qué va mi pedido?", "¿Cuánto vale el servicio?", "¿Qué documentos necesito para solicitar vacaciones?". Un asistente virtual con inteligencia artificial se entrena con TU información (tus productos, precios, políticas, preguntas frecuentes) y responde por tu página web o WhatsApp, y cuando no sabe algo, lo pasa a una persona de tu equipo.',
    analogy:
      'Es como clonar a tu mejor empleado de servicio al cliente: el que sabe todo, atiende bien y nunca falta. Solo que este trabaja las 24 horas, también en festivos.',
    forWhom: [
      'Negocios que reciben las mismas preguntas una y otra vez por WhatsApp o llamadas',
      'Empresas que pierden ventas por no responder fuera del horario de oficina',
      'Equipos de recursos humanos saturados de preguntas repetitivas de empleados',
      'Negocios que quieren atender más clientes sin contratar más personal'
    ],
    includes: [
      'Asistente entrenado con tu información: productos, precios, políticas, preguntas frecuentes',
      'Atención en tu página web y/o WhatsApp Business',
      'Respuestas en lenguaje natural: la gente escribe normal, el asistente entiende',
      'Consulta de estados: pedidos, solicitudes, citas (conectado a tus registros)',
      'Transferencia a una persona de tu equipo cuando el caso lo requiere',
      'Reporte de lo que más preguntan tus clientes, para mejorar tu negocio'
    ],
    notIncludes: [
      'No reemplaza el trato humano en temas delicados: para eso transfiere con tu equipo',
      'No inventa respuestas: solo responde con la información que tú apruebas',
      'No requiere que tus clientes descarguen nada: funciona en los canales que ya usan'
    ],
    cases: [
      {
        title: 'La tienda que atiende mientras duermes',
        business: 'Tienda de ropa online, 4 empleados',
        before:
          'El 40% de los mensajes de WhatsApp llegaban después de las 6 p.m. y se respondían al día siguiente. Muchos clientes ya habían comprado en otra parte.',
        after:
          'El asistente responde tallas, disponibilidad, precios y estado del pedido a cualquier hora. Los casos especiales quedan agendados para el equipo.',
        result: 'Las ventas por WhatsApp aumentaron 35% en dos meses.'
      },
      {
        title: 'Recursos humanos sin la fila de siempre',
        business: 'Empresa de logística, 60 empleados',
        before:
          'La persona de RRHH recibía a diario las mismas preguntas: certificados laborales, fechas de pago, días de vacaciones, afiliaciones.',
        after:
          'Los empleados le preguntan al asistente virtual y reciben la respuesta o el documento al instante. RRHH solo interviene en casos especiales.',
        result: 'RRHH recuperó 12 horas semanales para temas que sí necesitan personas.'
      }
    ],
    benefits: [
      { label: 'Atención al cliente', value: '24/7' },
      { label: 'Preguntas resueltas sin personas', value: '~70%' },
      { label: 'Tiempo de respuesta', value: 'Segundos' }
    ],
    tools: ['Microsoft Copilot Studio'],
    toolsNote:
      'Es la plataforma de Microsoft para crear asistentes con inteligencia artificial de forma segura y conectada a tus datos. Nosotros lo entrenamos con tu información y lo dejamos listo.'
  },
  {
    id: 'analitica',
    name: 'Reportes e inteligencia de negocio',
    shortName: 'Reportes y BI',
    tagline: 'Deja de adivinar: mira cómo va tu negocio en tiempo real',
    icon: 'chart',
    gradient: 'from-emerald-500 to-teal-600',
    plainExplanation:
      'Tus ventas, gastos, cartera y gastos ya existen, pero están regados en Excels, cuadernos y el software de facturación. La inteligencia de negocio junta toda esa información y la convierte en tableros visuales fáciles de entender: qué producto vende más, qué cliente te debe más, qué mes fue mejor, qué vendedor cumple. Se actualizan solos y los puedes ver desde el celular. Es la diferencia entre manejar el negocio "a ojo" y manejarlo con números.',
    analogy:
      'Es como el tablero de instrumentos de un carro: no necesitas ser mecánico para saber si vas rápido, si falta gasolina o si algo se está calentando. Así mismo verás tu negocio.',
    forWhom: [
      'Dueños que sienten que venden bien pero no saben a dónde se va la plata',
      'Empresas cuyo informe de ventas "está listo la otra semana" (y para entonces ya no sirve)',
      'Negocios con cartera vencida que nadie vigila hasta que es demasiado tarde',
      'Gerentes que toman decisiones con datos del mes pasado, o sin datos'
    ],
    includes: [
      'Tablero de ventas: por producto, cliente, vendedor, sede y período',
      'Tablero de cartera: quién te debe, cuánto y desde cuándo, con alertas',
      'Tablero de gastos y rentabilidad: qué líneas dejan plata y cuáles no',
      'Actualización automática: conectado a tu Excel o sistema de facturación',
      'Acceso desde el celular, la tablet o el computador',
      'Capacitación sencilla para que tú y tu equipo lean los tableros'
    ],
    notIncludes: [
      'No es contabilidad ni reemplaza a tu contador: es la capa visual sobre tus números',
      'No exige cambiar tu software de facturación: nos conectamos a lo que ya usas'
    ],
    cases: [
      {
        title: 'El restaurante que descubrió su plato estrella (y su plato problema)',
        business: 'Restaurante con 2 sedes',
        before:
          'El dueño revisaba ventas en el cierre del día y hacía cuentas en Excel el fin de semana. No sabía qué sede iba mejor ni qué platos perdían plata.',
        after:
          'Un tablero muestra ventas por sede, plato y horario en tiempo real. Descubrió que un plato popular dejaba pérdida por el costo de sus ingredientes.',
        result: 'Ajustó 3 platos del menú y la utilidad subió 18% en un trimestre.'
      },
      {
        title: 'La cartera que dejó de ser sorpresa',
        business: 'Distribuidora de papelería, 12 empleados',
        before:
          'Las facturas vencidas se descubrían cuando el cliente volvía a pedir. No había seguimiento sistemático y la cartera crecía sin control.',
        after:
          'Un tablero muestra la cartera por cliente y antigüedad, con alertas automáticas al vendedor responsable y recordatorios al cliente.',
        result: 'La cartera vencida a más de 60 días se redujo a la mitad en 90 días.'
      }
    ],
    benefits: [
      { label: 'Visibilidad del negocio', value: 'Diaria' },
      { label: 'Tiempo armando informes', value: '0 horas' },
      { label: 'Decisiones con datos', value: '100%' }
    ],
    tools: ['Microsoft Power BI', 'Tableau', 'Looker Studio'],
    toolsNote:
      'Son las herramientas líderes para crear tableros visuales. Elegimos la que mejor se ajuste a tu presupuesto y a lo que ya usas; los tableros se ven en cualquier dispositivo.'
  }
];

export interface QuizOption {
  label: string;
  serviceId: string;
}

export interface QuizQuestion {
  question: string;
  options: QuizOption[];
}

export const quizQuestions: QuizQuestion[] = [
  {
    question: '¿Cuál de estas frases suena más a tu día a día?',
    options: [
      { label: 'Me la paso copiando datos y enviando los mismos correos', serviceId: 'automatizacion' },
      { label: 'Todo lo manejamos en papel o en un Excel que nadie entiende', serviceId: 'apps' },
      { label: 'No doy abasto respondiendo las mismas preguntas de clientes', serviceId: 'agentes' },
      { label: 'No sé realmente cómo va el negocio hasta fin de mes', serviceId: 'analitica' }
    ]
  },
  {
    question: 'Si tuvieras un empleado extra gratis mañana, ¿qué le pedirías primero?',
    options: [
      { label: 'Que haga solo todas las tareas repetitivas', serviceId: 'automatizacion' },
      { label: 'Que organice el control del negocio en un solo lugar', serviceId: 'apps' },
      { label: 'Que atienda clientes a cualquier hora', serviceId: 'agentes' },
      { label: 'Que me entregue un informe claro cada mañana', serviceId: 'analitica' }
    ]
  },
  {
    question: '¿Qué problema te cuesta más plata hoy?',
    options: [
      { label: 'Errores y retrabajos por hacer las cosas a mano', serviceId: 'automatizacion' },
      { label: 'Información perdida entre cuadernos, papeles y archivos', serviceId: 'apps' },
      { label: 'Ventas perdidas por no responder a tiempo', serviceId: 'agentes' },
      { label: 'Decisiones malas por no tener los números claros', serviceId: 'analitica' }
    ]
  }
];