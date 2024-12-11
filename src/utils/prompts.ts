export const generateSEOPrompt = (title: string, inputLang: "tr" | "en", outputLang: "tr" | "en") => {
  const languageInstructions = 
    inputLang === outputLang 
      ? `Yanıtı ${inputLang === "tr" ? "Türkçe" : "İngilizce"} olarak ver.`
      : `Başlık ${inputLang === "tr" ? "Türkçe" : "İngilizce"}, çıktıyı ${outputLang === "tr" ? "Türkçe" : "İngilizce"} olarak ver.`;

  return `${languageInstructions}

Aşağıdaki başlık için JSON formatında yanıt ver:

Başlık: "${title}"

{
  "title": "Bu başlığı anlamını değiştirmeden özgünleştirerek daha iyi SEO uyumlu 55 karakteri geçmeyen bir title olarak yaz",
  "permalink": "url-friendly-permalink",
  "metaDescription": "Bu başlık için:
    - 155 karakteri geçmeyen
    - SEO uyumlu
    - İçerikle alakalı
    - İlgili keywordleri doğal bir şekilde içeren
    - Kullanıcının ilgisini çekecek
    - Doğal bir dille yazılmış
    bir description yaz"
}

Sadece JSON formatında yanıt ver, başka bir şey ekleme.`;
};

export const parseAIResponse = (responseText: string): any => {
  try {
    const jsonString = responseText.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("JSON parsing error:", error);
    console.log("Raw response:", responseText);
    throw new Error("AI yanıtı geçersiz format içeriyor");
  }
};