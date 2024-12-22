import os
from pathlib import Path
import re
from typing import List, Dict, Set, Tuple

class InternalLinkingSystem:
    def __init__(self, sitemap_path: str, articles_dir: str, api_key_manager):
        self.sitemap_path = sitemap_path
        self.articles_dir = articles_dir
        self.api_key_manager = api_key_manager
        self.urls = set()
        self.article_contents = {}
        self.keyword_url_map = {}

    def initialize_api_key(self):
        # API anahtarı yönetimi için basit implementasyon
        self.api_key = self.api_key_manager.get_api_key()

    def load_sitemap(self) -> Set[str]:
        """Sitemap dosyasından URL'leri yükler."""
        with open(self.sitemap_path, 'r', encoding='utf-8') as f:
            urls = {line.strip() for line in f if line.strip()}
        self.urls = urls
        return urls

    def load_articles(self) -> Dict[str, str]:
        """Makale dosyalarını yükler."""
        articles = {}
        for file_path in Path(self.articles_dir).glob('*.txt'):
            with open(file_path, 'r', encoding='utf-8') as f:
                articles[file_path.stem] = f.read()
        self.article_contents = articles
        return articles

    def extract_keywords(self, text: str) -> List[str]:
        """Metinden anahtar kelimeleri çıkarır."""
        # Basit bir keyword çıkarma implementasyonu
        words = re.findall(r'\b\w+\b', text.lower())
        # Stop words'leri filtrele
        stop_words = {'ve', 'veya', 'ile', 'için', 'bu', 'bir', 'da', 'de'}
        keywords = [w for w in words if w not in stop_words and len(w) > 3]
        return list(set(keywords))

    def create_keyword_url_map(self):
        """URL'leri anahtar kelimelerle eşleştirir."""
        for url in self.urls:
            # URL'den anahtar kelimeleri çıkar
            path_parts = url.split('/')
            relevant_parts = [p for p in path_parts if p and p not in ['http:', 'https:', 'www']]
            keywords = []
            for part in relevant_parts:
                # URL parçalarını kelimelere ayır
                words = re.split(r'[-_]', part)
                keywords.extend(words)
            
            # Her keyword için URL'i kaydet
            for keyword in keywords:
                if keyword not in self.keyword_url_map:
                    self.keyword_url_map[keyword] = set()
                self.keyword_url_map[keyword].add(url)

    def find_matching_urls(self, text: str, max_links: int = 3) -> List[Tuple[str, str]]:
        """Metin için eşleşen URL'leri bulur."""
        keywords = self.extract_keywords(text)
        matches = []
        
        for keyword in keywords:
            if keyword in self.keyword_url_map:
                for url in self.keyword_url_map[keyword]:
                    matches.append((keyword, url))
                    if len(matches) >= max_links:
                        break
            if len(matches) >= max_links:
                break
                
        return matches[:max_links]

    def process_article(self, content: str) -> str:
        """Makaleyi işler ve iç linkler ekler."""
        matches = self.find_matching_urls(content)
        modified_content = content
        
        for keyword, url in matches:
            # Basit link ekleme - geliştirilmesi gerekebilir
            link_html = f'<a href="{url}">{keyword}</a>'
            # Kelimenin ilk geçtiği yeri linkle değiştir
            pattern = re.compile(r'\b' + re.escape(keyword) + r'\b', re.IGNORECASE)
            modified_content = pattern.sub(link_html, modified_content, 1)
            
        return modified_content

    def save_processed_article(self, article_id: str, content: str):
        """İşlenmiş makaleyi kaydeder."""
        output_dir = "report"
        os.makedirs(output_dir, exist_ok=True)
        
        output_path = os.path.join(output_dir, f"{article_id}_processed.txt")
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(content)

    def run(self):
        """Ana işlem akışını çalıştırır."""
        # Sitemap ve makaleleri yükle
        self.load_sitemap()
        self.load_articles()
        
        # Keyword-URL eşleştirmelerini oluştur
        self.create_keyword_url_map()
        
        # Her makaleyi işle
        for article_id, content in self.article_contents.items():
            processed_content = self.process_article(content)
            self.save_processed_article(article_id, processed_content)
