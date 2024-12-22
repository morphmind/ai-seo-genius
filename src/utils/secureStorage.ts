// Encryption key generation
const generateKey = async () => {
  const key = await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256
    },
    true,
    ['encrypt', 'decrypt']
  );
  return key;
};

// Convert CryptoKey to string for storage
const exportKey = async (key: CryptoKey) => {
  const exported = await crypto.subtle.exportKey('raw', key);
  return Array.from(new Uint8Array(exported))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// Convert string back to CryptoKey
const importKey = async (keyStr: string) => {
  const keyBytes = new Uint8Array(
    keyStr.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
  );
  return await crypto.subtle.importKey(
    'raw',
    keyBytes,
    'AES-GCM',
    true,
    ['encrypt', 'decrypt']
  );
};

// Encrypt data
const encrypt = async (data: string, key: CryptoKey) => {
  const encodedData = new TextEncoder().encode(data);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encryptedData = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv
    },
    key,
    encodedData
  );

  const encryptedArray = new Uint8Array(encryptedData);
  const combined = new Uint8Array(iv.length + encryptedArray.length);
  combined.set(iv);
  combined.set(encryptedArray, iv.length);

  return Array.from(combined)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// Decrypt data
const decrypt = async (encryptedData: string, key: CryptoKey) => {
  const encryptedBytes = new Uint8Array(
    encryptedData.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
  );
  
  const iv = encryptedBytes.slice(0, 12);
  const data = encryptedBytes.slice(12);

  const decryptedData = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv
    },
    key,
    data
  );

  return new TextDecoder().decode(decryptedData);
};

// Main storage interface
export const secureStorage = {
  key: null as CryptoKey | null,

  // Initialize the storage with a key
  async init() {
    const storedKey = localStorage.getItem('encryption_key');
    if (storedKey) {
      this.key = await importKey(storedKey);
    } else {
      this.key = await generateKey();
      const exportedKey = await exportKey(this.key);
      localStorage.setItem('encryption_key', exportedKey);
    }
  },

  // Store encrypted data
  async setItem(key: string, value: any) {
    if (!this.key) await this.init();
    const encryptedData = await encrypt(JSON.stringify(value), this.key!);
    localStorage.setItem(key, encryptedData);
  },

  // Retrieve and decrypt data
  async getItem<T>(key: string, defaultValue: T): Promise<T> {
    if (!this.key) await this.init();
    const encryptedData = localStorage.getItem(key);
    if (!encryptedData) return defaultValue;
    
    try {
      const decryptedData = await decrypt(encryptedData, this.key!);
      return JSON.parse(decryptedData);
    } catch (error) {
      console.error('Error decrypting data:', error);
      return defaultValue;
    }
  },

  // Remove item
  removeItem(key: string) {
    localStorage.removeItem(key);
  },

  // Clear all storage
  clear() {
    localStorage.clear();
  }
};
