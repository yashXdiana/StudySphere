🌐 StudySphere — MPSC Group C (2026) Online Mock Test PortalStudySphere हे महाराष्ट्र लोकसेवा आयोग (MPSC) गट-क (Group C) २०२६ पूर्व व मुख्य परीक्षांच्या तयारीसाठी विकसित केलेले एक विनामूल्य, आधुनिक आणि ओपन-सोर्स ऑनलाइन मॉक टेस्ट प्लॅटफॉर्म आहे. कोणतीही सशुल्क टेस्ट सिरीज न लावता विद्यार्थ्यांना TCS/IBPS धर्तीवर रिअल-टाइम परीक्षेचा अनुभव मिळावा यासाठी ही प्रणाली तयार करण्यात आली आहे.📌 अनुक्रमणिका (Table of Contents)ठळक वैशिष्ट्ये (Key Features)प्रणालीचे आर्किटेक्चर (System Architecture)अभ्यासक्रम विभागणी (Syllabus Coverage)प्रकल्प डिरेक्टरी रचना (Directory Structure)नवीन टेस्ट कशी जोडावी? (How to Add New Tests)चाचणी JSON डेटा फॉरमॅट (Test JSON Schema)त्रुटी नोंदणी यंत्रणा (Google Sheets Issue Reporting)GitHub Pages वर होस्टिंग व सेटअप (Installation & Deployment)नियम व कायदेशीर माहिती (Disclaimer & License)✨ ठळक वैशिष्ट्ये (Key Features)⚡ १००% सर्व्हरलेस (Client-Side Only): Node.js, Python किंवा बाह्य डेटाबेसची कोणतीही गरज नाही. संपूर्ण पोर्टल GitHub Pages वर विनामूल्य चालते.🔍 स्मार्ट ऑटो-डिटेक्टर इंजिन (Auto-Probe Engine): कोणत्याही HTML किंवा catalog.json कोडला स्पर्श न करता, केवळ फोल्डरमध्ये test-1.json, test-2.json फाईल टाकली की पोर्टलवर तिचे कार्ड आपोआप सक्रिय होते.⏱️ MPSC रिअल-टाइम परीक्षा हॉल:काऊंटडाउन टाइमर (Dynamic Countdown Timer)MPSC मानक निगेटिव्ह मार्किंग ($+१.००$ बरोबर, $-०.२५$ चूक)TCS/IBPS पॅटर्न Question Palette (Answered, Not Answered, Review, Not Visited)मोबाईल व डेस्कटॉपवर एका सरळ रेषेत स्थिर (Zero-Scroll Fixed Bottom Dock Bar)🌐 द्विभाषिक सपोर्ट (Bilingual Toggle): एका क्लिकवर प्रश्न, पर्याय आणि स्पष्टीकरण मराठी, इंग्रजी किंवा दोन्ही भाषांत पाहण्याची सोय.🔤 टायपोग्राफी आणि फॉन्ट रिसायझर:मराठी जोडाक्षरे न तुटण्यासाठी Google चे 'Mukta' आणि 'Noto Sans Devanagari' फॉन्ट्स OpenType Ligatures सह.प्रश्न व पर्यायांसाठी Small (Default) / Medium / Large फॉन्ट टॉगल.📊 सविस्तर निकाल व विश्लेषण (Result Analytics):स्कोअरकार्ड, अचूकता (Accuracy %), प्रति प्रश्न सरासरी वेळ (Speed Metric), आणि निगेटिव्ह गुणांची वजावट.बरोबर, चूक आणि अनुत्तरित प्रश्नांचे स्वतंत्र फिल्टर्स.एका क्लिकवर व्हॉट्सॲपवर स्कोअर शेअरिंग आणि PDF सेव्ह / प्रिंट सुविधा.🚨 वन-क्लिक त्रुटी निवारण (Question Issue Reporting): विद्यार्थ्याने प्रश्नात चूक नोंदवल्यास ती थेट Google Apps Script द्वारे सुरक्षित Google Sheet मध्ये नोंदवली जाते आणि बटण हिरवे होऊन लॉक होते.🌓 डार्क व लाईट मोड: रात्रीच्या वेळी डोळ्यांवर ताण येऊ नये म्हणून ऑटोमॅटिक व मॅन्युअल डार्क मोड सपोर्ट.🏛️ प्रणालीचे आर्किटेक्चर (System Architecture)StudySphere हे Decoupled Client-Side Architecture वर आधारलेले आहे:┌─────────────────────────────────────────────────────────────┐
│                       StudySphere UI                        │
│   (index.html ➔ test-list.html ➔ test.html ➔ result.html)   │
└──────────────────────────────▲──────────────────────────────┘
                               │
               (Pure Fetch API / Dynamic Query URL)
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                    Static JSON Data Vault                   │
│   data/{subject}/chapters/{chapter-id}/test-1.json           │
│   data/{subject}/mixed/test-1.json                          │
└─────────────────────────────────────────────────────────────┘
index.html: सर्व विषय, कॅटेगरीज, लिंक्स, डोनेशन आणि माहिती मॉडेल्सचे होमपेज.test-list.html: Auto-Probe Engine द्वारे फोल्डर्स स्कॅन करून उपलब्ध चाचण्यांची सूची दर्शवणारे पान.test.html: परीक्षा हॉल जिथे URL Parameter (?file=data/.../test-1.json) द्वारे चाचणी लोड होते.result.html: sessionStorage मधील निकालाचे संपूर्ण विश्लेषण आणि Google Apps Script API द्वारे त्रुटी नोंदणी.📚 अभ्यासक्रम विभागणी (Syllabus Coverage)विभाग १: पूर्व परीक्षा (Prelims 2026 — ७ विषय)इतिहास (History): आधुनिक भारताचा इतिहास, १८५७ चा उठाव, सुधारणा चळवळी, महाराष्ट्राचा इतिहास (१२ घटक).भूगोल (Geography): प्राकृतिक, हवामान, नद्या, कृषी, खनिजे, लोकसंख्या, आपत्ती (१७ घटक).अर्थशास्त्र (Economics): राष्ट्रीय उत्पन्न, दारिद्र्य, बँकिंग, महागाई, अर्थसंकल्प, नियोजन (१७ घटक).राज्यशास्त्र व नागरिकशास्त्र (Polity & Civics): राज्यघटना, हक्क, संसद, न्यायालय, पंचायतराज, प्रशासन (१९ घटक).सामान्य विज्ञान (General Science): भौतिकशास्त्र, रसायनशास्त्र, जीवशास्त्र, आरोग्यशास्त्र (२७ घटक).चालू घडामोडी (Current Affairs): महाराष्ट्र, भारत, योजना, क्रीडा, पुरस्कार, नियुक्त्या (१७ घटक).बुद्धिमत्ता व अंकगणित (Aptitude & Reasoning): संख्या, टक्केवारी, काळ-काम-वेग, तर्क, कोडी (२७ घटक).विभाग २: मुख्य परीक्षा (Mains 2026 — Paper 1 & Paper 2)Paper 1 (Language): मराठी (६ घटक) आणि English (६ घटक).Paper 2 (GS & Special Knowledge): GS मधील सर्व ७ विषय + माहिती तंत्रज्ञान (IT - ९ घटक) + माहिती अधिकार (RTI २००५) व लोकसेवा हक्क (RTS २०१५) (१० घटक) + पदनिहाय विशेष ज्ञान (लिपिक, कर सहायक, उद्योग निरीक्षक, तांत्रिक सहायक, AMVI - ३३ घटक).विभाग ३: संपूर्ण संयुक्त मॉक चाचण्या (Combine Full Mocks)Prelims Combine Mock: १०० प्रश्न | १०० गुण | ६० मिनिटेMains Combine Mock: २०० प्रश्न | २०० गुण | १२० मिनिटे📂 प्रकल्प डिरेक्टरी रचना (Directory Structure)studysphere/
├── index.html                                 # मुख्य होमपेज
├── test-list.html                             # विषय व चॅप्टर सूची (Auto-Probe Engine सह)
├── test.html                                  # मुख्य परीक्षा हॉल (Timer + Palette + Dock Bar)
├── result.html                                # निकाल, विश्लेषण आणि त्रुटी रिपोर्टिंग
├── README.md                                  # अधिकृत दस्तऐवजीकरण
│
└── data/                                      # सर्व चाचण्यांचा मास्टर डेटाबेस
    ├── catalog.json                           # सर्व विषयांचे आणि घटकांचे इंडेक्स मेटाडेटा
    │
    ├── prelims-history/
    │   ├── chapters/
    │   │   ├── p-hist-01/
    │   │   │   ├── test-1.json                # पहिली चाचणी
    │   │   │   └── test-2.json                # दुसरी चाचणी
    │   │   └── p-hist-02/ ...
    │   └── mixed/
    │       └── test-1.json                    # संपूर्ण विषय मिश्र सराव चाचणी
    │
    ├── prelims-geography/ ...
    ├── prelims-economics/ ...
    ├── prelims-polity-civics/ ...
    ├── prelims-general-science/ ...
    ├── prelims-current-affairs/ ...
    ├── prelims-mental-ability-arithmetic/ ...
    │
    ├── mains-marathi/ ...
    ├── mains-english/ ...
    ├── mains-history/ ...
    ├── mains-information-technology/ ...
    ├── mains-rti-public-services/ ...
    ├── mains-post-specific-knowledge/ ...
    │
    ├── pre-mock/
    │   └── mixed/test-1.json                  # १०० गुणांची संयुक्त पूर्व परीक्षा
    └── mains-mock/
        └── mixed/test-1.json                  # २०० गुणांची संयुक्त मुख्य परीक्षा

