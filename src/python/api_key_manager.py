class ApiKeyManager:
    def __init__(self):
        self.api_key = None

    def get_api_key(self):
        return self.api_key or "default_key"

    def set_api_key(self, key):
        self.api_key = key
