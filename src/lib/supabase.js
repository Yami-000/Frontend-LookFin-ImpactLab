import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';
const bucketName = import.meta.env.VITE_SUPABASE_BUCKET_NAME ?? 'lookfin-attachments';

export const missingSupabaseKeys = [
  ['VITE_SUPABASE_URL', supabaseUrl],
  ['VITE_SUPABASE_ANON_KEY', supabaseAnonKey],
].filter(([, value]) => !value).map(([key]) => key);

const supabaseClient = missingSupabaseKeys.length === 0
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Upload a file to Supabase Storage and return its public URL
 * @param {File} file - The file to upload
 * @param {string} chatID - The chat ID for organizing files
 * @returns {Promise<string|null>} The public URL of the uploaded file or null if failed
 */
export const uploadFileToSupabase = async (file, chatID) => {
  if (!supabaseClient) {
    throw new Error('Supabase no está configurado. Revisa las variables VITE_SUPABASE_* en el frontend.');
  }

  if (!file) {
    throw new Error('No file provided');
  }

  // Generate a unique filename to avoid collisions
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(7);
  const fileExtension = file.name.split('.').pop();
  const filename = `${chatID}/${timestamp}-${randomSuffix}.${fileExtension}`;

  try {
    const { data, error } = await supabaseClient.storage
      .from(bucketName)
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Get the public URL for the uploaded file
    const { data: publicUrlData } = supabaseClient.storage
      .from(bucketName)
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error uploading file to Supabase:', error);
    throw new Error(`No se pudo subir el archivo: ${error.message}`);
  }
};

/**
 * Delete a file from Supabase Storage
 * @param {string} fileUrl - The public URL of the file to delete
 */
export const deleteFileFromSupabase = async (fileUrl) => {
  if (!supabaseClient || !fileUrl) return;

  try {
    // Extract the file path from the public URL
    const urlParts = fileUrl.split(`/storage/v1/object/public/${bucketName}/`);
    if (urlParts.length < 2) {
      console.warn('Could not parse Supabase file URL:', fileUrl);
      return;
    }

    const filePath = decodeURIComponent(urlParts[1]);

    const { error } = await supabaseClient.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      console.warn('Error deleting file from Supabase:', error);
    }
  } catch (error) {
    console.warn('Error deleting file from Supabase:', error);
  }
};

export default supabaseClient;
