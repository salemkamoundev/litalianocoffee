import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabaseConfig.url,
      environment.supabaseConfig.key
    );
  }

  async uploadImage(file: File): Promise<string> {
    const timestamp = Date.now();
    // Nettoyage du nom de fichier pour éviter les caractères spéciaux
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const path = `products/${timestamp}_${cleanFileName}`;

    const { data, error } = await this.supabase.storage
      .from(environment.supabaseConfig.bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Erreur Supabase Upload:', error);
      throw error;
    }

    // Récupération de l'URL publique
    const { data: publicUrlData } = this.supabase.storage
      .from(environment.supabaseConfig.bucket)
      .getPublicUrl(path);

    return publicUrlData.publicUrl;
  }
}
