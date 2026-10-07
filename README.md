🌐 StudySphere — MPSC Group C (2026) Online Examination Portal
महाराष्ट्र लोकसेवा आयोग (MPSC) गट-क २०२६ पूर्व व मुख्य परीक्षांसाठी विनामूल्य, आधुनिक आणि ओपन-सोर्स ऑनलाइन मॉक टेस्ट प्लॅटफॉर्म A modern, lightweight, client-side examination engine built for competitive exam aspirants.

📌 प्रकल्प परिचय (Project Overview)StudySphere हे कोणत्याही सशुल्क (Paid) टेस्ट सिरीजवर अवलंबून न राहता, गरजू व सेल्फ-स्टडी करणाऱ्या विद्यार्थ्यांना TCS/IBPS व MPSC अधिकृत पॅटर्ननुसार प्रत्यक्ष परीक्षेचा अनुभव देण्यासाठी तयार केलेले परीक्षा पोर्टल आहे.संपूर्ण प्रणाली Decoupled Client-Side Architecture वर आधारलेली असल्याने कोणत्याही Node.js, Python किंवा बाह्य डेटाबेस सर्व्हरशिवाय GitHub Pages वर १००% विनामूल्य, वेगवान आणि अखंडपणे चालते.

✨ ठळक वैशिष्ट्ये (Key Features)वैशिष्ट्य (Feature)तांत्रिक तपशील (Technical Details)

⚡ १००% सर्व्हरलेस (Client-Side)कोणतीही बॅकएंड गुंतागुंत नाही; शुद्ध HTML5, Tailwind CSS आणि आधुनिक Vanilla JavaScript द्वारे संचलित.

🔍 झिरो-कोड ऑटो-प्रोब (Auto-Probe Engine)कोणत्याही HTML किंवा catalog.json ला हात न लावता, केवळ फोल्डरमध्ये test-1.json, test-2.json टाकल्यास कार्ड आपोआप सक्रिय होते.

⏱️ MPSC रिअल-टाइम परीक्षा हॉलडायनॅमिक काऊंटडाउन टाइमर, MPSC मानक निगेटिव्ह मार्किंग ($+१.००$ बरोबर, $-०.२५$ चूक) आणि TCS/IBPS Question Palette (Answered, Not Answered, Review).

📱 Zero-Scroll Docked Barमोबाईल व डेस्कटॉपवर Review, Clear, Previous, Next ही चारही बटणे कायम एकाच सरळ रेषेत स्थिर (Fixed Single-Line Docked Bar).

🌐 द्विभाषिक टॉगल (Bilingual Support)एका क्लिकवर प्रश्न, पर्याय आणि स्पष्टीकरण मराठी, इंग्रजी किंवा दोन्ही भाषांत (Both) पाहण्याची सोय.

🔤 देवनागरी टायपोग्राफी व रिसायझरमराठी जोडाक्षरे न तुटण्यासाठी Google चे Mukta व Noto Sans Devanagari फॉन्ट्स (OpenType Ligatures सह) आणि S / M / L फॉन्ट टॉगल.

📊 ॲडव्हान्स निकाल व विश्लेषणअचूकता टक्केवारी (Accuracy %), निगेटिव्ह वजावट, प्रति प्रश्न सरासरी वेळ (Speed Metric), WhatsApp स्कोअर शेअरिंग आणि Print/PDF सपोर्ट.

🚨 वन-क्लिक त्रुटी निवारण (Issue Reporting)प्रश्नात त्रुटी आढळल्यास थेट Google Apps Script Webhook द्वारे सुरक्षित Google Sheet मध्ये तात्काळ नोंदणी.

🌓 डार्क व लाईट थीमरात्रीच्या अभ्यासात डोळ्यांवरील ताण कमी करण्यासाठी सिस्टीम व मॅन्युअल डार्क मोड सपोर्ट.


🏛️ प्रणालीचे आर्किटेक्चर (System Architecture)
┌────────────────────────────────────────────────────────────────────────┐
│                        StudySphere Web Platform                        │
│                                                                        │
│   [index.html]  ───────►  [test-list.html]  ───────►  [test.html]      │
│   (Home / Hub)            (Auto-Probe Engine)         (Exam Hall UI)   │
│                                                              │         │
│                                                              ▼         │
│   [Google Apps Script]  ◄───────  [result.html]  ◄───────────┘         │
│   (Issue Reporting)             (Detailed Analytics)                   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Pure Fetch API
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Static JSON Data Vault                          │
│                                                                        │
│   data/{subject}/chapters/{chapter-id}/test-1.json                     │
│   data/{subject}/mixed/test-1.json                                     │
│   data/pre-mock/mixed/test-1.json                                      │
└────────────────────────────────────────────────────────────────────────┘


📂 प्रकल्प डिरेक्टरी रचना (Directory Structure)studysphere/
├── index.html                                 # मुख्य होमपेज
├── test-list.html                             # विषय व चॅप्टर सूची (Auto-Probe Engine)
├── test.html                                  # मुख्य परीक्षा हॉल (Timer + Palette + Dock Bar)
├── result.html                                # निकाल, विश्लेषण आणि त्रुटी रिपोर्टिंग
├── README.md                                  # अधिकृत प्रकल्प दस्तऐवजीकरण
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

📊 त्रुटी नोंदणी यंत्रणा (Google Sheets Issue Reporting)विद्यार्थ्यांना चाचणी सोडवताना प्रश्नात त्रुटी आढळल्यास निकाल पृष्ठावरून एका क्लिकवर तक्रार नोंदवता येते.


महाराष्ट्रातील स्पर्धा परीक्षेची तयारी करणाऱ्या विद्यार्थ्यांसाठी समर्पित 🚩
