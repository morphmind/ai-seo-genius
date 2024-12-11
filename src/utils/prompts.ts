export const generateSEOPrompt = (title: string, inputLang: "tr" | "en", outputLang: "tr" | "en") => {
  const languageInstructions = 
    inputLang === outputLang 
      ? `Yanıtı ${inputLang === "tr" ? "Türkçe" : "İngilizce"} olarak ver.`
      : `Başlık ${inputLang === "tr" ? "Türkçe" : "İngilizce"}, çıktıyı ${outputLang === "tr" ? "Türkçe" : "İngilizce"} olarak ver.
         Önemli: Başlığı direkt çevirmek yerine, aynı anlama gelen SEO uyumlu özgün bir başlık oluştur.`;

  return `${languageInstructions}

Başlık: "${title}"

{
  "title": "Bu başlığı direkt çevirmeden, anlamını koruyarak ve SEO uyumlu olacak şekilde özgünleştirerek 55 karakteri geçmeyen bir title olarak yaz",
  "permalink": "url-friendly-permalink",
  "metaDescription": "Bu başlık için:
    - 155 karakteri geçmeyen
    - SEO uyumlu
    - İçerikle alakalı
    - İlgili keywordleri doğal bir şekilde içeren
    - Kullanıcının ilgisini çekecek
    - Doğal bir dille yazılmış
    bir description yaz"
}`;
};

export const generateFAQPrompt = (title: string, inputLang: "tr" | "en", outputLang: "tr" | "en", outputType: "text" | "schema") => {
  const languageInstructions = 
    inputLang === outputLang 
      ? `Yanıtı ${inputLang === "tr" ? "Türkçe" : "İngilizce"} olarak ver.`
      : `Başlık ${inputLang === "tr" ? "Türkçe" : "İngilizce"}, çıktıyı ${outputLang === "tr" ? "Türkçe" : "İngilizce"} olarak ver.`;

  const schemaInstructions = outputType === "schema" 
    ? `\nÖnemli: FAQ içeriğini hem normal metin olarak hem de FAQPage schema markup formatında ver.`
    : "";

  return `${languageInstructions}${schemaInstructions}

Başlık: "${title}"

Bu başlık için:
- 5-10 arası soru ve cevap oluştur
- Sorular SEO açısından değerli ve kullanıcıların arayabileceği şekilde olsun
- Cevaplar detaylı ve bilgilendirici olsun
- Her cevap en az 2-3 cümle olsun

Yanıtı şu JSON formatında ver:

{
  "title": "Bu başlığı SEO uyumlu olacak şekilde özgünleştirerek 55 karakteri geçmeyen bir title olarak yaz",
  "permalink": "url-friendly-permalink",
  "metaDescription": "SEO uyumlu 155 karakteri geçmeyen bir description",
  "faq": {
    "questions": [
      {
        "question": "Soru metni",
        "answer": "Cevap metni"
      }
    ]${outputType === "schema" ? ',\n    "schema": "FAQPage schema markup kodu"' : ""}
  }
}

Sadece JSON formatında yanıt ver, başka bir şey ekleme.`;
};

export const parseAIResponse = (responseText: string, includeFAQ: boolean = false): any => {
  try {
    const jsonString = responseText.replace(/```json\n?|\n?```/g, '').trim();
    const parsedData = JSON.parse(jsonString);
    
    // Ensure FAQ schema is properly formatted
    if (includeFAQ && parsedData.faq) {
      parsedData.faq.schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": parsedData.faq.questions.map((q: any) => ({
          "@type": "Question",
          "name": q.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": q.answer
          }
        }))
      };
    }
    
    return parsedData;
  } catch (error) {
    console.error("JSON parsing error:", error);
    console.log("Raw response:", responseText);
    throw new Error("AI yanıtı geçersiz format içeriyor");
  }
};
