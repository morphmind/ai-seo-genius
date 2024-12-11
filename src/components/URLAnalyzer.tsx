// Mevcut kod bloğunda model parametresini değiştirelim
body: JSON.stringify({
  model: "gpt-4o-mini", // Burayı gpt-4o-mini olarak güncelledik
  messages: [
                    {
                      role: "system",
                      content: "Sen bir SEO uzmanısın. Yanıtları sadece Türkçe olarak ver ve SADECE geçerli JSON formatında, markdown veya backtick kullanmadan döndür."
                    },
                    {
                      role: "user",
                      content: prompt
                    }
  ],
  temperature: 0.7
})
