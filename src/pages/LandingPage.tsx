import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
    Sparkles,
    ShieldCheck,
    Leaf,
    FlaskConical,
    Activity,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    MessageCircle,
    ArrowRight,
    Truck,
    Stethoscope,
    Lock,
    Phone,
    MapPin,
    Clock,
    Award,
    HeartPulse,
    SlidersHorizontal,
    ExternalLink
} from 'lucide-react'

// --- DATA: PRODUCTOS DESTACADOS & FICHAS CIENTÍFICAS ---
interface ProductDetail {
    id: string
    codeName: string
    name: string
    category: string
    tagline: string
    description: string
    badge: string
    highlightColor: string
    accentBg: string
    accentBorder: string
    actives: { name: string; desc: string }[]
    benefits: string[]
    dosage: string
    presentation: string
    clinicalFocus: string
    idealFor: string[]
}

const FEATURED_PRODUCTS: ProductDetail[] = [
    {
        id: 'artromag',
        codeName: 'ARTROMAG®',
        name: 'Artromag',
        category: 'Fórmula Osteo-Articular & Músculo-Esquelética',
        tagline: 'Regeneración articular profunda y modulación del dolor inflamatorio.',
        description: 'Complejo terapéutico bioasimilable formulado con quelatos de magnesio de alta biodisponibilidad y péptidos bioactivos de colágeno, diseñado para restablecer la flexibilidad del cartílago, reducir la rigidez matutina y optimizar la función neuromuscular.',
        badge: 'Alta Biodisponibilidad 98.4%',
        highlightColor: '#1A3326',
        accentBg: 'bg-[#EBF3EE]',
        accentBorder: 'border-[#D3DBD4]',
        actives: [
            { name: 'Citrato & Cloruro de Magnesio Grado USP', desc: 'Regula el transporte de calcio intracelular y relaja la placa neuromuscular.' },
            { name: 'Péptidos Bioactivos de Colágeno', desc: 'Estimula a los condrocitos para la síntesis de nueva matriz cartilaginosa.' },
            { name: 'Cofactores de Vitamina C y Zinc', desc: 'Acelera la hidroxilación de prolina y lisina en las fibras conectivas.' },
            { name: 'Extractos Botánicos Antiinflamatorios', desc: 'Inhibe vías de COX-2 de forma natural sin efectos gástricos adversos.' }
        ],
        benefits: [
            'Alivio comprobado de rigidez y dolor en rodillas, cadera y columna',
            'Prevención del desgaste prematuro en deportistas y adultos mayores',
            'Eliminación de calambres nocturnos y fatiga muscular por déficit de magnesio',
            'Fórmula no irritante, libre de excipientes sintéticos o azúcares añadidos'
        ],
        dosage: '1 porción disuelta en agua tibia o infusión por las mañanas o antes de dormir según indicación profesional.',
        presentation: 'Envase grado farmacéutico / Polvo microionizado de rápida absorción',
        clinicalFocus: 'Artrosis, tendinopatías, contracturas musculares crónicas, osteoporosis y prevención articular.',
        idealFor: ['Personas con dolor articular recurrente', 'Deportistas de alto impacto', 'Adultos mayores con rigidez', 'Pacientes con calambres y tensión muscular']
    },
    {
        id: 'microbiota',
        codeName: 'MICROBIOTA®',
        name: 'Microbiota',
        category: 'Simbiótico Avanzado & Restaurador de Barrera Epitelial',
        tagline: 'Equilibrio del ecosistema digestivo y fortalecimiento del eje intestino-inmune.',
        description: 'Formulación simbiótica de precisión clínica que combina cepas probióticas microencapsuladas gastro-resistentes con prebióticos selectivos de cadena corta para sellar uniones estrechas intestinales y restaurar la diversidad de la flora microbiana.',
        badge: 'Cepas Vivas Gastro-resistentes',
        highlightColor: '#2C5E43',
        accentBg: 'bg-[#F2F7F3]',
        accentBorder: 'border-[#D8E8DC]',
        actives: [
            { name: 'Multi-cepa Probiótica (Lactobacillus & Bifidobacterium)', desc: 'Cultivos viables que colonizan selectivamente el epitelio del colon.' },
            { name: 'Fructooligosacáridos (FOS) & Inulina Orgánica', desc: 'Sustrato prebiótico que induce la producción de butirato antiinflamatorio.' },
            { name: 'L-Glutamina de Grado Puro', desc: 'Combustible esencial para los enterocitos y el cierre de la permeabilidad intestinal.' },
            { name: 'Complejo de Enzimas Digestivas Suaves', desc: 'Facilita la asimilación de nutrientes y previene la fermentación excesiva.' }
        ],
        benefits: [
            'Disminución visible de distensión abdominal, gases e indigestión postprandial',
            'Regulación natural del tránsito intestinal (estreñimiento o diarreas recurrentes)',
            'Fortalecimiento del sistema inmunitario (el 70% reside en la mucosa intestinal)',
            'Optimización del estado de ánimo y energía mediante la vía del eje intestino-cerebro'
        ],
        dosage: '1 dosis diaria con el estómago vacío junto a un vaso de agua a temperatura ambiente.',
        presentation: 'Cápsulas gastro-resistentes vegetales / Polvo de reconstitución',
        clinicalFocus: 'Disbiosis, colon irritable (SII), permeabilidad intestinal, pos-antibioticoterapia y fatiga digestiva.',
        idealFor: ['Personas con inflamación abdominal crónica', 'Pacientes tras uso de antibióticos', 'Quienes padecen digestión lenta o pesadez', 'Salud inmunológica y bienestar general']
    },
    {
        id: 'magistrales',
        codeName: 'FÓRMULAS MAGISTRALES',
        name: 'Formulaciones Personalizadas',
        category: 'Medicina Funcional & Prescripción Específica',
        tagline: 'Tratamientos a medida adaptados a la bioquímica individual del paciente.',
        description: 'Desarrollamos recetas magistrales y dosificaciones individualizadas prescritas por médicos especialistas de nuestra red nacional. Cada fórmula es elaborada con materias primas de la más alta pureza botánica y farmacéutica.',
        badge: 'Prescripción Personalizada',
        highlightColor: '#365345',
        accentBg: 'bg-[#EBF3ED]',
        accentBorder: 'border-[#CCDCD0]',
        actives: [
            { name: 'Minerales Quelados de Alta Pureza', desc: 'Zinc, Selenio, Magnesio Bisglicinato, Cobre y Manganeso adaptados.' },
            { name: 'Extractos Botánicos Titulados', desc: 'Curcumina C3, Ashwagandha KSM-66, Boswellia Serrata y Cardo Mariano.' },
            { name: 'Vitaminas Liposomales e Hidrosolubles', desc: 'Vitamina D3+K2, Complejo B Metilado y Coenzima Q10 grado médico.' }
        ],
        benefits: [
            'Dosificación exacta según análisis de laboratorio y requerimiento clínico',
            'Sinergia de activos sinérgica evitando incompatibilidades farmacológicas',
            'Envíos prioritarios y confidenciales a los 9 departamentos de Bolivia',
            'Seguimiento directo con profesionales en medicina integrativa'
        ],
        dosage: 'Según indicaciones en la receta médica del especialista.',
        presentation: 'Frascos opacos de grado farmacéutico / Dosificación exacta',
        clinicalFocus: 'Salud metabólica, modulación hormonal, longevidad celular y apoyo inmunitario específico.',
        idealFor: ['Pacientes con requerimientos nutricionales específicos', 'Médicos que buscan formulaciones sin rellenos', 'Tratamientos integrales de medicina funcional']
    }
]

// --- DATA: PREGUNTAS FRECUENTES (FAQ) POR PRODUCTO ---
interface FAQItem {
    id: string
    productId: 'all' | 'artromag' | 'microbiota' | 'general'
    question: string
    answer: string
    productBadge: string
}

const FAQS_DATA: FAQItem[] = [
    {
        id: 'faq-1',
        productId: 'artromag',
        productBadge: 'Artromag®',
        question: '¿En cuánto tiempo se comienzan a percibir los efectos de Artromag?',
        answer: 'La mayoría de los pacientes reportan un alivio significativo en la rigidez matutina y tensión muscular entre los días 7 y 14 de uso continuo. La regeneración profunda del cartílago y tejido articular alcanza su pico de efectividad terapéutica entre las semanas 6 y 12.'
    },
    {
        id: 'faq-2',
        productId: 'artromag',
        productBadge: 'Artromag®',
        question: '¿Puedo consumir Artromag si tengo hipertensión arterial o diabetes?',
        answer: 'Sí. Artromag está formulado sin sodio añadido ni azúcares. De hecho, el magnesio quelado de alta pureza favorece la vasodilatación y el equilibrio endotelial. No obstante, si tomas antihipertensivos con diuréticos ahorradores de potasio, recomendamos consultar con tu médico tratante.'
    },
    {
        id: 'faq-3',
        productId: 'artromag',
        productBadge: 'Artromag®',
        question: '¿Es mejor tomar Artromag por la mañana o antes de dormir?',
        answer: 'Si tu objetivo primordial es aliviar calambres nocturnos, tensión muscular y mejorar la calidad del sueño reparador, tómalo 45 minutos antes de dormir. Si buscas soporte articular para tus actividades diarias y ejercicio físico, puedes tomarlo con el desayuno.'
    },
    {
        id: 'faq-4',
        productId: 'microbiota',
        productBadge: 'Microbiota®',
        question: '¿Las cepas de Microbiota necesitan refrigeración constante?',
        answer: 'Nuestras cepas cuentan con microencapsulación avanzada y liofilización de grado farmacéutico, lo que les permite mantener su viabilidad biológica a temperatura ambiente (inferior a 25°C) en un lugar seco y protegido de la luz solar directa.'
    },
    {
        id: 'faq-5',
        productId: 'microbiota',
        productBadge: 'Microbiota®',
        question: '¿Puedo tomar Microbiota si estoy en medio de un tratamiento con antibióticos?',
        answer: 'Totalmente recomendado. Los antibióticos barren tanto bacterias patógenas como la flora protectora. Para evitar que el antibiótico inactive los probióticos, toma Microbiota con al menos 2 a 3 horas de separación respecto a la toma del antibiótico.'
    },
    {
        id: 'faq-6',
        productId: 'microbiota',
        productBadge: 'Microbiota®',
        question: '¿Cuánto tiempo debe durar un protocolo de restauración intestinal?',
        answer: 'Para una recuperación básica tras episodios de disbiosis o pesadez, se recomienda un ciclo continuo de 30 a 60 días. En casos de permeabilidad intestinal o síndrome de intestino irritable, el protocolo sugerido por especialistas suele extenderse a 90 días.'
    },
    {
        id: 'faq-7',
        productId: 'general',
        productBadge: 'Envíos & Seguridad',
        question: '¿Cómo realizan los envíos a los distintos departamentos de Bolivia?',
        answer: 'Realizamos entregas directas en Cochabamba mediante nuestro servicio de reparto exprés local, y despachos diarios protegidos a Santa Cruz, La Paz, Oruro, Potosí, Tarija, Chuquisaca, Beni y Pando mediante transporte terrestre y aéreo confiable.'
    },
    {
        id: 'faq-8',
        productId: 'general',
        productBadge: 'Garantía & Origen',
        question: '¿Las fórmulas contienen colorantes, gluten o conservantes químicos?',
        answer: 'Ninguno. En Angles Natural operamos bajo estrictos estándares de pureza biológica. Nuestras materias primas son libres de gluten, colorantes artificiales, dióxido de titanio, estearatos pesados y azúcar refinada.'
    }
]

export default function LandingPage() {
    const [activeFaqTab, setActiveFaqTab] = useState<'all' | 'artromag' | 'microbiota' | 'general'>('all')
    const [expandedFaq, setExpandedFaq] = useState<string | null>('faq-1')
    const [selectedProductModal, setSelectedProductModal] = useState<ProductDetail | null>(null)
    const [activeConcern, setActiveConcern] = useState<'articular' | 'digestivo' | 'fatiga' | 'personalizado'>('articular')

    // WhatsApp Direct Link Generator
    const buildWhatsAppUrl = (topic: string) => {
        const text = encodeURIComponent(`Hola Angles Natural, me gustaría recibir más información y asesoramiento sobre: ${topic}.`)
        return `https://wa.me/59170000000?text=${text}`
    }

    const filteredFaqs = activeFaqTab === 'all' 
        ? FAQS_DATA 
        : FAQS_DATA.filter(f => f.productId === activeFaqTab)

    return (
        <div className="min-h-screen bg-[#FAFBF8] text-[#1C2822] font-sans antialiased selection:bg-[#D8E8DC] selection:text-[#163826]">

            {/* --- TOP BANNER INFORMATIVO SUTIL --- */}
            <div className="bg-[#1A3326] text-[#E8ECE8] text-xs py-2 px-4 text-center tracking-wider font-medium flex items-center justify-center gap-2 border-b border-[#2C4839]">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#68D4A1] animate-pulse"></span>
                <span>Laboratorio Magistral & Medicina Botánica Especializada</span>
                <span className="hidden sm:inline opacity-40">|</span>
                <span className="hidden sm:inline text-[#B4C3B6]">Despachos garantizados a los 9 departamentos de Bolivia</span>
            </div>

            {/* --- NAVBAR FLOTANTE EDITORIAL & ELEGANTE --- */}
            <header className="sticky top-0 z-40 bg-[#FAFBF8]/90 backdrop-blur-md border-b border-[#E3ECE4] transition-all">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    
                    {/* Logotipo & Monograma */}
                    <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-xl bg-[#1A3326] flex items-center justify-center shadow-sm border border-[#2C4839]">
                            <span className="text-[#E8ECE8] font-serif font-bold text-2xl tracking-tighter">A</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-serif font-bold text-xl sm:text-2xl text-[#1A3326] tracking-tight">Angles Natural</span>
                                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-[#EBF3EE] text-[#39463C] border border-[#D3DBD4] hidden sm:inline-block">
                                    Magistral
                                </span>
                            </div>
                            <p className="text-[11px] text-[#6F8A74] tracking-wider uppercase font-medium">Biotecnología & Salud Funcional</p>
                        </div>
                    </div>

                    {/* Menú de Navegación Suave */}
                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#455749]">
                        <a href="#filosofia" className="hover:text-[#1A3326] transition-colors">Filosofía</a>
                        <a href="#productos" className="hover:text-[#1A3326] transition-colors">Fórmulas Clínicas</a>
                        <a href="#guia" className="hover:text-[#1A3326] transition-colors">Guía Terapéutica</a>
                        <a href="#faq" className="hover:text-[#1A3326] transition-colors">Preguntas Frecuentes</a>
                        <a href="#contacto" className="hover:text-[#1A3326] transition-colors">Contacto</a>
                    </nav>

                    {/* Botones de Acción */}
                    <div className="flex items-center gap-3">
                        {/* Botón WhatsApp */}
                        <a
                            href={buildWhatsAppUrl('Consulta General')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1A3326] hover:bg-[#284838] text-white text-xs sm:text-sm font-medium shadow-sm transition-all duration-200"
                        >
                            <MessageCircle className="h-4 w-4 text-[#68D4A1]" />
                            <span className="hidden sm:inline">Consulta Magistral</span>
                            <span className="sm:hidden">Consultar</span>
                        </a>

                        {/* Acceso Discreto al Portal Administrativo */}
                        <Link
                            to="/admin"
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-[#D3DBD4] hover:border-[#8FA693] text-[#455749] hover:text-[#1A3326] bg-white/70 text-xs font-medium transition-all"
                            title="Acceso al Portal de Propietarias y Médicos"
                        >
                            <Lock className="h-3.5 w-3.5 text-[#6F8A74]" />
                            <span className="hidden lg:inline">Portal Admin</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* --- HERO SECTION: EDITORIAL & REFINADO --- */}
            <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden bg-gradient-to-b from-[#FAFBF8] via-[#F4F7F4] to-[#FAFBF8]">
                {/* Micro detalles orgánicos de fondo */}
                <div className="absolute top-10 right-10 w-96 h-96 bg-[#E8ECE8]/60 rounded-full blur-3xl pointer-events-none -z-10"></div>
                <div className="absolute bottom-10 left-10 w-80 h-80 bg-[#D8E8DC]/40 rounded-full blur-2xl pointer-events-none -z-10"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl">
                        
                        {/* Badge de rigor */}
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EBF3EE] border border-[#D3DBD4] text-[#39463C] text-xs font-semibold tracking-wider uppercase mb-6">
                            <Leaf className="h-3.5 w-3.5 text-[#4A7C59]" />
                            <span>Formulación Botánica & Quelatos de Alta Pureza</span>
                        </div>

                        {/* Título Principal Tipográfico */}
                        <h1 className="text-4xl sm:text-6xl font-serif font-normal text-[#1A3326] tracking-tight leading-[1.15] mb-6">
                            Ciencia botánica y precisión terapéutica para restaurar tu bienestar biológico.
                        </h1>

                        {/* Bajada */}
                        <p className="text-lg sm:text-xl text-[#52695C] leading-relaxed font-normal mb-8 max-w-2xl">
                            Fórmulas de grado magistral elaboradas bajo estándares clínicos rigurosos. Sin rellenos artificiales, con máxima biodisponibilidad para actuar donde tu organismo más lo necesita.
                        </p>

                        {/* Acciones del Hero */}
                        <div className="flex flex-wrap items-center gap-4">
                            <a
                                href="#productos"
                                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#1A3326] text-white hover:bg-[#284838] font-medium text-sm shadow-md shadow-[#1A3326]/10 transition-all group"
                            >
                                Explorar Fórmulas Clínicas
                                <ArrowRight className="h-4 w-4 text-[#68D4A1] group-hover:translate-x-1 transition-transform" />
                            </a>
                            <a
                                href="#guia"
                                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white border border-[#D3DBD4] hover:border-[#8FA693] text-[#39463C] font-medium text-sm transition-all"
                            >
                                <SlidersHorizontal className="h-4 w-4 text-[#6F8A74]" />
                                Guía de Selección
                            </a>
                        </div>
                    </div>

                    {/* --- PILARES DE FORMULACIÓN EN BARRA --- */}
                    <div className="mt-16 pt-10 border-t border-[#E3ECE4] grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
                        <div className="flex items-start gap-3.5">
                            <div className="p-2.5 rounded-xl bg-[#EBF3EE] text-[#2C5E43] shrink-0 border border-[#D3DBD4]">
                                <FlaskConical className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm text-[#1A3326]">Pureza Farmacéutica</h4>
                                <p className="text-xs text-[#52695C] mt-0.5">Ingredientes certificados sin aditivos sintéticos ni gluten.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3.5">
                            <div className="p-2.5 rounded-xl bg-[#EBF3EE] text-[#2C5E43] shrink-0 border border-[#D3DBD4]">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm text-[#1A3326]">Alta Biodisponibilidad</h4>
                                <p className="text-xs text-[#52695C] mt-0.5">Quelatos y péptidos diseñados para absorción celular directa.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3.5">
                            <div className="p-2.5 rounded-xl bg-[#EBF3EE] text-[#2C5E43] shrink-0 border border-[#D3DBD4]">
                                <Stethoscope className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm text-[#1A3326]">Aval Médico</h4>
                                <p className="text-xs text-[#52695C] mt-0.5">Prescrito por profesionales en medicina funcional y articular.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3.5">
                            <div className="p-2.5 rounded-xl bg-[#EBF3EE] text-[#2C5E43] shrink-0 border border-[#D3DBD4]">
                                <Truck className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm text-[#1A3326]">Envíos a Todo el País</h4>
                                <p className="text-xs text-[#52695C] mt-0.5">Despacho seguro a los 9 departamentos de Bolivia.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- SECCIÓN FILOSOFÍA & CIENCIA --- */}
            <section id="filosofia" className="py-20 bg-white border-y border-[#E3ECE4]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        
                        {/* Lado izquierdo: Manifiesto */}
                        <div className="lg:col-span-6 space-y-6">
                            <span className="text-xs uppercase font-bold tracking-[0.2em] text-[#4A7C59] block">
                                Nuestra Filosofía Terapéutica
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-serif text-[#1A3326] leading-tight">
                                Más allá del suplemento común: formulación bioactiva que respeta tu fisiología.
                            </h2>
                            <p className="text-[#52695C] leading-relaxed text-sm sm:text-base">
                                En la farmacología botánica tradicional, muchos productos comerciales pierden hasta el 80% de sus principios activos en el tracto gástrico debido a sales minerales de baja calidad (como óxidos o carbonatos insolubles).
                            </p>
                            <p className="text-[#52695C] leading-relaxed text-sm sm:text-base">
                                En <strong>Angles Natural</strong> seleccionamos exclusivamente formas quelatadas orgánicas, péptidos hidrolizados de bajo peso molecular y cepas simbióticas con viabilidad celular comprobada. Cada fórmula está pensada como una herramienta de apoyo fisiológico integral.
                            </p>

                            <div className="pt-2 flex flex-col sm:flex-row gap-4">
                                <div className="p-4 rounded-2xl bg-[#FAFBF8] border border-[#E3ECE4] flex-1">
                                    <span className="text-2xl font-serif font-bold text-[#1A3326] block">0%</span>
                                    <span className="text-xs text-[#52695C] font-medium">Excipientes nocivos, colorantes o azúcares ocultos</span>
                                </div>
                                <div className="p-4 rounded-2xl bg-[#FAFBF8] border border-[#E3ECE4] flex-1">
                                    <span className="text-2xl font-serif font-bold text-[#1A3326] block">100%</span>
                                    <span className="text-xs text-[#52695C] font-medium">Trazabilidad de pureza botánica y farmacéutica</span>
                                </div>
                            </div>
                        </div>

                        {/* Lado derecho: Tarjeta Destacada de Protocolo */}
                        <div className="lg:col-span-6">
                            <div className="p-8 sm:p-10 rounded-3xl bg-[#F4F7F4] border border-[#D3DBD4] relative overflow-hidden">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold uppercase tracking-wider text-[#39463C] bg-white px-3 py-1 rounded-full border border-[#D3DBD4]">
                                            Enfoque Terapéutico
                                        </span>
                                        <Award className="h-5 w-5 text-[#4A7C59]" />
                                    </div>

                                    <h3 className="text-2xl font-serif text-[#1A3326]">
                                        Los tres pilares de cada preparación magistral
                                    </h3>

                                    <ul className="space-y-4 text-sm text-[#455749]">
                                        <li className="flex items-start gap-3">
                                            <CheckCircle2 className="h-5 w-5 text-[#4A7C59] shrink-0 mt-0.5" />
                                            <span><strong>Sinergia Molecular:</strong> Combinamos nutrientes que actúan como cofactores mutuos para multiplicar la absorción.</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <CheckCircle2 className="h-5 w-5 text-[#4A7C59] shrink-0 mt-0.5" />
                                            <span><strong>Tolerancia Gástrica:</strong> Complejos no irritantes que protegen la mucosa gástrica e intestinal.</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <CheckCircle2 className="h-5 w-5 text-[#4A7C59] shrink-0 mt-0.5" />
                                            <span><strong>Acompañamiento Profesional:</strong> Respaldo y dosificación guiada por la red médica de Dra. Andrea Angles.</span>
                                        </li>
                                    </ul>

                                    <div className="pt-4 border-t border-[#D8E8DC]">
                                        <a
                                            href={buildWhatsAppUrl('Consulta con especialista')}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-sm font-semibold text-[#1A3326] hover:text-[#284838]"
                                        >
                                            Hablar con un asesor especialista
                                            <ChevronRight className="h-4 w-4" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- CATÁLOGO & SHOWCASE DE PRODUCTOS DESTACADOS --- */}
            <section id="productos" className="py-24 bg-[#FAFBF8]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Header de Sección */}
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <span className="text-xs uppercase font-bold tracking-[0.2em] text-[#4A7C59] block mb-2">
                            Fórmulas Esenciales
                        </span>
                        <h2 className="text-3xl sm:text-5xl font-serif text-[#1A3326]">
                            Soluciones magistrales de alta especialidad
                        </h2>
                        <p className="mt-4 text-[#52695C] text-sm sm:text-base">
                            Conoce nuestras formulaciones estrella con especificación completa de activos y mecanismo de acción clínica.
                        </p>
                    </div>

                    {/* Grid de Productos */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {FEATURED_PRODUCTS.map((prod) => (
                            <div
                                key={prod.id}
                                className="rounded-3xl bg-white border border-[#E3ECE4] hover:border-[#B4C3B6] p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-[#1A3326]/5 group"
                            >
                                <div>
                                    {/* Categoría & Badge */}
                                    <div className="flex items-center justify-between gap-2 mb-6">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#52695C] bg-[#F4F7F4] px-3 py-1 rounded-full border border-[#E3ECE4]">
                                            {prod.badge}
                                        </span>
                                        <span className="text-xs font-mono text-[#8FA693] font-semibold">
                                            {prod.codeName}
                                        </span>
                                    </div>

                                    {/* Título & Tagline */}
                                    <h3 className="text-2xl font-serif font-bold text-[#1A3326] mb-2 group-hover:text-[#2C5E43] transition-colors">
                                        {prod.name}
                                    </h3>
                                    <p className="text-xs font-semibold text-[#4A7C59] mb-4">
                                        {prod.category}
                                    </p>
                                    <p className="text-sm text-[#52695C] leading-relaxed mb-6">
                                        {prod.description}
                                    </p>

                                    {/* Principios Activos Resumidos */}
                                    <div className="p-4 rounded-2xl bg-[#FAFBF8] border border-[#E3ECE4] mb-6 space-y-2.5">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#39463C] block mb-1">
                                            Principios Activos Clave:
                                        </span>
                                        {prod.actives.slice(0, 3).map((act, i) => (
                                            <div key={i} className="text-xs text-[#455749] flex items-start gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#4A7C59] mt-1.5 shrink-0"></span>
                                                <span><strong>{act.name}:</strong> {act.desc}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Beneficios */}
                                    <div className="space-y-2 mb-8">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#39463C] block">
                                            Beneficios Comprobados:
                                        </span>
                                        {prod.benefits.slice(0, 3).map((b, i) => (
                                            <div key={i} className="flex items-center gap-2 text-xs text-[#52695C]">
                                                <CheckCircle2 className="h-4 w-4 text-[#4A7C59] shrink-0" />
                                                <span>{b}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Botones de la Tarjeta */}
                                <div className="space-y-3 pt-4 border-t border-[#E3ECE4]">
                                    <button
                                        onClick={() => setSelectedProductModal(prod)}
                                        className="w-full py-2.5 px-4 rounded-xl bg-[#F4F7F4] hover:bg-[#E8ECE8] text-[#1A3326] text-xs font-semibold tracking-wide transition-colors flex items-center justify-center gap-2"
                                    >
                                        Ver Ficha Clínica Completa
                                        <ExternalLink className="h-3.5 w-3.5 text-[#6F8A74]" />
                                    </button>

                                    <a
                                        href={buildWhatsAppUrl(`Pedido o Consulta de ${prod.name}`)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full py-3 px-4 rounded-xl bg-[#1A3326] hover:bg-[#284838] text-white text-xs font-medium tracking-wide transition-colors flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        <MessageCircle className="h-4 w-4 text-[#68D4A1]" />
                                        Consultar Disponibilidad / Pedir
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- MODAL DETALLADO DE PRODUCTO (FICHA CLÍNICA) --- */}
            {selectedProductModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A3326]/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div
                        className="bg-white max-w-2xl w-full max-h-[90vh] rounded-3xl p-6 sm:p-8 overflow-y-auto border border-[#D3DBD4] shadow-2xl space-y-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between border-b border-[#E3ECE4] pb-4">
                            <div>
                                <span className="text-xs uppercase font-bold text-[#4A7C59] tracking-wider block">
                                    Ficha Científica & Terapéutica
                                </span>
                                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#1A3326] mt-1">
                                    {selectedProductModal.name}
                                </h3>
                                <p className="text-xs text-[#52695C] mt-0.5">{selectedProductModal.category}</p>
                            </div>
                            <button
                                onClick={() => setSelectedProductModal(null)}
                                className="h-9 w-9 rounded-full bg-[#F4F7F4] hover:bg-[#E8ECE8] text-[#39463C] flex items-center justify-center font-bold text-sm transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Descripción & Enfoque */}
                        <div className="space-y-3">
                            <h4 className="text-xs uppercase font-bold text-[#1A3326] tracking-wider">Mecanismo & Propósito Clínico</h4>
                            <p className="text-sm text-[#455749] leading-relaxed">{selectedProductModal.description}</p>
                            <div className="p-3 bg-[#EBF3EE] rounded-xl text-xs text-[#1A3326] border border-[#D3DBD4]">
                                <strong>Enfoque Terapéutico:</strong> {selectedProductModal.clinicalFocus}
                            </div>
                        </div>

                        {/* Desglose de Activos */}
                        <div className="space-y-3">
                            <h4 className="text-xs uppercase font-bold text-[#1A3326] tracking-wider">Principios Activos y Acción Farmacológica</h4>
                            <div className="space-y-2">
                                {selectedProductModal.actives.map((act, i) => (
                                    <div key={i} className="p-3 bg-[#FAFBF8] rounded-xl border border-[#E3ECE4] text-xs">
                                        <span className="font-bold text-[#1A3326] block text-sm mb-0.5">{act.name}</span>
                                        <span className="text-[#52695C]">{act.desc}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Posología & Presentación */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            <div className="p-3.5 bg-[#FAFBF8] rounded-xl border border-[#E3ECE4]">
                                <span className="text-[11px] font-bold uppercase text-[#4A7C59] block mb-1">Posología Recomendada</span>
                                <p className="text-xs text-[#39463C]">{selectedProductModal.dosage}</p>
                            </div>
                            <div className="p-3.5 bg-[#FAFBF8] rounded-xl border border-[#E3ECE4]">
                                <span className="text-[11px] font-bold uppercase text-[#4A7C59] block mb-1">Presentación & Pureza</span>
                                <p className="text-xs text-[#39463C]">{selectedProductModal.presentation}</p>
                            </div>
                        </div>

                        {/* Botón WhatsApp de Acción en Modal */}
                        <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#E3ECE4]">
                            <button
                                onClick={() => setSelectedProductModal(null)}
                                className="px-5 py-2.5 rounded-full border border-[#D3DBD4] text-xs font-semibold text-[#455749] hover:bg-[#F4F7F4]"
                            >
                                Cerrar
                            </button>
                            <a
                                href={buildWhatsAppUrl(`Pedido de ${selectedProductModal.name}`)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-6 py-2.5 rounded-full bg-[#1A3326] hover:bg-[#284838] text-white text-xs font-semibold flex items-center gap-2"
                            >
                                <MessageCircle className="h-4 w-4 text-[#68D4A1]" />
                                Solicitar por WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* --- SECCIÓN INTERACTIVA: GUÍA DE SELECCIÓN TERAPÉUTICA --- */}
            <section id="guia" className="py-20 bg-white border-y border-[#E3ECE4]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto text-center mb-12">
                        <span className="text-xs uppercase font-bold tracking-[0.2em] text-[#4A7C59] block mb-2">
                            Recomendador Terapéutico
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-serif text-[#1A3326]">
                            ¿Cuál es tu principal necesidad de salud hoy?
                        </h2>
                        <p className="mt-3 text-sm text-[#52695C]">
                            Selecciona tu síntoma o requerimiento clínico para conocer la fórmula más adecuada.
                        </p>
                    </div>

                    {/* Selector de Necesidad */}
                    <div className="max-w-4xl mx-auto">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                            {[
                                { id: 'articular' as const, label: 'Articulaciones & Dolor', icon: Activity },
                                { id: 'digestivo' as const, label: 'Digestión & Microbioma', icon: HeartPulse },
                                { id: 'fatiga' as const, label: 'Músculos, Estrés & Sueño', icon: Sparkles },
                                { id: 'personalizado' as const, label: 'Receta / Personalizado', icon: Stethoscope },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveConcern(tab.id)}
                                    className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                                        activeConcern === tab.id
                                            ? 'bg-[#1A3326] text-white border-[#1A3326] shadow-md'
                                            : 'bg-[#FAFBF8] text-[#455749] border-[#E3ECE4] hover:border-[#B4C3B6]'
                                    }`}
                                >
                                    <tab.icon className={`h-5 w-5 ${activeConcern === tab.id ? 'text-[#68D4A1]' : 'text-[#6F8A74]'}`} />
                                    <span className="text-xs font-semibold leading-snug">{tab.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Resultado de la Recomendación */}
                        <div className="p-6 sm:p-8 rounded-3xl bg-[#F4F7F4] border border-[#D3DBD4] flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="space-y-2">
                                <span className="text-[11px] font-bold uppercase tracking-widest text-[#4A7C59]">
                                    Fórmula Recomendada
                                </span>
                                <h4 className="text-2xl font-serif font-bold text-[#1A3326]">
                                    {activeConcern === 'articular' && 'Artromag® — Protocolo Articular & Cartílago'}
                                    {activeConcern === 'digestivo' && 'Microbiota® — Protocolo Simbiótico Digestivo'}
                                    {activeConcern === 'fatiga' && 'Artromag® — Citrato / Cloruro de Magnesio Bioasimilable'}
                                    {activeConcern === 'personalizado' && 'Formulaciones Magistrales bajo Prescripción Médica'}
                                </h4>
                                <p className="text-xs sm:text-sm text-[#52695C] max-w-xl">
                                    {activeConcern === 'articular' && 'Recomendado para aliviar el desgaste, regenerar cartílago y desinflamar articulaciones de forma segura.'}
                                    {activeConcern === 'digestivo' && 'Indicado para desinflamar el abdomen, sellar la barrera intestinal y restituir la flora protectora.'}
                                    {activeConcern === 'fatiga' && 'Aporte directo de magnesio quelado para evitar calambres, relajar la musculatura y optimizar el descanso.'}
                                    {activeConcern === 'personalizado' && 'Envíanos la prescripción de tu doctor y prepararemos la combinación exacta con pureza magistral.'}
                                </p>
                            </div>

                            <a
                                href={buildWhatsAppUrl(
                                    activeConcern === 'articular' ? 'Consulta sobre Artromag para articulaciones' :
                                    activeConcern === 'digestivo' ? 'Consulta sobre Microbiota para digestión' :
                                    activeConcern === 'fatiga' ? 'Consulta sobre Magnesio para estrés y descanso' :
                                    'Consulta sobre Formulación Magistral personalizada'
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="shrink-0 px-6 py-3.5 rounded-full bg-[#1A3326] hover:bg-[#284838] text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm transition-colors"
                            >
                                <MessageCircle className="h-4 w-4 text-[#68D4A1]" />
                                Consultar este Tratamiento
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- SECCIÓN INTERACTIVA: PREGUNTAS FRECUENTES (FAQ) POR PRODUCTO --- */}
            <section id="faq" className="py-24 bg-[#FAFBF8]">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    <div className="text-center max-w-2xl mx-auto mb-14">
                        <span className="text-xs uppercase font-bold tracking-[0.2em] text-[#4A7C59] block mb-2">
                            Resolución Médica & Científica
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-serif text-[#1A3326]">
                            Preguntas Frecuentes por Producto
                        </h2>
                        <p className="mt-3 text-sm text-[#52695C]">
                            Respuestas transparentes sobre posología, tiempos de respuesta y compatibilidad de nuestras fórmulas.
                        </p>
                    </div>

                    {/* Filtro por Producto */}
                    <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
                        {[
                            { id: 'all' as const, label: 'Todas las Preguntas' },
                            { id: 'artromag' as const, label: 'Artromag®' },
                            { id: 'microbiota' as const, label: 'Microbiota®' },
                            { id: 'general' as const, label: 'Envíos & Seguridad' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveFaqTab(tab.id)}
                                className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                                    activeFaqTab === tab.id
                                        ? 'bg-[#1A3326] text-white shadow-sm'
                                        : 'bg-white text-[#52695C] border border-[#E3ECE4] hover:border-[#8FA693]'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Lista Acordeón de FAQs */}
                    <div className="space-y-3">
                        {filteredFaqs.map((faq) => {
                            const isOpen = expandedFaq === faq.id
                            return (
                                <div
                                    key={faq.id}
                                    className="rounded-2xl bg-white border border-[#E3ECE4] overflow-hidden transition-all duration-200"
                                >
                                    <button
                                        onClick={() => setExpandedFaq(isOpen ? null : faq.id)}
                                        className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-[#FAFBF8] transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#4A7C59] bg-[#EBF3EE] px-2.5 py-1 rounded-md border border-[#D3DBD4]">
                                                {faq.productBadge}
                                            </span>
                                            <span className="font-serif font-bold text-base sm:text-lg text-[#1A3326]">
                                                {faq.question}
                                            </span>
                                        </div>
                                        <ChevronDown className={`h-5 w-5 text-[#6F8A74] shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#1A3326]' : ''}`} />
                                    </button>

                                    {isOpen && (
                                        <div className="px-6 pb-6 pt-1 text-sm text-[#52695C] leading-relaxed border-t border-[#F4F7F4]">
                                            {faq.answer}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    {/* Banner de Dudas Adicionales */}
                    <div className="mt-12 p-6 rounded-2xl bg-[#EBF3EE] border border-[#D3DBD4] text-center flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-left">
                            <h4 className="font-serif font-bold text-[#1A3326]">¿Tienes una consulta médica específica sobre tu caso?</h4>
                            <p className="text-xs text-[#52695C] mt-0.5">Nuestro equipo farmacéutico responderá tus preguntas clínicas directamente.</p>
                        </div>
                        <a
                            href={buildWhatsAppUrl('Pregunta médica personalizada')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 px-5 py-2.5 rounded-full bg-[#1A3326] text-white hover:bg-[#284838] text-xs font-semibold flex items-center gap-2"
                        >
                            <MessageCircle className="h-4 w-4 text-[#68D4A1]" />
                            Escribir al WhatsApp
                        </a>
                    </div>
                </div>
            </section>

            {/* --- SECCIÓN CONTACTO & RED DE DOCTORES --- */}
            <section id="contacto" className="py-20 bg-white border-t border-[#E3ECE4]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        
                        <div className="p-6 rounded-2xl bg-[#FAFBF8] border border-[#E3ECE4] flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-[#EBF3EE] text-[#1A3326] border border-[#D3DBD4] shrink-0">
                                <MapPin className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-[#1A3326] text-sm">Ubicación Central</h4>
                                <p className="text-xs text-[#52695C] mt-1 leading-relaxed">
                                    Cochabamba, Bolivia.<br />
                                    Laboratorio Magistral & Despachos Nacionales.
                                </p>
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl bg-[#FAFBF8] border border-[#E3ECE4] flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-[#EBF3EE] text-[#1A3326] border border-[#D3DBD4] shrink-0">
                                <Phone className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-[#1A3326] text-sm">Atención & Pedidos</h4>
                                <p className="text-xs text-[#52695C] mt-1 leading-relaxed">
                                    Línea directa WhatsApp: <strong>+591 70000000</strong><br />
                                    Atención farmacéutica personalizada.
                                </p>
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl bg-[#FAFBF8] border border-[#E3ECE4] flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-[#EBF3EE] text-[#1A3326] border border-[#D3DBD4] shrink-0">
                                <Clock className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-[#1A3326] text-sm">Horario de Despacho</h4>
                                <p className="text-xs text-[#52695C] mt-1 leading-relaxed">
                                    Lunes a Viernes: 08:30 – 18:30<br />
                                    Sábados: 09:00 – 13:00
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FOOTER DE LUJO BOTÁNICO & ENLACE ADMIN --- */}
            <footer className="bg-[#1A3326] text-[#FAFBF8] py-14 border-t border-[#2C4839]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-10 border-b border-[#2C4839]">
                        
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-[#284838] flex items-center justify-center border border-[#3C6450]">
                                <span className="font-serif font-bold text-xl text-[#68D4A1]">A</span>
                            </div>
                            <div>
                                <span className="font-serif font-bold text-lg text-white">Angles Natural</span>
                                <p className="text-xs text-[#8FA693]">Laboratorio Magistral & Biotecnología Natural</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#B4C3B6] font-medium">
                            <a href="#filosofia" className="hover:text-white transition-colors">Filosofía</a>
                            <a href="#productos" className="hover:text-white transition-colors">Fórmulas</a>
                            <a href="#guia" className="hover:text-white transition-colors">Guía</a>
                            <a href="#faq" className="hover:text-white transition-colors">Preguntas Frecuentes</a>
                            <Link to="/admin" className="text-[#68D4A1] hover:underline flex items-center gap-1">
                                <Lock className="h-3 w-3" />
                                Portal Administrativo (/admin)
                            </Link>
                        </div>
                    </div>

                    <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8FA693] gap-4">
                        <p>© {new Date().getFullYear()} Angles Natural. Todos los derechos reservados.</p>
                        <p className="text-[11px] text-[#6F8A74] max-w-md text-center sm:text-right">
                            Las formulaciones magistrales se elaboran con ingredientes de grado farmacéutico. Este sitio tiene fines informativos y de asesoramiento terapéutico.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
