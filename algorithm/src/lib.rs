#![deny(clippy::all)]

use aes_gcm::{
    aead::{Aead, AeadCore, KeyInit, OsRng},
    Aes256Gcm, Key, Nonce,
};
use base64::{engine::general_purpose, Engine as _};
use mac_address::get_mac_address;
use napi::{bindgen_prelude::*, Error, Result};
use napi_derive::napi;
use rand::{distributions::Alphanumeric, Rng};
use sysinfo::{System, SystemExt};
use thiserror::Error;
use uuid::Uuid;

#[derive(Error, Debug)]
enum CryptoError {
    #[error("Encryption failed: {0}")]
    EncryptionError(String),
    
    #[error("Decryption failed: {0}")]
    DecryptionError(String),
    
    #[error("Authentication failed: Invalid machine ID")]
    AuthenticationError,
    
    #[error("Failed to get machine ID: {0}")]
    MachineIdError(String),
}

impl From<CryptoError> for Error {
    fn from(error: CryptoError) -> Self {
        Error::new(Status::GenericFailure, error.to_string())
    }
}

// AES-256 key derivation from a password
fn derive_key(password: &str) -> Key<Aes256Gcm> {
    // For simplicity, we're using a basic key derivation
    // In production, you'd want to use a more robust KDF like PBKDF2, Argon2, etc.
    let mut key_bytes = [0u8; 32]; // AES-256 requires a 32-byte key
    
    // Simple key stretching (not secure for production)
    for (i, byte) in password.bytes().enumerate() {
        key_bytes[i % 32] ^= byte;
    }
    
    Key::<Aes256Gcm>::from_slice(&key_bytes).clone()
}

// Get the machine ID
fn get_machine_id() -> Result<String> {
    let mut sys = System::new_all();
    sys.refresh_all();
    
    // Get hardware UUID if available
    if let Some(uuid) = sys.host_name() {
        return Ok(uuid);
    }
    
    // Fallback to MAC address-based UUID
    match get_mac_address() {
        Ok(Some(mac)) => Ok(format!("{}", mac)),
        _ => {
            // If we can't get MAC address, generate a UUID based on random values
            let uuid = Uuid::new_v4();
            Ok(uuid.to_string())
        }
    }
}

#[napi]
pub fn get_current_machine_id() -> Result<String> {
    get_machine_id()
}

#[napi]
pub fn encrypt(
    plaintext: String, 
    password: String, 
    machine_id: String,
) -> Result<String> {
    // Verify machine ID
    let current_machine_id = get_machine_id()?;
    let authenticated = current_machine_id == machine_id;
    
    // If not authenticated, encrypt a random string instead
    let data_to_encrypt = if authenticated {
        plaintext
    } else {
        // Generate a random string
        rand::thread_rng()
            .sample_iter(&Alphanumeric)
            .take(plaintext.len())
            .map(char::from)
            .collect()
    };
    
    // Derive key from password
    let key = derive_key(&password);
    let cipher = Aes256Gcm::new(&key);
    
    // Generate a random nonce
    let nonce = Aes256Gcm::generate_nonce(&mut OsRng);
    
    // Encrypt the data
    let ciphertext = cipher
        .encrypt(&nonce, data_to_encrypt.as_bytes())
        .map_err(|e| CryptoError::EncryptionError(e.to_string()))?;
    
    // Encode the nonce and ciphertext as base64
    let nonce_b64 = general_purpose::STANDARD.encode(nonce);
    let ciphertext_b64 = general_purpose::STANDARD.encode(ciphertext);
    
    // Return the result as nonce:ciphertext
    Ok(format!("{}:{}", nonce_b64, ciphertext_b64))
}

#[napi]
pub fn decrypt(
    ciphertext: String, 
    password: String, 
    machine_id: String,
) -> Result<String> {
    // Verify machine ID
    let current_machine_id = get_machine_id()?;
    if current_machine_id != machine_id {
        return Err(Error::from(CryptoError::AuthenticationError));
    }
    
    // Split the input into nonce and ciphertext
    let parts: Vec<&str> = ciphertext.split(':').collect();
    if parts.len() != 2 {
        return Err(Error::from(CryptoError::DecryptionError("Invalid format".to_string())));
    }
    
    // Decode base64
    let nonce_bytes = general_purpose::STANDARD
        .decode(parts[0])
        .map_err(|e| CryptoError::DecryptionError(format!("Invalid nonce: {}", e)))?;
    
    let ciphertext_bytes = general_purpose::STANDARD
        .decode(parts[1])
        .map_err(|e| CryptoError::DecryptionError(format!("Invalid ciphertext: {}", e)))?;
    
    // Convert nonce to the correct format
    let nonce = Nonce::from_slice(&nonce_bytes);
    
    // Derive key from password
    let key = derive_key(&password);
    let cipher = Aes256Gcm::new(&key);
    
    // Decrypt
    let plaintext = cipher
        .decrypt(nonce, ciphertext_bytes.as_ref())
        .map_err(|e| CryptoError::DecryptionError(e.to_string()))?;
    
    // Convert plaintext bytes to string
    let result = String::from_utf8(plaintext)
        .map_err(|e| CryptoError::DecryptionError(format!("Invalid UTF-8: {}", e)))?;
    
    Ok(result)
}

// Simple sum function for backward compatibility
#[napi]
pub fn sum(a: i32, b: i32) -> i32 {
    a + b
}
