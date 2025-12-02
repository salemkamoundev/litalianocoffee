#!/bin/bash

# Configuration des noms de fichiers
# Assurez-vous que ce nom correspond exactement à votre fichier exporté
INPUT_FILE="wc-product-export-2-12-2025-1764681462897.csv"
OUTPUT_FILE="products.json"

echo "=========================================="
echo "🔄 Début de la conversion CSV -> JSON"
echo "=========================================="

# 1. Vérification de la présence du fichier source
if [ ! -f "$INPUT_FILE" ]; then
    echo "❌ ERREUR : Le fichier source '$INPUT_FILE' est introuvable."
    echo "   Veuillez placer le fichier CSV dans le même dossier que ce script."
    exit 1
fi

# 2. Exécution du code Python embarqué pour le parsing robuste
# Nous utilisons 'python3 - <<EOF' pour passer le code directement sans créer de fichier .py temporaire
python3 - <<EOF
import csv
import json
import sys

input_filename = "$INPUT_FILE"
output_filename = "$OUTPUT_FILE"

def parse_price(price_str):
    """Nettoie et convertit le prix en float"""
    if not price_str:
        return 0.0
    try:
        # Remplace la virgule par un point si nécessaire pour le float
        return float(price_str.replace(',', '.'))
    except ValueError:
        return 0.0

try:
    products = []
    
    # Lecture du CSV avec encodage UTF-8
    with open(input_filename, mode='r', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        
        for row in reader:
            # Gestion des images (séparées par des virgules dans Woo Export)
            raw_images = row.get('Images', '')
            # On nettoie les espaces autour des URLs
            image_list = [img.strip() for img in raw_images.split(',')] if raw_images else []
            main_image = image_list[0] if image_list else ''

            # Construction de l'objet JSON propre
            # On vérifie si les clés existent pour éviter les erreurs si le CSV change légèrement
            product = {
                "id": row.get('ID'),
                "sku": row.get('UGS', ''),
                "name": row.get('Nom', 'Produit sans nom'),
                "description": row.get('Description', ''),
                "shortDescription": row.get('Description courte', ''),
                "price": parse_price(row.get('Tarif régulier', '0')),
                "salePrice": parse_price(row.get('Tarif promo', '0')),
                "stock": int(row.get('Stock', 0)) if row.get('Stock') and row.get('Stock').isdigit() else 0,
                "inStock": row.get('En stock ?') == '1',
                "category": row.get('Catégories', ''),
                "images": image_list,
                "imageUrl": main_image
            }
            products.append(product)

    # Écriture du fichier JSON final
    with open(output_filename, 'w', encoding='utf-8') as jsonfile:
        json.dump(products, jsonfile, indent=2, ensure_ascii=False)

    print(f"   Traitement Python terminé : {len(products)} produits convertis.")

except Exception as e:
    print(f"   Erreur interne Python : {str(e)}")
    sys.exit(1)
EOF

# 3. Vérification du code de retour de Python
if [ $? -eq 0 ]; then
    echo "✅ SUCCÈS : Le fichier '$OUTPUT_FILE' a été généré avec succès."
    echo "   Vous pouvez maintenant utiliser ce JSON dans votre projet Angular ou l'importer dans Supabase."
else
    echo "❌ ÉCHEC : Une erreur est survenue lors de la conversion."
    exit 1
fi

echo "=========================================="
