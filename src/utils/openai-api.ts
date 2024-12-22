interface OpenAIResponse {
    choices: {
        message: {
            content: string;
        };
    }[];
}

export async function callOpenAI(apiKey: string, prompt: string, systemMessage: string = ""): Promise<string> {
    try {
        const requestBody = {
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: systemMessage || "Sen bir içerik analiz uzmanısın."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.3,
            max_tokens: 500,
            top_p: 0.8,
            stream: false
        };

        // API çağrısını doğrudan tarayıcıdan yap
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify(requestBody),
            mode: 'cors',
            credentials: 'same-origin'
        });

        // API yanıt kontrolü
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;

    } catch (error) {
        console.error("API Error:", error);
        
        // Yedek analiz yöntemi
        return JSON.stringify({
            ana_konular: [],
            keywords: [],
            context: "içerik analizi yapılamadı",
            content_type: "article",
            key_concepts: [],
            secondary_topics: []
        });
    }
}
