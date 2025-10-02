# Test de Soumission de Devoir

## Étapes pour tester la fonctionnalité :

### 1. Vérifier la configuration Supabase

1. **Bucket de stockage** : Vérifiez que le bucket `assignments` existe
2. **Tables** : Vérifiez que les tables `assignments` et `assignment_submissions` existent
3. **Politiques RLS** : Vérifiez que les politiques sont configurées

### 2. Test dans l'interface

1. Connectez-vous en tant qu'étudiant
2. Allez dans la section "Devoirs"
3. Cliquez sur "Soumettre un devoir"
4. Sélectionnez un devoir
5. Uploadez un fichier (PDF, Word, etc.)
6. Ajoutez un titre et des commentaires
7. Cliquez sur "Soumettre"

### 3. Vérification des logs

Si l'erreur persiste, vérifiez la console du navigateur pour voir les détails de l'erreur.

### 4. Erreurs courantes et solutions

#### Erreur : "Bucket not found"
- **Solution** : Créer le bucket `assignments` dans Supabase Storage

#### Erreur : "Table does not exist"
- **Solution** : Exécuter les scripts SQL pour créer les tables

#### Erreur : "Permission denied"
- **Solution** : Configurer les politiques RLS appropriées

#### Erreur : "Invalid file type"
- **Solution** : Vérifier les types MIME autorisés dans le bucket

### 5. Debug

Pour déboguer, ajoutez des logs dans la fonction `submitAssignment` :

```javascript
console.log('Assignment ID:', assignmentId);
console.log('Student ID:', studentId);
console.log('File:', file);
console.log('Title:', title);
```

### 6. Vérification dans la base de données

Après une soumission réussie, vérifiez dans Supabase :
1. Table `assignment_submissions` : Nouvelle entrée ajoutée
2. Storage `assignments` : Fichier uploadé
3. URL publique : Fichier accessible 