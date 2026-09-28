// =================================================================
// StudySphere - Quiz Data Store
// IMPORTANT: Every quizCode and questionId must be strictly unique.
// correctAnswer MUST contain ONLY "A", "B", "C", or "D".
// =================================================================

window.STUDYSPHERE_QUIZZES = [
    {
        quizCode: "GEO-01-T01-QZ01",
        subjectCode: "GEO",
        chapterCode: "GEO-01",
        topicCode: "GEO-01-T01",
        quizType: "practice",
        titleMr: "अक्षांश व रेखांश — सराव चाचणी 1",
        titleEn: "Latitude & Longitude — Practice Quiz 1",
        descriptionMr: "पृथ्वी, अक्षांश आणि रेखांश या मूलभूत Topic वरील सराव प्रश्न.",
        descriptionEn: "Basic practice questions covering Earth, Latitude, and Longitude.",
        marksPerQuestion: 1,
        negativeMarks: 0.25,
        timeLimit: null, // No time limit for practice
        questions: [
            {
                questionId: "GEO-01-T01-QZ01-Q001",
                questionMr: "पृथ्वीवरील 0° अक्षांशाला काय म्हणतात?",
                questionEn: "What is 0° latitude on Earth called?",
                options: {
                    A: { mr: "विषुववृत्त", en: "Equator" },
                    B: { mr: "कर्कवृत्त", en: "Tropic of Cancer" },
                    C: { mr: "मकरवृत्त", en: "Tropic of Capricorn" },
                    D: { mr: "प्रधान रेखावृत्त", en: "Prime Meridian" }
                },
                correctAnswer: "A",
                explanationMr: "पृथ्वीच्या मध्यभागातून जाणाऱ्या 0° च्या काल्पनिक आडव्या रेषेला विषुववृत्त म्हणतात.",
                explanationEn: "The 0° imaginary horizontal line passing through the center of the Earth is called the Equator."
            },
            {
                questionId: "GEO-01-T01-QZ01-Q002",
                questionMr: "कर्कवृत्त खालीलपैकी कोणत्या अक्षांशावर आहे?",
                questionEn: "The Tropic of Cancer is located at which of the following latitudes?",
                options: {
                    A: { mr: "23.5° दक्षिण", en: "23.5° South" },
                    B: { mr: "23.5° उत्तर", en: "23.5° North" },
                    C: { mr: "66.5° उत्तर", en: "66.5° North" },
                    D: { mr: "66.5° दक्षिण", en: "66.5° South" }
                },
                correctAnswer: "B",
                explanationMr: "विषुववृत्ताच्या उत्तरेस 23.5° वर असलेल्या अक्षांशाला कर्कवृत्त म्हणतात.",
                explanationEn: "The latitude located at 23.5° North of the Equator is called the Tropic of Cancer."
            },
            {
                questionId: "GEO-01-T01-QZ01-Q003",
                questionMr: "कोणत्या रेखावृत्तावरून आंतरराष्ट्रीय वार रेषा (IDL) निश्चित केली जाते?",
                questionEn: "Which meridian is used to determine the International Date Line (IDL)?",
                options: {
                    A: { mr: "0° रेखावृत्त", en: "0° Meridian" },
                    B: { mr: "90° पूर्व रेखावृत्त", en: "90° East Meridian" },
                    C: { mr: "180° रेखावृत्त", en: "180° Meridian" },
                    D: { mr: "360° रेखावृत्त", en: "360° Meridian" }
                },
                correctAnswer: "C",
                explanationMr: "180° रेखावृत्तावरून साधारणपणे आंतरराष्ट्रीय वार रेषा निश्चित केली जाते.",
                explanationEn: "The International Date Line is generally determined by the 180° meridian."
            },
            {
                questionId: "GEO-01-T01-QZ01-Q004",
                questionMr: "पृथ्वीवर एकूण किती अक्षांश आहेत?",
                questionEn: "What is the total number of latitudes on Earth?",
                options: {
                    A: { mr: "90", en: "90" },
                    B: { mr: "180", en: "180" },
                    C: { mr: "181", en: "181" },
                    D: { mr: "360", en: "360" }
                },
                correctAnswer: "C",
                explanationMr: "90 उत्तर अक्षांश + 90 दक्षिण अक्षांश + 1 विषुववृत्त (0°) = 181 अक्षांश आहेत.",
                explanationEn: "There are 90 Northern latitudes + 90 Southern latitudes + 1 Equator (0°) = 181 latitudes."
            },
            {
                questionId: "GEO-01-T01-QZ01-Q005",
                questionMr: "भारताची प्रमाणवेळ (IST) कोणत्या रेखावृत्तावरून निश्चित केली जाते?",
                questionEn: "The Indian Standard Time (IST) is determined by which meridian?",
                options: {
                    A: { mr: "82.5° पश्चिम", en: "82.5° West" },
                    B: { mr: "82.5° पूर्व", en: "82.5° East" },
                    C: { mr: "23.5° पूर्व", en: "23.5° East" },
                    D: { mr: "88.5° पूर्व", en: "88.5° East" }
                },
                correctAnswer: "B",
                explanationMr: "भारताची प्रमाणवेळ अलाहाबाद जवळील मिर्झापूर येथून जाणाऱ्या 82.5° पूर्व रेखावृत्तावरून निश्चित केली जाते.",
                explanationEn: "The IST is determined by the 82.5° East meridian passing through Mirzapur near Allahabad."
            }
        ]
    },
    {
        quizCode: "GEO-01-T01-QZ02",
        subjectCode: "GEO",
        chapterCode: "GEO-01",
        topicCode: "GEO-01-T01",
        quizType: "test",
        titleMr: "पृथ्वी व अक्षांश — Test Quiz 1",
        titleEn: "Earth & Latitude — Test Quiz 1",
        descriptionMr: "परीक्षेच्या दृष्टिकोनातून वेळेच्या मर्यादेत सोडवण्यासाठी तयार केलेली चाचणी.",
        descriptionEn: "Exam-oriented test designed to be solved within a time limit.",
        marksPerQuestion: 1,
        negativeMarks: 0.25,
        timeLimit: 5, // 5 Minutes
        questions: [
            {
                questionId: "GEO-01-T01-QZ02-Q001",
                questionMr: "सर्वात मोठे अक्षवृत्त कोणते आहे?",
                questionEn: "Which is the largest latitude?",
                options: {
                    A: { mr: "कर्कवृत्त", en: "Tropic of Cancer" },
                    B: { mr: "मकरवृत्त", en: "Tropic of Capricorn" },
                    C: { mr: "विषुववृत्त", en: "Equator" },
                    D: { mr: "आर्क्टिक वृत्त", en: "Arctic Circle" }
                },
                correctAnswer: "C",
                explanationMr: "विषुववृत्त (0°) हे सर्वात मोठे अक्षवृत्त आहे. ध्रुवांकडे जाताना अक्षवृत्तांचा आकार लहान होत जातो.",
                explanationEn: "The Equator (0°) is the largest latitude. The size of latitudes decreases as we move towards the poles."
            },
            {
                questionId: "GEO-01-T01-QZ02-Q002",
                questionMr: "दोन लगतच्या रेखावृत्तांमधील अंतर विषुववृत्तावर किती असते?",
                questionEn: "What is the distance between two consecutive meridians at the equator?",
                options: {
                    A: { mr: "सुमारे 111 किमी", en: "Approx 111 km" },
                    B: { mr: "सुमारे 69 किमी", en: "Approx 69 km" },
                    C: { mr: "सुमारे 100 किमी", en: "Approx 100 km" },
                    D: { mr: "0 किमी", en: "0 km" }
                },
                correctAnswer: "A",
                explanationMr: "विषुववृत्तावर दोन रेखावृत्तांमधील अंतर सर्वाधिक म्हणजे सुमारे 111 किमी असते. ध्रुवांवर ते 0 किमी असते.",
                explanationEn: "The distance between two meridians is maximum at the equator, approx 111 km. At the poles, it is 0 km."
            },
            {
                questionId: "GEO-01-T01-QZ02-Q003",
                questionMr: "कर्कवृत्त भारतातील किती राज्यांमधून जाते?",
                questionEn: "The Tropic of Cancer passes through how many states in India?",
                options: {
                    A: { mr: "7", en: "7" },
                    B: { mr: "8", en: "8" },
                    C: { mr: "9", en: "9" },
                    D: { mr: "6", en: "6" }
                },
                correctAnswer: "B",
                explanationMr: "कर्कवृत्त भारतातील 8 राज्यांमधून जाते (गुजरात, राजस्थान, मध्य प्रदेश, छत्तीसगड, झारखंड, पश्चिम बंगाल, त्रिपुरा, मिझोरम).",
                explanationEn: "The Tropic of Cancer passes through 8 Indian states (Gujarat, Rajasthan, MP, Chhattisgarh, Jharkhand, West Bengal, Tripura, Mizoram)."
            },
            {
                questionId: "GEO-01-T01-QZ02-Q004",
                questionMr: "ग्रीनिच (Greenwich) रेखावृत्त म्हणून कोणते रेखावृत्त ओळखले जाते?",
                questionEn: "Which meridian is known as the Greenwich Meridian?",
                options: {
                    A: { mr: "180° रेखावृत्त", en: "180° Meridian" },
                    B: { mr: "90° रेखावृत्त", en: "90° Meridian" },
                    C: { mr: "0° रेखावृत्त", en: "0° Meridian" },
                    D: { mr: "82.5° रेखावृत्त", en: "82.5° Meridian" }
                },
                correctAnswer: "C",
                explanationMr: "0° रेखावृत्त लंडन जवळील ग्रीनिच शहरातून जाते, म्हणून त्याला ग्रीनिच रेखावृत्त किंवा प्रधान रेखावृत्त म्हणतात.",
                explanationEn: "The 0° meridian passes through Greenwich near London, hence it is called the Greenwich or Prime Meridian."
            },
            {
                questionId: "GEO-01-T01-QZ02-Q005",
                questionMr: "भारतीय प्रमाणवेळ (IST) ग्रीनिच प्रमाणवेळेच्या (GMT) किती पुढे आहे?",
                questionEn: "How much is the Indian Standard Time (IST) ahead of Greenwich Mean Time (GMT)?",
                options: {
                    A: { mr: "4 तास 30 मिनिटे", en: "4 hours 30 mins" },
                    B: { mr: "5 तास 30 मिनिटे", en: "5 hours 30 mins" },
                    C: { mr: "6 तास", en: "6 hours" },
                    D: { mr: "5 तास", en: "5 hours" }
                },
                correctAnswer: "B",
                explanationMr: "IST ही 82.5° पूर्व रेखावृत्तावर आधारित आहे. 82.5 × 4 मिनिटे = 330 मिनिटे, म्हणजेच 5 तास 30 मिनिटे पुढे आहे.",
                explanationEn: "IST is based on 82.5° East. 82.5 × 4 mins = 330 mins, which means it is 5 hours 30 mins ahead."
            }
        ]
    }
];
