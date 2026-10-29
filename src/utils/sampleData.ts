import { randomizeQuestionsAndOptions } from './parser';

const RAW_MATH_TRIGONOMETRY = [
  { q: "यदि $z = \\cos\\theta + i\\sin\\theta$ है, तो $z^n + z^{-n}$ किसके बराबर है?", o: ["$2\\sin(n\\theta)$", "$2i\\sin(n\\theta)$", "$2\\cos(n\\theta)$", "$2i\\cos(n\\theta)$"], a: 2 },
  { q: "यदि $\\tan\\theta = \\frac{3}{4}$ है, तो $\\frac{1 - \\cos^2\\theta}{1 + \\sin^2\\theta}$ का मान क्या होगा?", o: ["$\\frac{16}{25}$", "$\\frac{9}{34}$", "$\\frac{9}{25}$", "$\\frac{25}{34}$"], a: 1 },
  { q: "सीमा $\\lim_{x \\to 0} \\frac{\\sin(5x)}{x}$ का मान क्या है?", o: ["$0$", "$1$", "$\\infty$", "$5$"], a: 3 },
  { q: "समाकलन $\\int \\frac{1}{1 + x^2} \\, dx$ का मान किसके बराबर होता है?", o: ["$\\tan^{-1}(x) + C$", "$\\sin^{-1}(x) + C$", "$\\ln|1 + x^2| + C$", "$\\frac{1}{2x} + C$"], a: 0 },
  { q: "यदि आव्यूह $A = \\begin{pmatrix} 2 & 3 \\\\ 1 & 4 \\end{pmatrix}$ है, तो सारणिक $\\det(A)$ का मान क्या होगा?", o: ["$8$", "$11$", "$6$", "$5$"], a: 3 },
  { q: "समीकरण $x^2 - 5x + 6 = 0$ के मूलों का योग और गुणनफल क्रमशः क्या हैं?", o: ["$-5$ और $6$", "$5$ और $6$", "$6$ और $5$", "$2$ और $3$"], a: 1 },
  { q: "व्यंजक $\\sqrt{\\frac{1 - \\cos(2\\theta)}{2}}$ किसके समतुल्य है, जहाँ $0 < \\theta < \\frac{\\pi}{2}$?", o: ["$\\sin\\theta$", "$\\cos\\theta$", "$\\tan\\theta$", "$\\sec\\theta$"], a: 0 },
  { q: "द्विपद प्रमेय के अनुसार $(1 + x)^n$ के प्रसार में पदों की कुल संख्या कितनी होती है?", o: ["$n$", "$n - 1$", "$n + 1$", "$2n$"], a: 2 },
  { q: "यदि सदिश $\\vec{a} = 2\\hat{i} + 3\\hat{j}$ और $\\vec{b} = 4\\hat{i} - \\hat{j}$ हैं, तो अदिश गुणनफल $\\vec{a} \\cdot \\vec{b}$ क्या होगा?", o: ["$11$", "$5$", "$8$", "$3$"], a: 1 },
  { q: "फलन $f(x) = x^3 - 3x^2 + 4$ का अवकलज $f'(x)$ शून्य किस मान पर होगा?", o: ["$x = 1$ तथा $x = 3$", "$x = -1$ तथा $x = 2$", "$x = 0$ तथा $x = -2$", "$x = 0$ तथा $x = 2$"], a: 3 },
  { q: "श्रेणी $\\sum_{k=1}^{n} k = 1 + 2 + 3 + \\dots + n$ का योगफल सूत्र क्या है?", o: ["$\\frac{n(n + 1)}{2}$", "$\\frac{n(n + 1)(2n + 1)}{6}$", "$\\left[\\frac{n(n + 1)}{2}\\right]^2$", "$n^2$"], a: 0 },
  { q: "यदि $\\log_{10}(x) = 3$ है, तो $x$ का मान क्या होगा?", o: ["$30$", "$100$", "$1000$", "$300$"], a: 2 },
  { q: "वृत्त के समीकरण $x^2 + y^2 = 25$ की त्रिज्या $r$ क्या होगी?", o: ["$25$", "$\\sqrt{5}$", "$10$", "$5$"], a: 3 },
  { q: "समाकलन $\\int_{0}^{\\pi/2} \\cos(x) \\, dx$ का निश्चित मान क्या है?", o: ["$0$", "$1$", "$-1$", "$\\frac{\\pi}{2}$"], a: 1 },
  { q: "यदि गुणोत्तर श्रेणी का प्रथम पद $a = 3$ तथा सार्व अनुपात $r = 2$ है, तो चौथा पद $T_4$ क्या होगा?", o: ["$24$", "$18$", "$12$", "$48$"], a: 0 },
  { q: "अवकल समीकरण $\\frac{dy}{dx} = 2x$ का व्यापक हल क्या है?", o: ["$y = 2x^2 + C$", "$y = x + C$", "$y = x^2 + C$", "$y = \\frac{x^2}{2} + C$"], a: 2 },
  { q: "त्रिभुज के कोणों का अनुपात $1 : 2 : 3$ है। सबसे बड़े कोण का मान रेडियन में क्या होगा?", o: ["$\\frac{\\pi}{6}$", "$\\frac{\\pi}{2}$", "$\\frac{\\pi}{3}$", "$\\frac{2\\pi}{3}$"], a: 1 },
  { q: "यदि $P(A) = 0.4$, $P(B) = 0.5$ तथा घटनाएँ स्वतंत्र हैं, तो $P(A \\cap B)$ का मान क्या होगा?", o: ["$0.9$", "$0.1$", "$0.02$", "$0.2$"], a: 3 },
  { q: "फलन $y = \\sin(2x)$ का आवर्तकाल (Period) क्या है?", o: ["$\\pi$", "$2\\pi$", "$\\frac{\\pi}{2}$", "$4\\pi$"], a: 0 },
  { q: "यदि सम्मिश्र संख्या $z = 1 + i\\sqrt{3}$ है, तो इसका मापांक $|z|$ क्या होगा?", o: ["$1$", "$4$", "$2$", "$\\sqrt{2}$"], a: 2 },
];

const RAW_BHIMBETKA = [
  { q: "भीमबेटका की गुफाएँ भारत के किस राज्य में स्थित हैं?", o: ["राजस्थान", "मध्य प्रदेश", "उत्तर प्रदेश", "महाराष्ट्र"], a: 1 },
  { q: "भीमबेटका के शैलचित्रों की खोज किस भारतीय पुरातत्वविद् ने की थी?", o: ["दयाराम साहनी", "राखालदास बनर्जी", "सर जॉन मार्शल", "डॉ. विष्णु श्रीधर वाकणकर"], a: 3 },
  { q: "भीमबेटका की गुफाओं की खोज किस वर्ष में हुई थी?", o: ["1921 ई.", "1947 ई.", "1957-58 ई.", "1974 ई."], a: 2 },
  { q: "यूनेस्को (UNESCO) ने भीमबेटका को किस वर्ष विश्व धरोहर स्थल घोषित किया?", o: ["2003", "1999", "2007", "2010"], a: 0 },
  { q: "भीमबेटका मध्य प्रदेश के किस जिले में स्थित है?", o: ["भोपाल", "सीहोर", "रायसेन", "विदिशा"], a: 2 },
  { q: "भीमबेटका किस पर्वत श्रृंखला की तलहटी में स्थित है?", o: ["विंध्याचल पर्वतमाला", "सतपुड़ा पर्वतमाला", "अरावली पर्वतमाला", "पश्चिमी घाट"], a: 0 },
  { q: "भीमबेटका के शैलचित्र मुख्यतः किस ऐतिहासिक काल से संबंधित हैं?", o: ["हड़प्पा काल", "वैदिक काल", "मौर्य काल", "पुरापाषाण एवं मध्यपाषाण काल"], a: 3 },
  { q: "भीमबेटका नाम का संबंध महाभारत के किस पात्र से माना जाता है?", o: ["अर्जुन", "भीम", "युधिष्ठिर", "दुर्योधन"], a: 1 },
  { q: "भीमबेटका के चित्रों में किन रंगों का सर्वाधिक प्रयोग किया गया है?", o: ["नीला और पीला", "हरा और काला", "सफेद और लाल/गेरुआ", "बैंगनी और नारंगी"], a: 2 },
  { q: "भीमबेटका में लाल रंग बनाने के लिए आदिमानव किस खनिज का उपयोग करते थे?", o: ["हेमेटाइट (गेरू)", "चाक", "तांबा", "कोयला"], a: 0 },
  { q: "भीमबेटका के शैलचित्रों का मुख्य विषय क्या है?", o: ["राजदरबार के दृश्य", "मंदिर निर्माण", "युद्ध नौसेना", "शिकार, नृत्य एवं दैनिक जीवन"], a: 3 },
  { q: "भीमबेटका में कुल लगभग कितने शैलाश्रय (Rock Shelters) पहचाने गए हैं?", o: ["लगभग 100", "लगभग 750 से अधिक", "लगभग 250", "लगभग 2000"], a: 1 },
  { q: "भीमबेटका के सबसे प्रसिद्ध शैल आश्रय को क्या नाम दिया गया है जहाँ एक बड़ा सभागार जैसा स्थल है?", o: ["ऑडिटोरियम गुफा (Auditorium Cave)", "भीम बैठक", "इंद्र सभा", "रंगमहल"], a: 0 },
  { q: "भीमबेटका क्षेत्र किस वन्यजीव अभयारण्य के अंतर्गत आता है?", o: ["कान्हा राष्ट्रीय उद्यान", "बांधवगढ़ अभयारण्य", "रातापानी वन्यजीव अभयारण्य", "पेंच राष्ट्रीय उद्यान"], a: 2 },
  { q: "भीमबेटका की 'Zoo Rock' (चिड़ियाघर चट्टान) पर कितने जानवरों के चित्र अंकित हैं?", o: ["केवल 5 प्रकार के", "1000 से अधिक", "केवल पक्षियों के", "लगभग 252 जानवरों के चित्र"], a: 3 },
  { q: "भीमबेटका की चित्रकला किस प्रकार की कला का प्राचीनतम प्रमाण प्रस्तुत करती है?", o: ["मुगल चित्रकला", "भारतीय उपमहाद्वीप में मानव जीवन के आरंभिक पदचिह्न", "कांगड़ा शैली", "तंजावुर चित्रकला"], a: 1 },
  { q: "भीमबेटका के चित्रों में रंगों को स्थायी बनाने के लिए संभवतः किसका मिश्रण किया जाता था?", o: ["रासायनिक वार्निश", "आधुनिक एक्रिलिक", "पशु चर्बी एवं पेड़ों का गोंद", "तेल के रंग"], a: 2 },
  { q: "भीमबेटका भोपाल से दक्षिण-पूर्व में लगभग कितनी दूरी पर स्थित है?", o: ["45 किमी", "15 किमी", "120 किमी", "200 किमी"], a: 0 },
  { q: "भीमबेटका के चित्रों में शिकारियों को किन हथियारों के साथ दर्शाया गया है?", o: ["बंदूक और तोप", "धनुष-बाण, भाले और नुकीले डंडे", "लोहे की तलवार", "विस्फोटक"], a: 1 },
  { q: "पुरातत्वविदों के अनुसार भीमबेटका में मानव गतिविधि का समय कितने वर्ष पुराना आंका गया है?", o: ["5,000 वर्ष", "10,000 वर्ष", "500 वर्ष", "1,00,000 वर्ष से भी अधिक"], a: 3 },
];

const RAW_PHYSICS_CHEM = [
  { q: "गतिज ऊर्जा का सूत्र $E_k = \\frac{1}{2}mv^2$ में यदि वेग $v$ को दोगुना कर दिया जाए, तो गतिज ऊर्जा कितनी गुनी हो जाएगी?", o: ["$2$ गुनी", "$4$ गुनी", "$8$ गुनी", "अपरिवर्तित रहेगी"], a: 1 },
  { q: "सल्फ्यूरिक अम्ल का सही रासायनिक सूत्र क्या है?", o: ["$\\text{HCl}$", "$\\text{HNO}_3$", "$\\text{H}_2\\text{SO}_4$", "$\\text{H}_2\\text{O}_2$"], a: 2 },
  { q: "प्रकाश का निर्वात में वेग $c = 3 \\times 10^8 \\text{ m/s}$ है। $5000\\text{ \\AA}$ तरंगदैर्ध्य की आवृत्ति $\\nu = \\frac{c}{\\lambda}$ क्या होगी?", o: ["$6 \\times 10^{14}\\text{ Hz}$", "$1.5 \\times 10^{15}\\text{ Hz}$", "$3 \\times 10^{14}\\text{ Hz}$", "$6 \\times 10^{12}\\text{ Hz}$"], a: 0 },
  { q: "न्यूटन के द्वितीय गति नियम के अनुसार बल ($\\vec{F}$) तथा संवेग परिवर्तन की दर में सही सदिश संबंध क्या है?", o: ["$\\vec{F} = m\\vec{v}$", "$\\vec{F} = \\frac{d\\vec{v}}{dx}$", "$\\vec{F} = \\vec{p} \\times \\vec{v}$", "$\\vec{F} = \\frac{d\\vec{p}}{dt}$"], a: 3 },
  { q: "जल के एक अणु ($\\text{H}_2\\text{O}$) में हाइड्रोजन और ऑक्सीजन का द्रव्यमान अनुपात क्या है?", o: ["$8 : 1$", "$1 : 2$", "$1 : 8$", "$2 : 1$"], a: 2 },
  { q: "गुरुत्वाकर्षण नियतांक $G$ का SI मात्रक क्या है?", o: ["$\\text{N}\\cdot\\text{m}^2/\\text{kg}^2$", "$\\text{N}\\cdot\\text{m}/\\text{kg}$", "$\\text{kg}\\cdot\\text{m}/\\text{s}^2$", "$\\text{m}/\\text{s}^2$"], a: 0 },
  { q: "आदर्श गैस समीकरण $PV = nRT$ में $R$ क्या प्रदर्शित करता है?", o: ["प्रतिरोध", "सार्वत्रिक गैस नियतांक", "रिडबर्ग नियतांक", "त्रिज्या"], a: 1 },
  { q: "यदि किसी परिपथ में प्रतिरोध $R = 10\\,\\Omega$ तथा धारा $I = 2\\text{ A}$ है, तो विभवान्तर $V = I \\cdot R$ क्या होगा?", o: ["$5\\text{ V}$", "$12\\text{ V}$", "$0.2\\text{ V}$", "$20\\text{ V}$"], a: 3 },
  { q: "शुद्ध जल का $\\text{pH}$ मान $25^\\circ\\text{C}$ पर कितना होता है?", o: ["$0$", "$7$", "$14$", "$1$"], a: 1 },
  { q: "नाभिकीय विखंडन में यूरेनियम-235 का प्रतीक कैसे लिखा जाता है?", o: ["$^{235}_{92}\\text{U}$", "$^{92}_{235}\\text{U}$", "$^{14}_{6}\\text{C}$", "$^{238}_{92}\\text{U}$"], a: 0 },
  { q: "सरल लोलक के आवर्तकाल का सूत्र $T = 2\\pi \\sqrt{\\frac{L}{g}}$ के अनुसार यदि लंबाई $L$ चौगुनी कर दी जाए तो आवर्तकाल क्या होगा?", o: ["आधा", "चौगुना", "अपरिवर्तित", "दोगुना"], a: 3 },
  { q: "प्लांक नियतांक $h$ का मान लगभग कितना होता है?", o: ["$3.0 \\times 10^{8}\\text{ m/s}$", "$1.6 \\times 10^{-19}\\text{ C}$", "$6.626 \\times 10^{-34}\\text{ J}\\cdot\\text{s}$", "$9.1 \\times 10^{-31}\\text{ kg}$"], a: 2 },
  { q: "मेथेन गैस का रासायनिक सूत्र क्या है?", o: ["$\\text{CH}_4$", "$\\text{C}_2\\text{H}_6$", "$\\text{C}_2\\text{H}_2$", "$\\text{C}_6\\text{H}_6$"], a: 0 },
  { q: "विद्युत धारिता (Capacitance) का SI मात्रक क्या है?", o: ["हेनरी (H)", "वेबर (Wb)", "टेस्ला (T)", "फैराड (F)"], a: 3 },
  { q: "ध्वनि तरंगें किस प्रकार की तरंगें हैं?", o: ["अनुप्रस्थ विद्युतचुंबकीय तरंगें", "अनुदैर्ध्य यांत्रिक तरंगें", "स्थैतिक तरंगें", "रेडियो तरंगें"], a: 1 },
  { q: "यदि किसी वस्तु का द्रव्यमान $m = 10\\text{ kg}$ और गुरुत्वीय त्वरण $g = 9.8\\text{ m/s}^2$ है, तो भार $W = mg$ क्या होगा?", o: ["$9.8\\text{ N}$", "$980\\text{ N}$", "$98\\text{ N}$", "$0.98\\text{ N}$"], a: 2 },
  { q: "बेकिंग सोडा (खाने का सोडा) का रासायनिक नाम क्या है?", o: ["सोडियम कार्बोनेट ($\\text{Na}_2\\text{CO}_3$)", "सोडियम बाइकार्बोनेट ($\\text{NaHCO}_3$)", "सोडियम हाइड्रोक्साइड ($\\text{NaOH}$)", "कैल्शियम कार्बोनेट ($\\text{CaCO}_3$)"], a: 1 },
  { q: "लेंस की क्षमता $P = \\frac{1}{f\\text{ (मीटर में)}}$ का मात्रक क्या है?", o: ["मीटर", "कैंडेला", "ल्यूमेन", "डायोप्टर (D)"], a: 3 },
  { q: "ऊष्मागतिकी के प्रथम नियम का गणितीय रूप क्या है?", o: ["$\\Delta Q = \\Delta U + \\Delta W$", "$\\Delta U = Q \\times W$", "$P_1 V_1 = P_2 V_2$", "$S = k \\ln \\Omega$"], a: 0 },
  { q: "भारी जल (Heavy Water) का रासायनिक सूत्र क्या है?", o: ["$\\text{H}_2\\text{O}$", "$\\text{T}_2\\text{O}$", "$\\text{D}_2\\text{O}$", "$\\text{H}_2\\text{O}_2$"], a: 2 },
];

function serializeSample(
  list: Array<{ q: string; o: string[]; a: number }>
): string {
  return list
    .map((q) => {
      const opts = q.o.map((opt) => `"${opt}"`).join(', ');
      return `{ q: "${q.q}", o: [${opts}], a: ${q.a} },`;
    })
    .join('\n');
}

export const SAMPLE_MATH_TRIGONOMETRY = serializeSample(RAW_MATH_TRIGONOMETRY);
export const SAMPLE_BHIMBETKA = serializeSample(RAW_BHIMBETKA);
export const SAMPLE_PHYSICS_CHEM = serializeSample(RAW_PHYSICS_CHEM);

/**
 * Builds the comprehensive prompt matching the user's prompt specification
 */
export function buildPromptText(
  topic = 'भीमबेटका की गुफाएँ',
  questionCount = 20,
  language = 'Hindi',
  difficulty = 'Medium',
  additionalNotes = ''
): string {
  const languageRulesBlock =
    language === 'Hinglish'
      ? `### CRITICAL REQUIREMENT 2: Language Rules (Hinglish — Technical Words in English, Other Words in Hindi)
* Write the sentence structure, grammar, and general words in clear Hindi (Devanagari script), while keeping ALL technical, scientific, mathematical, and subject-specific terms in English script!
* Examples of required Hinglish style:
  - "यदि किसी Particle की Velocity $v$ को दोगुना कर दिया जाए, तो उसकी Kinetic Energy कितनी हो जाएगी?"
  - "Matrix $A = \\begin{pmatrix} 2 & 3 \\\\ 1 & 4 \\end{pmatrix}$ का Determinant क्या होगा?"
  - "Cell में Protein Synthesis का मुख्य कार्य कौन-सा Organelle करता है?"
  - "Alternating Current (AC) Circuit में Resonance की स्थिति में Power Factor कितना होता है?"
* Keep mathematical symbols, formulas, chemical equations, and code/HTML tags (e.g., <br>, <div>, <p>) in standard English/mathematical notation.`
      : language === 'English'
      ? `### CRITICAL REQUIREMENT 2: Language Rules (English)
* Write all questions and options in clear, precise academic English.
* Keep mathematical symbols, formulas, chemical equations, and code/HTML tags (e.g., <br>, <div>, <p>) in standard English/mathematical notation.`
      : language === 'Bilingual (Hindi + English)'
      ? `### CRITICAL REQUIREMENT 2: Language Rules (Bilingual: Hindi + English)
* Write every question and option in both Hindi (Devanagari script) and English (e.g., "कोशिका का शक्तिगृह किसे कहते हैं? / Which organelle is known as the Powerhouse of the Cell?").
* Keep mathematical symbols, formulas, chemical equations, and code/HTML tags (e.g., <br>, <div>, <p>) in standard English/mathematical notation.`
      : `### CRITICAL REQUIREMENT 2: Language Rules (Hindi)
* Write all questions and options in clear Hindi (Devanagari script).
* Keep mathematical symbols, formulas, chemical equations, and code/HTML tags (e.g., <br>, <div>, <p>) in standard English/mathematical notation.`;

  return `You are an Expert Quiz Master, Educational Content Analyst, and Assessment Designer.
Your task is to carefully analyze the topic, notes, or study material provided and generate a high-quality multiple-choice quiz.

### CRITICAL REQUIREMENT 1: Question Quantity, Randomization & Difficulty
* Question Quantity: Generate EXACTLY ${questionCount} UNIQUE multiple-choice questions.
* Randomize Question Order: Mix questions across different subtopics and concepts in random order so similar questions do not cluster together.
* Difficulty Level: ${difficulty} (Standard conceptual and application-based questions suitable for school/board and competitive exams).

${languageRulesBlock}

### CRITICAL REQUIREMENT 3: Pure LaTeX Math & Formula Formatting ($...$)
The quiz app uses a dedicated LaTeX Math Engine. Write ALL mathematical expressions, equations, fractions, powers, subscripts, roots, calculus limits, matrices, vectors, and chemical formulas in standard LaTeX wrapped in \`$...$\` (do NOT use Markdown formatting):
* Fractions (भिन्न / बटा): Always use \`\\frac{a}{b}\` inside \`$...$\`, e.g., \`$\\frac{1}{\\sin\\theta}$\`, \`$\\frac{\\sin\\theta}{\\cos\\theta}$\`, \`$\\frac{x + 1}{x - 1}$\`, \`$\\frac{\\sqrt{3}}{2}$\`.
* Exponents / Powers (Superscripts): Always use \`^{...}\` in LaTeX, e.g., \`$z^n + z^{-n}$\`, \`$x^{n+1}$\`, \`$10^{-6}$\`, \`$e^{i\\theta}$\`, \`$\\sin^2\\theta + \\cos^2\\theta = 1$\`, \`$\\left(\\frac{a}{b}\\right)^n$\`.
* Subscripts & Chemical Formulas: Always use \`_{...}\` in LaTeX, e.g., \`$a_n$\`, \`$a_{n-1}$\`, \`$\\log_{10}(x)$\`, \`$\\text{H}_2\\text{O}$\`, \`$\\text{CO}_2$\`, \`$\\text{H}_2\\text{SO}_4$\`.
* Square & Nth Roots (वर्गमूल): Always use \`\\sqrt{...}\` or \`\\sqrt[n]{...}\`, e.g., \`$\\sqrt{3}$\`, \`$\\sqrt{x^2 + y^2}$\`, \`$\\sqrt[3]{x}$\`, \`$\\sqrt{\\frac{1 - \\cos\\theta}{1 + \\cos\\theta}}$\`.
* Calculus, Limits, Vectors & Binomials: Use standard LaTeX commands such as \`$\\lim_{x \\to 0} \\frac{\\sin x}{x}$\`, \`$\\int_{0}^{\\pi/2} \\sin x \\, dx$\`, \`$\\sum_{k=1}^{n} k^2$\`, \`$\\binom{n}{r}$\`, \`$\\vec{a} \\cdot \\vec{b}$\`, \`$\\overline{AB}$\`, \`$\\hat{i}$\`.
* Greek Letters & Math Symbols: Use standard LaTeX commands: \`\\theta\`, \`\\pi\`, \`\\alpha\`, \`\\beta\`, \`\\gamma\`, \`\\Delta\`, \`\\Omega\`, \`^\\circ\`, \`\\pm\`, \`\\times\`, \`\\div\`, \`\\cdot\`, \`\\leq\`, \`\\geq\`, \`\\neq\`, \`\\approx\`, \`\\equiv\`, \`\\infty\`, \`\\rightarrow\`, \`\\Rightarrow\`, \`\\rightleftharpoons\`.
* Keep every question and option on a SINGLE line (use inline \`$...$\`, do NOT use multiline \`$$\` blocks).

### CRITICAL REQUIREMENT 4: Pure Random Option Shuffling & Answer Positions
* Exactly 4 distinct, non-empty options per question (\`o: ["...", "...", "...", "..."]\`).
* **DO NOT make \`a: 0\` (Option A) the correct answer for every question!**
* **Purely Random Answer Position (\`a: 0, 1, 2, or 3\`)**: For each question, randomly shuffle all 4 options inside \`o: [...]\` and set \`a\` to the new index (\`0\`, \`1\`, \`2\`, or \`3\`) of the correct answer with no artificial pattern or fixed cycle.
* Avoid options like "Both A and B" or "All of the above" so each option is self-contained when shuffled.
* Keep HTML tags like <br>, <hr>, <p>, <div> as literal text on a single line (do NOT render them as actual line breaks).
* Inside double-quoted strings, always use single quotes ('...') instead of unescaped double quotes.

### CRITICAL REQUIREMENT 5: Strict Output Format (Notice how \`a\` varies randomly)
Return ONLY the raw quiz objects wrapped inside a single \`\`\`text code block so that LaTeX commands, backslashes, and tags are preserved verbatim:
\`\`\`text
{ q: "यदि $z = \\cos\\theta + i\\sin\\theta$ है, तो $z^n + z^{-n}$ किसके बराबर है?", o: ["$2\\sin(n\\theta)$", "$2i\\sin(n\\theta)$", "$2\\cos(n\\theta)$", "$2i\\cos(n\\theta)$"], a: 2 },
{ q: "यदि $\\tan\\theta = \\frac{3}{4}$ है, तो $\\frac{1 - \\cos^2\\theta}{1 + \\sin^2\\theta}$ का मान क्या होगा?", o: ["$\\frac{16}{25}$", "$\\frac{9}{34}$", "$\\frac{9}{25}$", "$\\frac{25}{34}$"], a: 1 },
{ q: "सीमा $\\lim_{x \\to 0} \\frac{\\sin(5x)}{x}$ का मान क्या है?", o: ["$0$", "$1$", "$\\infty$", "$5$"], a: 3 },
{ q: "समाकलन $\\int \\frac{1}{1 + x^2} \\, dx$ का मान किसके बराबर होता है?", o: ["$\\tan^{-1}(x) + C$", "$\\sin^{-1}(x) + C$", "$\\ln|1 + x^2| + C$", "$\\frac{1}{2x} + C$"], a: 0 },
\`\`\`

### TOPIC / STUDY NOTES TO GENERATE QUIZ FROM:
${topic}${additionalNotes ? `\n\nAdditional instructions / notes:\n${additionalNotes}` : ''}

Now generate all ${questionCount} questions immediately inside a single \`\`\`text code block using the exact format above, ensuring \`a\` is randomly varied across 0, 1, 2, and 3.`;
}

/**
 * Generates full 100-question mock test dataset for राम रमन विज्ञान विश्वविद्यालय
 * with purely randomized question order and purely randomized options
 */
export function generateRamRaman100QuestionsText(): string {
  const extra40Questions = [
    // 41-60: Physical Chemistry & Biology / Modern Science
    { q: "आवर्त सारणी में सबसे हल्का तत्व कौन-सा है?", o: ["हीलियम (He)", "हाइड्रोजन (H)", "लिथियम (Li)", "सोडियम (Na)"], a: 1 },
    { q: "प्रकाश संश्लेषण में पौधे कौन-सी गैस अवशोषित करते हैं?", o: ["$\\text{O}_2$", "$\\text{CO}_2$", "$\\text{N}_2$", "$\\text{CO}$"], a: 1 },
    { q: "मानव रक्त का सामान्य $\\text{pH}$ मान कितना होता है?", o: ["$6.2$", "$7.4$", "$8.5$", "$5.5$"], a: 1 },
    { q: "कोशिका का 'शक्तिगृह' (Powerhouse of the Cell) किसे कहा जाता है?", o: ["राइबोसोम", "माइटोकॉन्ड्रिया", "गॉल्जीकाय", "लाइसोसोम"], a: 1 },
    { q: "रेडियोधर्मिता की खोज किस वैज्ञानिक ने की थी?", o: ["मैडम क्यूरी", "हेनरी बेकेरल", "रदरफोर्ड", "नील्स बोर"], a: 1 },
    { q: "ओजोन परत वायुमंडल के किस मंडल में पाई जाती है?", o: ["क्षोभमंडल", "समतापमंडल (Stratosphere)", "मध्यमंडल", "आयनमंडल"], a: 1 },
    { q: "यदि किसी धातु का कार्यफलन $\\phi = 2.0\\text{ eV}$ है, तो देहली आवृत्ति क्या होगी?", o: ["$4.84 \\times 10^{14}\\text{ Hz}$", "$2.5 \\times 10^{14}\\text{ Hz}$", "$1.2 \\times 10^{15}\\text{ Hz}$", "$6.0 \\times 10^{13}\\text{ Hz}$"], a: 0 },
    { q: "बॉयल का नियम किस भौतिक अवस्था पर लागू होता है?", o: ["स्थिर दाब पर", "स्थिर ताप पर", "स्थिर आयतन पर", "स्थिर एन्ट्रॉपी पर"], a: 1 },
    { q: "गैल्वेनिक सेल में एनोड पर कौन-सी प्रक्रिया होती है?", o: ["अपचयन (Reduction)", "ऑक्सीकरण (Oxidation)", "उदासीनीकरण", "अवक्षेपण"], a: 1 },
    { q: "विद्युत चुम्बकीय प्रेरण का नियम किसने प्रतिपादित किया?", o: ["माइकल फैराडे", "जेम्स क्लर्क मैक्सवेल", "आंद्रे एम्पीयर", "जॉर्ज साइमन ओम"], a: 0 },
    { q: "$\\alpha$-कण पर कितना विद्युत आवेश होता है?", o: ["$+e$", "$+2e$", "$-e$", "शून्य"], a: 1 },
    { q: "परम शून्य ताप (Absolute Zero) का मान सेल्सियस में कितना होता है?", o: ["$0^\\circ\\text{C}$", "$-273.15^\\circ\\text{C}$", "$-100^\\circ\\text{C}$", "$-459.67^\\circ\\text{C}$"], a: 1 },
    { q: "डीएनए (DNA) की द्विकुंडलिनी संरचना किसने प्रस्तुत की थी?", o: ["वॉटसन एवं क्रिक", "ग्रेगर मेंडल", "रॉबर्ट हुक", "लुई पाश्चर"], a: 0 },
    { q: "ध्वनि की तीव्रता किस इकाई में मापी जाती है?", o: ["हर्ट्ज़ (Hz)", "डेसिबल (dB)", "लक्स (Lux)", "पास्कल (Pa)"], a: 1 },
    { q: "अम्लीय वर्षा का मुख्य कारण किन गैसों का उत्सर्जन है?", o: ["$\\text{CO}$ तथा $\\text{CO}_2$", "$\\text{SO}_2$ तथा $\\text{NO}_2$", "$\\text{CH}_4$ तथा $\\text{NH}_3$", "$\\text{CFC}$"], a: 1 },
    { q: "प्रकाश के प्रकीर्णन के कारण आकाश का रंग नीला दिखाई देता है, यह सिद्धांत किसने दिया?", o: ["लॉर्ड रैले", "सी. वी. रमन", "क्रिश्चियन हाइगेंस", "आइंस्टीन"], a: 0 },
    { q: "हीरे की अत्यधिक चमक का मुख्य कारण क्या है?", o: ["पूर्ण आंतरिक परावर्तन", "अपवर्तन", "विवर्तन", "व्यतिकरण"], a: 0 },
    { q: "पीतल (Brass) किन धातुओं का मिश्रधातु है?", o: ["तांबा एवं टिन", "तांबा एवं जस्ता (Cu + Zn)", "लोहा एवं कार्बन", "एल्युमिनियम एवं तांबा"], a: 1 },
    { q: "सौर सेल में मुख्यतः किस अर्धचालक का उपयोग किया जाता है?", o: ["सिलिकॉन (Si)", "तांबा", "चांदी", "सीसा"], a: 0 },
    { q: "रमन प्रभाव (Raman Effect) के लिए डॉ. सी. वी. रमन को नोबेल पुरस्कार किस वर्ष मिला?", o: ["1913", "1930", "1942", "1954"], a: 1 },

    // 81-100: Advanced Mathematics, Calculus & Applied Science
    { q: "यदि $\\sin\\theta + \\cos\\theta = \\sqrt{2}$ है, तो $\\sin\\theta \\cdot \\cos\\theta$ का मान क्या होगा?", o: ["$\\frac{1}{2}$", "$1$", "$\\frac{1}{\\sqrt{2}}$", "$0$"], a: 0 },
    { q: "समाकलन $\\int e^x (\\sin x + \\cos x) \\, dx$ का मान क्या है?", o: ["$e^x \\sin x + C$", "$e^x \\cos x + C$", "$e^x \\tan x + C$", "$e^{-x} \\sin x + C$"], a: 0 },
    { q: "अवकलज $\\frac{d}{dx}(\\ln(\\sin x))$ किसके बराबर है?", o: ["$\\cot x$", "$\\tan x$", "$\\sec x$", "$-\\csc x$"], a: 0 },
    { q: "बिंदु $(3, 4)$ की मूल बिंदु $(0, 0)$ से दूरी क्या है?", o: ["$5$", "$7$", "$\\sqrt{7}$", "$25$"], a: 0 },
    { q: "यदि किसी गोले की त्रिज्या $r$ को दोगुना कर दिया जाए, तो उसका आयतन $V = \\frac{4}{3}\\pi r^3$ कितने गुना हो जाएगा?", o: ["$8$ गुना", "$4$ गुना", "$2$ गुना", "$16$ गुना"], a: 0 },
    { q: "एक पासे को फेंकने पर सम संख्या (Even Number) आने की प्रायिकता क्या है?", o: ["$\\frac{1}{2}$", "$\\frac{1}{3}$", "$\\frac{1}{6}$", "$\\frac{2}{3}$"], a: 0 },
    { q: "यदि $\\binom{n}{2} = 15$ है, तो धनात्मक पूर्णांक $n$ का मान क्या होगा?", o: ["$6$", "$5$", "$10$", "$8$"], a: 0 },
    { q: "सदिश $\\vec{v} = 3\\hat{i} + 4\\hat{j} + 12\\hat{k}$ का परिमाण $|\\vec{v}|$ कितना है?", o: ["$13$", "$19$", "$\\sqrt{29}$", "$12$"], a: 0 },
    { q: "विद्युत शक्ति $P$, विभवान्तर $V$ और प्रतिरोध $R$ में सही संबंध क्या है?", o: ["$P = \\frac{V^2}{R}$", "$P = V \\cdot R^2$", "$P = \\frac{R}{V^2}$", "$P = V^2 \\cdot R$"], a: 0 },
    { q: "कार्बन-12 समस्थानिक ($^{12}_{6}\\text{C}$) के नाभिक में न्यूट्रॉनों की संख्या कितनी होती है?", o: ["$6$", "$12$", "$18$", "$4$"], a: 0 },
    { q: "यदि किसी तरंग की आवृत्ति $f = 50\\text{ Hz}$ है, तो उसका आवर्तकाल $T = \\frac{1}{f}$ कितना होगा?", o: ["$0.02\\text{ s}$", "$0.2\\text{ s}$", "$50\\text{ s}$", "$0.05\\text{ s}$"], a: 0 },
    { q: "अमोनिया गैस के निर्माण की औद्योगिक विधि को क्या कहते हैं?", o: ["हैबर विधि ($\\text{N}_2 + 3\\text{H}_2 \\rightleftharpoons 2\\text{NH}_3$)", "संपर्क विधि", "ओस्टवाल्ड विधि", "सॉल्वे विधि"], a: 0 },
    { q: "यदि दो प्रतिरोध $R_1 = 6\\,\\Omega$ और $R_2 = 3\\,\\Omega$ समांतर क्रम में जुड़े हैं, तो तुल्य प्रतिरोध $R_{eq}$ क्या होगा?", o: ["$2\\,\\Omega$", "$9\\,\\Omega$", "$4.5\\,\\Omega$", "$1.5\\,\\Omega$"], a: 0 },
    { q: "आइंस्टीन का द्रव्यमान-ऊर्जा तुल्यता समीकरण क्या है?", o: ["$E = mc^2$", "$E = \\frac{1}{2}mc^2$", "$E = m^2c$", "$E = \\frac{mc}{2}$"], a: 0 },
    { q: "किसी बहुभुज के बाह्य कोणों (Exterior Angles) का कुल योग सदैव कितना होता है?", o: ["$360^\\circ$", "$180^\\circ$", "$540^\\circ$", "$720^\\circ$"], a: 0 },
    { q: "यदि $\\sin A = \\frac{1}{2}$ और $0 < A < \\frac{\\pi}{2}$ है, तो $\\cos(2A)$ का मान क्या होगा?", o: ["$\\frac{1}{2}$", "$\\frac{\\sqrt{3}}{2}$", "$0$", "$1$"], a: 0 },
    { q: "परवलय $y^2 = 12x$ की नाभि (Focus) के निर्देशांक क्या हैं?", o: ["$(3, 0)$", "$(0, 3)$", "$(-3, 0)$", "$(6, 0)$"], a: 0 },
    { q: "सीमा $\\lim_{x \\to 0} \\frac{e^x - 1}{x}$ का मान किसके बराबर है?", o: ["$1$", "$0$", "$e$", "$\\infty$"], a: 0 },
    { q: "साधारण नमक (सोडियम क्लोराइड) का रासायनिक सूत्र क्या है?", o: ["$\\text{NaCl}$", "$\\text{KCl}$", "$\\text{Na}_2\\text{SO}_4$", "$\\text{CaCl}_2$"], a: 0 },
    { q: "वायुमंडल में सर्वाधिक मात्रा (लगभग $78\\%$) में पाई जाने वाली गैस कौन-सी है?", o: ["नाइट्रोजन ($\\text{N}_2$)", "ऑक्सीजन ($\\text{O}_2$)", "आर्गन ($\\text{Ar}$)", "कार्बन डाइऑक्साइड ($\\text{CO}_2$)"], a: 0 },
  ];

  const baseQuestions = [
    ...RAW_MATH_TRIGONOMETRY,
    ...RAW_PHYSICS_CHEM,
    ...RAW_BHIMBETKA,
    ...extra40Questions,
  ];

  const all100Raw = baseQuestions.map((q, idx) => ({ ...q, id: idx + 1 }));

  // Purely randomize all 100 questions AND purely shuffle all 4 options of every question
  const randomized = randomizeQuestionsAndOptions(all100Raw);

  return randomized
    .map((q) => {
      const opts = q.o.map((opt) => `"${opt}"`).join(', ');
      return `{ q: "${q.q}", o: [${opts}], a: ${q.a} },`;
    })
    .join('\n');
}


