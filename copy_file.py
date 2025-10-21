#!/usr/bin/env python3
import shutil
import os

# Utiliser le nom exact du fichier avec l'apostrophe courbe Unicode
source_file = "public/cours/semestre1/08 S1 Fondements de la Didactique des Disciplines de l'EFTP.pdf"
dest_file = 'public/cours/semestre1/08_S1_Fondements_de_la_Didactique_des_Disciplines_de_l_EFTP.pdf'

try:
    # Copier le fichier
    shutil.copy2(source_file, dest_file)
    print('Fichier copié avec succès')
    print('Source:', source_file)
    print('Destination:', dest_file)
    
    # Vérifier que le fichier existe
    if os.path.exists(dest_file):
        print('Fichier de destination créé avec succès')
    else:
        print('Erreur: Fichier de destination non créé')
        
except Exception as e:
    print('Erreur lors de la copie:', e)
