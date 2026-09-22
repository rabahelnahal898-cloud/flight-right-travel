// @ts-nocheck
import { createContext, type FormEvent, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  Heart,
  MapPin,
  Menu,
  MessageCircle,
  Minus,
  Navigation,
  Plus,
  Search,
  Send,
  Sparkles,
  Star,
  Users,
  X,
} from 'lucide-react';
import { Route, Switch, useLocation, Router as WouterRouter, useRoute } from 'wouter';

const brandLogo = '/flight-right-logo.svg';
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
const contactEmail = import.meta.env.VITE_CONTACT_EMAIL || 'hello@flightright.travel';
const contactPhone = import.meta.env.VITE_CONTACT_PHONE || '+31 20 555 0160';
const whatsappNumber = (import.meta.env.VITE_WHATSAPP_NUMBER || contactPhone).replace(/\D/g, '');
const businessAddress = 'Amsterdam, Netherlands';
const businessHours = 'Monday to Saturday · 09:00–18:00 CET';
const brandProfile = {
  name: 'Flight Right Travel & Tourism',
  tagline: 'Thoughtful travel, memorable flights',
  description: 'Flight Right helps travelers compare and arrange flights between Europe, Egypt and Türkiye, with visa guidance, private trip planning and hands-on support when your journey needs a human touch.',
};

type Language = 'en' | 'ar' | 'nl';

const languageLabels: Record<Language, string> = { en: 'EN', ar: 'العربية', nl: 'NL' };

const translations: Record<'ar' | 'nl', Record<string, string>> = {
  ar: {
    'Flight Right': 'فلايت رايت', 'Flight Right Travel & Tourism': 'فلايت رايت للسفر والسياحة', 'Thoughtful travel, memorable flights': 'سفر مدروس ورحلات لا تُنسى', 'Flight Right helps travelers compare and arrange flights between Europe, Egypt and Türkiye, with visa guidance, private trip planning and hands-on support when your journey needs a human touch.': 'تساعد فلايت رايت المسافرين على مقارنة وترتيب الرحلات بين أوروبا ومصر وتركيا، مع إرشادات التأشيرات وتخطيط الرحلات الخاصة ودعم شخصي عند الحاجة.', 'Flights': 'الرحلات الجوية', 'Destinations': 'الوجهات', 'Contact': 'تواصل معنا', 'My Trips': 'رحلاتي', 'Popular destinations': 'الوجهات الشائعة', 'Where our travelers are going': 'إلى أين يسافر عملاؤنا', 'Our services': 'خدماتنا', 'Featured routes': 'المسارات المميزة', 'Popular flight routes': 'مسارات الطيران الشائعة', 'Partner with us': 'كن شريكًا معنا', 'Start a request': 'ابدأ طلبًا', 'Browse partners': 'استعرض الشركاء', 'List your service': 'أضف خدمتك', 'Subscribe': 'اشترك', 'Subscribed': 'تم الاشتراك', 'Back home': 'العودة للرئيسية', 'Talk to our team': 'تحدث مع فريقنا', 'Search flights': 'ابحث عن الرحلات', 'View details': 'عرض التفاصيل', 'Continue to booking': 'المتابعة للحجز', 'Send booking request': 'إرسال طلب الحجز', 'Send message': 'إرسال الرسالة', 'Sending...': 'جارٍ الإرسال...', 'Request a trip plan': 'اطلب برنامجًا سياحيًا', 'Plan this trip': 'خطط لهذه الرحلة', 'Request a plan': 'اطلب خطة', 'Request this service': 'اطلب هذه الخدمة', 'Start planning': 'ابدأ التخطيط', 'Become a partner': 'كن شريكًا', 'Submit partner request': 'إرسال طلب الشراكة', 'Check availability': 'تحقق من التوفر', 'Explore package': 'استكشف البرنامج', 'View itinerary': 'عرض البرنامج', 'Request transfer': 'طلب انتقال', 'Full name': 'الاسم الكامل', 'Email': 'البريد الإلكتروني', 'Phone': 'الهاتف', 'Subject': 'الموضوع', 'Message': 'الرسالة', 'Your name': 'اسمك', 'Your email address': 'بريدك الإلكتروني', 'How can we help?': 'كيف يمكننا مساعدتك؟', 'Your journey, our passion.': 'رحلتك، شغفنا.', 'Support': 'الدعم', 'Services': 'الخدمات', 'Company': 'الشركة', 'About us': 'من نحن', 'Visa support': 'دعم التأشيرات', 'Private trips': 'رحلات خاصة', 'Discover Egypt': 'اكتشف مصر', 'Group travel': 'الرحلات الجماعية', 'B2B': 'للشركات', 'Press': 'الإعلام', 'WhatsApp support': 'دعم WhatsApp', 'Language': 'اللغة', 'Service': 'خدمة', 'Guided experiences': 'تجارب بصحبة مرشد', 'Accommodation': 'إقامة', 'Transfers': 'الانتقالات', 'Experiences': 'تجارب', 'from · per person': 'ابتداءً من · للشخص', 'From €85': 'ابتداءً من 85€', 'From €210/night': 'ابتداءً من 210€ لليلة', 'Request a quote': 'اطلب عرض سعر', 'Build your plan': 'أنشئ خطتك', 'Monday to Saturday · 09:00–18:00 CET': 'من الاثنين إلى السبت · 09:00–18:00 بتوقيت وسط أوروبا', 'Hours: Monday to Saturday, 09:00–18:00 CET': 'ساعات العمل: من الاثنين إلى السبت، 09:00–18:00 بتوقيت وسط أوروبا', 'Economy': 'اقتصادية', 'Premium Economy': 'اقتصادية مميزة', 'Business': 'رجال أعمال', 'First': 'الأولى', 'Passengers': 'المسافرون', 'traveller': 'مسافر', 'travellers': 'مسافرون', 'From': 'من', 'To': 'إلى', 'Departure': 'المغادرة', 'Return': 'العودة', 'Cabin': 'الدرجة', 'Lowest price': 'أقل سعر', 'Recommended': 'موصى به', 'No booking found for those details.': 'لم يتم العثور على حجز بهذه البيانات.', 'Where will': 'إلى أين', 'you go next?': 'ستسافر بعد ذلك؟', 'Travel support built around real trips': 'دعم سفر مصمم لرحلات حقيقية', 'From ancient wonders to island coastlines — ten places our travelers can’t stop booking.': 'من العجائب القديمة إلى السواحل والجزر، عشر وجهات يواصل عملاؤنا حجزها.', 'Historic lanes, Bosphorus light': 'أزقة تاريخية وضوء البوسفور', 'Old stones, river evenings': 'آثار قديمة وأمسيات على النيل', 'Sea air, reef days': 'هواء البحر وأيام الشعاب المرجانية', 'Red Sea calm': 'هدوء البحر الأحمر', 'Sunrise magic': 'سحر الشروق', 'Coasts, gardens and drift': 'سواحل وحدائق واسترخاء', 'Skyline and desert light': 'أفق المدينة وضوء الصحراء', 'City edges and mountain air': 'أطراف المدينة وهواء الجبال', 'Seaside evenings and culture': 'أمسيات بحرية وثقافة', 'Canals, bikes and easy energy': 'قنوات ودراجات وحيوية هادئة', 'city breaks & culture': 'عطلات مدن وثقافة', 'nile evenings & old stones': 'أمسيات النيل والآثار القديمة', 'sun, reef & slow rhythms': 'شمس وشعاب وإيقاع هادئ', 'reef escapes & sunsets': 'رحلات الشعاب وغروب الشمس', 'balloons & volcanic landscapes': 'مناطيد ومناظر بركانية', 'beaches, bay views & easy escapes': 'شواطئ وإطلالات خلابة ورحلات هادئة', 'modern stays & desert days': 'إقامات عصرية وأيام في الصحراء', 'ancient routes & warm hospitality': 'طرق عريقة وضيافة دافئة', 'coast, cafés & city rhythm': 'ساحل ومقاهٍ وإيقاع المدينة', 'city breaks & design-led routes': 'عطلات مدن ومسارات مميزة', 'Cairo heritage day': 'يوم تراثي في القاهرة', 'Istanbul city stay': 'إقامة في إسطنبول', 'Red Sea arrival service': 'خدمة الوصول إلى البحر الأحمر', 'Cappadocia sunrise plan': 'خطة شروق كابادوكيا', 'Cairo, Egypt': 'القاهرة، مصر', 'Istanbul, Türkiye': 'إسطنبول، تركيا', 'Hurghada, Egypt': 'الغردقة، مصر', 'Cappadocia, Türkiye': 'كابادوكيا، تركيا', 'Private guide, historic landmarks and flexible pickup planning.': 'مرشد خاص ومعالم تاريخية وترتيب مرن للاستقبال.', 'Central hotel options for short breaks, couples and families.': 'خيارات فنادق مركزية للعطلات القصيرة والأزواج والعائلات.', 'Airport pickup and resort transfer coordination.': 'استقبال من المطار وترتيب الانتقال إلى المنتجع.', 'Cave stay, valley tour and sunrise activity coordination.': 'إقامة كهفية وجولة في الوديان وترتيب تجربة الشروق.', 'Local services, ready for your journey.': 'خدمات محلية جاهزة لرحلتك.', 'Browse accommodation, guided experiences and transfers from the Flight Right partner network. Every request is confirmed with the provider before payment.': 'استعرض الإقامات والتجارب والانتقالات من شبكة شركاء فلايت رايت. يتم تأكيد كل طلب مع مقدم الخدمة قبل الدفع.', 'New routes, seasonal fares and destination guides — occasionally, not overwhelmingly.': 'مسارات جديدة وأسعار موسمية وأدلة وجهات، بشكل مفيد وغير مزعج.', 'Thoughtful ideas, not a flood.': 'أفكار مدروسة وليست رسائل مزعجة.', 'EUR': 'يورو', 'EGP': 'جنيه مصري', 'TRY': 'ليرة تركية', 'USD': 'دولار أمريكي'
  },
  nl: {
    'Flight Right': 'Flight Right', 'Flight Right Travel & Tourism': 'Flight Right Reizen & Toerisme', 'Thoughtful travel, memorable flights': 'Doordachte reizen en memorabele vluchten', 'Flight Right helps travelers compare and arrange flights between Europe, Egypt and Türkiye, with visa guidance, private trip planning and hands-on support when your journey needs a human touch.': 'Flight Right helpt reizigers vluchten tussen Europa, Egypte en Türkiye vergelijken en regelen, met visumbegeleiding, privéreizen en persoonlijke ondersteuning.', 'Flights': 'Vluchten', 'Destinations': 'Bestemmingen', 'Contact': 'Contact', 'My Trips': 'Mijn reizen', 'Popular destinations': 'Populaire bestemmingen', 'Where our travelers are going': 'Waar onze reizigers naartoe gaan', 'Our services': 'Onze diensten', 'Featured routes': 'Uitgelichte routes', 'Popular flight routes': 'Populaire vliegroutes', 'Partner with us': 'Word partner', 'Start a request': 'Start een aanvraag', 'Browse partners': 'Partners bekijken', 'List your service': 'Dienst aanmelden', 'Subscribe': 'Inschrijven', 'Subscribed': 'Ingeschreven', 'Back home': 'Terug naar home', 'Talk to our team': 'Praat met ons team', 'Search flights': 'Vluchten zoeken', 'View details': 'Details bekijken', 'Continue to booking': 'Doorgaan naar boeken', 'Send booking request': 'Boekingsaanvraag versturen', 'Send message': 'Bericht versturen', 'Sending...': 'Versturen...', 'Request a trip plan': 'Vraag een reisplan aan', 'Plan this trip': 'Plan deze reis', 'Request a plan': 'Vraag een plan aan', 'Request this service': 'Deze dienst aanvragen', 'Start planning': 'Start met plannen', 'Become a partner': 'Word partner', 'Submit partner request': 'Partneraanvraag versturen', 'Check availability': 'Beschikbaarheid controleren', 'Explore package': 'Pakket bekijken', 'View itinerary': 'Programma bekijken', 'Request transfer': 'Transfer aanvragen', 'Full name': 'Volledige naam', 'Email': 'E-mail', 'Phone': 'Telefoon', 'Subject': 'Onderwerp', 'Message': 'Bericht', 'Your name': 'Je naam', 'Your email address': 'Je e-mailadres', 'How can we help?': 'Hoe kunnen we helpen?', 'Your journey, our passion.': 'Jouw reis, onze passie.', 'Support': 'Ondersteuning', 'Services': 'Diensten', 'Company': 'Bedrijf', 'About us': 'Over ons', 'Visa support': 'Visumondersteuning', 'Private trips': 'Privéreizen', 'Discover Egypt': 'Ontdek Egypte', 'Group travel': 'Groepsreizen', 'B2B': 'Zakelijk', 'Press': 'Pers', 'WhatsApp support': 'WhatsApp-support', 'Language': 'Taal', 'Service': 'Dienst', 'Guided experiences': 'Begeleide ervaringen', 'Accommodation': 'Accommodatie', 'Transfers': 'Transfers', 'Experiences': 'Ervaringen', 'from · per person': 'vanaf · per persoon', 'From €85': 'Vanaf €85', 'From €210/night': 'Vanaf €210/nacht', 'Request a quote': 'Offerte aanvragen', 'Build your plan': 'Bouw je plan', 'Monday to Saturday · 09:00–18:00 CET': 'Maandag tot en met zaterdag · 09:00–18:00 CET', 'Hours: Monday to Saturday, 09:00–18:00 CET': 'Openingstijden: maandag tot en met zaterdag, 09:00–18:00 CET', 'Economy': 'Economy', 'Premium Economy': 'Premium Economy', 'Business': 'Business', 'First': 'First', 'Passengers': 'Passagiers', 'traveller': 'reiziger', 'travellers': 'reizigers', 'From': 'Van', 'To': 'Naar', 'Departure': 'Vertrek', 'Return': 'Terugreis', 'Cabin': 'Cabine', 'Lowest price': 'Laagste prijs', 'Recommended': 'Aanbevolen', 'No booking found for those details.': 'Geen boeking gevonden voor deze gegevens.', 'Where will': 'Waar', 'you go next?': 'ga je naartoe?', 'Travel support built around real trips': 'Reisondersteuning voor echte reizen', 'From ancient wonders to island coastlines — ten places our travelers can’t stop booking.': 'Van oude wonderen tot eilanden en kusten: tien bestemmingen die onze reizigers blijven boeken.', 'Historic lanes, Bosphorus light': 'Historische straten en Bosporuslicht', 'Old stones, river evenings': 'Oude stenen en avonden aan de rivier', 'Sea air, reef days': 'Zeelucht en dagen bij het rif', 'Red Sea calm': 'Rust aan de Rode Zee', 'Sunrise magic': 'Magie bij zonsopkomst', 'Coasts, gardens and drift': 'Kusten, tuinen en ontspanning', 'Skyline and desert light': 'Skyline en woestijnlicht', 'City edges and mountain air': 'Stadsrand en berglucht', 'Seaside evenings and culture': 'Avonden aan zee en cultuur', 'Canals, bikes and easy energy': 'Grachten, fietsen en ontspannen energie', 'city breaks & culture': 'stadsreizen & cultuur', 'nile evenings & old stones': 'Nijlavonden & oude stenen', 'sun, reef & slow rhythms': 'zon, rif & rustig tempo', 'reef escapes & sunsets': 'rifvakanties & zonsondergangen', 'balloons & volcanic landscapes': 'ballonnen & vulkanische landschappen', 'beaches, bay views & easy escapes': 'stranden, baaien & ontspannen reizen', 'modern stays & desert days': 'moderne verblijven & woestijndagen', 'ancient routes & warm hospitality': 'oude routes & warme gastvrijheid', 'coast, cafés & city rhythm': 'kust, cafés & stadsritme', 'city breaks & design-led routes': 'stadsreizen & designroutes', 'Cairo heritage day': 'Cairo erfgoeddag', 'Istanbul city stay': 'Stadsverblijf in Istanbul', 'Red Sea arrival service': 'Aankomstservice Rode Zee', 'Cappadocia sunrise plan': 'Cappadocië zonsopkomstplan', 'Cairo, Egypt': 'Cairo, Egypte', 'Istanbul, Türkiye': 'Istanbul, Türkiye', 'Hurghada, Egypt': 'Hurghada, Egypte', 'Cappadocia, Türkiye': 'Cappadocië, Türkiye', 'Private guide, historic landmarks and flexible pickup planning.': 'Privégids, historische bezienswaardigheden en flexibele ophaalplanning.', 'Central hotel options for short breaks, couples and families.': 'Centrale hotels voor korte reizen, stellen en gezinnen.', 'Airport pickup and resort transfer coordination.': 'Ophaalservice vanaf de luchthaven en transfer naar het resort.', 'Cave stay, valley tour and sunrise activity coordination.': 'Overnachting in een grothotel, valleitocht en zonsopkomstactiviteit.', 'Local services, ready for your journey.': 'Lokale diensten voor jouw reis.', 'Browse accommodation, guided experiences and transfers from the Flight Right partner network. Every request is confirmed with the provider before payment.': 'Bekijk accommodaties, begeleide ervaringen en transfers uit het Flight Right-partnernetwerk. Elke aanvraag wordt vóór betaling met de aanbieder bevestigd.', 'New routes, seasonal fares and destination guides — occasionally, not overwhelmingly.': 'Nieuwe routes, seizoentarieven en bestemmingsgidsen, af en toe en overzichtelijk.', 'Thoughtful ideas, not a flood.': 'Doordachte ideeën, geen overvloed.', 'EUR': 'EUR', 'EGP': 'EGP', 'TRY': 'TRY', 'USD': 'USD'
  },
};

Object.assign(translations.ar, {
  'Group travel abroad': 'رحلات جماعية إلى الخارج',
  'Organizing affordable group trips to the most popular global destinations with carefully crafted itineraries designed for smooth and enjoyable travel.': 'تنظيم رحلات جماعية بأسعار مناسبة إلى أشهر الوجهات، مع برامج مدروسة لتجربة سفر سهلة وممتعة.',
  'Visa assistance': 'المساعدة في التأشيرات',
  'Assisting clients in obtaining visas for top travel destinations, with full support for document preparation and application processes.': 'مساعدة العملاء في الحصول على تأشيرات الوجهات المهمة، مع دعم كامل لإعداد المستندات وإجراءات التقديم.',
  'Private trips & honeymoon packages': 'الرحلات الخاصة وباقات شهر العسل',
  'Offering customized honeymoon packages for unforgettable romantic getaways, designed to suit every budget and preference.': 'تقديم باقات شهر عسل مخصصة لرحلات رومانسية لا تُنسى، بما يناسب مختلف الميزانيات والتفضيلات.',
  'B2B services': 'خدمات الشركات',
  'Supporting travel agents, corporate planners and partner networks with reliable route guidance, coordination and service standards.': 'دعم وكلاء السفر ومنظمي رحلات الشركات وشبكات الشركاء بإرشادات موثوقة للمسارات وتنسيق احترافي ومعايير خدمة واضحة.',
});

Object.assign(translations.nl, {
  'Group travel abroad': 'Groepsreizen naar het buitenland',
  'Organizing affordable group trips to the most popular global destinations with carefully crafted itineraries designed for smooth and enjoyable travel.': 'Betaalbare groepsreizen naar populaire bestemmingen, met zorgvuldig samengestelde programma’s voor een soepele en fijne reis.',
  'Visa assistance': 'Visumondersteuning',
  'Assisting clients in obtaining visas for top travel destinations, with full support for document preparation and application processes.': 'Hulp bij visa voor belangrijke bestemmingen, inclusief volledige ondersteuning bij documenten en de aanvraagprocedure.',
  'Private trips & honeymoon packages': 'Privéreizen en huwelijksreispakketten',
  'Offering customized honeymoon packages for unforgettable romantic getaways, designed to suit every budget and preference.': 'Persoonlijke huwelijksreispakketten voor onvergetelijke romantische reizen, afgestemd op elk budget en elke voorkeur.',
  'B2B services': 'B2B-diensten',
  'Supporting travel agents, corporate planners and partner networks with reliable route guidance, coordination and service standards.': 'Ondersteuning voor reisagenten, zakelijke planners en partners met betrouwbare routebegeleiding, coördinatie en duidelijke servicenormen.',
});

Object.assign(translations.ar, {
  'Antalya is one of the most popular routes in our portfolio, combining easy flight access, local culture and flexible trip planning.': 'أنطاليا من أشهر المسارات لدينا، فهي تجمع بين سهولة الوصول جواً والثقافة المحلية والتخطيط المرن للرحلات.',
  'Coastal stays with swimming and sea views': 'إقامات ساحلية مع السباحة وإطلالات البحر',
  'Old-town walks, waterfalls and nearby ruins': 'نزهات في المدينة القديمة وشلالات وآثار قريبة',
  'Flexible options for families, couples and groups': 'خيارات مرنة للعائلات والأزواج والمجموعات',
  'Flight and resort comparisons': 'مقارنة الرحلات والمنتجعات',
  'Hotel planning across beach and city areas': 'تخطيط الفنادق في مناطق الشاطئ والمدينة',
  'Boat trips, old-town visits and day excursions': 'رحلات بحرية وزيارات للمدينة القديمة ورحلات يومية',
  'Airport transfers and family-friendly trip coordination': 'انتقالات المطار وتنسيق رحلات مناسبة للعائلات',
  'Coastal holidays, families, couples and resort travellers': 'العطلات الساحلية والعائلات والأزواج ورواد المنتجعات',
  'Antalya coast break': 'عطلة ساحل أنطاليا',
  '4 nights with flights, a coastal stay, transfers and time for the beach.': 'أربع ليالٍ مع الرحلات وإقامة ساحلية وانتقالات ووقت للشاطئ.',
  'Culture and coast': 'الثقافة والساحل',
  '6 nights balancing old-town Antalya, day trips and a comfortable seaside base.': 'ست ليالٍ تجمع بين مدينة أنطاليا القديمة والرحلات اليومية وقاعدة مريحة على البحر.',
  'Family summer stay': 'إقامة عائلية صيفية',
  '7 nights with practical transfers, family accommodation and an easy-paced plan.': 'سبع ليالٍ مع انتقالات عملية وإقامة عائلية وبرنامج بإيقاع مريح.',
  'Decide whether your priority is a resort, old-town access or a mix of both.': 'حدد ما إذا كانت الأولوية للمنتجع أو الوصول إلى المدينة القديمة أو مزيج منهما.',
  'Add day trips selectively so the itinerary keeps enough time for the coast.': 'أضف الرحلات اليومية بعناية حتى يحتفظ البرنامج بوقت كافٍ للساحل.',
  'We can match the accommodation area to your transfer needs and travel pace.': 'يمكننا اختيار منطقة الإقامة بما يناسب انتقالاتك وإيقاع سفرك.',
  'Dubai is one of the most popular routes in our portfolio, combining easy flight access, local culture and flexible trip planning.': 'دبي من أشهر المسارات لدينا، فهي تجمع بين سهولة الوصول جواً والثقافة المحلية والتخطيط المرن للرحلات.',
  'Modern architecture, shopping and dining': 'عمارة حديثة وتسوق وتجارب طعام',
  'Desert activities alongside city experiences': 'أنشطة صحراوية إلى جانب تجارب المدينة',
  'Many hotel and itinerary styles for different budgets': 'خيارات فنادق وبرامج تناسب الميزانيات المختلفة',
  'Flight and stopover planning': 'تخطيط الرحلات والتوقفات',
  'City hotels, resorts and family accommodation': 'فنادق المدينة والمنتجعات والإقامات العائلية',
  'Desert safaris, city tours and attraction planning': 'رحلات السفاري الصحراوية وجولات المدينة وتخطيط الزيارات',
  'Airport transfers and schedule coordination': 'انتقالات المطار وتنسيق المواعيد',
  'Stopovers, families, couples, shopping trips and business travel': 'التوقفات والعائلات والأزواج ورحلات التسوق وسفر الأعمال',
  'Dubai city break': 'عطلة مدينة في دبي',
  '3 nights with flights, a central hotel, transfers and a selection of city highlights.': 'ثلاث ليالٍ مع الرحلات وفندق مركزي وانتقالات ومجموعة من أبرز معالم المدينة.',
  'City and desert': 'المدينة والصحراء',
  '5 nights combining skyline experiences, shopping time and a desert excursion.': 'خمس ليالٍ تجمع بين إطلالات المدينة ووقت للتسوق ورحلة صحراوية.',
  'Family Dubai stay': 'إقامة عائلية في دبي',
  '6 nights with family-friendly accommodation, easy transfers and flexible activity days.': 'ست ليالٍ مع إقامة مناسبة للعائلات وانتقالات سهلة وأيام أنشطة مرنة.',
  'Choose the hotel area around the experiences you care about most.': 'اختر منطقة الفندق وفق التجارب التي تهمك أكثر.',
  'Reserve space for rest because the city offers more activities than a short trip can fit.': 'خصص وقتًا للراحة لأن المدينة تقدم أنشطة أكثر مما تستوعبه الرحلة القصيرة.',
  'We can build a practical stopover plan around your onward flight.': 'يمكننا بناء خطة توقف عملية حول رحلة المتابعة.',
  'Amman is one of the most popular routes in our portfolio, combining easy flight access, local culture and flexible trip planning.': 'عمّان من أشهر المسارات لدينا، فهي تجمع بين سهولة الوصول جواً والثقافة المحلية والتخطيط المرن للرحلات.',
  'Historic sites, markets and local food': 'مواقع تاريخية وأسواق وطعام محلي',
  'A gateway to Petra, Wadi Rum and the Dead Sea': 'بوابة إلى البتراء ووادي رم والبحر الميت',
  'A strong base for a compact Jordan itinerary': 'قاعدة ممتازة لبرنامج أردني مختصر',
  'Flights and multi-city route planning': 'تخطيط الرحلات والمسارات متعددة المدن',
  'City hotels and regional accommodation': 'فنادق المدينة والإقامات الإقليمية',
  'Guided visits and private transfers': 'زيارات بصحبة مرشد وانتقالات خاصة',
  'Itinerary support for Jordan highlights': 'دعم تخطيط برنامج لأبرز معالم الأردن',
  'Culture travellers, couples, small groups and first-time visitors to Jordan': 'محبو الثقافة والأزواج والمجموعات الصغيرة وزوار الأردن لأول مرة',
  'Amman city stay': 'إقامة في عمّان',
  '3 nights with hotel planning, city sightseeing and time for local food and markets.': 'ثلاث ليالٍ مع تخطيط الفندق وجولات المدينة ووقت للطعام المحلي والأسواق.',
  'Jordan highlights': 'أبرز معالم الأردن',
  '6 nights linking Amman with Petra, Wadi Rum or the Dead Sea through a coordinated route.': 'ست ليالٍ تربط عمّان بالبتراء أو وادي رم أو البحر الميت عبر مسار منسق.',
  'Private Jordan route': 'مسار أردني خاص',
  '7 nights with a flexible driver-led itinerary shaped around your interests and pace.': 'سبع ليالٍ مع برنامج مرن بسيارة وسائق مصمم وفق اهتماماتك وإيقاعك.',
  'Jordan is best planned as a route rather than a single-city visit if you have enough time.': 'من الأفضل تخطيط الأردن كمسار لا كزيارة مدينة واحدة إذا كان لديك وقت كافٍ.',
  'Allow realistic travel time between the capital and regional highlights.': 'احسب وقتًا واقعيًا للتنقل بين العاصمة وأبرز المناطق.',
  'We can coordinate a private or small-group plan around your arrival flight.': 'يمكننا تنسيق برنامج خاص أو لمجموعة صغيرة حول رحلة الوصول.',
  'Beirut is one of the most popular routes in our portfolio, combining easy flight access, local culture and flexible trip planning.': 'بيروت من أشهر المسارات لدينا، فهي تجمع بين سهولة الوصول جواً والثقافة المحلية والتخطيط المرن للرحلات.',
  'Seafront walks, cafés and neighbourhood culture': 'نزهات على البحر ومقاهٍ وثقافة الأحياء',
  'Food, design and arts experiences': 'تجارب الطعام والتصميم والفنون',
  'Easy access to day trips beyond the capital': 'وصول سهل إلى رحلات يومية خارج العاصمة',
  'Flight and city-stay planning': 'تخطيط الرحلات والإقامة في المدينة',
  'Boutique hotels and practical accommodation choices': 'فنادق بوتيكية وخيارات إقامة عملية',
  'Food, culture and private day-tour requests': 'طلبات جولات خاصة للطعام والثقافة',
  'Airport transfers and itinerary support': 'انتقالات المطار ودعم البرنامج',
  'Couples, food travellers, culture travellers and short city breaks': 'الأزواج ومحبو الطعام والثقافة وعطلات المدن القصيرة',
  'Beirut weekend': 'عطلة نهاية أسبوع في بيروت',
  '3 nights with a central stay, airport transfer and a food-and-culture focused plan.': 'ثلاث ليالٍ مع إقامة مركزية وانتقال من المطار وبرنامج يركز على الطعام والثقافة.',
  'City and coast': 'المدينة والساحل',
  '5 nights with Beirut experiences plus a flexible day trip outside the capital.': 'خمس ليالٍ مع تجارب بيروت ورحلة يومية مرنة خارج العاصمة.',
  'Private Lebanon stay': 'إقامة خاصة في لبنان',
  '6 to 7 nights with tailored city, mountain and coastal experiences.': 'من ست إلى سبع ليالٍ مع تجارب مخصصة في المدينة والجبال والساحل.',
  'A central base makes it easier to combine neighbourhood walks with restaurants and galleries.': 'تسهل الإقامة المركزية الجمع بين جولات الأحياء والمطاعم والمعارض.',
  'Keep day trips flexible so the itinerary can follow local conditions and your pace.': 'حافظ على مرونة الرحلات اليومية ليتناسب البرنامج مع الظروف المحلية وإيقاعك.',
  'We can focus the plan on food, culture, coastline or a balanced mix.': 'يمكننا تركيز البرنامج على الطعام أو الثقافة أو الساحل أو مزيج متوازن.',
  'Amsterdam is one of the most popular routes in our portfolio, combining easy flight access, local culture and flexible trip planning.': 'أمستردام من أشهر المسارات لدينا، فهي تجمع بين سهولة الوصول جواً والثقافة المحلية والتخطيط المرن للرحلات.',
  'Canals, museums and walkable neighbourhoods': 'قنوات ومتاحف وأحياء مناسبة للمشي',
  'Excellent rail and air connections for onward travel': 'شبكة ممتازة من القطارات والرحلات للمتابعة',
  'A flexible base for couples, families and business visitors': 'قاعدة مرنة للأزواج والعائلات وزوار الأعمال',
  'Flights and short-break planning': 'تخطيط الرحلات والعطلات القصيرة',
  'Central hotel and apartment recommendations': 'اقتراحات الفنادق والشقق المركزية',
  'Museum, canal and local experience requests': 'طلبات تجارب المتاحف والقنوات والأنشطة المحلية',
  'Airport and station transfer guidance': 'إرشادات الانتقال من المطار والمحطة',
  'City breaks, weekend visitors, families and business travellers': 'عطلات المدن وزوار نهاية الأسبوع والعائلات ومسافرو الأعمال',
  'Amsterdam weekend': 'عطلة نهاية أسبوع في أمستردام',
  '2 to 3 nights with a central stay, arrival guidance and a simple city highlights plan.': 'من ليلتين إلى ثلاث مع إقامة مركزية وإرشادات الوصول وبرنامج بسيط لأبرز معالم المدينة.',
  'Amsterdam and beyond': 'أمستردام وما بعدها',
  '4 to 5 nights combining the city with nearby towns or a wider Netherlands route.': 'من أربع إلى خمس ليالٍ تجمع المدينة مع بلدات قريبة أو مسار أوسع في هولندا.',
  'Work and leisure stay': 'إقامة للعمل والترفيه',
  'A flexible plan that keeps transport, accommodation and personal time easy to manage.': 'خطة مرنة تجعل إدارة المواصلات والإقامة والوقت الشخصي سهلة.',
  'Book the accommodation area around your main museums, meetings or neighbourhood interests.': 'احجز منطقة الإقامة حول المتاحف أو الاجتماعات أو الأحياء التي تهمك.',
  'Use public transport and walking time as part of the experience, not just a transfer between stops.': 'استخدم المواصلات العامة ووقت المشي كجزء من التجربة لا كتنقل بين المحطات فقط.',
  'We can combine Amsterdam with onward routes across Europe, Egypt or Türkiye.': 'يمكننا جمع أمستردام مع مسارات متابعة عبر أوروبا أو مصر أو تركيا.'
});

Object.assign(translations.ar, {
  'Compare flight options with clear timings, stops and cabin details. This results view is ready to receive live Duffel offers when the API is connected.': 'قارن خيارات الرحلات مع مواعيد واضحة وعدد التوقفات وتفاصيل الدرجة. هذه الصفحة جاهزة لاستقبال عروض Duffel المباشرة عند ربط واجهة البرمجة.',
  to: 'إلى'
});

Object.assign(translations.nl, {
  'Compare flight options with clear timings, stops and cabin details. This results view is ready to receive live Duffel offers when the API is connected.': 'Vergelijk vluchtopties met duidelijke tijden, stops en cabinegegevens. Deze resultatenpagina is klaar voor actuele Duffel-aanbiedingen zodra de API is gekoppeld.',
  to: 'naar'
});

Object.assign(translations.ar, {
  '4h 25m': '4س 25د', '5h 35m': '5س 35د',
  'Economy fare. Taxes and live provider conditions will be confirmed during the API-backed booking step.': 'سعر الدرجة الاقتصادية. سيتم تأكيد الضرائب وشروط مزود الخدمة الحالية أثناء خطوة الحجز المرتبطة بواجهة البرمجة.',
  ' fare. Taxes and live provider conditions will be confirmed during the API-backed booking step.': ' السعر. سيتم تأكيد الضرائب وشروط مزود الخدمة الحالية أثناء خطوة الحجز المرتبطة بواجهة البرمجة.'
});

Object.assign(translations.nl, {
  '4h 25m': '4u 25m', '5h 35m': '5u 35m',
  'Economy fare. Taxes and live provider conditions will be confirmed during the API-backed booking step.': 'Economy-tarief. Belastingen en actuele voorwaarden van de aanbieder worden bevestigd tijdens de API-gestuurde boekingsstap.',
  ' fare. Taxes and live provider conditions will be confirmed during the API-backed booking step.': ' tarief. Belastingen en actuele voorwaarden van de aanbieder worden bevestigd tijdens de API-gestuurde boekingsstap.'
});

Object.assign(translations.nl, {
  'Custom trip request': 'Aangepast reisverzoek', 'travel service': 'reisdienst', 'Tell us your dates, destination, number of travellers and preferences': 'Vertel ons je data, bestemming, aantal reizigers en voorkeuren'
});

Object.assign(translations.ar, {
  EUR: 'يورو', EGP: 'جنيه مصري', TRY: 'ليرة تركية', USD: 'دولار',
  'Travel support built around real trips': 'دعم سفر مصمم لرحلات حقيقية', Service: 'خدمة',
  'Local services, ready for your journey.': 'خدمات محلية جاهزة لرحلتك.', 'Browse accommodation, guided experiences and transfers from the Flight Right partner network. Every request is confirmed with the provider before payment.': 'استعرض أماكن الإقامة والتجارب بصحبة مرشد والانتقالات من شبكة شركاء Flight Right. يتم تأكيد كل طلب مع مقدم الخدمة قبل الدفع.',
  'Stay inspired': 'ابقَ على اطلاع', 'New routes, seasonal fares and destination guides — occasionally, not overwhelmingly.': 'مسارات جديدة وأسعار موسمية وأدلة وجهات، من وقت لآخر وبلا إغراق.', 'You’re signed up for new inspiration.': 'تم تسجيلك للحصول على أفكار سفر جديدة.', 'Thoughtful ideas, not a flood.': 'أفكار مدروسة، بلا إغراق.',
  'Your journey, our passion.': 'رحلتك، شغفنا.', Services: 'الخدمات', Company: 'الشركة', Support: 'الدعم', 'Group travel': 'رحلات جماعية', 'Discover Egypt': 'اكتشف مصر', 'About us': 'من نحن', Press: 'الإعلام', 'WhatsApp support': 'دعم WhatsApp',
  'Built for people who want less friction and more feeling.': 'صُمم لمن يريد سفرًا أسهل وتجارب أكثر شعورًا.', 'Our story': 'قصتنا', 'What we value': 'قيمنا', 'Apply now': 'قدّم الآن', 'Perks & culture': 'المزايا والثقافة', 'Latest updates': 'آخر التحديثات', 'Media contact': 'تواصل الإعلام', 'Press & partnerships': 'الإعلام والشراكات', 'For interviews, destination stories and partnership requests, contact our media desk.': 'للمقابلات وقصص الوجهات وطلبات الشراكة، تواصل مع قسم الإعلام.', 'Office: Amsterdam, Netherlands': 'المكتب: أمستردام، هولندا',
  'Thanks for getting in touch.': 'شكرًا لتواصلك معنا.', 'Return home': 'العودة للرئيسية', 'Talk to us': 'تحدث معنا', 'Hours: Monday to Saturday, 09:00–18:00 CET': 'الساعات: من الاثنين إلى السبت، 09:00–18:00 بتوقيت وسط أوروبا', 'Your name': 'اسمك', 'How can we help?': 'كيف يمكننا مساعدتك؟', 'Tell us about your trip or enquiry': 'أخبرنا عن رحلتك أو استفسارك',
  'Request received': 'تم استلام الطلب', 'Your booking request has been sent to the Flight Right team. We will confirm availability and the next step before anything is charged.': 'تم إرسال طلب الحجز إلى فريق Flight Right. سنؤكد التوفر والخطوة التالية قبل تحصيل أي مبلغ.', 'Passenger details': 'بيانات المسافر', 'Complete the request form to continue. Payment is intentionally not collected in this prototype; the API integration will add secure Duffel payment handling here.': 'أكمل نموذج الطلب للمتابعة. لا يتم تحصيل الدفع في هذا النموذج التجريبي؛ وستضيف واجهة البرمجة معالجة دفع Duffel الآمنة هنا.', 'Lead traveller': 'المسافر الرئيسي', 'First name': 'الاسم الأول', 'Last name': 'اسم العائلة', 'Send booking request': 'إرسال طلب الحجز',
  'Your itinerary': 'برنامج رحلتك', 'We have your details.': 'تم استلام بياناتك.', 'Your booking request is ready for review.': 'طلب حجزك جاهز للمراجعة.', 'Hotels': 'الفنادق', 'Holidays': 'العطلات', 'Tours': 'الجولات', 'Transfers': 'الانتقالات', Holiday: 'عطلة', Experience: 'تجربة', 'Check availability': 'تحقق من التوفر', 'Explore package': 'استكشف البرنامج', 'View itinerary': 'عرض البرنامج', 'Request transfer': 'طلب انتقال',
  'Flight Right service': 'خدمة Flight Right', 'Personal support': 'دعم شخصي', 'Tell us what you need and we will prepare the next step.': 'أخبرنا بما تحتاجه وسنجهز لك الخطوة التالية.', 'Request a plan': 'اطلب خطة', 'We have your request.': 'تم استلام طلبك.', 'Back home': 'العودة للرئيسية', 'Full name': 'الاسم الكامل', 'Tell us your dates, destination, number of travellers and preferences': 'أخبرنا بتواريخك ووجهتك وعدد المسافرين وتفضيلاتك', 'Send request': 'إرسال الطلب', 'Selected service': 'الخدمة المختارة', 'We will confirm live availability, inclusions, cancellation terms and payment options before proceeding.': 'سنؤكد التوفر الحالي والمزايا وشروط الإلغاء وخيارات الدفع قبل المتابعة.',
  'Partner marketplace': 'سوق الشركاء', 'For travellers': 'للمسافرين', 'Add the right local details to your trip.': 'أضف التفاصيل المحلية المناسبة إلى رحلتك.', 'Choose a service below or ask us to combine several into one route plan.': 'اختر خدمة أدناه أو اطلب منا جمع عدة خدمات في خطة واحدة.', 'Become a partner': 'كن شريكًا', 'Partner offer': 'عرض شريك', 'Request this service': 'اطلب هذه الخدمة', 'Partner request received': 'تم استلام طلب الشراكة', 'Thank you. The Flight Right team will review your service details and contact you about the next onboarding step.': 'شكرًا لك. سيراجع فريق Flight Right تفاصيل خدمتك ويتواصل معك بشأن خطوة الانضمام التالية.', 'Your service is in review.': 'خدمتك قيد المراجعة.', 'We will confirm the listing requirements, commercial terms and availability before your offer is shown to travellers.': 'سنؤكد متطلبات الإدراج والشروط التجارية والتوفر قبل عرض خدمتك على المسافرين.', 'View marketplace': 'عرض السوق',
  'Business information': 'بيانات الشركة', 'Business name': 'اسم الشركة', 'Contact email': 'البريد الإلكتروني للتواصل', 'Service type': 'نوع الخدمة', 'Choose one': 'اختر واحدًا', Accommodation: 'إقامة', 'Guided experiences': 'تجارب بصحبة مرشد', 'Other travel service': 'خدمة سفر أخرى', 'Main location': 'الموقع الرئيسي', 'Tell us about your offer': 'أخبرنا عن عرضك', 'Describe your service, capacity, typical price and preferred travellers': 'صف خدمتك وسعتها وسعرها المعتاد والمسافرين المفضلين لديك', 'Submit partner request': 'إرسال طلب الشراكة', 'How it works': 'كيف يعمل النظام', '01. Apply.': '01. قدّم الطلب.', '02. Review.': '02. المراجعة.', '03. Publish.': '03. النشر.', '04. Confirm.': '04. التأكيد.', 'Share your business and service details.': 'شارك بيانات شركتك وخدمتك.', 'We check fit, availability and listing information.': 'نتحقق من الملاءمة والتوفر وبيانات الإدراج.', 'Approved offers can be requested by Flight Right travellers.': 'يمكن لمسافري Flight Right طلب العروض المعتمدة.', 'We coordinate the request and provider terms before payment.': 'ننسق الطلب وشروط مقدم الخدمة قبل الدفع.',
  'Why partner with us': 'لماذا تصبح شريكًا معنا', 'Partner contact': 'تواصل الشركاء', 'Business enquiries': 'استفسارات الشركات', 'Contact sales': 'تواصل مع المبيعات', 'Find a booking': 'ابحث عن حجز', 'Look up your trip': 'ابحث عن رحلتك', 'Booking reference': 'مرجع الحجز', 'Booking email': 'بريد الحجز', 'Find trip': 'البحث عن الرحلة',
  'Travelers are responsible for providing accurate personal, travel and payment information at the time of booking. We rely on this to confirm reservations and support any changes or requests.': 'يتحمل المسافرون مسؤولية تقديم معلومات شخصية ومعلومات سفر ودفع دقيقة عند الحجز. نعتمد عليها لتأكيد الحجوزات ودعم أي تغييرات أو طلبات.', 'Service availability': 'توفر الخدمة', 'Flight Right provides information, booking support and travel coordination services. Availability and pricing are subject to change based on provider schedules, supplier policies and market conditions.': 'تقدم Flight Right المعلومات ودعم الحجز وتنسيق السفر. يخضع التوفر والأسعار للتغيير بحسب جداول مقدمي الخدمة وسياسات الموردين وظروف السوق.', 'Liability and support': 'المسؤولية والدعم', 'We aim to provide accurate guidance and responsive support throughout the booking journey.': 'نهدف إلى تقديم إرشادات دقيقة ودعم سريع طوال رحلة الحجز.', 'What we collect': 'ما نجمعه', 'How we use it': 'كيف نستخدمه', 'Your choices': 'خياراتك', 'We may collect contact details, travel preferences, payment information, trip history and information from service providers necessary to complete your booking.': 'قد نجمع بيانات التواصل وتفضيلات السفر ومعلومات الدفع وسجل الرحلات والمعلومات اللازمة من مقدمي الخدمات لإتمام حجزك.', 'We use this information to manage bookings, tailor recommendations, provide customer support and improve the quality of our travel services.': 'نستخدم هذه المعلومات لإدارة الحجوزات وتخصيص التوصيات وتقديم دعم العملاء وتحسين جودة خدمات السفر.', 'You can request access to your personal data, correct inaccurate details or ask us to stop communication from us at any time by contacting our support team.': 'يمكنك طلب الوصول إلى بياناتك الشخصية أو تصحيح المعلومات غير الدقيقة أو طلب إيقاف التواصل معنا في أي وقت عبر فريق الدعم.',
  'From Cairo and the Nile to the Red Sea and Sinai, our Egypt journeys are designed for comfort, culture and easy planning.': 'من القاهرة والنيل إلى البحر الأحمر وسيناء، صُممت رحلاتنا في مصر للراحة والثقافة وسهولة التخطيط.', 'Flight Right partner marketplace': 'سوق شركاء Flight Right'
});

Object.assign(translations.ar, {
  'Destination': 'الوجهة', 'Choose a destination to start planning.': 'اختر وجهة لبدء التخطيط.', 'Our story': 'قصتنا', 'What we value': 'قيمنا', 'About us': 'من نحن', 'Years planning journeys': 'سنوات في تخطيط الرحلات', 'Trips arranged': 'رحلة تم ترتيبها', 'Core destinations': 'وجهة رئيسية', 'Guest rating': 'تقييم العملاء', 'Built for people who want less friction and more feeling.': 'صُمم لمن يريد سفرًا أسهل وتجارب أكثر شعورًا.', 'What we offer': 'ما نقدمه', 'Why travelers choose it': 'لماذا يختارها المسافرون', 'Best for': 'مناسبة لـ', 'Ways to travel': 'طرق السفر', 'Planning notes': 'نصائح التخطيط', 'A better fit for your days': 'خطة تناسب أيامك بشكل أفضل', 'Choose your': 'اختر إيقاع', 'rhythm': 'رحلتك', 'Flights': 'الرحلات الجوية', 'Flight details': 'تفاصيل الرحلة', 'Selected flight': 'الرحلة المختارة', 'Airline': 'شركة الطيران', 'Travel date': 'تاريخ السفر', 'Schedule': 'المواعيد', 'Stops': 'التوقفات', 'Fare summary': 'ملخص السعر', 'per traveller': 'للمسافر', 'Flight details': 'تفاصيل الرحلة', 'Hotels': 'الفنادق', 'Holidays': 'العطلات', 'Tours': 'الجولات', 'Transfers': 'الانتقالات', 'Holiday': 'عطلة', 'Experience': 'تجربة', 'Your search': 'بحثك', 'Sort by': 'ترتيب حسب', 'Edit search': 'تعديل البحث', 'Passenger details': 'بيانات المسافر', 'Lead traveller': 'المسافر الرئيسي', 'First name': 'الاسم الأول', 'Last name': 'اسم العائلة', 'Your itinerary': 'برنامج رحلتك', 'Estimated total': 'الإجمالي التقديري', 'Request received': 'تم استلام الطلب', 'Complete your request': 'أكمل طلبك', 'Traveller details': 'بيانات المسافر', 'Travel dates and group size': 'تواريخ السفر وعدد المسافرين', 'Selected service': 'الخدمة المختارة', 'Personal support': 'دعم شخصي', 'Tell us what you need and we will prepare the next step.': 'أخبرنا بما تحتاجه وسنجهز لك الخطوة التالية.', 'Partner marketplace': 'سوق الشركاء', 'For travellers': 'للمسافرين', 'Add the right local details to your trip.': 'أضف التفاصيل المحلية المناسبة إلى رحلتك.', 'Choose a service below or ask us to combine several into one route plan.': 'اختر خدمة أدناه أو اطلب منا دمج عدة خدمات في برنامج واحد.', 'Partner offer': 'عرض من شريك', 'Partner request received': 'تم استلام طلب الشراكة', 'Your service is in review.': 'خدمتك قيد المراجعة.', 'List your service': 'أضف خدمتك', 'Business information': 'معلومات الشركة', 'Business name': 'اسم الشركة', 'Contact email': 'بريد التواصل', 'Service type': 'نوع الخدمة', 'Main location': 'الموقع الرئيسي', 'Tell us about your offer': 'أخبرنا عن خدمتك', 'How it works': 'كيف يعمل النظام', 'Why partner with us': 'لماذا تصبح شريكًا معنا', 'Partner contact': 'تواصل الشركاء', 'Business enquiries': 'استفسارات الشركات', 'Contact sales': 'تواصل مع المبيعات', 'Help center': 'مركز المساعدة', 'Can I change my flight after booking?': 'هل يمكنني تغيير الرحلة بعد الحجز؟', 'Can I request help with a group flight?': 'هل يمكنني طلب مساعدة في رحلة جماعية؟', 'How do I manage my itineraries?': 'كيف أدير برامج رحلاتي؟', 'My Trips': 'رحلاتي', 'Find a booking': 'ابحث عن حجز', 'Look up your trip': 'ابحث عن رحلتك', 'Booking reference': 'مرجع الحجز', 'Booking email': 'بريد الحجز', 'Find trip': 'البحث عن الرحلة', 'No booking found for those details.': 'لم يتم العثور على حجز بهذه البيانات.', 'Terms of service': 'شروط الخدمة', 'Booking responsibilities': 'مسؤوليات الحجز', 'Service availability': 'توفر الخدمة', 'Liability and support': 'المسؤولية والدعم', 'Privacy policy': 'سياسة الخصوصية', 'What we collect': 'ما نجمعه', 'How we use it': 'كيف نستخدمه', 'Your choices': 'خياراتك', 'Message sent': 'تم إرسال الرسالة', 'Thanks for getting in touch.': 'شكرًا لتواصلك معنا.', 'Return home': 'العودة للرئيسية', 'Talk to us': 'تحدث معنا', 'Latest updates': 'آخر التحديثات', 'Media contact': 'تواصل الإعلام', 'Press & partnerships': 'الإعلام والشراكات', 'Apply now': 'تقدم الآن', 'Perks & culture': 'المزايا وثقافة العمل', 'Flight Right service': 'خدمة Flight Right', 'Personal support': 'دعم شخصي', 'Partner offer': 'عرض شريك', 'Business enquiries': 'استفسارات الأعمال', 'Contact sales': 'تواصل مع المبيعات'
});

Object.assign(translations.nl, {
  'Destination': 'Bestemming', 'Choose a destination to start planning.': 'Kies een bestemming om te beginnen.', 'Our story': 'Ons verhaal', 'What we value': 'Waar we voor staan', 'Years planning journeys': 'Jaar ervaring met reisplanning', 'Trips arranged': 'Geregelde reizen', 'Core destinations': 'Belangrijke bestemmingen', 'Guest rating': 'Beoordeling van gasten', 'Built for people who want less friction and more feeling.': 'Voor mensen die minder gedoe en meer beleving willen.', 'What we offer': 'Wat we bieden', 'Why travelers choose it': 'Waarom reizigers hiervoor kiezen', 'Best for': 'Ideaal voor', 'Ways to travel': 'Manieren om te reizen', 'Planning notes': 'Planningsnotities', 'A better fit for your days': 'Een plan dat bij jouw dagen past', 'Choose your': 'Kies jouw', 'rhythm': 'ritme', 'Flight details': 'Vluchtgegevens', 'Selected flight': 'Geselecteerde vlucht', 'Airline': 'Luchtvaartmaatschappij', 'Travel date': 'Reisdatum', 'Schedule': 'Schema', 'Stops': 'Stops', 'Fare summary': 'Prijs overzicht', 'per traveller': 'per reiziger', 'Hotels': 'Hotels', 'Holidays': 'Vakanties', 'Tours': 'Tours', 'Transfers': 'Transfers', 'Holiday': 'Vakantie', 'Experience': 'Ervaring', 'Your search': 'Jouw zoekopdracht', 'Sort by': 'Sorteren op', 'Edit search': 'Zoekopdracht aanpassen', 'Passenger details': 'Passagiersgegevens', 'Lead traveller': 'Hoofdreiziger', 'First name': 'Voornaam', 'Last name': 'Achternaam', 'Your itinerary': 'Jouw reisprogramma', 'Estimated total': 'Geschat totaal', 'Request received': 'Aanvraag ontvangen', 'Complete your request': 'Rond je aanvraag af', 'Traveller details': 'Reizigersgegevens', 'Travel dates and group size': 'Reisdata en groepsgrootte', 'Selected service': 'Geselecteerde dienst', 'Tell us what you need and we will prepare the next step.': 'Vertel wat je nodig hebt, dan bereiden wij de volgende stap voor.', 'Partner marketplace': 'Partnermarktplaats', 'For travellers': 'Voor reizigers', 'Add the right local details to your trip.': 'Voeg de juiste lokale details aan je reis toe.', 'Choose a service below or ask us to combine several into one route plan.': 'Kies hieronder een dienst of laat ons meerdere diensten combineren.', 'Partner offer': 'Partneraanbod', 'Partner request received': 'Partneraanvraag ontvangen', 'Your service is in review.': 'Je dienst wordt beoordeeld.', 'Business information': 'Bedrijfsinformatie', 'Business name': 'Bedrijfsnaam', 'Contact email': 'Contact-e-mail', 'Service type': 'Type dienst', 'Main location': 'Hoofdlocatie', 'Tell us about your offer': 'Vertel over je aanbod', 'How it works': 'Zo werkt het', 'Why partner with us': 'Waarom partner worden', 'Partner contact': 'Partnercontact', 'Business enquiries': 'Zakelijke vragen', 'Contact sales': 'Neem contact op met sales', 'Help center': 'Helpcentrum', 'Can I change my flight after booking?': 'Kan ik mijn vlucht na het boeken wijzigen?', 'Can I request help with a group flight?': 'Kan ik hulp vragen bij een groepsvlucht?', 'How do I manage my itineraries?': 'Hoe beheer ik mijn reisprogramma’s?', 'Find a booking': 'Boeking zoeken', 'Look up your trip': 'Je reis opzoeken', 'Booking reference': 'Boekingsreferentie', 'Booking email': 'Boekingse-mail', 'Find trip': 'Reis zoeken', 'Terms of service': 'Servicevoorwaarden', 'Booking responsibilities': 'Verantwoordelijkheden bij boeken', 'Service availability': 'Beschikbaarheid van de dienst', 'Liability and support': 'Aansprakelijkheid en ondersteuning', 'Privacy policy': 'Privacybeleid', 'What we collect': 'Wat we verzamelen', 'How we use it': 'Hoe we het gebruiken', 'Your choices': 'Jouw keuzes', 'Message sent': 'Bericht verzonden', 'Thanks for getting in touch.': 'Bedankt voor je bericht.', 'Return home': 'Terug naar home', 'Talk to us': 'Neem contact op', 'Latest updates': 'Laatste updates', 'Media contact': 'Perscontact', 'Press & partnerships': 'Pers en partnerschappen', 'Apply now': 'Solliciteer nu', 'Perks & culture': 'Voordelen en cultuur', 'Flight Right service': 'Flight Right-dienst', 'Personal support': 'Persoonlijke ondersteuning'
});

Object.assign(translations.ar, {
  Istanbul: 'إسطنبول', Cairo: 'القاهرة', Hurghada: 'الغردقة', 'Sharm El Sheikh': 'شرم الشيخ', Cappadocia: 'كابادوكيا', Antalya: 'أنطاليا', Dubai: 'دبي', Amman: 'عمّان', Beirut: 'بيروت', Amsterdam: 'أمستردام', Türkiye: 'تركيا', Egypt: 'مصر', Jordan: 'الأردن', Lebanon: 'لبنان', Netherlands: 'هولندا', 'United Arab Emirates': 'الإمارات العربية المتحدة', Direct: 'مباشرة', '1 stop': 'توقف واحد', 'Selected flight': 'الرحلة المختارة', 'Fare summary': 'ملخص السعر', 'Your itinerary': 'برنامج رحلتك', 'per traveller': 'للمسافر', Airline: 'شركة الطيران', 'Travel date': 'تاريخ السفر', Schedule: 'المواعيد', Stops: 'التوقفات', 'Your search': 'بحثك', 'Sort by': 'ترتيب حسب', 'Edit search': 'تعديل البحث', 'Latest updates': 'آخر التحديثات', 'Media contact': 'تواصل الإعلام', 'Press & partnerships': 'الإعلام والشراكات', Office: 'المكتب', 'Business enquiries': 'استفسارات الشركات', 'Partner contact': 'تواصل الشركاء', 'Contact sales': 'تواصل مع المبيعات', 'Partner offer': 'عرض شريك', 'For travellers': 'للمسافرين', 'How it works': 'كيف يعمل النظام', 'Why partner with us': 'لماذا تصبح شريكًا معنا', 'Selected service': 'الخدمة المختارة', 'Opening payment...': 'جارٍ فتح الدفع...', 'Continue to secure payment': 'المتابعة إلى الدفع الآمن', 'Ways to travel': 'طرق السفر', 'Planning notes': 'نصائح التخطيط', 'A better fit for your days': 'خطة تناسب أيامك بشكل أفضل', 'Why travelers choose it': 'لماذا يختارها المسافرون', 'Best for': 'مناسبة لـ', 'What we offer': 'ما نقدمه', 'All rights reserved.': 'جميع الحقوق محفوظة.', 'Amsterdam, Netherlands': 'أمستردام، هولندا'
});

Object.assign(translations.nl, {
  Istanbul: 'Istanbul', Cairo: 'Cairo', Hurghada: 'Hurghada', 'Sharm El Sheikh': 'Sharm El Sheikh', Cappadocia: 'Cappadocië', Antalya: 'Antalya', Dubai: 'Dubai', Amman: 'Amman', Beirut: 'Beiroet', Amsterdam: 'Amsterdam', Türkiye: 'Türkiye', Egypt: 'Egypte', Jordan: 'Jordanië', Lebanon: 'Libanon', Netherlands: 'Nederland', 'United Arab Emirates': 'Verenigde Arabische Emiraten', Direct: 'Direct', '1 stop': '1 stop', 'Selected flight': 'Geselecteerde vlucht', 'Fare summary': 'Prijs overzicht', 'Your itinerary': 'Jouw reisprogramma', 'per traveller': 'per reiziger', Airline: 'Luchtvaartmaatschappij', 'Travel date': 'Reisdatum', Schedule: 'Schema', Stops: 'Stops', 'Your search': 'Jouw zoekopdracht', 'Sort by': 'Sorteren op', 'Edit search': 'Zoekopdracht aanpassen', 'Latest updates': 'Laatste updates', 'Media contact': 'Perscontact', 'Press & partnerships': 'Pers en partnerschappen', Office: 'Kantoor', 'Business enquiries': 'Zakelijke vragen', 'Partner contact': 'Partnercontact', 'Contact sales': 'Neem contact op met sales', 'Partner offer': 'Partneraanbod', 'For travellers': 'Voor reizigers', 'How it works': 'Zo werkt het', 'Why partner with us': 'Waarom partner worden', 'Selected service': 'Geselecteerde dienst', 'Opening payment...': 'Betaling openen...', 'Continue to secure payment': 'Doorgaan naar veilige betaling', 'Ways to travel': 'Manieren om te reizen', 'Planning notes': 'Planningsnotities', 'A better fit for your days': 'Een plan dat bij jouw dagen past', 'Why travelers choose it': 'Waarom reizigers hiervoor kiezen', 'Best for': 'Ideaal voor', 'What we offer': 'Wat we bieden', 'All rights reserved.': 'Alle rechten voorbehouden.', 'Amsterdam, Netherlands': 'Amsterdam, Nederland'
});

Object.assign(translations.ar, {
  'Istanbul is one of the most popular routes in our portfolio, combining easy flight access, local culture and flexible trip planning.': 'إسطنبول من أشهر الوجهات لدينا، فهي تجمع بين سهولة الوصول جواً والثقافة المحلية والتخطيط المرن للرحلات.',
  'Istanbul brings together historic streets, Bosphorus views and a lively city rhythm that works beautifully for short escapes or longer stays. Flight Right can shape the trip around the way you want to travel, from a compact city break to a slower cultural stay.': 'تجمع إسطنبول بين الشوارع التاريخية وإطلالات البوسفور وإيقاع المدينة الحيوي، لذلك تناسب الرحلات القصيرة والإقامات الأطول. يمكن لفلايت رايت تصميم الرحلة وفق أسلوب سفرك، من عطلة مدينة سريعة إلى إقامة ثقافية هادئة.',
  'Historic neighbourhoods and iconic landmarks': 'أحياء تاريخية ومعالم شهيرة', 'Bosphorus views, cafés and evening walks': 'إطلالات البوسفور والمقاهي والتنزهات المسائية', 'A practical mix of culture, food, shopping and free time': 'مزيج عملي من الثقافة والطعام والتسوق والوقت الحر', 'Flight options for city breaks and long-weekend travel': 'خيارات طيران لعطلات المدن ونهاية الأسبوع', 'Central hotels, boutique stays and accommodation planning': 'فنادق مركزية وإقامات بوتيكية وتخطيط السكن', 'Private sightseeing, Bosphorus cruises and local experiences': 'جولات خاصة ورحلات في البوسفور وتجارب محلية', 'Airport transfers and support with building a smooth itinerary': 'انتقالات من المطار ودعم لبناء برنامج سلس', 'Visa guidance and trip support for international travellers': 'إرشادات التأشيرات ودعم السفر الدولي', 'City breaks, couples, families, groups and culture-focused travellers': 'عطلات المدن والأزواج والعائلات والمجموعات ومحبو الثقافة', 'Istanbul city break': 'عطلة مدينة في إسطنبول', '3 nights with return flights, a central hotel, airport transfer and a guided old-city experience.': 'ثلاث ليالٍ مع رحلات ذهاب وعودة وفندق مركزي وانتقال من المطار وجولة بصحبة مرشد في المدينة القديمة.', 'Istanbul and the Bosphorus': 'إسطنبول والبوسفور', '4 nights with city sightseeing, a Bosphorus cruise, hotel planning and time to explore independently.': 'أربع ليالٍ مع جولات في المدينة ورحلة في البوسفور وتخطيط الفندق ووقت للاستكشاف بحرية.', 'A deeper Istanbul stay': 'إقامة أعمق في إسطنبول', '5 to 7 nights with flexible tours, neighbourhood walks, shopping time and a personalised pace.': 'من خمس إلى سبع ليالٍ مع جولات مرنة وتنزهات في الأحياء ووقت للتسوق وإيقاع شخصي.', 'Choose Sultanahmet for quick access to historic landmarks or Beyoglu and Karakoy for restaurants, galleries and evening energy.': 'اختر السلطان أحمد للوصول السريع إلى المعالم التاريخية، أو بيوغلو وكاراكوي للمطاعم والمعارض والحيوية المسائية.', 'A Bosphorus cruise works well as a relaxed half-day between walking tours and gives the itinerary a different view of the city.': 'تمنحك رحلة البوسفور نصف يوم هادئ بين جولات المشي وإطلالة مختلفة على المدينة.', 'We can keep the plan flexible for families and groups, or build a more detailed schedule for a first visit or special occasion.': 'يمكننا إبقاء البرنامج مرنًا للعائلات والمجموعات أو بناء جدول أكثر تفصيلًا للزيارة الأولى والمناسبات الخاصة.'
});

Object.assign(translations.nl, {
  'Istanbul is one of the most popular routes in our portfolio, combining easy flight access, local culture and flexible trip planning.': 'Istanbul is een van onze populairste routes, met eenvoudige vluchtverbindingen, lokale cultuur en flexibele reisplanning.',
  'Istanbul brings together historic streets, Bosphorus views and a lively city rhythm that works beautifully for short escapes or longer stays. Flight Right can shape the trip around the way you want to travel, from a compact city break to a slower cultural stay.': 'Istanbul combineert historische straten, uitzicht op de Bosporus en een levendig stadsritme. Flight Right stemt de reis af op jouw stijl, van een korte stedentrip tot een rustig cultureel verblijf.',
  'Historic neighbourhoods and iconic landmarks': 'Historische wijken en iconische bezienswaardigheden', 'Bosphorus views, cafés and evening walks': 'Uitzicht op de Bosporus, cafés en avondwandelingen', 'A practical mix of culture, food, shopping and free time': 'Een praktische mix van cultuur, eten, winkelen en vrije tijd', 'Flight options for city breaks and long-weekend travel': 'Vluchtopties voor stedentrips en lange weekenden', 'Central hotels, boutique stays and accommodation planning': 'Centrale hotels, boetiekverblijven en accommodatieplanning', 'Private sightseeing, Bosphorus cruises and local experiences': 'Privérondleidingen, Bosporuscruises en lokale ervaringen', 'Airport transfers and support with building a smooth itinerary': 'Luchthaventransfers en hulp bij een soepel programma', 'Visa guidance and trip support for international travellers': 'Visumbegeleiding en reisondersteuning', 'City breaks, couples, families, groups and culture-focused travellers': 'Stedentrips, stellen, gezinnen, groepen en cultuurliefhebbers', 'Istanbul city break': 'Stedentrip Istanbul', '3 nights with return flights, a central hotel, airport transfer and a guided old-city experience.': 'Drie nachten met retourvluchten, een centraal hotel, luchthaventransfer en een rondleiding door de oude stad.', 'Istanbul and the Bosphorus': 'Istanbul en de Bosporus', '4 nights with city sightseeing, a Bosphorus cruise, hotel planning and time to explore independently.': 'Vier nachten met sightseeing, een Bosporuscruise, hotelplanning en tijd om zelfstandig te ontdekken.', 'A deeper Istanbul stay': 'Een langer verblijf in Istanbul', '5 to 7 nights with flexible tours, neighbourhood walks, shopping time and a personalised pace.': 'Vijf tot zeven nachten met flexibele tours, wandelingen door wijken, winkeltijd en een persoonlijk tempo.', 'Choose Sultanahmet for quick access to historic landmarks or Beyoglu and Karakoy for restaurants, galleries and evening energy.': 'Kies Sultanahmet voor historische bezienswaardigheden, of Beyoğlu en Karaköy voor restaurants, galerieën en avondleven.', 'A Bosphorus cruise works well as a relaxed half-day between walking tours and gives the itinerary a different view of the city.': 'Een Bosporuscruise is een ontspannen halve dag tussen wandelingen en geeft een ander beeld van de stad.', 'We can keep the plan flexible for families and groups, or build a more detailed schedule for a first visit or special occasion.': 'We kunnen het programma flexibel houden voor gezinnen en groepen, of een uitgebreider schema maken voor een eerste bezoek of speciale gelegenheid.'
});

Object.assign(translations.ar, {
  'Istanbul - Istanbul city break': 'إسطنبول - عطلة مدينة في إسطنبول', 'Istanbul - Istanbul and the Bosphorus': 'إسطنبول - إسطنبول والبوسفور', 'Istanbul - A deeper Istanbul stay': 'إسطنبول - إقامة أعمق في إسطنبول', 'Complete your request': 'أكمل طلبك', 'Share the details below and Flight Right will prepare a live quote or booking option. No payment is collected until the itinerary and provider conditions are confirmed.': 'شاركنا التفاصيل أدناه وستجهز فلايت رايت عرضًا مباشرًا أو خيار حجز. لا يتم تحصيل أي مبلغ حتى يتم تأكيد البرنامج وشروط مقدم الخدمة.', 'Traveller details': 'بيانات المسافر', 'Travel dates and group size': 'تواريخ السفر وعدد المسافرين', 'Selected service': 'الخدمة المختارة', 'Flight Right planning request': 'طلب تخطيط من Flight Right', 'We will confirm live availability, inclusions, cancellation terms and payment options before proceeding.': 'سنؤكد التوفر الحالي والمزايا وشروط الإلغاء وخيارات الدفع قبل المتابعة.', 'Send request': 'إرسال الطلب', 'Request received': 'تم استلام الطلب', 'Your Flight Right request is ready for review. Our team will confirm availability, pricing and the next payment step before anything is charged.': 'طلبك لدى Flight Right جاهز للمراجعة. سيؤكد فريقنا التوفر والسعر وخطوة الدفع التالية قبل تحصيل أي مبلغ.', 'We have your request.': 'تم استلام طلبك.', 'Back home': 'العودة للرئيسية'
});

Object.assign(translations.nl, {
  'Istanbul - Istanbul city break': 'Istanbul - Stedentrip Istanbul', 'Istanbul - Istanbul and the Bosphorus': 'Istanbul - Istanbul en de Bosporus', 'Istanbul - A deeper Istanbul stay': 'Istanbul - Een langer verblijf in Istanbul', 'Complete your request': 'Rond je aanvraag af', 'Share the details below and Flight Right will prepare a live quote or booking option. No payment is collected until the itinerary and provider conditions are confirmed.': 'Deel hieronder je gegevens. Flight Right maakt een actuele offerte of boekingsoptie. Er wordt pas betaald nadat het programma en de voorwaarden zijn bevestigd.', 'Traveller details': 'Reizigersgegevens', 'Travel dates and group size': 'Reisdata en groepsgrootte', 'Selected service': 'Geselecteerde dienst', 'Flight Right planning request': 'Flight Right-planningsaanvraag', 'We will confirm live availability, inclusions, cancellation terms and payment options before proceeding.': 'We bevestigen beschikbaarheid, inbegrepen diensten, annuleringsvoorwaarden en betaalopties voordat we doorgaan.', 'Send request': 'Aanvraag versturen', 'Request received': 'Aanvraag ontvangen', 'Your Flight Right request is ready for review. Our team will confirm availability, pricing and the next payment step before anything is charged.': 'Je Flight Right-aanvraag wordt beoordeeld. Ons team bevestigt beschikbaarheid, prijs en de volgende betaalstap voordat er iets wordt afgeschreven.', 'We have your request.': 'We hebben je aanvraag ontvangen.', 'Back home': 'Terug naar home'
});

Object.assign(translations.ar, {
  'Language selector': 'اختيار اللغة', 'Contact Flight Right on WhatsApp': 'تواصل مع فلايت رايت عبر WhatsApp', 'Contact us on WhatsApp': 'تواصل معنا عبر WhatsApp', 'Toggle menu': 'فتح القائمة',
  'EUR': 'يورو', 'Passengers': 'المسافرون', 'Cabin': 'درجة السفر', 'Economy': 'اقتصادية', 'Premium Economy': 'اقتصادية مميزة', 'Business': 'رجال الأعمال',
  'Travel support built around real trips': 'دعم سفر مصمم لرحلات حقيقية', 'Local services, ready for your journey.': 'خدمات محلية جاهزة لرحلتك.', 'Stay inspired': 'ابقَ على اطلاع', 'New routes, seasonal fares and destination guides — occasionally, not overwhelmingly.': 'مسارات جديدة وأسعار موسمية وأدلة وجهات، من وقت لآخر وبلا إغراق.', 'You’re signed up for new inspiration.': 'تم تسجيلك للحصول على أفكار سفر جديدة.', 'Thoughtful ideas, not a flood.': 'أفكار مدروسة، بلا إغراق.',
  'Services': 'الخدمات', 'Company': 'الشركة', 'Support': 'الدعم', 'Visa support': 'دعم التأشيرات', 'Private trips': 'رحلات خاصة', 'Message sent': 'تم إرسال الرسالة', 'Your enquiry is ready for the Flight Right team. We will respond using the contact details you provided.': 'استفسارك جاهز لفريق Flight Right. سنرد باستخدام بيانات التواصل التي قدمتها.', 'Thanks for getting in touch.': 'شكرًا لتواصلك معنا.', 'Return home': 'العودة للرئيسية', 'Talk to us': 'تحدث معنا', 'Hours: Monday to Saturday, 09:00–18:00 CET': 'الساعات: من الاثنين إلى السبت، 09:00–18:00 بتوقيت وسط أوروبا',
  'Recommended': 'موصى به', 'Lowest price': 'أقل سعر', 'Review the itinerary, fare and passenger details before sending your booking request. Final availability and price will come from Duffel once connected.': 'راجع البرنامج والسعر وبيانات المسافرين قبل إرسال طلب الحجز. سيأتي التوفر والسعر النهائيان من Duffel عند الاتصال.', 'We have your details.': 'تم استلام بياناتك.', 'Your reference is': 'رقمك المرجعي هو', 'Passenger details': 'بيانات المسافر', 'Booking reference': 'مرجع الحجز', 'Booking email': 'بريد الحجز', 'Find trip': 'البحث عن الرحلة',
  'Hotels': 'الفنادق', 'Holidays': 'العطلات', 'Tours': 'الجولات', 'Transfers': 'الانتقالات', 'Check availability': 'تحقق من التوفر', 'Explore package': 'استكشف البرنامج', 'View itinerary': 'عرض البرنامج', 'Request transfer': 'طلب انتقال', 'Flight Right service': 'خدمة Flight Right', 'Add the right local details to your trip.': 'أضف التفاصيل المحلية المناسبة إلى رحلتك.', 'Choose a service below or ask us to combine several into one route plan.': 'اختر خدمة أدناه أو اطلب منا جمع عدة خدمات في خطة واحدة.', 'Partner offer': 'عرض شريك', 'Request this service': 'اطلب هذه الخدمة', 'Business information': 'بيانات الشركة', 'Business name': 'اسم الشركة', 'Contact email': 'البريد الإلكتروني للتواصل', 'Service type': 'نوع الخدمة', 'Choose one': 'اختر واحدًا', 'Other travel service': 'خدمة سفر أخرى', 'Main location': 'الموقع الرئيسي', 'Tell us about your offer': 'أخبرنا عن عرضك', 'Submit partner request': 'إرسال طلب الشراكة', 'How it works': 'كيف يعمل النظام', 'Apply now': 'قدّم الآن', 'Contact sales': 'تواصل مع المبيعات', 'Help center': 'مركز المساعدة', 'My Trips': 'رحلاتي', 'Terms of service': 'شروط الخدمة', 'Privacy policy': 'سياسة الخصوصية'
});

Object.assign(translations.nl, {
  'Language selector': 'Taalkeuze', 'Contact Flight Right on WhatsApp': 'Neem contact op met Flight Right via WhatsApp', 'Contact us on WhatsApp': 'Neem contact op via WhatsApp', 'Toggle menu': 'Menu openen',
  'Passengers': 'Passagiers', 'Cabin': 'Cabine', 'Economy': 'Economy', 'Premium Economy': 'Premium economy', 'Business': 'Business',
  'Travel support built around real trips': 'Reisondersteuning voor echte reizen', 'Local services, ready for your journey.': 'Lokale diensten voor jouw reis.', 'Stay inspired': 'Blijf geïnspireerd', 'New routes, seasonal fares and destination guides — occasionally, not overwhelmingly.': 'Nieuwe routes, seizoensprijzen en bestemmingsgidsen, af en toe en zonder overdaad.', 'You’re signed up for new inspiration.': 'Je ontvangt nieuwe reisinspiratie.', 'Thoughtful ideas, not a flood.': 'Doordachte ideeën, geen overvloed.',
  'Services': 'Diensten', 'Company': 'Bedrijf', 'Support': 'Ondersteuning', 'Visa support': 'Visumondersteuning', 'Private trips': 'Privéreizen', 'Message sent': 'Bericht verstuurd', 'Your enquiry is ready for the Flight Right team. We will respond using the contact details you provided.': 'Je vraag staat klaar voor het Flight Right-team. We antwoorden via de contactgegevens die je hebt opgegeven.', 'Thanks for getting in touch.': 'Bedankt voor je bericht.', 'Return home': 'Terug naar home', 'Talk to us': 'Praat met ons', 'Hours: Monday to Saturday, 09:00–18:00 CET': 'Openingstijden: maandag tot en met zaterdag, 09:00–18:00 CET',
  'Recommended': 'Aanbevolen', 'Lowest price': 'Laagste prijs', 'Review the itinerary, fare and passenger details before sending your booking request. Final availability and price will come from Duffel once connected.': 'Controleer het programma, tarief en de passagiersgegevens voordat je de aanvraag verstuurt. De definitieve beschikbaarheid en prijs komen van Duffel zodra de koppeling actief is.', 'We have your details.': 'We hebben je gegevens.', 'Your reference is': 'Je referentie is', 'Booking reference': 'Boekingsreferentie', 'Booking email': 'Boekingse-mail', 'Find trip': 'Reis zoeken',
  'Check availability': 'Beschikbaarheid controleren', 'Explore package': 'Pakket bekijken', 'View itinerary': 'Programma bekijken', 'Request transfer': 'Transfer aanvragen', 'Flight Right service': 'Flight Right-dienst', 'Add the right local details to your trip.': 'Voeg de juiste lokale details toe aan je reis.', 'Choose a service below or ask us to combine several into one route plan.': 'Kies hieronder een dienst of vraag ons meerdere diensten te combineren in één reisplan.', 'Partner offer': 'Partneraanbod', 'Request this service': 'Deze dienst aanvragen', 'Business information': 'Bedrijfsgegevens', 'Business name': 'Bedrijfsnaam', 'Contact email': 'Contact-e-mail', 'Service type': 'Type dienst', 'Choose one': 'Kies één', 'Other travel service': 'Andere reisdienst', 'Main location': 'Hoofdlocatie', 'Tell us about your offer': 'Vertel over je aanbod', 'Submit partner request': 'Partneraanvraag versturen', 'How it works': 'Zo werkt het', 'Apply now': 'Nu aanmelden', 'Contact sales': 'Neem contact op met sales', 'Help center': 'Helpcentrum', 'Terms of service': 'Servicevoorwaarden', 'Privacy policy': 'Privacybeleid'
});

Object.assign(translations.ar, {
  'From ancient wonders to island coastlines — ten places our travelers can’t stop booking.': 'من العجائب القديمة إلى السواحل والجزر، عشر وجهات يواصل عملاؤنا حجزها.',
  'Historic lanes, Bosphorus light': 'أزقة تاريخية وضوء البوسفور', 'city breaks & culture': 'عطلات مدن وثقافة',
  'Old stones, river evenings': 'آثار قديمة وأمسيات على النيل', 'nile evenings & old stones': 'أمسيات النيل والآثار القديمة',
  'Sea air, reef days': 'هواء البحر وأيام الشعاب المرجانية', 'sun, reef & slow rhythms': 'شمس وشعاب وإيقاع هادئ',
  'Red Sea calm': 'هدوء البحر الأحمر', 'reef escapes & sunsets': 'رحلات الشعاب وغروب الشمس',
  'Sunrise magic': 'سحر الشروق', 'balloons & volcanic landscapes': 'مناطيد ومناظر بركانية',
  'Coasts, gardens and drift': 'سواحل وحدائق واسترخاء', 'beaches, bay views & easy escapes': 'شواطئ وإطلالات خلابة ورحلات هادئة',
  'Skyline and desert light': 'أفق المدينة وضوء الصحراء', 'modern stays & desert days': 'إقامات عصرية وأيام في الصحراء',
  'City edges and mountain air': 'أطراف المدينة وهواء الجبال', 'ancient routes & warm hospitality': 'طرق عريقة وضيافة دافئة',
  'Seaside evenings and culture': 'أمسيات بحرية وثقافة', 'coast, cafés & city rhythm': 'ساحل ومقاهٍ وإيقاع المدينة',
  'Canals, bikes and easy energy': 'قنوات ودراجات وحيوية هادئة', 'city breaks & design-led routes': 'عطلات مدن ومسارات مميزة',
  from: 'ابتداءً من'
});

Object.assign(translations.nl, {
  'From ancient wonders to island coastlines — ten places our travelers can’t stop booking.': 'Van oude wonderen tot eilandkusten: tien bestemmingen die onze reizigers blijven boeken.',
  'Historic lanes, Bosphorus light': 'Historische straten en licht op de Bosporus', 'city breaks & culture': 'Stedentrips en cultuur',
  'Old stones, river evenings': 'Oude stenen en avonden aan de rivier', 'nile evenings & old stones': 'Nijl-avonden en oude stenen',
  'Sea air, reef days': 'Zeelucht en dagen bij het rif', 'sun, reef & slow rhythms': 'Zon, rif en een rustig tempo',
  'Red Sea calm': 'Rust aan de Rode Zee', 'reef escapes & sunsets': 'Rif, ontspanning en zonsondergangen',
  'Sunrise magic': 'Magische zonsopgang', 'balloons & volcanic landscapes': 'Ballonnen en vulkaanlandschappen',
  'Coasts, gardens and drift': 'Kusten, tuinen en ontspanning', 'beaches, bay views & easy escapes': 'Stranden, baaien en ontspannen uitstapjes',
  'Skyline and desert light': 'Skyline en woestijnlicht', 'modern stays & desert days': 'Moderne verblijven en dagen in de woestijn',
  'City edges and mountain air': 'Stadsranden en berglucht', 'ancient routes & warm hospitality': 'Oude routes en warme gastvrijheid',
  'Seaside evenings and culture': 'Avonden aan zee en cultuur', 'coast, cafés & city rhythm': 'Kust, cafés en stadsritme',
  'Canals, bikes and easy energy': 'Grachten, fietsen en ontspannen sfeer', 'city breaks & design-led routes': 'Stedentrips en routes met karakter',
  from: 'vanaf'
});

Object.assign(translations.ar, {
  'Cairo is one of the most popular routes in our portfolio, combining easy flight access, local culture and flexible trip planning.': 'القاهرة من أشهر المسارات لدينا، فهي تجمع بين سهولة الوصول جواً والثقافة المحلية والتخطيط المرن للرحلات.',
  'Pyramids, history and culture-rich city days': 'الأهرامات والتاريخ وأيام غنية بالثقافة', 'Great access for family travel and short stays': 'وصول مناسب للرحلات العائلية والإقامات القصيرة', 'A practical gateway to Egypt and beyond': 'بوابة عملية إلى مصر وما بعدها', 'Flights to and from major European routes': 'رحلات من وإلى أهم المسارات الأوروبية', 'Hotel and city stay planning': 'تخطيط الفنادق والإقامة في المدينة', 'Private guided sightseeing': 'جولات خاصة بصحبة مرشد', 'Easy trip support for families and first-time visitors': 'دعم سفر سهل للعائلات والزوار لأول مرة', 'Culture travelers, families and short multi-city trips': 'محبو الثقافة والعائلات والرحلات القصيرة متعددة المدن', 'Cairo essentials': 'أساسيات القاهرة', '3 nights with a city hotel, airport transfer and a guided pyramids and museum day.': 'ثلاث ليالٍ مع فندق في المدينة وانتقال من المطار ويوم بصحبة مرشد للأهرامات والمتحف.', 'Cairo and the Nile': 'القاهرة والنيل', '6 nights combining Cairo with a river experience and time for Egypt\'s historic highlights.': 'ست ليالٍ تجمع بين القاهرة وتجربة نيلية ووقت لاستكشاف أبرز معالم مصر التاريخية.', 'Egypt first journey': 'الرحلة المصرية الأولى', '8 to 10 nights linking Cairo with Luxor, Aswan or the Red Sea.': 'من ثماني إلى عشر ليالٍ تربط القاهرة بالأقصر أو أسوان أو البحر الأحمر.', 'A central Cairo stay makes it easier to combine historic sites, museums and local food.': 'الإقامة في وسط القاهرة تسهّل الجمع بين المواقع التاريخية والمتاحف والطعام المحلي.', 'Longer trips can add the Nile or a Red Sea finish without rushing the capital.': 'يمكن للرحلات الأطول إضافة النيل أو نهاية على البحر الأحمر دون استعجال العاصمة.', 'We can arrange a private, family or small-group pace around your arrival flight.': 'يمكننا ترتيب برنامج خاص أو عائلي أو لمجموعة صغيرة بما يناسب رحلة الوصول.',
  'Hurghada is one of the most popular routes in our portfolio, combining easy flight access, local culture and flexible trip planning.': 'الغردقة من أشهر المسارات لدينا، فهي تجمع بين سهولة الوصول جواً والثقافة المحلية والتخطيط المرن للرحلات.', 'Warm-weather beach escapes': 'رحلات شاطئية بطقس دافئ', 'Resort stays and water-based travel': 'إقامات في المنتجعات ورحلات بحرية', 'Simple, relaxed planning for short holidays': 'تخطيط بسيط ومريح للعطلات القصيرة', 'Resort and beach stay recommendations': 'اقتراحات المنتجعات والإقامات الشاطئية', 'Flight combinations for sea-and-sun breaks': 'خيارات طيران لعطلات البحر والشمس', 'Transfer coordination and holiday planning': 'تنسيق الانتقالات وتخطيط العطلات', 'Flexible package options for couples and families': 'باقات مرنة للأزواج والعائلات', 'Beach holidays, couples and sun-seekers': 'عطلات الشاطئ والأزواج ومحبو الشمس', 'Hurghada beach break': 'عطلة شاطئية في الغردقة', '4 nights with flights, resort accommodation, transfers and time by the Red Sea.': 'أربع ليالٍ مع الرحلات وإقامة في منتجع وانتقالات ووقت على البحر الأحمر.', 'Reef and relaxation': 'الشعاب والاسترخاء', '6 nights with snorkelling or diving options balanced with slower resort days.': 'ست ليالٍ مع خيارات الغوص أو الغوص السطحي وأيام هادئة في المنتجع.', 'Egypt and the Red Sea': 'مصر والبحر الأحمر', '8 to 10 nights combining Cairo sightseeing with a Hurghada beach stay.': 'من ثماني إلى عشر ليالٍ تجمع بين جولات القاهرة وإقامة شاطئية في الغردقة.', 'Choose your resort around the beach, reef and activity access you prefer.': 'اختر منتجعك وفق الشاطئ والشعاب والأنشطة التي تفضلها.', 'Keep sea days flexible around weather and water conditions.': 'حافظ على مرونة أيام البحر بحسب الطقس وحالة المياه.', 'Hurghada works well as a relaxing finish after a culture-focused Egypt route.': 'تناسب الغردقة نهاية مريحة بعد مسار مصري يركز على الثقافة.',
  'Sharm El Sheikh is one of the most popular routes in our portfolio, combining easy flight access, local culture and flexible trip planning.': 'شرم الشيخ من أشهر المسارات لدينا، فهي تجمع بين سهولة الوصول جواً والثقافة المحلية والتخطيط المرن للرحلات.', 'Clear water and coral-reef experiences': 'مياه صافية وتجارب الشعاب المرجانية', 'Resort comfort with optional desert adventures': 'راحة المنتجعات مع مغامرات صحراوية اختيارية', 'A relaxed base for couples, families and groups': 'قاعدة مريحة للأزواج والعائلات والمجموعات', 'Flight and resort planning': 'تخطيط الرحلات والمنتجعات', 'Airport transfers and local transport': 'انتقالات المطار والمواصلات المحلية', 'Snorkelling, diving and desert excursion options': 'خيارات الغوص والغوص السطحي والرحلات الصحراوية', 'Flexible beach itineraries for couples and families': 'برامج شاطئية مرنة للأزواج والعائلات', 'Beach escapes, families, couples and water-sports travellers': 'عطلات الشاطئ والعائلات والأزواج ومحبو الرياضات المائية', 'Red Sea reset': 'استراحة البحر الأحمر', '4 nights with flights, resort stay, transfers and a relaxed beach-focused plan.': 'أربع ليالٍ مع الرحلات وإقامة في منتجع وانتقالات وخطة شاطئية مريحة.', 'Reef and desert escape': 'رحلة الشعاب والصحراء', '6 nights with snorkelling or diving options plus a guided desert experience.': 'ست ليالٍ مع خيارات الغوص أو الغوص السطحي وتجربة صحراوية بصحبة مرشد.', 'Family resort week': 'أسبوع عائلي في المنتجع', '7 nights with family-friendly accommodation, simple transfers and flexible free time.': 'سبع ليالٍ مع إقامة مناسبة للعائلات وانتقالات بسيطة ووقت حر مرن.', 'Choose the resort area around the activities and beach style you prefer.': 'اختر منطقة المنتجع وفق الأنشطة ونمط الشاطئ الذي تفضله.', 'Keep at least one unscheduled day for the sea, pool or a slower evening.': 'اترك يومًا واحدًا على الأقل بلا برنامج للبحر أو المسبح أو أمسية هادئة.', 'We can arrange the flights and support services around your confirmed hotel choice.': 'يمكننا ترتيب الرحلات وخدمات الدعم حول الفندق الذي اخترته.',
  'Cappadocia is one of the most popular routes in our portfolio, combining easy flight access, local culture and flexible trip planning.': 'كابادوكيا من أشهر المسارات لدينا، فهي تجمع بين سهولة الوصول جواً والثقافة المحلية والتخطيط المرن للرحلات.', 'Unique volcanic landscapes and valley walks': 'مناظر بركانية فريدة ونزهات في الوديان', 'Cave hotels and memorable sunrise views': 'فنادق الكهوف وإطلالات شروق لا تُنسى', 'A strong fit for couples, photographers and curious families': 'مناسبة للأزواج والمصورين والعائلات المحبة للاستكشاف', 'Flight combinations through Türkiye': 'خيارات رحلات عبر تركيا', 'Cave hotel and boutique accommodation planning': 'تخطيط فنادق الكهوف والإقامات البوتيكية', 'Balloon flight and guided valley tour requests': 'طلبات رحلات المناطيد وجولات الوديان بصحبة مرشد', 'Transfers between airports, hotels and activities': 'انتقالات بين المطارات والفنادق والأنشطة', 'Couples, photographers, families and culture-focused travellers': 'الأزواج والمصورون والعائلات ومحبو الثقافة', 'Cappadocia highlights': 'أبرز معالم كابادوكيا', '3 nights with a cave-style stay, airport transfer and a guided landscape day.': 'ثلاث ليالٍ مع إقامة بطابع الكهوف وانتقال من المطار ويوم بصحبة مرشد بين المناظر الطبيعية.', 'Istanbul and Cappadocia': 'إسطنبول وكابادوكيا', '6 nights combining historic Istanbul with Cappadocia valleys and sunrise experiences.': 'ست ليالٍ تجمع بين إسطنبول التاريخية ووديان كابادوكيا وتجارب الشروق.', 'Slow valley stay': 'إقامة هادئة في الوادي', '4 to 5 nights with flexible walks, local food and time to enjoy the landscape at your pace.': 'من أربع إلى خمس ليالٍ مع نزهات مرنة وطعام محلي ووقت للاستمتاع بالطبيعة وفق إيقاعك.', 'Early mornings are important for sunrise activities, so a nearby stay can make the schedule easier.': 'الصباح الباكر مهم لأنشطة الشروق، لذلك تجعل الإقامة القريبة البرنامج أسهل.', 'Weather can affect balloon operations; keep the itinerary flexible when possible.': 'قد يؤثر الطقس في رحلات المناطيد، لذا حافظ على مرونة البرنامج قدر الإمكان.', 'Cappadocia works especially well as a second stop after Istanbul.': 'تناسب كابادوكيا بشكل خاص محطة ثانية بعد إسطنبول.'
});

Object.assign(translations.ar, {
  'About us': 'من نحن', 'Careers': 'الوظائف', 'Press': 'الإعلام', 'Contact': 'تواصل معنا',
  'فلايت رايت is a travel agency built around care, route clarity and practical advice for travelers moving between Europe, Egypt and Türkiye.': 'فلايت رايت وكالة سفر تقوم على الاهتمام ووضوح المسارات والنصائح العملية للمسافرين بين أوروبا ومصر وتركيا.',
  'فلايت رايت started with a simple challenge: comparing international flights was fragmented, slow and overwhelming. We built a service that brings route discovery, fare comparison and human support into one clear plan.': 'بدأت فلايت رايت من تحدٍ بسيط: كانت مقارنة الرحلات الدولية مجزأة وبطيئة ومربكة. لذلك بنينا خدمة تجمع اكتشاف المسارات ومقارنة الأسعار والدعم البشري في خطة واضحة واحدة.',
  'Today we help families, couples and business travelers discover routes that fit their pace, their budget and their sense of what a good trip should feel like.': 'نساعد اليوم العائلات والأزواج ومسافري الأعمال على اكتشاف مسارات تناسب إيقاعهم وميزانيتهم وما يتوقعونه من رحلة جيدة.',
  'Thoughtful itineraries built around real traveler needs.': 'برامج مدروسة مبنية حول احتياجات المسافرين الحقيقية.', 'Transparent pricing with no hidden surprise extras.': 'أسعار واضحة بلا تكاليف إضافية مخفية.', 'Human support before, during and after each trip.': 'دعم بشري قبل الرحلة وأثناءها وبعدها.', 'A mix of practical logistics and memorable local moments.': 'مزيج من الخدمات العملية واللحظات المحلية التي لا تُنسى.',
  'HYBRID': 'هجين', 'ON-SITE / REMOTE': 'من المكتب / عن بُعد', 'REMOTE · EUROPE & MIDDLE EAST': 'عن بُعد · أوروبا والشرق الأوسط', 'Senior Travel Consultant': 'مستشار سفر أول', 'Destination Specialist': 'متخصص وجهات', 'Partnership Manager': 'مدير الشراكات', 'Guide customers through complex itineraries and help them build smarter, smoother travel plans.': 'ساعد العملاء في البرامج المعقدة وابنِ معهم خطط سفر أذكى وأسهل.', 'Build local travel knowledge across Egypt, Türkiye and Europe and shape premium recommendations.': 'طوّر معرفة محلية بالسفر في مصر وتركيا وأوروبا وقدّم توصيات مميزة.', 'Develop relationships with hotels, tour operators and transfer providers that improve traveler experiences.': 'طوّر علاقات مع الفنادق ومنظمي الجولات ومقدمي الانتقالات لتحسين تجارب المسافرين.', 'Flexible work setup': 'نظام عمل مرن', 'Travel discounts': 'خصومات على السفر', 'Wellbeing support': 'دعم الرفاهية', 'Learning budget': 'ميزانية للتعلم', 'Inclusive culture': 'ثقافة شاملة', 'Careers': 'الوظائف', 'Apply now': 'قدّم الآن',
  'فلايت رايت works with journalists, destination partners and media outlets to share practical insight, stories from the road, and updates on the travel market across our key regions.': 'تعمل فلايت رايت مع الصحفيين وشركاء الوجهات ووسائل الإعلام لمشاركة رؤى عملية وقصص من الطريق وتحديثات سوق السفر في مناطقنا الرئيسية.', 'فلايت رايت expands regional city breaks across Egypt and Türkiye.': 'توسع فلايت رايت رحلات المدن الإقليمية في مصر وتركيا.', 'Travel experts highlight calmer, more curated holiday planning for families.': 'يسلط خبراء السفر الضوء على تخطيط عطلات أكثر هدوءًا وتنظيمًا للعائلات.', 'فلايت رايت launches boutique route packages from Amsterdam and beyond.': 'تطلق فلايت رايت باقات مسارات بوتيكية من أمستردام وما بعدها.', 'For interviews, destination stories and partnership requests, contact our media desk.': 'للمقابلات وقصص الوجهات وطلبات الشراكة، تواصل مع قسم الإعلام.',
  'We are here to help you plan, confirm or adjust your trip. Reach out with travel questions, partner inquiries or general feedback and our team will get back to you quickly.': 'نحن هنا لمساعدتك في تخطيط رحلتك أو تأكيدها أو تعديلها. تواصل معنا بشأن أسئلة السفر أو استفسارات الشراكة أو الملاحظات العامة وسيرد فريقنا سريعًا.', 'Email:': 'البريد الإلكتروني:', 'Phone:': 'الهاتف:', 'Office:': 'المكتب:',
  'Nile Grand Palace': 'قصر النيل الكبير', 'Nile view rooms and breakfast included.': 'غرف بإطلالة على النيل مع وجبة إفطار.', 'Bosphorus Pearl Hotel': 'فندق لؤلؤة البوسفور', 'Boutique stay in the historical centre.': 'إقامة بوتيكية في المركز التاريخي.', 'Red Sea Royal Resort': 'منتجع البحر الأحمر الملكي', 'All-inclusive beach resort with reef access.': 'منتجع شاطئي شامل مع وصول إلى الشعاب.', 'city-centre stays': 'إقامات وسط المدينة', 'resort escapes': 'عطلات المنتجعات', 'We curate accommodations that match your trip style — comfortable, convenient and worth returning to.': 'نختار أماكن إقامة تناسب أسلوب رحلتك، مريحة وعملية وتستحق العودة إليها.', 'Holiday packages should feel easy to choose and even easier to enjoy. We combine the essentials — flights, stays, transfers and activities — into one complete trip plan.': 'يجب أن تكون باقات العطلات سهلة الاختيار وأسهل في الاستمتاع. نجمع الرحلات والإقامات والانتقالات والأنشطة في خطة سفر متكاملة.', 'Cairo & Nile Explorer': 'مستكشف القاهرة والنيل', '6 nights · flights, hotel & Nile cruise': '6 ليالٍ · رحلات وفندق ورحلة نيلية', 'Istanbul Weekend Escape': 'عطلة نهاية أسبوع في إسطنبول', '3 nights · flights & boutique hotel': '3 ليالٍ · رحلات وفندق بوتيكي', 'Red Sea Diving Retreat': 'عطلة غوص في البحر الأحمر', '7 nights · Hurghada resort stay': '7 ليالٍ · إقامة في منتجع الغردقة',
  'The best trips are shaped by the moments between the must-sees. We offer tours that add context, comfort and a deeper connection to the places you visit.': 'تتشكل أفضل الرحلات من اللحظات بين المعالم الأساسية. نقدم جولات تضيف السياق والراحة وارتباطًا أعمق بالأماكن التي تزورها.', 'Pyramids & Sphinx Private Tour': 'جولة خاصة للأهرامات وأبو الهول', 'Half-day · private guide · Cairo': 'نصف يوم · مرشد خاص · القاهرة', 'Cappadocia Sunrise Balloon Flight': 'رحلة منطاد عند شروق كابادوكيا', '1 hour · hotel pickup': 'ساعة واحدة · استقبال من الفندق', 'Bosphorus Dinner Cruise': 'رحلة عشاء في البوسفور', 'Evening · music and sparkling views': 'مساء · موسيقى وإطلالات متلألئة',
  'Smooth ground travel matters as much as the flight itself. We arrange reliable transfers that keep your itinerary calm from arrival to final destination.': 'تُعد سهولة التنقل البري مهمة بقدر الرحلة نفسها. نرتب انتقالات موثوقة تحافظ على هدوء برنامجك من الوصول حتى وجهتك النهائية.', 'Airport transfers': 'انتقالات المطار', 'Private pickup and drop-off across major arrival points in Egypt, Türkiye and the Netherlands.': 'استقبال وتوصيل خاص في أهم نقاط الوصول في مصر وتركيا وهولندا.', 'Intercity transfers': 'انتقالات بين المدن', 'Comfortable door-to-door transport between cities and key regional hubs.': 'نقل مريح من الباب إلى الباب بين المدن والمراكز الإقليمية المهمة.', 'Private chauffeur': 'سائق خاص', 'Flexible travel for families, small groups and business schedules.': 'سفر مرن للعائلات والمجموعات الصغيرة وجداول الأعمال.',
  'Get practical guidance for preparing a visa application, checking document requirements and arranging an appointment where available.': 'احصل على إرشادات عملية لإعداد طلب التأشيرة والتحقق من متطلبات المستندات وترتيب الموعد عند توفره.', 'Document checklist': 'قائمة المستندات', 'Understand the supporting documents, travel details and personal information normally required for your destination.': 'تعرّف على المستندات الداعمة وبيانات السفر والمعلومات الشخصية المطلوبة عادة لوجهتك.', 'Appointment guidance': 'إرشادات الموعد', 'We help you prepare for the appointment process and keep your travel plan aligned with the expected timeline.': 'نساعدك في الاستعداد لإجراءات الموعد والحفاظ على توافق خطة سفرك مع الجدول المتوقع.', 'Travel planning together': 'تخطيط السفر معًا', 'Pair your visa support request with flight planning, accommodation and a clear trip outline.': 'اجمع طلب دعم التأشيرة مع تخطيط الرحلات والإقامة ومخطط واضح للرحلة.',
  'We partner with travel agents, corporate planners and destination specialists to deliver dependable flight options, route support and consistent service standards across Europe, Egypt and Türkiye.': 'نتعاون مع وكلاء السفر ومنظمي رحلات الشركات ومتخصصي الوجهات لتقديم خيارات رحلات موثوقة ودعم للمسارات ومعايير خدمة ثابتة في أوروبا ومصر وتركيا.', 'Flight search support for corporate partners': 'دعم البحث عن الرحلات لشركاء الشركات', 'Flexible pricing and allocation on selected routes': 'أسعار وتخصيص مرنان على مسارات مختارة', 'Dedicated support for corporate and travel trade clients': 'دعم مخصص لعملاء الشركات وقطاع السفر', 'Fast, reliable communication and booking coordination': 'تواصل سريع وموثوق وتنسيق للحجوزات',
  'Need guidance before or during a trip? We’ve gathered the most common travel questions and practical answers to make booking and planning easier.': 'تحتاج إلى إرشادات قبل الرحلة أو أثناءها؟ جمعنا أسئلة السفر الأكثر شيوعًا وإجابات عملية لتسهيل الحجز والتخطيط.', 'Yes, depending on fare conditions and airline policy. Our support team can guide you through the available options and any extra costs.': 'نعم، بحسب شروط السعر وسياسة شركة الطيران. يمكن لفريق الدعم إرشادك إلى الخيارات المتاحة وأي تكاليف إضافية.', 'Yes. Contact our team with your route, dates and group size. The API-ready booking flow will pass the request to our support team for review.': 'نعم. تواصل مع فريقنا واذكر مسارك وتواريخك وعدد المسافرين. سيرسل مسار الحجز الجاهز لواجهة البرمجة الطلب إلى فريق الدعم للمراجعة.', 'Use the My Trips section to review upcoming journeys, saved ideas and important travel details in one place.': 'استخدم قسم رحلاتي لمراجعة الرحلات القادمة والأفكار المحفوظة وتفاصيل السفر المهمة في مكان واحد.',
  'Your requested flights and booking details will appear here once the live account and Duffel order connection is enabled.': 'ستظهر الرحلات المطلوبة وتفاصيل الحجز هنا عند تفعيل الحساب المباشر وربط طلب Duffel.', 'These terms explain how we provide travel services and what is expected of both travelers and the Flight Right team when planning a booking or itinerary.': 'توضح هذه الشروط كيفية تقديم خدمات السفر وما هو متوقع من المسافرين وفريق Flight Right عند تخطيط الحجز أو البرنامج.', 'For operational issues outside our control, the relevant airline, hotel or service provider remains responsible for their own policies.': 'في المشكلات التشغيلية الخارجة عن سيطرتنا، تظل شركة الطيران أو الفندق أو مقدم الخدمة المعني مسؤولًا عن سياساته.', 'We respect the trust you place in us when you share your travel information. This policy explains how we collect, use and protect personal data in connection with booking services.': 'نحترم الثقة التي تضعها فينا عند مشاركة معلومات سفرك. توضح هذه السياسة كيفية جمع البيانات الشخصية واستخدامها وحمايتها فيما يتعلق بخدمات الحجز.',
  'Your business': 'شركتك', 'City and country': 'المدينة والدولة', 'Destination': 'الوجهة'
});

Object.assign(translations.ar, {
  'Flight Right is a travel agency built around care, route clarity and practical advice for travelers moving between Europe, Egypt and Türkiye.': 'فلايت رايت وكالة سفر تقوم على الاهتمام ووضوح المسارات والنصائح العملية للمسافرين بين أوروبا ومصر وتركيا.',
  'Flight Right started with a simple challenge: comparing international flights was fragmented, slow and overwhelming. We built a service that brings route discovery, fare comparison and human support into one clear plan.': 'بدأت فلايت رايت من تحدٍ بسيط: كانت مقارنة الرحلات الدولية مجزأة وبطيئة ومربكة. لذلك بنينا خدمة تجمع اكتشاف المسارات ومقارنة الأسعار والدعم البشري في خطة واضحة واحدة.',
  'We are building a team that combines hospitality, planning and practical problem-solving. If you care about detail, service and better travel experiences, you may be a fit.': 'نبني فريقًا يجمع بين الضيافة والتخطيط وحل المشكلات العملية. إذا كنت تهتم بالتفاصيل والخدمة وتجارب السفر الأفضل فقد تكون مناسبًا لنا.',
  'Amsterdam · Hybrid': 'أمستردام · هجين', 'Cairo · On-site / Remote': 'القاهرة · من المكتب / عن بُعد', 'Remote · Europe & Middle East': 'عن بُعد · أوروبا والشرق الأوسط',
  'Flight Right works with journalists, destination partners and media outlets to share practical insight, stories from the road, and updates on the travel market across our key regions.': 'تعمل فلايت رايت مع الصحفيين وشركاء الوجهات ووسائل الإعلام لمشاركة رؤى عملية وقصص من الطريق وتحديثات سوق السفر في مناطقنا الرئيسية.', 'Flight Right expands regional city breaks across Egypt and Türkiye.': 'توسع فلايت رايت رحلات المدن الإقليمية في مصر وتركيا.', 'Flight Right launches boutique route packages from Amsterdam and beyond.': 'تطلق فلايت رايت باقات مسارات بوتيكية من أمستردام وما بعدها.',
  'Cairo blends heritage, river evenings and easy access to Egypt’s most iconic sights, making it a strong destination for city breaks and cultural itineraries.': 'تجمع القاهرة بين التراث وأمسيات النيل وسهولة الوصول إلى أشهر معالم مصر، مما يجعلها وجهة مميزة لعطلات المدن والبرامج الثقافية.',
  'From city-centre stays to resort escapes, we curate accommodations that match your trip style — comfortable, convenient and worth returning to.': 'من إقامات وسط المدينة إلى عطلات المنتجعات، نختار أماكن إقامة تناسب أسلوب رحلتك، مريحة وعملية وتستحق العودة إليها.', '/night': '/ليلة',
  'Flight search support for corporate partners': 'دعم البحث عن الرحلات لشركاء الشركات', partners: 'الشركاء', 'guides': 'المرشدون', 'tour operators': 'منظمو الجولات', 'Start with your business details and the service you want to offer.': 'ابدأ ببيانات شركتك والخدمة التي تريد تقديمها.', 'can apply to join': 'يمكنهم التقدم للانضمام إلى', 'Your service': 'خدمتك', 'want to offer': 'تريد تقديمها',
  'Explore selected hotels, tours, experiences and transfer services that can be added to a Flight Right itinerary. We confirm each request with the provider before payment.': 'استكشف الفنادق والجولات والتجارب وخدمات الانتقال المختارة التي يمكن إضافتها إلى برنامج Flight Right. نؤكد كل طلب مع مقدم الخدمة قبل الدفع.'
  , 'Flight search support for': 'دعم البحث عن الرحلات لـ', and: 'و', 'transfer providers': 'مقدمو خدمات الانتقال', 'partner network': 'شبكة الشركاء'
});

Object.assign(translations.nl, {
  'Today we help families, couples and business travelers discover routes that fit their pace, their budget and their sense of what a good trip should feel like.': 'Vandaag helpen we gezinnen, stellen en zakenreizigers routes te vinden die passen bij hun tempo, budget en idee van een goede reis.', 'Thoughtful itineraries built around real traveler needs.': 'Doordachte reisprogramma’s rond de echte behoeften van reizigers.', 'Transparent pricing with no hidden surprise extras.': 'Transparante prijzen zonder verborgen extra kosten.', 'Human support before, during and after each trip.': 'Persoonlijke ondersteuning voor, tijdens en na elke reis.', 'A mix of practical logistics and memorable local moments.': 'Een mix van praktische logistiek en onvergetelijke lokale momenten.',
  'Careers': 'Vacatures', 'We are building a team that combines hospitality, planning and practical problem-solving. If you care about detail, service and better travel experiences, you may be a fit.': 'We bouwen aan een team dat gastvrijheid, planning en praktische oplossingen combineert. Als je oog hebt voor detail, service en betere reiservaringen, pas je misschien bij ons.', 'Senior Travel Consultant': 'Senior reisadviseur', 'Guide customers through complex itineraries and help them build smarter, smoother travel plans.': 'Begeleid klanten bij complexe reisprogramma’s en help hen slimmere, soepelere reisplannen te maken.', 'Destination Specialist': 'Bestemmingsspecialist', 'Build local travel knowledge across Egypt, Türkiye and Europe and shape premium recommendations.': 'Bouw lokale reiskennis op over Egypte, Türkiye en Europa en maak premium aanbevelingen.', 'Partnership Manager': 'Partnershipmanager', 'Develop relationships with hotels, tour operators and transfer providers that improve traveler experiences.': 'Bouw relaties op met hotels, touroperators en transferaanbieders die reiservaringen verbeteren.', 'Hybrid': 'Hybride', 'On-site / Remote': 'Op locatie / op afstand', 'Remote · Europe & Middle East': 'Op afstand · Europa en Midden-Oosten',
  'Travel experts highlight calmer, more curated holiday planning for families.': 'Reisexperts benadrukken rustigere, zorgvuldig samengestelde vakantieplanning voor gezinnen.', 'For interviews, destination stories and partnership requests, contact our media desk.': 'Neem voor interviews, bestemmingsverhalen en partnerverzoeken contact op met onze mediadienst.', 'We are here to help you plan, confirm or adjust your trip. Reach out with travel questions, partner inquiries or general feedback and our team will get back to you quickly.': 'We helpen je graag je reis te plannen, bevestigen of aanpassen. Neem contact op met vragen over reizen, partners of algemene feedback en we reageren snel.', 'Email:': 'E-mail:', 'Phone:': 'Telefoon:', 'Office:': 'Kantoor:',
  'Flight Right is a travel agency built around care, route clarity and practical advice for travelers moving between Europe, Egypt and Türkiye.': 'Flight Right is een reisbureau rond aandacht, duidelijke routes en praktisch advies voor reizigers tussen Europa, Egypte en Türkiye.', 'Flight Right started with a simple challenge: comparing international flights was fragmented, slow and overwhelming. We built a service that brings route discovery, fare comparison and human support into one clear plan.': 'Flight Right begon met een eenvoudige uitdaging: internationale vluchten vergelijken was versnipperd, traag en overweldigend. Daarom brachten we routeontdekking, tariefvergelijking en persoonlijke ondersteuning samen in één duidelijk plan.',
  'Your business': 'Jouw bedrijf', 'City and country': 'Stad en land', 'Describe your service, capacity, typical price and preferred travellers': 'Beschrijf je dienst, capaciteit, gangbare prijs en gewenste reizigers', 'Share your business and service details.': 'Deel je bedrijfs- en dienstgegevens.', 'We check fit, availability and listing information.': 'We controleren de geschiktheid, beschikbaarheid en listinginformatie.', 'Approved offers can be requested by Flight Right travellers.': 'Goedgekeurde aanbiedingen kunnen door Flight Right-reizigers worden aangevraagd.', 'We coordinate the request and provider terms before payment.': 'We coördineren de aanvraag en voorwaarden van de aanbieder vóór betaling.', '01. Apply.': '01. Aanmelden.', '02. Review.': '02. Beoordelen.', '03. Publish.': '03. Publiceren.', '04. Confirm.': '04. Bevestigen.', 'Hotels, guides, tour operators and transfer providers can apply to join the Flight Right partner network. Start with your business details and the service you want to offer.': 'Hotels, gidsen, touroperators en transferaanbieders kunnen zich aanmelden voor het Flight Right-partnernetwerk. Begin met je bedrijfsgegevens en de dienst die je wilt aanbieden.', 'Your business': 'Jouw bedrijf', 'City and country': 'Stad en land'
});

Object.assign(translations.nl, {
  'Cairo is one of the most popular routes in our portfolio, combining easy flight access, local culture and flexible trip planning.': 'Cairo is een van onze populairste routes, met goede vluchtverbindingen, lokale cultuur en flexibele reisplanning.', 'Cairo blends heritage, river evenings and easy access to Egypt’s most iconic sights, making it a strong destination for city breaks and cultural itineraries.': 'Cairo combineert erfgoed, avonden aan de rivier en eenvoudige toegang tot de bekendste bezienswaardigheden van Egypte. Daardoor is het ideaal voor stedentrips en culturele programma’s.', 'Pyramids, history and culture-rich city days': 'Piramides, geschiedenis en cultuurrijke dagen in de stad', 'Great access for family travel and short stays': 'Goede bereikbaarheid voor gezinsreizen en korte verblijven', 'A practical gateway to Egypt and beyond': 'Een praktische toegangspoort tot Egypte en verder', 'Flights to and from major European routes': 'Vluchten van en naar belangrijke Europese routes', 'Hotel and city stay planning': 'Hotel- en stadsverblijven plannen', 'Private guided sightseeing': 'Privérondleidingen met gids', 'Easy trip support for families and first-time visitors': 'Eenvoudige reisondersteuning voor gezinnen en nieuwe bezoekers', 'Culture travelers, families and short multi-city trips': 'Cultuurliefhebbers, gezinnen en korte reizen door meerdere steden', 'Cairo essentials': 'Cairo in het kort', '3 nights with a city hotel, airport transfer and a guided pyramids and museum day.': 'Drie nachten met een stadshotel, luchthaventransfer en een begeleide dag bij de piramides en het museum.', 'Cairo and the Nile': 'Cairo en de Nijl', '6 nights combining Cairo with a river experience and time for Egypt\'s historic highlights.': 'Zes nachten met Cairo, een rivierervaring en tijd voor de historische hoogtepunten van Egypte.', 'Egypt first journey': 'Eerste reis door Egypte', '8 to 10 nights linking Cairo with Luxor, Aswan or the Red Sea.': 'Acht tot tien nachten die Cairo verbinden met Luxor, Aswan of de Rode Zee.', 'A central Cairo stay makes it easier to combine historic sites, museums and local food.': 'Een verblijf in centraal Cairo maakt het eenvoudiger om historische plekken, musea en lokale gerechten te combineren.', 'Longer trips can add the Nile or a Red Sea finish without rushing the capital.': 'Bij langere reizen kun je de Nijl of de Rode Zee toevoegen zonder de hoofdstad te overhaasten.', 'We can arrange a private, family or small-group pace around your arrival flight.': 'We kunnen een privé-, gezins- of kleine groepsreis afstemmen op je aankomstvlucht.'
});

const LanguageContext = createContext<{ language: Language; setLanguage: (language: Language) => void }>({ language: 'en', setLanguage: () => undefined });
const originalTextValues = new WeakMap<Text, string>();
const originalAttributeValues = new WeakMap<HTMLElement, Partial<Record<'placeholder' | 'title' | 'aria-label', string>>>();

function useLanguage() {
  return useContext(LanguageContext);
}

function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => (localStorage.getItem('flight-right-language') as Language) || 'en');
  const setLanguage = (nextLanguage: Language) => { setLanguageState(nextLanguage); localStorage.setItem('flight-right-language', nextLanguage); };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.body.classList.toggle('language-ar', language === 'ar');
    const translate = () => {
      const map = language === 'en' ? null : translations[language];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const nodes: Text[] = [];
      let current: Node | null;
      while ((current = walker.nextNode())) nodes.push(current as Text);
      nodes.forEach((node) => {
        const source = originalTextValues.get(node) || node.nodeValue || '';
        originalTextValues.set(node, source);
        const value = source.trim();
        if (!value || !map || node.parentElement?.closest('script,style')) {
          if (!map) node.nodeValue = source;
          return;
        }
        const entries = Object.entries(map).sort(([left], [right]) => right.length - left.length);
        node.nodeValue = entries.reduce((text, [key, translated]) => {
          if (/^[A-Za-z][A-Za-z'-]*$/.test(key)) {
            return text.replace(new RegExp(`\\b${key.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\b`, 'g'), translated);
          }
          return text.split(key).join(translated);
        }, source);
      });
      document.querySelectorAll<HTMLElement>('[placeholder], [title], [aria-label]').forEach((element) => {
        const originalValues = originalAttributeValues.get(element) || {};
        (['placeholder', 'title', 'aria-label'] as const).forEach((attribute) => {
          const currentValue = element.getAttribute(attribute);
          if (currentValue && originalValues[attribute] === undefined) originalValues[attribute] = currentValue;
          const source = originalValues[attribute];
          if (!source) return;
          element.setAttribute(attribute, map?.[source] || source);
        });
        originalAttributeValues.set(element, originalValues);
      });
    };
    translate();
    const observer = new MutationObserver(translate);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [language]);

  return <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>;
}

function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  return <div className="flex items-center gap-1 rounded-full border border-[#173846]/10 bg-white/60 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#173846]" aria-label="Language selector">
    {(Object.keys(languageLabels) as Language[]).map((item) => <button key={item} type="button" onClick={() => setLanguage(item)} className={language === item ? 'font-bold text-[#c75a3b]' : 'text-[#617277]'}>{languageLabels[item]}</button>)}
  </div>;
}

function whatsappHref() {
  const message = encodeURIComponent('Hello Flight Right, I need help with a flight.');
  return `https://wa.me/${whatsappNumber}?text=${message}`;
}

function WhatsAppButton() {
  return (
    <a
      href={whatsappHref()}
      target="_blank"
      rel="noreferrer"
      aria-label="Contact Flight Right on WhatsApp"
      title="Contact us on WhatsApp"
      className="fixed bottom-5 right-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-[0_12px_30px_rgba(37,211,102,0.35)] transition-transform hover:scale-105"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}

const queryClient = new QueryClient();

type Destination = {
  id: string;
  city: string;
  country: string;
  tag: string;
  price: string;
  image: string;
  accent: string;
};

type FlightSearch = {
  from: string;
  to: string;
  departDate: string;
  returnDate: string;
  passengers: number;
  cabin: string;
};

type FlightOffer = {
  id: string;
  airline: string;
  flightNumber: string;
  departTime: string;
  arriveTime: string;
  duration: string;
  stops: string;
  price: string;
  cabin: string;
};

const destinations: Destination[] = [
  {
    id: 'istanbul',
    city: 'Istanbul',
    country: 'Türkiye',
    tag: 'Historic lanes, Bosphorus light',
    price: '€129',
    image: 'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=1100',
    accent: 'city breaks & culture',
  },
  {
    id: 'cairo',
    city: 'Cairo',
    country: 'Egypt',
    tag: 'Old stones, river evenings',
    price: '€245',
    image: 'https://images.pexels.com/photos/3225531/pexels-photo-3225531.jpeg?auto=compress&cs=tinysrgb&w=1100',
    accent: 'nile evenings & old stones',
  },
  {
    id: 'hurghada',
    city: 'Hurghada',
    country: 'Egypt',
    tag: 'Sea air, reef days',
    price: '€289',
    image: 'https://images.pexels.com/photos/533322/pexels-photo-533322.jpeg?auto=compress&cs=tinysrgb&w=1100',
    accent: 'sun, reef & slow rhythms',
  },
  {
    id: 'sharm-el-sheikh',
    city: 'Sharm El Sheikh',
    country: 'Egypt',
    tag: 'Red Sea calm',
    price: '€219',
    image: 'https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&w=1100',
    accent: 'reef escapes & sunsets',
  },
  {
    id: 'cappadocia',
    city: 'Cappadocia',
    country: 'Türkiye',
    tag: 'Sunrise magic',
    price: '€179',
    image: 'https://images.pexels.com/photos/585402/pexels-photo-585402.jpeg?auto=compress&cs=tinysrgb&w=1100',
    accent: 'balloons & volcanic landscapes',
  },
  {
    id: 'antalya',
    city: 'Antalya',
    country: 'Türkiye',
    tag: 'Coasts, gardens and drift',
    price: '€189',
    image: 'https://images.pexels.com/photos/1139541/pexels-photo-1139541.jpeg?auto=compress&cs=tinysrgb&w=1100',
    accent: 'beaches, bay views & easy escapes',
  },
  {
    id: 'dubai',
    city: 'Dubai',
    country: 'United Arab Emirates',
    tag: 'Skyline and desert light',
    price: '€315',
    image: 'https://images.pexels.com/photos/1470502/pexels-photo-1470502.jpeg?auto=compress&cs=tinysrgb&w=1100',
    accent: 'modern stays & desert days',
  },
  {
    id: 'amman',
    city: 'Amman',
    country: 'Jordan',
    tag: 'City edges and mountain air',
    price: '€199',
    image: 'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=1100',
    accent: 'ancient routes & warm hospitality',
  },
  {
    id: 'beirut',
    city: 'Beirut',
    country: 'Lebanon',
    tag: 'Seaside evenings and culture',
    price: '€229',
    image: 'https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg?auto=compress&cs=tinysrgb&w=1100',
    accent: 'coast, cafés & city rhythm',
  },
  {
    id: 'amsterdam',
    city: 'Amsterdam',
    country: 'Netherlands',
    tag: 'Canals, bikes and easy energy',
    price: '€245',
    image: 'https://images.pexels.com/photos/2193300/pexels-photo-2193300.jpeg?auto=compress&cs=tinysrgb&w=1100',
    accent: 'city breaks & design-led routes',
  },
];

const destinationDetails: Record<string, {
  city: string;
  country: string;
  image: string;
  overview: string;
  whyVisit: string[];
  offers: string[];
  bestFor: string;
  packages?: { name: string; details: string }[];
  planningNotes?: string[];
}> = {
  istanbul: {
    city: 'Istanbul',
    country: 'Türkiye',
    image: 'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=1100',
    overview: 'Istanbul brings together historic streets, Bosphorus views and a lively city rhythm that works beautifully for short escapes or longer stays. Flight Right can shape the trip around the way you want to travel, from a compact city break to a slower cultural stay.',
    whyVisit: [
      'Historic neighbourhoods and iconic landmarks',
      'Bosphorus views, cafés and evening walks',
      'A practical mix of culture, food, shopping and free time',
    ],
    offers: [
      'Flight options for city breaks and long-weekend travel',
      'Central hotels, boutique stays and accommodation planning',
      'Private sightseeing, Bosphorus cruises and local experiences',
      'Airport transfers and support with building a smooth itinerary',
      'Visa guidance and trip support for international travellers',
    ],
    bestFor: 'City breaks, couples, families, groups and culture-focused travellers',
    packages: [
      { name: 'Istanbul city break', details: '3 nights with return flights, a central hotel, airport transfer and a guided old-city experience.' },
      { name: 'Istanbul and the Bosphorus', details: '4 nights with city sightseeing, a Bosphorus cruise, hotel planning and time to explore independently.' },
      { name: 'A deeper Istanbul stay', details: '5 to 7 nights with flexible tours, neighbourhood walks, shopping time and a personalised pace.' },
    ],
    planningNotes: [
      'Choose Sultanahmet for quick access to historic landmarks or Beyoglu and Karakoy for restaurants, galleries and evening energy.',
      'A Bosphorus cruise works well as a relaxed half-day between walking tours and gives the itinerary a different view of the city.',
      'We can keep the plan flexible for families and groups, or build a more detailed schedule for a first visit or special occasion.',
    ],
  },
  cairo: {
    city: 'Cairo',
    country: 'Egypt',
    image: 'https://images.pexels.com/photos/3225531/pexels-photo-3225531.jpeg?auto=compress&cs=tinysrgb&w=1100',
    overview: 'Cairo blends heritage, river evenings and easy access to Egypt’s most iconic sights, making it a strong destination for city breaks and cultural itineraries.',
    whyVisit: [
      'Pyramids, history and culture-rich city days',
      'Great access for family travel and short stays',
      'A practical gateway to Egypt and beyond',
    ],
    offers: [
      'Flights to and from major European routes',
      'Hotel and city stay planning',
      'Private guided sightseeing',
      'Easy trip support for families and first-time visitors',
    ],
    bestFor: 'Culture travelers, families and short multi-city trips',
    packages: [
      { name: 'Cairo essentials', details: '3 nights with a city hotel, airport transfer and a guided pyramids and museum day.' },
      { name: 'Cairo and the Nile', details: '6 nights combining Cairo with a river experience and time for Egypt\'s historic highlights.' },
      { name: 'Egypt first journey', details: '8 to 10 nights linking Cairo with Luxor, Aswan or the Red Sea.' },
    ],
    planningNotes: ['A central Cairo stay makes it easier to combine historic sites, museums and local food.', 'Longer trips can add the Nile or a Red Sea finish without rushing the capital.', 'We can arrange a private, family or small-group pace around your arrival flight.'],
  },
  hurghada: {
    city: 'Hurghada',
    country: 'Egypt',
    image: 'https://images.pexels.com/photos/533322/pexels-photo-533322.jpeg?auto=compress&cs=tinysrgb&w=1100',
    overview: 'Hurghada is a popular choice for easy Red Sea escapes with warm weather, resort stays and relaxed seaside itineraries.',
    whyVisit: [
      'Warm-weather beach escapes',
      'Resort stays and water-based travel',
      'Simple, relaxed planning for short holidays',
    ],
    offers: [
      'Resort and beach stay recommendations',
      'Flight combinations for sea-and-sun breaks',
      'Transfer coordination and holiday planning',
      'Flexible package options for couples and families',
    ],
    bestFor: 'Beach holidays, couples and sun-seekers',
    packages: [
      { name: 'Hurghada beach break', details: '4 nights with flights, resort accommodation, transfers and time by the Red Sea.' },
      { name: 'Reef and relaxation', details: '6 nights with snorkelling or diving options balanced with slower resort days.' },
      { name: 'Egypt and the Red Sea', details: '8 to 10 nights combining Cairo sightseeing with a Hurghada beach stay.' },
    ],
    planningNotes: ['Choose your resort around the beach, reef and activity access you prefer.', 'Keep sea days flexible around weather and water conditions.', 'Hurghada works well as a relaxing finish after a culture-focused Egypt route.'],
  },
  'sharm-el-sheikh': {
    city: 'Sharm El Sheikh',
    country: 'Egypt',
    image: 'https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&w=1100',
    overview: 'Sharm El Sheikh pairs Red Sea beaches with reef adventures, desert landscapes and easy resort days for travellers who want sun without a complicated itinerary.',
    whyVisit: ['Clear water and coral-reef experiences', 'Resort comfort with optional desert adventures', 'A relaxed base for couples, families and groups'],
    offers: ['Flight and resort planning', 'Airport transfers and local transport', 'Snorkelling, diving and desert excursion options', 'Flexible beach itineraries for couples and families'],
    bestFor: 'Beach escapes, families, couples and water-sports travellers',
    packages: [
      { name: 'Red Sea reset', details: '4 nights with flights, resort stay, transfers and a relaxed beach-focused plan.' },
      { name: 'Reef and desert escape', details: '6 nights with snorkelling or diving options plus a guided desert experience.' },
      { name: 'Family resort week', details: '7 nights with family-friendly accommodation, simple transfers and flexible free time.' },
    ],
    planningNotes: ['Choose the resort area around the activities and beach style you prefer.', 'Keep at least one unscheduled day for the sea, pool or a slower evening.', 'We can arrange the flights and support services around your confirmed hotel choice.'],
  },
  cappadocia: {
    city: 'Cappadocia',
    country: 'Türkiye',
    image: 'https://images.pexels.com/photos/585402/pexels-photo-585402.jpeg?auto=compress&cs=tinysrgb&w=1100',
    overview: 'Cappadocia is known for its unusual rock valleys, cave stays and sunrise views, making it a memorable add-on to an Istanbul journey or a destination in its own right.',
    whyVisit: ['Unique volcanic landscapes and valley walks', 'Cave hotels and memorable sunrise views', 'A strong fit for couples, photographers and curious families'],
    offers: ['Flight combinations through Türkiye', 'Cave hotel and boutique accommodation planning', 'Balloon flight and guided valley tour requests', 'Transfers between airports, hotels and activities'],
    bestFor: 'Couples, photographers, families and culture-focused travellers',
    packages: [
      { name: 'Cappadocia highlights', details: '3 nights with a cave-style stay, airport transfer and a guided landscape day.' },
      { name: 'Istanbul and Cappadocia', details: '6 nights combining historic Istanbul with Cappadocia valleys and sunrise experiences.' },
      { name: 'Slow valley stay', details: '4 to 5 nights with flexible walks, local food and time to enjoy the landscape at your pace.' },
    ],
    planningNotes: ['Early mornings are important for sunrise activities, so a nearby stay can make the schedule easier.', 'Weather can affect balloon operations; keep the itinerary flexible when possible.', 'Cappadocia works especially well as a second stop after Istanbul.'],
  },
  antalya: {
    city: 'Antalya',
    country: 'Türkiye',
    image: 'https://images.pexels.com/photos/1139541/pexels-photo-1139541.jpeg?auto=compress&cs=tinysrgb&w=1100',
    overview: 'Antalya combines a Mediterranean coastline with historic old-town streets, resort areas and day trips for travellers who want both rest and variety.',
    whyVisit: ['Coastal stays with swimming and sea views', 'Old-town walks, waterfalls and nearby ruins', 'Flexible options for families, couples and groups'],
    offers: ['Flight and resort comparisons', 'Hotel planning across beach and city areas', 'Boat trips, old-town visits and day excursions', 'Airport transfers and family-friendly trip coordination'],
    bestFor: 'Coastal holidays, families, couples and resort travellers',
    packages: [
      { name: 'Antalya coast break', details: '4 nights with flights, a coastal stay, transfers and time for the beach.' },
      { name: 'Culture and coast', details: '6 nights balancing old-town Antalya, day trips and a comfortable seaside base.' },
      { name: 'Family summer stay', details: '7 nights with practical transfers, family accommodation and an easy-paced plan.' },
    ],
    planningNotes: ['Decide whether your priority is a resort, old-town access or a mix of both.', 'Add day trips selectively so the itinerary keeps enough time for the coast.', 'We can match the accommodation area to your transfer needs and travel pace.'],
  },
  dubai: {
    city: 'Dubai',
    country: 'United Arab Emirates',
    image: 'https://images.pexels.com/photos/1470502/pexels-photo-1470502.jpeg?auto=compress&cs=tinysrgb&w=1100',
    overview: 'Dubai offers a polished city break with skyline views, shopping, desert experiences and a wide choice of hotels for short stays or longer stopovers.',
    whyVisit: ['Modern architecture, shopping and dining', 'Desert activities alongside city experiences', 'Many hotel and itinerary styles for different budgets'],
    offers: ['Flight and stopover planning', 'City hotels, resorts and family accommodation', 'Desert safaris, city tours and attraction planning', 'Airport transfers and schedule coordination'],
    bestFor: 'Stopovers, families, couples, shopping trips and business travel',
    packages: [
      { name: 'Dubai city break', details: '3 nights with flights, a central hotel, transfers and a selection of city highlights.' },
      { name: 'City and desert', details: '5 nights combining skyline experiences, shopping time and a desert excursion.' },
      { name: 'Family Dubai stay', details: '6 nights with family-friendly accommodation, easy transfers and flexible activity days.' },
    ],
    planningNotes: ['Choose the hotel area around the experiences you care about most.', 'Reserve space for rest because the city offers more activities than a short trip can fit.', 'We can build a practical stopover plan around your onward flight.'],
  },
  amman: {
    city: 'Amman',
    country: 'Jordan',
    image: 'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=1100',
    overview: 'Amman is a useful starting point for Jordan, with a lively capital, historic viewpoints and access to cultural and natural highlights beyond the city.',
    whyVisit: ['Historic sites, markets and local food', 'A gateway to Petra, Wadi Rum and the Dead Sea', 'A strong base for a compact Jordan itinerary'],
    offers: ['Flights and multi-city route planning', 'City hotels and regional accommodation', 'Guided visits and private transfers', 'Itinerary support for Jordan highlights'],
    bestFor: 'Culture travellers, couples, small groups and first-time visitors to Jordan',
    packages: [
      { name: 'Amman city stay', details: '3 nights with hotel planning, city sightseeing and time for local food and markets.' },
      { name: 'Jordan highlights', details: '6 nights linking Amman with Petra, Wadi Rum or the Dead Sea through a coordinated route.' },
      { name: 'Private Jordan route', details: '7 nights with a flexible driver-led itinerary shaped around your interests and pace.' },
    ],
    planningNotes: ['Jordan is best planned as a route rather than a single-city visit if you have enough time.', 'Allow realistic travel time between the capital and regional highlights.', 'We can coordinate a private or small-group plan around your arrival flight.'],
  },
  beirut: {
    city: 'Beirut',
    country: 'Lebanon',
    image: 'https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg?auto=compress&cs=tinysrgb&w=1100',
    overview: 'Beirut brings together a Mediterranean setting, restaurants, galleries and a lively urban rhythm, with room to add coastal and mountain day trips.',
    whyVisit: ['Seafront walks, cafés and neighbourhood culture', 'Food, design and arts experiences', 'Easy access to day trips beyond the capital'],
    offers: ['Flight and city-stay planning', 'Boutique hotels and practical accommodation choices', 'Food, culture and private day-tour requests', 'Airport transfers and itinerary support'],
    bestFor: 'Couples, food travellers, culture travellers and short city breaks',
    packages: [
      { name: 'Beirut weekend', details: '3 nights with a central stay, airport transfer and a food-and-culture focused plan.' },
      { name: 'City and coast', details: '5 nights with Beirut experiences plus a flexible day trip outside the capital.' },
      { name: 'Private Lebanon stay', details: '6 to 7 nights with tailored city, mountain and coastal experiences.' },
    ],
    planningNotes: ['A central base makes it easier to combine neighbourhood walks with restaurants and galleries.', 'Keep day trips flexible so the itinerary can follow local conditions and your pace.', 'We can focus the plan on food, culture, coastline or a balanced mix.'],
  },
  amsterdam: {
    city: 'Amsterdam',
    country: 'Netherlands',
    image: 'https://images.pexels.com/photos/2193300/pexels-photo-2193300.jpeg?auto=compress&cs=tinysrgb&w=1100',
    overview: 'Amsterdam is an easy city break for canals, museums, neighbourhood cafés and connections across the Netherlands and Europe.',
    whyVisit: ['Canals, museums and walkable neighbourhoods', 'Excellent rail and air connections for onward travel', 'A flexible base for couples, families and business visitors'],
    offers: ['Flights and short-break planning', 'Central hotel and apartment recommendations', 'Museum, canal and local experience requests', 'Airport and station transfer guidance'],
    bestFor: 'City breaks, weekend visitors, families and business travellers',
    packages: [
      { name: 'Amsterdam weekend', details: '2 to 3 nights with a central stay, arrival guidance and a simple city highlights plan.' },
      { name: 'Amsterdam and beyond', details: '4 to 5 nights combining the city with nearby towns or a wider Netherlands route.' },
      { name: 'Work and leisure stay', details: 'A flexible plan that keeps transport, accommodation and personal time easy to manage.' },
    ],
    planningNotes: ['Book the accommodation area around your main museums, meetings or neighbourhood interests.', 'Use public transport and walking time as part of the experience, not just a transfer between stops.', 'We can combine Amsterdam with onward routes across Europe, Egypt or Türkiye.'],
  },
};

const flightRoutes = [
  { from: 'Amsterdam', to: 'Cairo', price: '€245', note: 'from · per person' },
  { from: 'Amsterdam', to: 'Istanbul', price: '€129', note: 'from · per person' },
  { from: 'Cairo', to: 'Istanbul', price: '€165', note: 'from · per person' },
  { from: 'Amsterdam', to: 'Hurghada', price: '€289', note: 'from · per person' },
  { from: 'Amsterdam', to: 'Antalya', price: '€179', note: 'from · per person' },
];

const demoOffers: FlightOffer[] = [
  { id: 'fr-001', airline: 'KLM', flightNumber: 'KL 553', departTime: '10:20', arriveTime: '16:45', duration: '4h 25m', stops: 'Direct', price: '€245', cabin: 'Economy' },
  { id: 'fr-002', airline: 'EgyptAir', flightNumber: 'MS 758', departTime: '14:10', arriveTime: '20:35', duration: '4h 25m', stops: 'Direct', price: '€268', cabin: 'Economy' },
  { id: 'fr-003', airline: 'Turkish Airlines', flightNumber: 'TK 1952', departTime: '11:45', arriveTime: '18:20', duration: '5h 35m', stops: '1 stop', price: '€219', cabin: 'Economy' },
];

function buildFlightSearch(params: URLSearchParams): FlightSearch {
  return {
    from: params.get('from') || 'Amsterdam',
    to: params.get('to') || 'Cairo',
    departDate: params.get('depart') || '2026-02-12',
    returnDate: params.get('return') || '2026-02-20',
    passengers: Number(params.get('passengers')) || 1,
    cabin: params.get('cabin') || 'Economy',
  };
}

function searchHref(search: FlightSearch) {
  const params = new URLSearchParams({
    from: search.from,
    to: search.to,
    depart: search.departDate,
    return: search.returnDate,
    passengers: String(search.passengers),
    cabin: search.cabin,
  });
  return `/flights?${params.toString()}`;
}

const holidayPackages = [
  {
    title: 'Cairo & Nile Explorer',
    summary: '6 nights · flights, hotel & Nile cruise included',
    price: '€899',
    note: 'from · per person',
  },
  {
    title: 'Istanbul Weekend Escape',
    summary: '3 nights · flights & boutique hotel included',
    price: '€349',
    note: 'from · per person',
  },
  {
    title: 'Red Sea Diving Retreat',
    summary: '7 nights · Hurghada · flights & resort included',
    price: '€749',
    note: 'from · per person',
  },
];

const hotelOffers = [
  {
    city: 'Cairo',
    title: 'Nile Grand Palace',
    detail: '5-star · Nile view · breakfast included',
    price: '€145',
    note: 'from · per night',
  },
  {
    city: 'Istanbul',
    title: 'Bosphorus Pearl Hotel',
    detail: '4-star · Old City · free cancellation',
    price: '€210',
    note: 'from · per night',
  },
  {
    city: 'Hurghada',
    title: 'Red Sea Royal Resort',
    detail: '5-star · all-inclusive · private beach',
    price: '€165',
    note: 'from · per night',
  },
];

const tours = [
  {
    title: 'Pyramids & Sphinx Private Tour',
    location: 'Cairo',
    detail: 'half-day · private guide',
    price: '€85',
    note: 'from · per person',
  },
  {
    title: 'Cappadocia Sunrise Balloon Flight',
    location: 'Cappadocia',
    detail: '1 hour · hotel pickup',
    price: '€175',
    note: 'from · per person',
  },
  {
    title: 'Bosphorus Dinner Cruise',
    location: 'Istanbul',
    detail: 'evening · live music',
    price: '€65',
    note: 'from · per person',
  },
];

const partnerListings = [
  { id: 'partner-cairo-guide', category: 'Guided experiences', name: 'Cairo heritage day', location: 'Cairo, Egypt', detail: 'Private guide, historic landmarks and flexible pickup planning.', price: 'From €85' },
  { id: 'partner-istanbul-stay', category: 'Accommodation', name: 'Istanbul city stay', location: 'Istanbul, Türkiye', detail: 'Central hotel options for short breaks, couples and families.', price: 'From €210/night' },
  { id: 'partner-red-sea-transfer', category: 'Transfers', name: 'Red Sea arrival service', location: 'Hurghada, Egypt', detail: 'Airport pickup and resort transfer coordination.', price: 'Request a quote' },
  { id: 'partner-cappadocia-experience', category: 'Experiences', name: 'Cappadocia sunrise plan', location: 'Cappadocia, Türkiye', detail: 'Cave stay, valley tour and sunrise activity coordination.', price: 'Build your plan' },
];

const reasons = [
  {
    icon: '🤝',
    title: 'Trusted travel partners',
    text: 'Airlines and route partners we\'ve vetted across Europe, Egypt and Türkiye.',
  },
  {
    icon: '💶',
    title: 'Competitive prices',
    text: 'Direct relationships and smart routing keep fares and package rates honest.',
  },
  {
    icon: '🎧',
    title: 'Personal travel support',
    text: 'A real person to call before, during and after your trip — in your language.',
  },
  {
    icon: '🧭',
    title: 'One platform for your journey',
    text: 'Flight search, fare comparison and booking support in one clear place.',
  },
];

const serviceHighlights = [
  {
    title: 'Group travel abroad',
    text: 'Organizing affordable group trips to the most popular global destinations with carefully crafted itineraries designed for smooth and enjoyable travel.',
  },
  {
    title: 'Visa assistance',
    text: 'Assisting clients in obtaining visas for top travel destinations, with full support for document preparation and application processes.',
  },
  {
    title: 'Private trips & honeymoon packages',
    text: 'Offering customized honeymoon packages for unforgettable romantic getaways, designed to suit every budget and preference.',
  },
  {
    title: 'Discover Egypt',
    text: 'From Cairo and the Nile to the Red Sea and Sinai, our Egypt journeys are designed for comfort, culture and easy planning.',
  },
  {
    title: 'B2B services',
    text: 'Supporting travel agents, corporate planners and partner networks with reliable route guidance, coordination and service standards.',
  },
];

function Home() {
  const [from, setFrom] = useState('Amsterdam');
  const [to, setTo] = useState('Cairo');
  const [departDate, setDepartDate] = useState('2026-02-12');
  const [returnDate, setReturnDate] = useState('2026-02-20');
  const [passengers, setPassengers] = useState(2);
  const [travelType, setTravelType] = useState('Flights');
  const [cabin, setCabin] = useState('Economy');
  const [showPassengers, setShowPassengers] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchMessage, setSearchMessage] = useState('');
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [, setLocation] = useLocation();

  const filteredDestinations = useMemo(() => {
    const query = to.trim().toLowerCase();
    if (!query) return destinations;
    return destinations.filter((destination) =>
      `${destination.city} ${destination.country} ${destination.tag}`.toLowerCase().includes(query),
    );
  }, [to]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!from.trim() || !to.trim()) {
      setSearchMessage('Choose a destination to start planning.');
      return;
    }
    setLocation(searchHref({ from, to, departDate, returnDate, passengers, cabin }));
  };

  const updatePassengers = (delta: number) => {
    setPassengers((current) => Math.min(8, Math.max(1, current + delta)));
  };

  const navItems = [
    { label: 'Flights', href: '/flights' },
    { label: 'Destinations', href: '#destinations' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <div className="noise min-h-screen overflow-x-hidden bg-[#f5efe5] text-[#173846]">
      {feedback && (
        <div className="fixed bottom-5 left-1/2 z-40 -translate-x-1/2 rounded-full bg-[#173846] px-5 py-3 text-sm font-semibold text-[#f7edcf] shadow-2xl">
          <span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-[#f6c94b]" /> {feedback}</span>
        </div>
      )}

      <header className="fixed inset-x-0 top-0 z-[60] border-b border-[#1b3b4f]/10 bg-[#f7f0e4]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-4 px-5 py-4 lg:px-10">
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center">
              <span className="brand-logo-shell">
                <img src={brandLogo} alt="Flight Right" className="brand-logo-image" />
              </span>
            </a>
          </div>

          <nav className="hidden items-center gap-6 xl:flex">
            <a href="/" className="font-bold text-[#173846]">Flight Right</a>
            {navItems.map((item) => (
              <a key={item.label} href={item.href} className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#173846]/80 transition-colors hover:text-[#c75a3b]">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <LanguageSwitcher />
            <div className="flex items-center gap-2 rounded-full border border-[#173846]/10 bg-white/60 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#173846]">
              <span>EUR</span>
              <span className="text-[#617277]">EGP</span>
              <span className="text-[#617277]">TRY</span>
              <span className="text-[#617277]">USD</span>
            </div>
            <a href="/my-trips" className="rounded-full bg-[#173846] px-4 py-2 text-xs font-bold text-[#f7edcf] transition-colors hover:bg-[#c75a3b]">
              My Trips
            </a>
          </div>

          <button
            onClick={() => setMobileOpen((current) => !current)}
            className="rounded-full border border-[#173846]/10 p-2 text-[#173846] xl:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-[#173846]/10 bg-[#f7f0e4] px-5 py-4 xl:hidden">
            <div className="flex flex-col gap-3 text-sm font-semibold text-[#173846]">
              <div className="flex items-center justify-between border-b border-[#173846]/10 pb-3">
                <span>Language</span>
                <LanguageSwitcher />
              </div>
              {navItems.map((item) => (
                <a key={item.label} href={item.href} className="py-1 hover:text-[#c75a3b]" onClick={() => setMobileOpen(false)}>
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="pt-20">
        <section id="booking" className="relative overflow-hidden bg-[#173846] text-[#f7edcf]">
          <div className="absolute inset-0 opacity-20 wander-grid" />
          <div className="relative mx-auto max-w-[1320px] px-5 pb-10 pt-14 lg:px-10 lg:pb-16 lg:pt-20">
            <div className="mb-7 text-[11px] font-bold uppercase tracking-[0.24em] text-[#f6c94b]">{brandProfile.name}</div>
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <div>
                <h1 className="max-w-[720px] font-display text-[clamp(3.4rem,7vw,7rem)] leading-[0.82] tracking-[-0.075em] text-[#f7edcf]">
                  Where will<br />you go next?
                </h1>
                <p className="mt-5 max-w-[620px] text-lg leading-8 text-[#f7edcf]/75">
                  {brandProfile.description}
                </p>
              </div>

              <div className="rounded-[28px] border border-[#f7edcf]/20 bg-[#f7edcf]/8 p-3 shadow-2xl backdrop-blur-md">
                <div className="grid grid-cols-1 gap-2 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-[#f7edcf]/75">
                  {['Flights'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setTravelType(type)}
                      className="rounded-full bg-[#f6c94b] px-3 py-2 text-[#173846] transition-colors"
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSearch} className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                  <label className="rounded-2xl border border-[#f7edcf]/15 bg-white/5 p-3">
                    <span className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#f6c94b]">
                      <Navigation className="h-3.5 w-3.5" /> From
                    </span>
                    <input value={from} onChange={(event) => setFrom(event.target.value)} className="w-full bg-transparent text-sm font-semibold text-[#f7edcf] outline-none placeholder:text-[#f7edcf]/60" />
                  </label>

                  <label className="rounded-2xl border border-[#f7edcf]/15 bg-white/5 p-3">
                    <span className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#f6c94b]">
                      <MapPin className="h-3.5 w-3.5" /> To
                    </span>
                    <input value={to} onChange={(event) => setTo(event.target.value)} className="w-full bg-transparent text-sm font-semibold text-[#f7edcf] outline-none placeholder:text-[#f7edcf]/60" placeholder="Destination" />
                  </label>

                  <label className="rounded-2xl border border-[#f7edcf]/15 bg-white/5 p-3">
                    <span className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#f6c94b]">
                      <CalendarDays className="h-3.5 w-3.5" /> Departure
                    </span>
                    <input type="date" value={departDate} onChange={(event) => setDepartDate(event.target.value)} className="w-full bg-transparent text-sm font-semibold text-[#f7edcf] outline-none" />
                  </label>

                  <label className="rounded-2xl border border-[#f7edcf]/15 bg-white/5 p-3">
                    <span className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#f6c94b]">
                      <CalendarDays className="h-3.5 w-3.5" /> Return
                    </span>
                    <input type="date" value={returnDate} onChange={(event) => setReturnDate(event.target.value)} className="w-full bg-transparent text-sm font-semibold text-[#f7edcf] outline-none" />
                  </label>

                  <div className="relative rounded-2xl border border-[#f7edcf]/15 bg-white/5 p-3">
                    <button type="button" onClick={() => setShowPassengers((current) => !current)} className="flex w-full items-center justify-between gap-2 text-left">
                      <span>
                        <span className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#f6c94b]">
                          <Users className="h-3.5 w-3.5" /> Passengers
                        </span>
                        <span className="text-sm font-semibold text-[#f7edcf]">{passengers} {passengers === 1 ? 'traveller' : 'travellers'}</span>
                      </span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${showPassengers ? 'rotate-180' : ''}`} />
                    </button>

                    {showPassengers && (
                      <div className="absolute left-2 right-2 top-[calc(100%+8px)] z-20 rounded-2xl border border-[#d7cdbb] bg-[#f8f0e2] p-4 text-[#173846] shadow-xl">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-bold">Passengers</span>
                          <div className="flex items-center gap-3">
                            <button type="button" onClick={() => updatePassengers(-1)} className="rounded-full border border-[#173846]/20 p-1.5">
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-5 text-center font-bold">{passengers}</span>
                            <button type="button" onClick={() => updatePassengers(1)} className="rounded-full border border-[#173846]/20 p-1.5">
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </form>

                <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3 rounded-full border border-[#f7edcf]/15 bg-white/5 px-3 py-2 text-sm text-[#f7edcf]">
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#f6c94b]">Cabin</span>
                    <select value={cabin} onChange={(event) => setCabin(event.target.value)} className="bg-transparent text-sm text-[#f7edcf] outline-none">
                      <option className="text-[#173846]">Economy</option>
                      <option className="text-[#173846]">Premium Economy</option>
                      <option className="text-[#173846]">Business</option>
                    </select>
                  </div>

                  <button type="button" onClick={() => setLocation(searchHref({ from, to, departDate, returnDate, passengers, cabin }))} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#f6c94b] px-6 py-3 text-sm font-bold text-[#173846] transition-transform hover:-translate-y-0.5">
                    Search flights <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                {searchMessage && <p className="mt-4 text-center text-sm font-semibold text-[#f6c94b]">{searchMessage}</p>}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1320px] px-5 py-24 lg:px-10 lg:py-28">
          <div className="mb-10 text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#c75a3b]">Our services</p>
            <h2 className="mt-4 font-display text-5xl leading-none tracking-[-0.055em] text-[#173846] md:text-7xl">Travel support built around real trips</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
            {serviceHighlights.map((service) => (
              <div key={service.title} className="rounded-[24px] border border-[#d7cdbb] bg-white p-5 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#c75a3b]">Service</p>
                <h3 className="mt-4 font-display text-3xl leading-none tracking-[-0.04em] text-[#173846]">{service.title}</h3>
                <p className="mt-4 text-sm leading-6 text-[#617277]">{service.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="destinations" className="mx-auto max-w-[1320px] px-5 pb-24 lg:px-10 lg:pb-28">
          <div className="mb-10 text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#c75a3b]">Popular destinations</p>
            <h2 className="mt-4 font-display text-5xl leading-none tracking-[-0.055em] text-[#173846] md:text-7xl">Where our travelers are going</h2>
            <p className="mx-auto mt-5 max-w-[680px] text-base leading-7 text-[#617277]">
              From ancient wonders to island coastlines — ten places our travelers can’t stop booking.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
            {destinations.map((destination) => (
              <button
                key={destination.id}
                type="button"
                onClick={() => setLocation(`/destination/${destination.id}`)}
                className="group overflow-hidden rounded-[24px] border border-[#d7cdbb] bg-white text-left shadow-sm transition-transform hover:-translate-y-1"
              >
                <div className="relative h-64 overflow-hidden">
                  <img src={destination.image} alt={destination.city} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#173846]/80 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-[#f7edcf]">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#f6c94b]">{destination.country}</p>
                    <h3 className="mt-2 font-display text-3xl leading-none tracking-[-0.04em]">{destination.city}</h3>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-sm leading-6 text-[#617277]">{destination.tag}</p>
                  <div className="mt-4 flex items-center justify-between gap-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#c75a3b]">
                    <span>{destination.accent}</span>
                    <span>{destination.price} from</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="border-y border-[#d7cdbb] bg-[#f0e6d6]">
          <div className="mx-auto max-w-[1320px] px-5 py-24 lg:px-10 lg:py-28">
            <div className="mb-10 text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#c75a3b]">Featured routes</p>
              <h2 className="mt-4 font-display text-5xl leading-none tracking-[-0.055em] text-[#173846] md:text-7xl">Popular flight routes</h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
              {flightRoutes.map((route) => (
                <div key={`${route.from}-${route.to}`} className="rounded-[24px] border border-[#d7cdbb] bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.18em] text-[#c75a3b]">
                    <span>{route.from}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                    <span>{route.to}</span>
                  </div>
                  <div className="mt-6 flex items-end justify-between gap-3">
                    <div className="font-mono-custom text-2xl font-bold text-[#173846]">{route.price}</div>
                    <div className="text-[11px] text-[#617277]">{route.note}</div>
                  </div>
                  <a href={searchHref({ from: route.from, to: route.to, departDate, returnDate, passengers, cabin })} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#c75a3b]">
                    View details <ChevronRight className="h-4 w-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>


        <section className="mx-auto max-w-[1320px] px-5 py-24 lg:px-10 lg:py-28">
          <div className="rounded-[28px] border border-[#d7cdbb] bg-[#f7f0e4] p-8 shadow-sm lg:p-12">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#c75a3b]">Flight Right partner marketplace</p>
                <h2 className="mt-4 font-display text-5xl leading-none tracking-[-0.055em] text-[#173846] md:text-7xl">Local services, ready for your journey.</h2>
                <p className="mt-5 max-w-2xl text-base leading-7 text-[#617277]">Browse accommodation, guided experiences and transfers from the Flight Right partner network. Every request is confirmed with the provider before payment.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a href="/partners" className="rounded-full bg-[#173846] px-6 py-3 text-sm font-bold text-[#f7edcf]">Browse partners</a>
                <a href="/partners/apply" className="rounded-full bg-[#c75a3b] px-6 py-3 text-sm font-bold text-[#fff4e3]">List your service</a>
              </div>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {partnerListings.map((listing) => (
                <a key={listing.id} href={`/checkout?service=partner&item=${encodeURIComponent(listing.name)}`} className="rounded-[22px] border border-[#d7cdbb] bg-white p-5 transition-transform hover:-translate-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#c75a3b]">{listing.category}</p>
                  <h3 className="mt-3 font-display text-2xl leading-none text-[#173846]">{listing.name}</h3>
                  <p className="mt-2 text-xs font-semibold text-[#173846]">{listing.location}</p>
                  <p className="mt-3 text-sm leading-6 text-[#617277]">{listing.detail}</p>
                  <div className="mt-5 flex items-center justify-between gap-3 text-xs font-bold text-[#c75a3b]"><span>{listing.price}</span><ArrowRight className="h-4 w-4" /></div>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1320px] px-5 pb-20 lg:px-10">
          <div className="rounded-[28px] bg-[#f0e6d6] p-8 lg:p-12">
            <div className="mb-8 flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#c75a3b]">Stay inspired</p>
                <h2 className="mt-3 font-display text-5xl leading-none tracking-[-0.055em] text-[#173846] md:text-7xl">New routes, seasonal fares and destination guides — occasionally, not overwhelmingly.</h2>
              </div>
              <div className="hidden md:block">
                <a href="#newsletter" className="rounded-full bg-[#173846] px-6 py-3 text-sm font-bold text-[#f7edcf]">Subscribe</a>
              </div>
            </div>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex-1 max-w-[500px]">
                <form id="newsletter" onSubmit={async (event) => { event.preventDefault(); if (!email.trim()) return; const response = await fetch(`${apiBaseUrl}/api/newsletter/subscribe`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) }); if (response.ok) setSubscribed(true); }} className="flex flex-col gap-3 sm:flex-row">
                  <label className="flex flex-1 items-center gap-3 rounded-full border border-[#173846]/10 bg-white px-5 py-3 text-[#173846]">
                    <Send className="h-4 w-4 text-[#c75a3b]" />
                    <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="Your email address" className="w-full bg-transparent text-sm outline-none placeholder:text-[#617277]" />
                  </label>
                  <button type="submit" className="rounded-full bg-[#c75a3b] px-6 py-3 text-sm font-bold text-[#fff4e3] hover:bg-[#173846]">
                    {subscribed ? 'Subscribed' : 'Subscribe'}
                  </button>
                </form>
                {subscribed && <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#173846]"><Check className="h-4 w-4 text-[#c75a3b]" /> You’re signed up for new inspiration.</p>}
              </div>
              <div className="flex items-center gap-2 text-[#173846]/70">
                <Sparkles className="h-4 w-4 text-[#c75a3b]" />
                <span>Thoughtful ideas, not a flood.</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer id="contact" className="border-t border-[#d7cdbb] bg-[#f5efe5]">
        <div className="mx-auto max-w-[1320px] px-5 py-10 lg:px-10">
          <div className="grid gap-8 md:grid-cols-[1.5fr_.8fr_.8fr_.8fr]">
            <div>
              <div className="flex items-center">
                <span className="brand-logo-shell brand-logo-shell-footer">
                  <img src={brandLogo} alt="Flight Right" className="brand-logo-image" />
                </span>
              </div>
              <p className="mt-4 max-w-[320px] text-sm leading-6 text-[#617277]">
                {brandProfile.description}
              </p>
                  <p className="mt-5 text-sm font-medium text-[#173846]">Your journey, our passion.</p>
            </div>

            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#c75a3b]">Services</h4>
              <ul className="mt-4 space-y-3 text-sm text-[#173846]">
                <li><a href="/flights" className="hover:text-[#c75a3b]">Flights</a></li>
                <li><a href="/services/group-trips" className="hover:text-[#c75a3b]">Group travel</a></li>
                <li><a href="/services/visa" className="hover:text-[#c75a3b]">Visa support</a></li>
                <li><a href="/services/honeymoon" className="hover:text-[#c75a3b]">Private trips</a></li>
                <li><a href="/services/egypt" className="hover:text-[#c75a3b]">Discover Egypt</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#c75a3b]">Company</h4>
              <ul className="mt-4 space-y-3 text-sm text-[#173846]">
                <li><a href="/about" className="hover:text-[#c75a3b]">About us</a></li>
                <li><a href="/b2b" className="hover:text-[#c75a3b]">B2B</a></li>
                <li><a href="/press" className="hover:text-[#c75a3b]">Press</a></li>
                <li><a href="/contact" className="hover:text-[#c75a3b]">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#c75a3b]">Support</h4>
              <ul className="mt-4 space-y-3 text-sm text-[#173846]">
                <li><a href={whatsappHref()} className="hover:text-[#c75a3b]" target="_blank" rel="noreferrer">WhatsApp support</a></li>
                <li><a href={`mailto:${contactEmail}`} className="hover:text-[#c75a3b]">{contactEmail}</a></li>
                <li><a href={`tel:${contactPhone.replace(/\s+/g, '')}`} className="hover:text-[#c75a3b]">{contactPhone}</a></li>
                <li><span>{businessHours}</span></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-[#d7cdbb] pt-6 text-[11px] font-medium uppercase tracking-[0.14em] text-[#617277] md:flex-row md:items-center md:justify-between">
            <p>© 2026 {brandProfile.name}. All rights reserved.</p>
            <p>Flight Right Travel & Tourism • {businessAddress}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function PageFrame({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f5efe5] text-[#173846]">
      <header className="border-b border-[#173846]/10 bg-[#f7f0e4]">
        <div className="mx-auto flex max-w-[1160px] items-center justify-between px-5 py-5 lg:px-10">
          <a href="/" className="flex items-center gap-3">
            <span className="brand-logo-shell">
              <img src={brandLogo} alt="Flight Right" className="brand-logo-image" />
            </span>
          </a>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <a href="/b2b" className="hidden rounded-full border border-[#173846]/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#173846] sm:inline-flex">
              Partner with us
            </a>
            <a href="/checkout?service=general" className="rounded-full bg-[#173846] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#f7edcf]">
              Start a request
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1160px] px-5 py-14 lg:px-10 lg:py-20">
        <div className="mb-10 rounded-[30px] bg-[#173846] p-8 text-[#f7edcf] shadow-[0_30px_80px_rgba(23,56,70,0.18)] lg:p-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#f6c94b]">Flight Right</p>
          <h1 className="mt-4 font-display text-5xl leading-none tracking-[-0.05em] md:text-7xl">{title}</h1>
          <p className="mt-5 max-w-[700px] text-base leading-7 text-[#f7edcf]/75">{intro}</p>
        </div>
        {children}
      </main>
    </div>
  );
}

function AboutPage() {
  const stats = [
    { value: '12+', label: 'Years planning journeys' },
    { value: '35k+', label: 'Trips arranged' },
    { value: '15', label: 'Core destinations' },
    { value: '4.9/5', label: 'Guest rating' },
  ];

  const values = [
    'Thoughtful itineraries built around real traveler needs.',
    'Transparent pricing with no hidden surprise extras.',
    'Human support before, during and after each trip.',
    'A mix of practical logistics and memorable local moments.',
  ];

  return (
    <PageFrame
      title="About us"
      intro="Flight Right is a travel agency built around care, route clarity and practical advice for travelers moving between Europe, Egypt and Türkiye."
    >
      <div className="grid gap-6 md:grid-cols-4">
        {stats.map((item) => (
          <div key={item.label} className="rounded-[24px] border border-[#d7cdbb] bg-white p-6 shadow-sm">
            <div className="font-display text-4xl leading-none tracking-[-0.04em] text-[#173846]">{item.value}</div>
            <p className="mt-3 text-sm text-[#617277]">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-[#d7cdbb] bg-white p-8 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#c75a3b]">Our story</p>
          <h2 className="mt-4 font-display text-4xl leading-[0.95] tracking-[-0.04em] text-[#173846]">Built for people who want less friction and more feeling.</h2>
          <p className="mt-5 text-base leading-7 text-[#617277]">
            Flight Right started with a simple challenge: comparing international flights was fragmented, slow and overwhelming. We built a service that brings route discovery, fare comparison and human support into one clear plan.
          </p>
          <p className="mt-4 text-base leading-7 text-[#617277]">
            Today we help families, couples and business travelers discover routes that fit their pace, their budget and their sense of what a good trip should feel like.
          </p>
        </div>

        <div className="rounded-[28px] bg-[#f0e6d6] p-8 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#c75a3b]">What we value</p>
          <ul className="mt-5 space-y-4 text-sm leading-6 text-[#173846]">
            {values.map((value) => (
              <li key={value} className="flex gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#c75a3b]" />
                <span>{value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </PageFrame>
  );
}

function CareersPage() {
  const roles = [
    {
      title: 'Senior Travel Consultant',
      location: 'Amsterdam · Hybrid',
      text: 'Guide customers through complex itineraries and help them build smarter, smoother travel plans.',
    },
    {
      title: 'Destination Specialist',
      location: 'Cairo · On-site / Remote',
      text: 'Build local travel knowledge across Egypt, Türkiye and Europe and shape premium recommendations.',
    },
    {
      title: 'Partnership Manager',
      location: 'Remote · Europe & Middle East',
      text: 'Develop relationships with hotels, tour operators and transfer providers that improve traveler experiences.',
    },
  ];

  const perks = ['Flexible work setup', 'Travel discounts', 'Wellbeing support', 'Learning budget', 'Inclusive culture'];

  return (
    <PageFrame
      title="Careers"
      intro="We are building a team that combines hospitality, planning and practical problem-solving. If you care about detail, service and better travel experiences, you may be a fit."
    >
      <div className="grid gap-6 md:grid-cols-2">
        {roles.map((role) => (
          <div key={role.title} className="rounded-[26px] border border-[#d7cdbb] bg-white p-7 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c75a3b]">{role.location}</p>
            <h2 className="mt-4 font-display text-4xl leading-[0.95] tracking-[-0.04em] text-[#173846]">{role.title}</h2>
            <p className="mt-4 text-base leading-7 text-[#617277]">{role.text}</p>
            <a href={`/contact?subject=${encodeURIComponent(`Application: ${role.title}`)}`} className="mt-6 inline-flex rounded-full bg-[#173846] px-5 py-2.5 text-sm font-bold text-[#f7edcf]">Apply now</a>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-[28px] bg-[#f0e6d6] p-8 shadow-sm">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#c75a3b]">Perks & culture</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {perks.map((perk) => (
            <span key={perk} className="rounded-full border border-[#173846]/10 bg-white px-4 py-2 text-sm font-semibold text-[#173846]">{perk}</span>
          ))}
        </div>
      </div>
    </PageFrame>
  );
}

function PressPage() {
  const headlines = [
    'Flight Right expands regional city breaks across Egypt and Türkiye.',
    'Travel experts highlight calmer, more curated holiday planning for families.',
    'Flight Right launches boutique route packages from Amsterdam and beyond.',
  ];

  return (
    <PageFrame
      title="Press"
      intro="Flight Right works with journalists, destination partners and media outlets to share practical insight, stories from the road, and updates on the travel market across our key regions."
    >
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-[#d7cdbb] bg-white p-8 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#c75a3b]">Latest updates</p>
          <ul className="mt-5 space-y-5">
            {headlines.map((headline) => (
              <li key={headline} className="border-b border-[#d7cdbb] pb-4 text-lg leading-7 text-[#173846]">
                {headline}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[28px] bg-[#173846] p-8 text-[#f7edcf] shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#f6c94b]">Media contact</p>
          <h2 className="mt-4 font-display text-4xl leading-[0.95] tracking-[-0.04em]">Press & partnerships</h2>
          <p className="mt-4 text-base leading-7 text-[#f7edcf]/75">For interviews, destination stories and partnership requests, contact our media desk.</p>
          <div className="mt-6 space-y-3 text-sm text-[#f7edcf]/85">
            <p>Email: press@flightright.travel</p>
            <p>Phone: +31 20 555 0160</p>
            <p>Office: Amsterdam, Netherlands</p>
          </div>
        </div>
      </div>
    </PageFrame>
  );
}

function ContactPage() {
  const [location, setLocation] = useLocation();
  const subjectFromUrl = new URLSearchParams(location.split('?')[1] || '').get('subject') || '';
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (sent) {
    return <PageFrame title="Message sent" intro="Your enquiry is ready for the Flight Right team. We will respond using the contact details you provided."><div className="rounded-[28px] border border-[#d7cdbb] bg-white p-8 shadow-sm"><Check className="h-10 w-10 text-[#c75a3b]" /><h2 className="mt-5 font-display text-5xl leading-none tracking-[-0.04em] text-[#173846]">Thanks for getting in touch.</h2><a href="/" className="mt-7 inline-flex rounded-full bg-[#173846] px-6 py-3 text-sm font-bold text-[#f7edcf]">Return home</a></div></PageFrame>;
  }

  return (
    <PageFrame
      title="Contact"
      intro="We are here to help you plan, confirm or adjust your trip. Reach out with travel questions, partner inquiries or general feedback and our team will get back to you quickly."
    >
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[28px] bg-[#173846] p-8 text-[#f7edcf] shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#f6c94b]">Talk to us</p>
          <div className="mt-6 space-y-5 text-sm">
            <p>Email: {contactEmail || 'Email address will be added soon'}</p>
            <p>Phone: {contactPhone || 'Phone number will be added soon'}</p>
            <a href={whatsappHref()} className="inline-flex items-center gap-2 text-[#f6c94b] hover:text-[#fff4e3]"><MessageCircle className="h-4 w-4" /> WhatsApp support</a>
            <p>Hours: Monday to Saturday, 09:00–18:00 CET</p>
          </div>
        </div>

        <div className="rounded-[28px] border border-[#d7cdbb] bg-white p-8 shadow-sm">
          <form onSubmit={async (event) => {
            event.preventDefault();
            setSubmitting(true);
            setError('');
            const form = new FormData(event.currentTarget);
            try {
              const response = await fetch(`${apiBaseUrl}/api/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  name: form.get('name'),
                  email: form.get('email'),
                  subject: form.get('subject'),
                  message: form.get('message'),
                }),
              });
              if (!response.ok) throw new Error('We could not send your message. Please try again.');
              setSent(true);
            } catch (submissionError) {
              setError(submissionError instanceof Error ? submissionError.message : 'We could not send your message. Please try again.');
            } finally {
              setSubmitting(false);
            }
          }} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="text-sm font-medium text-[#173846]">
                Full name
                <input name="name" required className="mt-2 w-full rounded-2xl border border-[#d7cdbb] bg-[#f7f0e4] px-4 py-3 outline-none" placeholder="Your name" />
              </label>
              <label className="text-sm font-medium text-[#173846]">
                Email
                <input name="email" required type="email" className="mt-2 w-full rounded-2xl border border-[#d7cdbb] bg-[#f7f0e4] px-4 py-3 outline-none" placeholder="you@example.com" />
              </label>
            </div>
            <label className="block text-sm font-medium text-[#173846]">
              Subject
                <input name="subject" defaultValue={subjectFromUrl} required className="mt-2 w-full rounded-2xl border border-[#d7cdbb] bg-[#f7f0e4] px-4 py-3 outline-none" placeholder="How can we help?" />
            </label>
            <label className="block text-sm font-medium text-[#173846]">
              Message
              <textarea name="message" required rows={5} className="mt-2 w-full rounded-2xl border border-[#d7cdbb] bg-[#f7f0e4] px-4 py-3 outline-none" placeholder="Tell us about your trip or enquiry" />
            </label>
            {error && <p role="alert" className="text-sm font-semibold text-[#c75a3b]">{error}</p>}
            <button type="submit" disabled={submitting} className="rounded-full bg-[#c75a3b] px-6 py-3 text-sm font-bold text-[#fff4e3] disabled:cursor-not-allowed disabled:opacity-60">{submitting ? 'Sending...' : 'Send message'}</button>
          </form>
        </div>
      </div>
    </PageFrame>
  );
}

function FlightsPage() {
  const [location, setLocation] = useLocation();
  const initialSearch = buildFlightSearch(new URLSearchParams(location.split('?')[1] || ''));
  const [search, setSearch] = useState(initialSearch);
  const [sort, setSort] = useState('recommended');
  const offers = sort === 'price' ? [...demoOffers].sort((a, b) => Number(a.price.slice(1)) - Number(b.price.slice(1))) : demoOffers;

  return (
    <PageFrame
      title="Flights"
      intro="Compare flight options with clear timings, stops and cabin details. This results view is ready to receive live Duffel offers when the API is connected."
    >
      <div className="rounded-[28px] border border-[#d7cdbb] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#c75a3b]">Your search</p>
            <h2 className="mt-2 font-display text-4xl leading-none tracking-[-0.04em] text-[#173846]">{search.from} to {search.to}</h2>
            <p className="mt-3 text-sm text-[#617277]">{search.departDate} · {search.passengers} traveller{search.passengers === 1 ? '' : 's'} · {search.cabin}</p>
          </div>
          <label className="text-sm font-semibold text-[#173846]">Sort by
            <select value={sort} onChange={(event) => setSort(event.target.value)} className="ml-3 rounded-full border border-[#d7cdbb] bg-[#f7f0e4] px-4 py-2 text-sm outline-none">
              <option value="recommended">Recommended</option>
              <option value="price">Lowest price</option>
            </select>
          </label>
        </div>
        <div className="mt-6 space-y-4">
          {offers.map((offer) => (
            <div key={offer.id} className="grid gap-5 rounded-[22px] border border-[#d7cdbb] bg-[#f7f0e4] p-5 lg:grid-cols-[1fr_auto_auto] lg:items-center">
              <div>
                <p className="text-sm font-bold text-[#173846]">{offer.airline} <span className="font-normal text-[#617277]">{offer.flightNumber}</span></p>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-[#173846]"><strong>{offer.departTime}</strong><ArrowRight className="h-4 w-4 text-[#c75a3b]" /><strong>{offer.arriveTime}</strong><span className="text-[#617277]">{offer.duration} · {offer.stops}</span></div>
              </div>
              <div className="font-mono-custom text-2xl font-bold text-[#173846]">{offer.price}<span className="ml-2 font-sans text-xs font-normal text-[#617277]">per traveller</span></div>
              <a href={`/flight-offers/${offer.id}?${new URLSearchParams({ from: search.from, to: search.to, depart: search.departDate, return: search.returnDate, passengers: String(search.passengers), cabin: search.cabin })}`} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#173846] px-5 py-3 text-sm font-bold text-[#f7edcf]">View details <ChevronRight className="h-4 w-4" /></a>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setLocation('/#booking')} className="mt-6 text-sm font-bold text-[#c75a3b]">Edit search</button>
      </div>
    </PageFrame>
  );
}

function DestinationDetailPage() {
  const [, params] = useRoute('/destination/:slug');
  const slug = params?.slug || 'istanbul';
  const selectedDestination = destinations.find((destination) => destination.id === slug);
  const item = destinationDetails[slug] || {
    city: selectedDestination?.city || 'Istanbul',
    country: selectedDestination?.country || 'Türkiye',
    image: selectedDestination?.image || destinationDetails.istanbul.image,
    overview: `${selectedDestination?.city || 'This destination'} is part of the Flight Right network for practical flight planning, comfortable stays and flexible travel support. Tell us what matters most and we will shape the right next step.`,
    whyVisit: [
      selectedDestination?.tag || 'A destination with its own character and rhythm',
      selectedDestination?.accent || 'Flexible routes and local experiences',
      'A trip plan shaped around your dates, budget and travel style',
    ],
    offers: [
      'Flight options and route planning',
      'Hotel and accommodation recommendations',
      'Tours, transfers and practical local support',
      'Personal guidance before you travel',
    ],
    bestFor: 'Travellers looking for a clear, flexible trip plan',
  };
  const [location, setLocation] = useLocation();

  return (
    <PageFrame
      title={item.city}
      intro={`${item.city} is one of the most popular routes in our portfolio, combining easy flight access, local culture and flexible trip planning.`}
    >
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="overflow-hidden rounded-[30px] border border-[#d7cdbb] bg-white shadow-sm">
          <img src={item.image} alt={item.city} className="h-[360px] w-full object-cover" />
          <div className="p-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#c75a3b]">{item.country}</p>
            <h2 className="mt-4 font-display text-5xl leading-none tracking-[-0.05em] text-[#173846]">{item.city}</h2>
            <p className="mt-5 text-base leading-7 text-[#617277]">{item.overview}</p>

            <div className="mt-8">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#c75a3b]">Why travelers choose it</p>
              <ul className="mt-4 space-y-3 text-base leading-7 text-[#173846]">
                {item.whyVisit.map((note) => (
                  <li key={note} className="flex gap-3">
                    <span className="mt-2 h-2.5 w-2.5 rounded-full bg-[#c75a3b]" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="rounded-[30px] bg-[#173846] p-8 text-[#f7edcf] shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#f6c94b]">What we offer</p>
          <ul className="mt-5 space-y-4 text-base leading-7 text-[#f7edcf]/85">
            {item.offers.map((offer) => (
              <li key={offer} className="flex gap-3">
                <span className="mt-2 h-2.5 w-2.5 rounded-full bg-[#f6c94b]" />
                <span>{offer}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 rounded-[24px] border border-[#f7edcf]/15 bg-white/5 p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#f6c94b]">Best for</p>
            <p className="mt-3 text-lg font-semibold text-[#f7edcf]">{item.bestFor}</p>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setLocation(searchHref({ from: 'Amsterdam', to: item.city, departDate: '2026-02-12', returnDate: '2026-02-20', passengers: 2, cabin: 'Economy' }))}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#f6c94b] px-6 py-3 text-sm font-bold text-[#173846]"
            >
              Search flights <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setLocation('/contact')}
              className="inline-flex items-center justify-center rounded-full border border-[#f7edcf]/20 px-6 py-3 text-sm font-bold text-[#f7edcf]"
            >
              Talk to our team
            </button>
            <button
              type="button"
              onClick={() => setLocation(`/checkout?service=destination&item=${encodeURIComponent(`${item.city} trip planning`)}`)}
              className="inline-flex items-center justify-center rounded-full border border-[#f7edcf]/20 px-6 py-3 text-sm font-bold text-[#f7edcf]"
            >
              Request a trip plan
            </button>
          </div>
        </div>
      </div>

      {item.packages && (
        <section className="mt-8">
          <div className="mb-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#c75a3b]">Ways to travel</p>
            <h2 className="mt-3 font-display text-4xl leading-none tracking-[-0.04em] text-[#173846]">Choose your {item.city} rhythm</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {item.packages.map((packageIdea) => (
              <div key={packageIdea.name} className="rounded-[24px] border border-[#d7cdbb] bg-white p-6 shadow-sm">
                <h3 className="font-display text-3xl leading-none tracking-[-0.04em] text-[#173846]">{packageIdea.name}</h3>
                <p className="mt-4 text-sm leading-6 text-[#617277]">{packageIdea.details}</p>
                <button type="button" onClick={() => setLocation(`/checkout?service=destination&item=${encodeURIComponent(`${item.city} - ${packageIdea.name}`)}`)} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#c75a3b]">
                  Plan this trip <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {item.planningNotes && (
        <section className="mt-8 grid gap-8 rounded-[28px] border border-[#d7cdbb] bg-[#f0e6d6] p-8 lg:grid-cols-[0.8fr_1.2fr] lg:p-10">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#c75a3b]">Planning notes</p>
            <h2 className="mt-3 font-display text-4xl leading-none tracking-[-0.04em] text-[#173846]">A better fit for your days</h2>
          </div>
          <ul className="space-y-4 text-base leading-7 text-[#173846]">
            {item.planningNotes.map((note) => (
              <li key={note} className="flex gap-3">
                <Check className="mt-1 h-5 w-5 shrink-0 text-[#c75a3b]" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </PageFrame>
  );
}

function FlightDetailsPage() {
  const [, params] = useRoute('/flight-offers/:id');
  const [location] = useLocation();
  const offer = demoOffers.find((item) => item.id === params?.id) || demoOffers[0];
  const search = buildFlightSearch(new URLSearchParams(location.split('?')[1] || ''));
  const bookingQuery = new URLSearchParams({ from: search.from, to: search.to, depart: search.departDate, return: search.returnDate, passengers: String(search.passengers), cabin: search.cabin });

  return (
    <PageFrame title="Flight details" intro="Review the itinerary, fare and passenger details before sending your booking request. Final availability and price will come from Duffel once connected.">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
        <div className="rounded-[28px] border border-[#d7cdbb] bg-white p-8 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#c75a3b]">Selected flight</p>
          <h2 className="mt-4 font-display text-5xl leading-none tracking-[-0.04em] text-[#173846]">{search.from} to {search.to}</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <div><p className="text-xs uppercase tracking-[0.16em] text-[#617277]">Airline</p><p className="mt-2 text-lg font-bold text-[#173846]">{offer.airline} · {offer.flightNumber}</p></div>
            <div><p className="text-xs uppercase tracking-[0.16em] text-[#617277]">Travel date</p><p className="mt-2 text-lg font-bold text-[#173846]">{search.departDate}</p></div>
            <div><p className="text-xs uppercase tracking-[0.16em] text-[#617277]">Schedule</p><p className="mt-2 text-lg font-bold text-[#173846]">{offer.departTime} - {offer.arriveTime}</p></div>
            <div><p className="text-xs uppercase tracking-[0.16em] text-[#617277]">Stops</p><p className="mt-2 text-lg font-bold text-[#173846]">{offer.stops} · {offer.duration}</p></div>
          </div>
        </div>
        <div className="rounded-[28px] bg-[#173846] p-8 text-[#f7edcf] shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#f6c94b]">Fare summary</p>
          <div className="mt-6 flex items-end justify-between gap-4"><span className="text-[#f7edcf]/70">{search.passengers} traveller{search.passengers === 1 ? '' : 's'}</span><strong className="font-mono-custom text-4xl">€{Number(offer.price.slice(1)) * search.passengers}</strong></div>
          <p className="mt-4 text-sm leading-6 text-[#f7edcf]/70">{offer.cabin} fare. Taxes and live provider conditions will be confirmed during the API-backed booking step.</p>
          <a href={`/book/${offer.id}?${bookingQuery.toString()}`} className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#f6c94b] px-6 py-3 text-sm font-bold text-[#173846]">Continue to booking <ArrowRight className="h-4 w-4" /></a>
        </div>
      </div>
    </PageFrame>
  );
}

function BookingPage() {
  const [, params] = useRoute('/book/:id');
  const [location] = useLocation();
  const search = buildFlightSearch(new URLSearchParams(location.split('?')[1] || ''));
  const offer = demoOffers.find((item) => item.id === params?.id) || demoOffers[0];
  const [submitted, setSubmitted] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [error, setError] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);

  const startPayment = async () => {
    setPaymentLoading(true);
    setPaymentError('');
    try {
      const response = await fetch(`${apiBaseUrl}/api/payments/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, successUrl: `${window.location.origin}/my-trips?payment=success`, cancelUrl: `${window.location.origin}/book/${params?.id}?payment=cancelled` }),
      });
      const result = await response.json() as { checkoutUrl?: string; error?: string };
      if (!response.ok || !result.checkoutUrl) throw new Error(result.error || 'Secure payment is not available yet.');
      window.location.assign(result.checkoutUrl);
    } catch (paymentSubmissionError) {
      setPaymentError(paymentSubmissionError instanceof Error ? paymentSubmissionError.message : 'Secure payment is not available yet.');
    } finally {
      setPaymentLoading(false);
    }
  };

  if (submitted) {
    return <PageFrame title="Request received" intro="Your booking request has been sent to the Flight Right team. We will confirm availability and the next payment step."><div className="rounded-[28px] border border-[#d7cdbb] bg-white p-8 shadow-sm"><Check className="h-10 w-10 text-[#c75a3b]" /><h2 className="mt-5 font-display text-5xl leading-none tracking-[-0.04em] text-[#173846]">We have your details.</h2><p className="mt-4 max-w-2xl text-base leading-7 text-[#617277]">Your reference is <strong>{bookingId}</strong>. Keep it with your email to look up the request later.</p><div className="mt-7 flex flex-wrap gap-3"><button type="button" onClick={startPayment} disabled={paymentLoading} className="rounded-full bg-[#c75a3b] px-6 py-3 text-sm font-bold text-[#fff4e3] disabled:opacity-60">{paymentLoading ? 'Opening payment...' : 'Continue to secure payment'}</button><a href="/my-trips" className="inline-flex rounded-full bg-[#173846] px-6 py-3 text-sm font-bold text-[#f7edcf]">View My Trips</a></div>{paymentError && <p role="alert" className="mt-4 text-sm font-semibold text-[#c75a3b]">{paymentError}</p>}</div></PageFrame>;
  }

  return (
    <PageFrame title="Passenger details" intro="Complete the request form to continue. Payment is intentionally not collected in this prototype; the API integration will add secure Duffel payment handling here.">
      <form onSubmit={async (event) => { event.preventDefault(); setError(''); const form = new FormData(event.currentTarget); try { const response = await fetch(`${apiBaseUrl}/api/bookings`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ offerId: offer.id, firstName: form.get('firstName'), lastName: form.get('lastName'), email: form.get('email'), phone: form.get('phone'), search }) }); if (!response.ok) throw new Error('We could not create the booking request.'); const result = await response.json() as { id: string }; setBookingId(result.id); setSubmitted(true); } catch (submissionError) { setError(submissionError instanceof Error ? submissionError.message : 'We could not create the booking request.'); } }} className="grid gap-8 lg:grid-cols-[1fr_.75fr]">
        <div className="rounded-[28px] border border-[#d7cdbb] bg-white p-8 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#c75a3b]">Lead traveller</p>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <label className="text-sm font-medium text-[#173846]">First name<input required name="firstName" className="mt-2 w-full rounded-2xl border border-[#d7cdbb] bg-[#f7f0e4] px-4 py-3 outline-none" /></label>
            <label className="text-sm font-medium text-[#173846]">Last name<input required name="lastName" className="mt-2 w-full rounded-2xl border border-[#d7cdbb] bg-[#f7f0e4] px-4 py-3 outline-none" /></label>
            <label className="text-sm font-medium text-[#173846] md:col-span-2">Email<input required type="email" className="mt-2 w-full rounded-2xl border border-[#d7cdbb] bg-[#f7f0e4] px-4 py-3 outline-none" placeholder="you@example.com" /></label>
            <label className="text-sm font-medium text-[#173846] md:col-span-2">Phone<input required name="phone" type="tel" className="mt-2 w-full rounded-2xl border border-[#d7cdbb] bg-[#f7f0e4] px-4 py-3 outline-none" placeholder="+31 ..." /></label>
          </div>
          {error && <p role="alert" className="mt-5 text-sm font-semibold text-[#c75a3b]">{error}</p>}
          <button type="submit" className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#c75a3b] px-6 py-3 text-sm font-bold text-[#fff4e3]">Send booking request <ArrowRight className="h-4 w-4" /></button>
        </div>
        <div className="rounded-[28px] bg-[#173846] p-8 text-[#f7edcf] shadow-sm"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#f6c94b]">Your itinerary</p><h2 className="mt-4 font-display text-4xl leading-none">{search.from} to {search.to}</h2><p className="mt-4 text-sm text-[#f7edcf]/70">{offer.airline} · {offer.flightNumber}<br />{search.departDate} · {search.passengers} traveller{search.passengers === 1 ? '' : 's'}</p><div className="mt-8 border-t border-[#f7edcf]/20 pt-5"><span className="text-sm text-[#f7edcf]/70">Estimated total</span><strong className="mt-2 block font-mono-custom text-3xl">€{Number(offer.price.slice(1)) * search.passengers}</strong></div></div>
      </form>
    </PageFrame>
  );
}

function HotelsPage() {
  const listings = [
    { name: 'Nile Grand Palace', city: 'Cairo', price: '€145/night', text: 'Nile view rooms and breakfast included.' },
    { name: 'Bosphorus Pearl Hotel', city: 'Istanbul', price: '€210/night', text: 'Boutique stay in the historical centre.' },
    { name: 'Red Sea Royal Resort', city: 'Hurghada', price: '€165/night', text: 'All-inclusive beach resort with reef access.' },
  ];

  return (
    <PageFrame
      title="Hotels"
      intro="From city-centre stays to resort escapes, we curate accommodations that match your trip style — comfortable, convenient and worth returning to."
    >
      <div className="grid gap-6 md:grid-cols-3">
        {listings.map((item) => (
          <div key={item.name} className="rounded-[24px] border border-[#d7cdbb] bg-white p-6 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#c75a3b]">{item.city}</p>
            <h2 className="mt-4 font-display text-3xl leading-none tracking-[-0.04em] text-[#173846]">{item.name}</h2>
            <p className="mt-4 text-base leading-7 text-[#617277]">{item.text}</p>
            <div className="mt-6 font-mono-custom text-2xl font-bold text-[#173846]">{item.price}</div>
            <a href={`/checkout?service=hotel&item=${encodeURIComponent(item.name)}`} className="mt-6 inline-flex rounded-full bg-[#c75a3b] px-4 py-2 text-xs font-bold text-[#fff4e3]">Check availability</a>
          </div>
        ))}
      </div>
    </PageFrame>
  );
}

function HolidaysPage() {
  const listings = [
    { name: 'Cairo & Nile Explorer', details: '6 nights · flights, hotel & Nile cruise', price: '€899' },
    { name: 'Istanbul Weekend Escape', details: '3 nights · flights & boutique hotel', price: '€349' },
    { name: 'Red Sea Diving Retreat', details: '7 nights · Hurghada resort stay', price: '€749' },
  ];

  return (
    <PageFrame
      title="Holidays"
      intro="Holiday packages should feel easy to choose and even easier to enjoy. We combine the essentials — flights, stays, transfers and activities — into one complete trip plan."
    >
      <div className="grid gap-6 md:grid-cols-3">
        {listings.map((item) => (
          <div key={item.name} className="rounded-[24px] border border-[#d7cdbb] bg-white p-6 shadow-sm">
            <div className="mb-5 inline-flex rounded-full bg-[#173846]/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#173846]">Holiday</div>
            <h2 className="font-display text-4xl leading-[0.95] tracking-[-0.04em] text-[#173846]">{item.name}</h2>
            <p className="mt-4 text-base leading-7 text-[#617277]">{item.details}</p>
            <div className="mt-6 font-mono-custom text-2xl font-bold text-[#173846]">{item.price}</div>
            <a href={`/checkout?service=holiday&item=${encodeURIComponent(item.name)}`} className="mt-6 inline-flex rounded-full bg-[#173846] px-4 py-2 text-xs font-bold text-[#f7edcf]">Explore package</a>
          </div>
        ))}
      </div>
    </PageFrame>
  );
}

function ToursPage() {
  const listings = [
    { name: 'Pyramids & Sphinx Private Tour', price: '€85', text: 'Half-day · private guide · Cairo' },
    { name: 'Cappadocia Sunrise Balloon Flight', price: '€175', text: '1 hour · hotel pickup' },
    { name: 'Bosphorus Dinner Cruise', price: '€65', text: 'Evening · music and sparkling views' },
  ];

  return (
    <PageFrame
      title="Tours"
      intro="The best trips are shaped by the moments between the must-sees. We offer tours that add context, comfort and a deeper connection to the places you visit."
    >
      <div className="grid gap-6 md:grid-cols-3">
        {listings.map((item) => (
          <div key={item.name} className="rounded-[24px] border border-[#d7cdbb] bg-white p-6 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#c75a3b]">Experience</p>
            <h2 className="mt-4 font-display text-3xl leading-none tracking-[-0.04em] text-[#173846]">{item.name}</h2>
            <p className="mt-4 text-base leading-7 text-[#617277]">{item.text}</p>
            <div className="mt-6 font-mono-custom text-2xl font-bold text-[#173846]">{item.price}</div>
            <a href={`/checkout?service=tour&item=${encodeURIComponent(item.name)}`} className="mt-6 inline-flex rounded-full bg-[#c75a3b] px-4 py-2 text-xs font-bold text-[#fff4e3]">View itinerary</a>
          </div>
        ))}
      </div>
    </PageFrame>
  );
}

function TransfersPage() {
  const items = [
    { title: 'Airport transfers', text: 'Private pickup and drop-off across major arrival points in Egypt, Türkiye and the Netherlands.' },
    { title: 'Intercity transfers', text: 'Comfortable door-to-door transport between cities and key regional hubs.' },
    { title: 'Private chauffeur', text: 'Flexible travel for families, small groups and business schedules.' },
  ];

  return (
    <PageFrame
      title="Transfers"
      intro="Smooth ground travel matters as much as the flight itself. We arrange reliable transfers that keep your itinerary calm from arrival to final destination."
    >
      <div className="grid gap-6 md:grid-cols-3">
        {items.map((item) => (
          <div key={item.title} className="rounded-[24px] border border-[#d7cdbb] bg-white p-6 shadow-sm">
            <h2 className="font-display text-3xl leading-none tracking-[-0.04em] text-[#173846]">{item.title}</h2>
            <p className="mt-4 text-base leading-7 text-[#617277]">{item.text}</p>
            <a href={`/checkout?service=transfer&item=${encodeURIComponent(item.title)}`} className="mt-6 inline-flex rounded-full bg-[#173846] px-4 py-2 text-xs font-bold text-[#f7edcf]">Request transfer</a>
          </div>
        ))}
      </div>
    </PageFrame>
  );
}

const serviceCatalog: Record<string, {
  title: string;
  intro: string;
  items: { title: string; text: string }[];
}> = {
  'group-trips': {
    title: 'Group trips',
    intro: 'Plan a shared journey with the flights, stays, transfers and activities coordinated around your group size, budget and preferred pace.',
    items: [
      { title: 'Shared departures', text: 'We help coordinate routes, dates and arrival plans for families, friends, clubs and company groups.' },
      { title: 'Built-to-fit itineraries', text: 'Choose a guided program, a relaxed city break or a mix of planned experiences and free time.' },
      { title: 'One point of contact', text: 'Keep questions, booking details and changes in one place while the trip comes together.' },
    ],
  },
  honeymoon: {
    title: 'Honeymoon and private trips',
    intro: 'Create a private escape with thoughtful flight choices, comfortable stays and experiences shaped around your celebration.',
    items: [
      { title: 'Romantic city breaks', text: 'Istanbul, European cities and other culture-rich destinations for couples who want a little of everything.' },
      { title: 'Beach and resort stays', text: 'Relaxed Red Sea and coastal options with room for rest, dining and easy excursions.' },
      { title: 'Personal planning', text: 'Tell us your dates, budget and travel style and we will shape the right combination for you.' },
    ],
  },
  visa: {
    title: 'Visa support',
    intro: 'Get practical guidance for preparing a visa application, checking document requirements and arranging an appointment where available.',
    items: [
      { title: 'Document checklist', text: 'Understand the supporting documents, travel details and personal information normally required for your destination.' },
      { title: 'Appointment guidance', text: 'We help you prepare for the appointment process and keep your travel plan aligned with the expected timeline.' },
      { title: 'Travel planning together', text: 'Pair your visa support request with flight planning, accommodation and a clear trip outline.' },
    ],
  },
  egypt: {
    title: 'Discover Egypt',
    intro: 'Build an Egypt journey across Cairo, the Nile, Luxor, Aswan and the Red Sea with culture, history and time to unwind.',
    items: [
      { title: 'Cairo and the pyramids', text: 'Explore the Giza plateau, museums, historic neighbourhoods and local food with a practical city plan.' },
      { title: 'Nile and ancient Egypt', text: 'Combine Luxor and Aswan with a multi-day route through temples, river scenery and landmark history.' },
      { title: 'Red Sea escapes', text: 'Add Hurghada or Sharm El Sheikh for reef time, resort comfort and a slower finish to the journey.' },
    ],
  },
  'work-abroad': {
    title: 'Work and study abroad',
    intro: 'Start with practical planning support for international work or study journeys, from destination research to travel preparation and document guidance.',
    items: [
      { title: 'Destination planning', text: 'Compare possible destinations, travel timing and the practical steps involved before you commit to a move.' },
      { title: 'Travel preparation', text: 'Coordinate flights, temporary accommodation and an arrival plan around your confirmed work or study arrangements.' },
      { title: 'Document guidance', text: 'Understand which official organisations and documents you may need to check. Approval always remains with the relevant authorities.' },
    ],
  },
};

function ServiceCategoryPage() {
  const [, params] = useRoute('/services/:slug');
  const slug = params?.slug || 'group-trips';
  const service = serviceCatalog[slug] || serviceCatalog['group-trips'];

  return (
    <PageFrame title={service.title} intro={service.intro}>
      <div className="grid gap-6 md:grid-cols-3">
        {service.items.map((item) => (
          <div key={item.title} className="rounded-[24px] border border-[#d7cdbb] bg-white p-6 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#c75a3b]">Flight Right service</p>
            <h2 className="mt-4 font-display text-3xl leading-none tracking-[-0.04em] text-[#173846]">{item.title}</h2>
            <p className="mt-4 text-base leading-7 text-[#617277]">{item.text}</p>
            <a href={`/checkout?service=${slug}&item=${encodeURIComponent(item.title)}`} className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#c75a3b] px-5 py-3 text-sm font-bold text-[#fff4e3]">
              Start planning <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        ))}
      </div>
      <div className="mt-8 rounded-[28px] bg-[#173846] p-8 text-[#f7edcf] lg:p-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#f6c94b]">Personal support</p>
        <h2 className="mt-4 max-w-2xl font-display text-4xl leading-none tracking-[-0.04em]">Tell us what you need and we will prepare the next step.</h2>
        <a href={`/checkout?service=${slug}`} className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#f6c94b] px-6 py-3 text-sm font-bold text-[#173846]">Request a plan <ArrowRight className="h-4 w-4" /></a>
      </div>
    </PageFrame>
  );
}

function ServiceCheckoutPage() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split('?')[1] || '');
  const service = params.get('service') || 'travel service';
  const item = params.get('item') || 'Custom trip request';
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (submitted) {
    return (
      <PageFrame title="Request received" intro="Your Flight Right request is ready for review. Our team will confirm availability, pricing and the next payment step before anything is charged.">
        <div className="rounded-[28px] border border-[#d7cdbb] bg-white p-8 shadow-sm">
          <Check className="h-10 w-10 text-[#c75a3b]" />
          <h2 className="mt-5 font-display text-5xl leading-none tracking-[-0.04em] text-[#173846]">We have your request.</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#617277]">We will contact you about {item.toLowerCase()} and confirm the live options before payment. Secure card checkout will be enabled when the payment key is added.</p>
          <a href="/" className="mt-7 inline-flex rounded-full bg-[#173846] px-6 py-3 text-sm font-bold text-[#f7edcf]">Back home</a>
        </div>
      </PageFrame>
    );
  }

  return (
    <PageFrame title="Complete your request" intro="Share the details below and Flight Right will prepare a live quote or booking option. No payment is collected until the itinerary and provider conditions are confirmed.">
      <form onSubmit={async (event) => { event.preventDefault(); setError(''); const form = new FormData(event.currentTarget); try { const response = await fetch(`${apiBaseUrl}/api/service-requests`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ service, item, name: form.get('name'), email: form.get('email'), phone: form.get('phone'), details: form.get('details') }) }); if (!response.ok) throw new Error('We could not send this request. Please try again.'); setSubmitted(true); } catch (submissionError) { setError(submissionError instanceof Error ? submissionError.message : 'We could not send this request. Please try again.'); } }} className="grid gap-8 lg:grid-cols-[1fr_.75fr]">
        <div className="rounded-[28px] border border-[#d7cdbb] bg-white p-8 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#c75a3b]">Traveller details</p>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <label className="text-sm font-medium text-[#173846]">Full name<input required name="name" className="mt-2 w-full rounded-2xl border border-[#d7cdbb] bg-[#f7f0e4] px-4 py-3 outline-none" placeholder="Your name" /></label>
            <label className="text-sm font-medium text-[#173846]">Email<input required name="email" type="email" className="mt-2 w-full rounded-2xl border border-[#d7cdbb] bg-[#f7f0e4] px-4 py-3 outline-none" placeholder="you@example.com" /></label>
            <label className="text-sm font-medium text-[#173846] md:col-span-2">Phone<input required name="phone" type="tel" className="mt-2 w-full rounded-2xl border border-[#d7cdbb] bg-[#f7f0e4] px-4 py-3 outline-none" placeholder="+31 ..." /></label>
            <label className="text-sm font-medium text-[#173846] md:col-span-2">Travel dates and group size<textarea required name="details" rows={4} className="mt-2 w-full rounded-2xl border border-[#d7cdbb] bg-[#f7f0e4] px-4 py-3 outline-none" placeholder="Tell us your dates, destination, number of travellers and preferences" /></label>
          </div>
          {error && <p role="alert" className="mt-5 text-sm font-semibold text-[#c75a3b]">{error}</p>}
          <button type="submit" className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#c75a3b] px-6 py-3 text-sm font-bold text-[#fff4e3]">Send request <ArrowRight className="h-4 w-4" /></button>
        </div>
        <div className="rounded-[28px] bg-[#173846] p-8 text-[#f7edcf] shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#f6c94b]">Selected service</p>
          <h2 className="mt-4 font-display text-4xl leading-none">{item}</h2>
          <p className="mt-4 text-sm leading-6 text-[#f7edcf]/70">{service.replace(/-/g, ' ')} · Flight Right planning request</p>
          <div className="mt-8 border-t border-[#f7edcf]/20 pt-5 text-sm leading-6 text-[#f7edcf]/70">We will confirm live availability, inclusions, cancellation terms and payment options before proceeding.</div>
        </div>
      </form>
    </PageFrame>
  );
}

function PartnerMarketplacePage() {
  return (
    <PageFrame title="Partner marketplace" intro="Explore selected hotels, tours, experiences and transfer services that can be added to a Flight Right itinerary. We confirm each request with the provider before payment.">
      <div className="mb-8 flex flex-col gap-5 rounded-[28px] bg-[#173846] p-8 text-[#f7edcf] lg:flex-row lg:items-end lg:justify-between lg:p-10">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#f6c94b]">For travellers</p>
          <h2 className="mt-4 max-w-2xl font-display text-4xl leading-none tracking-[-0.04em]">Add the right local details to your trip.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-[#f7edcf]/70">Choose a service below or ask us to combine several into one route plan.</p>
        </div>
        <a href="/partners/apply" className="inline-flex shrink-0 rounded-full bg-[#f6c94b] px-6 py-3 text-sm font-bold text-[#173846]">Become a partner</a>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {partnerListings.map((listing) => (
          <div key={listing.id} className="rounded-[26px] border border-[#d7cdbb] bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#c75a3b]">{listing.category}</p>
              <span className="rounded-full bg-[#f0e6d6] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#173846]">Partner offer</span>
            </div>
            <h2 className="mt-4 font-display text-4xl leading-none tracking-[-0.04em] text-[#173846]">{listing.name}</h2>
            <p className="mt-2 text-sm font-semibold text-[#173846]">{listing.location}</p>
            <p className="mt-4 max-w-xl text-base leading-7 text-[#617277]">{listing.detail}</p>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[#d7cdbb] pt-5">
              <span className="font-mono-custom text-xl font-bold text-[#173846]">{listing.price}</span>
              <a href={`/checkout?service=partner&item=${encodeURIComponent(listing.name)}`} className="inline-flex items-center gap-2 rounded-full bg-[#c75a3b] px-5 py-3 text-sm font-bold text-[#fff4e3]">Request this service <ArrowRight className="h-4 w-4" /></a>
            </div>
          </div>
        ))}
      </div>
    </PageFrame>
  );
}

function PartnerApplicationPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (submitted) {
    return (
      <PageFrame title="Partner request received" intro="Thank you. The Flight Right team will review your service details and contact you about the next onboarding step.">
        <div className="rounded-[28px] border border-[#d7cdbb] bg-white p-8 shadow-sm">
          <Check className="h-10 w-10 text-[#c75a3b]" />
          <h2 className="mt-5 font-display text-5xl leading-none tracking-[-0.04em] text-[#173846]">Your service is in review.</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#617277]">We will confirm the listing requirements, commercial terms and availability before your offer is shown to travellers.</p>
          <a href="/partners" className="mt-7 inline-flex rounded-full bg-[#173846] px-6 py-3 text-sm font-bold text-[#f7edcf]">View marketplace</a>
        </div>
      </PageFrame>
    );
  }

  return (
    <PageFrame title="List your service" intro="Hotels, guides, tour operators and transfer providers can apply to join the Flight Right partner network. Start with your business details and the service you want to offer.">
      <form onSubmit={async (event) => { event.preventDefault(); setError(''); const form = new FormData(event.currentTarget); try { const response = await fetch(`${apiBaseUrl}/api/partner-applications`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ business: form.get('business'), email: form.get('email'), type: form.get('type'), location: form.get('location'), details: form.get('details') }) }); if (!response.ok) throw new Error('We could not submit your partner request. Please try again.'); setSubmitted(true); } catch (submissionError) { setError(submissionError instanceof Error ? submissionError.message : 'We could not submit your partner request. Please try again.'); } }} className="grid gap-8 lg:grid-cols-[1fr_.75fr]">
        <div className="rounded-[28px] border border-[#d7cdbb] bg-white p-8 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#c75a3b]">Business information</p>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <label className="text-sm font-medium text-[#173846]">Business name<input required name="business" className="mt-2 w-full rounded-2xl border border-[#d7cdbb] bg-[#f7f0e4] px-4 py-3 outline-none" placeholder="Your business" /></label>
            <label className="text-sm font-medium text-[#173846]">Contact email<input required name="email" type="email" className="mt-2 w-full rounded-2xl border border-[#d7cdbb] bg-[#f7f0e4] px-4 py-3 outline-none" placeholder="you@example.com" /></label>
            <label className="text-sm font-medium text-[#173846]">Service type<select required name="type" className="mt-2 w-full rounded-2xl border border-[#d7cdbb] bg-[#f7f0e4] px-4 py-3 outline-none"><option value="">Choose one</option><option>Accommodation</option><option>Guided experiences</option><option>Tours</option><option>Transfers</option><option>Other travel service</option></select></label>
            <label className="text-sm font-medium text-[#173846]">Main location<input required name="location" className="mt-2 w-full rounded-2xl border border-[#d7cdbb] bg-[#f7f0e4] px-4 py-3 outline-none" placeholder="City and country" /></label>
            <label className="text-sm font-medium text-[#173846] md:col-span-2">Tell us about your offer<textarea required name="details" rows={5} className="mt-2 w-full rounded-2xl border border-[#d7cdbb] bg-[#f7f0e4] px-4 py-3 outline-none" placeholder="Describe your service, capacity, typical price and preferred travellers" /></label>
          </div>
          {error && <p role="alert" className="mt-5 text-sm font-semibold text-[#c75a3b]">{error}</p>}
          <button type="submit" className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#c75a3b] px-6 py-3 text-sm font-bold text-[#fff4e3]">Submit partner request <ArrowRight className="h-4 w-4" /></button>
        </div>
        <div className="rounded-[28px] bg-[#173846] p-8 text-[#f7edcf] shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#f6c94b]">How it works</p>
          <ol className="mt-5 space-y-5 text-sm leading-6 text-[#f7edcf]/80">
            <li><strong className="text-[#f7edcf]">01. Apply.</strong> Share your business and service details.</li>
            <li><strong className="text-[#f7edcf]">02. Review.</strong> We check fit, availability and listing information.</li>
            <li><strong className="text-[#f7edcf]">03. Publish.</strong> Approved offers can be requested by Flight Right travellers.</li>
            <li><strong className="text-[#f7edcf]">04. Confirm.</strong> We coordinate the request and provider terms before payment.</li>
          </ol>
        </div>
      </form>
    </PageFrame>
  );
}

function B2BPage() {
  const features = [
    'Flight search support for B2B partners',
    'Flexible pricing and allocation on selected routes',
    'Dedicated support for corporate and travel trade clients',
    'Fast, reliable communication and booking coordination',
  ];

  return (
    <PageFrame
      title="B2B"
      intro="We partner with travel agents, corporate planners and destination specialists to deliver dependable flight options, route support and consistent service standards across Europe, Egypt and Türkiye."
    >
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-[#d7cdbb] bg-white p-8 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#c75a3b]">Why partner with us</p>
          <ul className="mt-5 space-y-4 text-base leading-7 text-[#173846]">
            {features.map((feature) => (
              <li key={feature} className="flex gap-3">
                <span className="mt-2 h-2.5 w-2.5 rounded-full bg-[#c75a3b]" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[28px] bg-[#173846] p-8 text-[#f7edcf] shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#f6c94b]">Partner contact</p>
          <h2 className="mt-4 font-display text-4xl leading-[0.95] tracking-[-0.04em]">Business enquiries</h2>
          <div className="mt-6 space-y-3 text-sm text-[#f7edcf]/80">
            <p>Email: {contactEmail}</p>
            <p>Phone: {contactPhone}</p>
            <p>Amsterdam · Cairo · Istanbul</p>
          </div>
          <a href="/contact?subject=Business%20partnership%20enquiry" className="mt-8 inline-flex rounded-full bg-[#f6c94b] px-6 py-3 text-sm font-bold text-[#173846]">Contact sales</a>
        </div>
      </div>
    </PageFrame>
  );
}

function HelpCenterPage() {
  const faq = [
    { question: 'Can I change my flight after booking?', answer: 'Yes, depending on fare conditions and airline policy. Our support team can guide you through the available options and any extra costs.' },
    { question: 'Can I request help with a group flight?', answer: 'Yes. Contact our team with your route, dates and group size. The API-ready booking flow will pass the request to our support team for review.' },
    { question: 'How do I manage my itineraries?', answer: 'Use the My Trips section to review upcoming journeys, saved ideas and important travel details in one place.' },
  ];

  return (
    <PageFrame
      title="Help center"
      intro="Need guidance before or during a trip? We’ve gathered the most common travel questions and practical answers to make booking and planning easier."
    >
      <div className="space-y-6">
        {faq.map((item) => (
          <div key={item.question} className="rounded-[24px] border border-[#d7cdbb] bg-white p-6 shadow-sm">
            <h2 className="font-display text-3xl leading-none tracking-[-0.04em] text-[#173846]">{item.question}</h2>
            <p className="mt-4 text-base leading-7 text-[#617277]">{item.answer}</p>
          </div>
        ))}
      </div>
    </PageFrame>
  );
}

function MyTripsPage() {
  const [searched, setSearched] = useState(false);
  const [trips, setTrips] = useState<Array<{ id: string; status: string }>>([]);
  const [error, setError] = useState('');

  return (
    <PageFrame
      title="My Trips"
      intro="Your requested flights and booking details will appear here once the live account and Duffel order connection is enabled."
    >
      <div className="rounded-[28px] border border-[#d7cdbb] bg-white p-8 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#c75a3b]">Find a booking</p>
        <h2 className="mt-4 font-display text-4xl leading-none tracking-[-0.04em] text-[#173846]">Look up your trip</h2>
        <form onSubmit={async (event) => { event.preventDefault(); setError(''); const form = new FormData(event.currentTarget); try { const response = await fetch(`${apiBaseUrl}/api/trips/lookup`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reference: form.get('reference'), email: form.get('email') }) }); if (!response.ok) throw new Error('Trip lookup failed.'); const result = await response.json() as { trips: Array<{ id: string; status: string }> }; setTrips(result.trips); setSearched(true); } catch (lookupError) { setError(lookupError instanceof Error ? lookupError.message : 'Trip lookup failed.'); } }} className="mt-6 grid gap-4 md:grid-cols-[1fr_1fr_auto]">
          <input required name="reference" placeholder="Booking reference" className="rounded-2xl border border-[#d7cdbb] bg-[#f7f0e4] px-4 py-3 text-sm outline-none" />
          <input required name="email" type="email" placeholder="Booking email" className="rounded-2xl border border-[#d7cdbb] bg-[#f7f0e4] px-4 py-3 text-sm outline-none" />
          <button type="submit" className="rounded-full bg-[#173846] px-6 py-3 text-sm font-bold text-[#f7edcf]">Find trip</button>
        </form>
        {error && <p role="alert" className="mt-5 text-sm font-semibold text-[#c75a3b]">{error}</p>}
        {searched && <p className="mt-5 text-sm font-semibold text-[#c75a3b]">{trips.length ? trips.map((trip) => `${trip.id}: ${trip.status}`).join(' · ') : 'No booking found for those details.'}</p>}
      </div>
    </PageFrame>
  );
}

function TermsPage() {
  return (
    <PageFrame
      title="Terms of service"
      intro="These terms explain how we provide travel services and what is expected of both travelers and the Flight Right team when planning a booking or itinerary."
    >
      <div className="space-y-6 rounded-[28px] border border-[#d7cdbb] bg-white p-8 shadow-sm">
        <div>
          <h2 className="font-display text-3xl leading-none tracking-[-0.04em] text-[#173846]">Booking responsibilities</h2>
          <p className="mt-3 text-base leading-7 text-[#617277]">Travelers are responsible for providing accurate personal, travel and payment information at the time of booking. We rely on this to confirm reservations and support any changes or requests.</p>
        </div>
        <div>
          <h2 className="font-display text-3xl leading-none tracking-[-0.04em] text-[#173846]">Service availability</h2>
          <p className="mt-3 text-base leading-7 text-[#617277]">Flight Right provides information, booking support and travel coordination services. Availability and pricing are subject to change based on provider schedules, supplier policies and market conditions.</p>
        </div>
        <div>
          <h2 className="font-display text-3xl leading-none tracking-[-0.04em] text-[#173846]">Liability and support</h2>
          <p className="mt-3 text-base leading-7 text-[#617277]">We aim to provide accurate guidance and responsive support throughout the booking journey. For operational issues outside our control, the relevant airline, hotel or service provider remains responsible for their own policies.</p>
        </div>
      </div>
    </PageFrame>
  );
}

function PrivacyPage() {
  return (
    <PageFrame
      title="Privacy policy"
      intro="We respect the trust you place in us when you share your travel information. This policy explains how we collect, use and protect personal data in connection with booking services."
    >
      <div className="space-y-6 rounded-[28px] border border-[#d7cdbb] bg-white p-8 shadow-sm">
        <div>
          <h2 className="font-display text-3xl leading-none tracking-[-0.04em] text-[#173846]">What we collect</h2>
          <p className="mt-3 text-base leading-7 text-[#617277]">We may collect contact details, travel preferences, payment information, trip history and information from service providers necessary to complete your booking.</p>
        </div>
        <div>
          <h2 className="font-display text-3xl leading-none tracking-[-0.04em] text-[#173846]">How we use it</h2>
          <p className="mt-3 text-base leading-7 text-[#617277]">We use this information to manage bookings, tailor recommendations, provide customer support and improve the quality of our travel services.</p>
        </div>
        <div>
          <h2 className="font-display text-3xl leading-none tracking-[-0.04em] text-[#173846]">Your choices</h2>
          <p className="mt-3 text-base leading-7 text-[#617277]">You can request access to your personal data, correct inaccurate details or ask us to stop communication from us at any time by contacting our support team.</p>
        </div>
      </div>
    </PageFrame>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/about" component={AboutPage} />
        <Route path="/careers" component={CareersPage} />
        <Route path="/press" component={PressPage} />
        <Route path="/contact" component={ContactPage} />
        <Route path="/destination/:slug" component={DestinationDetailPage} />
        <Route path="/flight-offers/:id" component={FlightDetailsPage} />
        <Route path="/book/:id" component={BookingPage} />
        <Route path="/checkout" component={ServiceCheckoutPage} />
        <Route path="/partners" component={PartnerMarketplacePage} />
        <Route path="/partners/apply" component={PartnerApplicationPage} />
        <Route path="/flights" component={FlightsPage} />
        <Route path="/hotels" component={HotelsPage} />
        <Route path="/holidays" component={HolidaysPage} />
        <Route path="/tours" component={ToursPage} />
        <Route path="/transfers" component={TransfersPage} />
        <Route path="/services/:slug" component={ServiceCategoryPage} />
        <Route path="/b2b" component={B2BPage} />
        <Route path="/help-center" component={HelpCenterPage} />
        <Route path="/my-trips" component={MyTripsPage} />
        <Route path="/terms" component={TermsPage} />
        <Route path="/privacy" component={PrivacyPage} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return <LanguageProvider><QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><WhatsAppButton /><Toaster /></TooltipProvider></QueryClientProvider></LanguageProvider>;
}

export default App;