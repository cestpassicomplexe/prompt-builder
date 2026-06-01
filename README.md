[![License: CC BY 4.0](https://img.shields.io/badge/License-CC%20BY%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by/4.0/)

# Tutoriel Utilisateur : Prompt Builder

Bienvenue dans le Prompt Builder ! Cet outil vous permet de construire des prompts interactifs et dynamiques, ou des formulaires simples, en combinant différents types de champs. Vous pouvez ensuite copier le prompt finalisé ou exporter un formulaire HTML complet.

---

## 1. Interface Utilisateur

L'interface du Prompt Builder est divisée en plusieurs zones principales :

### En-tête

![](Mode%20d'emploi.png)

En haut de la page, vous trouverez :
*   Le titre de l'application : **Prompt Builder**.
*   Les contrôles principaux :
    *   💾 **Sauvegarder la Configuration** (`.technopedia`): Permet de sauvegarder votre travail actuel dans un fichier.
    *   📤 **Charger la Configuration** (`.technopedia`): Permet de charger une configuration précédemment sauvegardée.
    *   **Copier le texte du Prompt**: Copie le contenu textuel du champ "Prompt Principal" (voir ci-dessous) une fois les variables résolues.
    *   **Copier code HTML + aperçu**: Génère et copie le code HTML d'un formulaire interactif basé sur votre zone de travail, et ouvre un aperçu dans un nouvel onglet.

### Boîte à Outils

Située sur la gauche, la **Boîte à Outils** contient les différents types d'éléments que vous pouvez ajouter à votre prompt à l'aide d'un glissé-déposé :

*   Texte (Markdown) : Texte simple avec mise en page en markdown
*   QCM (Choix unique)
*   Cases à cocher
*   Liste déroulante
*   Zone de texte
*   Zone de texte multi-lignes
*   Champ numérique
*   Champ d'URL
*   Curseur (plage de données numériques)




### Zone de Travail

Au centre, la **Zone de Travail** est l'endroit où vous construisez votre prompt. Vous y glissez et déposez les éléments depuis la Boîte à Outils. Chaque élément ajouté ici peut être configuré.
Chaque élément affiche une petite étiquette en haut à gauche avec son **ID de variable** (ex: `markdown1`, `qcm2`), utile pour les variables dynamiques.

![](Mode%20d'emploi-2.png)


### Panneau des Propriétés

Sur la droite, le **Panneau des Propriétés** affiche les options de configuration pour l'élément actuellement sélectionné dans la Zone de Travail. Si aucun élément n'est sélectionné, il vous invite à en sélectionner un.
![](Mode%20d'emploi-1.png)



---

## 2. Premiers Pas : Construire votre Prompt

### Le Champ "Prompt Principal"

Au démarrage de l'application, un élément "Texte (Markdown)" est automatiquement créé. Il est marqué comme le **Prompt Principal** (son ID est `prompt`).
*   **C'est le contenu de ce champ qui sera utilisé lorsque vous cliquerez sur "Copier le texte du Prompt"**.
*   Il est conçu pour contenir le texte final de votre prompt, y compris les références aux autres champs personnalisables que vous ajouterez (via les variables dynamiques).
*   Pour une meilleure ergonomie, il est souvent préférable de placer les champs de saisie *avant* ce champ principal dans la zone de travail.

![](Mode%20d'emploi-6.png)

---

### Ajouter des Éléments

1.  Cliquez et maintenez un élément dans la **Boîte à Outils**.
2.  Faites-le glisser vers la **Zone de Travail**.
3.  Relâchez le bouton de la souris pour le déposer.
    Un nouvel élément sera créé avec des valeurs par défaut et sera automatiquement sélectionné. Ses propriétés s'afficheront dans le Panneau des Propriétés.

![](Mode%20d'emploi-3.png)

### Sélectionner et Déplacer des Éléments

*   **Sélectionner** : Cliquez simplement sur un élément dans la Zone de Travail. Il sera encadré en bleu, et ses propriétés s'afficheront.
*   **Déplacer** :
    1.  Survolez un élément dans la Zone de Travail. Des contrôles apparaîtront en haut à droite.
    2.  Cliquez et maintenez l'icône de déplacement (↕️).
    3.  Faites glisser l'élément à la position souhaitée dans la Zone de Travail et relâchez.

![](Mode%20d'emploi-5.png)


### Supprimer des Éléments

1.  Survolez un élément dans la Zone de Travail.
2.  Cliquez sur l'icône de suppression (❌).
    *Attention : Le champ "Prompt Principal" (voir ci-dessous) ne peut généralement pas être supprimé.*

## 3. Configurer les Éléments

Lorsque vous sélectionnez un élément dans la Zone de Travail, ses propriétés s'affichent dans le **Panneau des Propriétés**.
![](Mode%20d'emploi-1.png)
### Propriétés Communes

La plupart des éléments partagent ces propriétés :
*   **ID (non modifiable)** : Un identifiant unique généré automatiquement pour l'élément (ex: `textinput1`, `qcm2`). Cet ID est utilisé pour les variables dynamiques.
*   **Label / Question** : Le texte affiché comme titre ou question pour le champ.
*   **Texte indicatif (Placeholder)** : (Pour les champs de saisie et listes déroulantes) Un texte d'aide qui apparaît dans le champ avant que l'utilisateur n'entre une valeur.

### Texte (Markdown)

*   **Actions rapides (Barre d'outils Markdown)** :
    *   **B** (Gras), *I* (Italique), <u>U</u> (Souligné)
    *   **URL** (Lien) : Vous demandera l'URL et le texte du lien.
    *   ● (Liste à puces), 1. (Liste numérotée)
    *   😀 (Emoji) : Ouvre un sélecteur d'emojis.
*   **Insérer un champ...** : Une liste déroulante pour insérer facilement l'ID d'un autre champ de votre formulaire sous forme de variable `{{id_du_champ}}` dans le contenu Markdown.
*   **Contenu (Markdown)** : La zone principale où vous écrivez votre texte. Vous pouvez utiliser la syntaxe Markdown pour formater le texte (titres, listes, gras, italique, liens, etc.).
    *   *Note pour le champ "Prompt Principal"* : C'est ici que vous construirez votre prompt final, en intégrant les valeurs des autres champs via leurs IDs (ex: `{{textinput1}}`).
*   **(Optionnel) Rendre pliable (Collapsible)**: Si coché, le contenu markdown sera affiché dans une section `<details>` qui peut être ouverte/fermée.
*   **(Optionnel) Texte du résumé (Summary)**: Si "Rendre pliable" est coché, ce texte sera utilisé pour l'en-tête cliquable de la section `<details>`.

#### Autres format markdown courant

*   **Gras** : `**texte en gras**` ou `__texte en gras__`
*   *Italique* : `*texte en italique*` ou `_texte en italique_`
*   ***Gras et italique*** : `***texte en gras et italique***`
*   ~~Barré~~ : `~~texte barré~~`

*   # Titre 1 : `# Titre 1`
*   ## Titre 2 : `## Titre 2`
*   ### Titre 3 : `### Titre 3`
    (et ainsi de suite jusqu'à 6 dièses pour les titres de niveau 6)

*   **Listes à puces (non ordonnées)** :
    *   `* Élément 1`
    *   `- Élément 2`
    *   `+ Élément 3`
        *   `  * Sous-élément`

*   **Listes numérotées (ordonnées)** :
    1.  `1. Premier élément`
    2.  `2. Deuxième élément`
        1.  `  1. Sous-élément`

*   **Liens** : `[Texte du lien](URL)`
    Exemple : `[Obsidian](https://obsidian.md)`

*   **Images** : `![Texte alternatif](URL de l'image)`

*   **Code en ligne** : `` `code` ``
    Exemple : `Ceci est du `code` en ligne.`

*   **Bloc de code** :
    ```
    ```langage
    Votre code ici
    ```
    ```
    (Remplacez `langage` par le langage de programmation, par exemple `python`, `javascript`, `markdown`, etc.)

*   **Citation (blockquote)** :
    ```
    > Ceci est une citation.
    > Elle peut s'étendre sur plusieurs lignes.
    ```

*   **Ligne horizontale** : `---` ou `***` ou `___` (trois tirets, astérisques ou underscores sur une ligne)

### QCM, Cases à Cocher, Liste Déroulante

![](Mode%20d'emploi-7.png)


*   **Label / Question** : La question posée à l'utilisateur.
*   **Options (une par ligne)** : Entrez chaque option sur une nouvelle ligne. Ces options deviendront les choix pour le QCM, les cases à cocher ou les éléments de la liste déroulante.
    *   Exemple :
        ```
        Option A
        Option B
        Choix C
        ```

### Champs de Saisie (Texte, Numérique, URL, Multi-lignes)

*   **Label / Question** : Le nom du champ.
*   **Texte indicatif (Placeholder)** : Texte d'aide affiché dans le champ vide.
*   **Propriétés Spécifiques** :
    *   **Zone de texte multi-lignes (Textarea)** :
        *   `Nombre de lignes initial` : Définit la hauteur initiale du champ.
    *   **Champ numérique (Number Input)** :
        *   `Valeur minimale` : La plus petite valeur acceptée.
        *   `Valeur maximale` : La plus grande valeur acceptée.
        *   `Pas (Step)` : L'incrément pour les flèches de contrôle du champ numérique (ex: 1, 0.5, 10).


![](Mode%20d'emploi-9.png)

### Curseur (Range)
![](Mode%20d'emploi-10.png)
*   **Label** : Le nom du curseur.
*   **Min** : La valeur minimale du curseur.
*   **Max** : La valeur maximale du curseur.
*   **Pas (Step)** : L'incrément de déplacement du curseur.
*   **Valeur par défaut** : La position initiale du curseur.

---

## 4. Utilisation des Variables Dynamiques

Une fonctionnalité clé du Prompt Builder est la possibilité d'insérer dynamiquement le contenu d'un champ dans un autre, particulièrement utile pour construire le "Prompt Principal".

1.  **Identifiez l'ID du champ source** : Chaque élément a un ID unique affiché dans le Panneau des Propriétés (ex: `textinput1`, `qcm3`) et sur l'élément lui-même dans le canvas.
2.  **Insérez la variable** : Dans un champ "Texte (Markdown)" (typiquement le "Prompt Principal"), vous pouvez insérer cet ID en utilisant la syntaxe `{{id_du_champ}}`.
    *   Exemple : Si vous avez un champ "Zone de texte" avec l'ID `sujetPrincipal`, vous pouvez écrire dans votre prompt principal : `Rédige un texte sur le sujet suivant : {{sujetPrincipal}}`.
    *   La liste déroulante `Insérer un champ...` dans les propriétés Markdown facilite cette insertion.

Lorsque le prompt est généré (soit pour "Copier le texte", soit dans le HTML exporté), `{{id_du_champ}}` sera remplacé par la valeur actuelle du champ correspondant.

![](Mode%20d'emploi-13.png)


![](Mode%20d'emploi-11.png)



---

## 5. Exporter votre Travail

### Copier le Texte du Prompt

Cliquez sur le bouton **"Copier le texte du Prompt"** dans l'en-tête.
*   Cela prendra le contenu du champ "Prompt Principal" (celui marqué avec `data-is-prompt="true"`).
*   Toutes les variables `{{id_du_champ}}` seront remplacées par les valeurs actuelles des champs correspondants.
*   Le Markdown sera converti en texte brut.
*   Le texte résultant sera copié dans votre presse-papiers.
![](Mode%20d'emploi-14.png)
### Copier code HTML + Aperçu

Cliquez sur le bouton **"Copier code HTML + aperçu"** dans l'en-tête.
*   Cela génère un document HTML complet contenant tous les éléments de votre Zone de Travail, transformés en un formulaire interactif.
*   Ce HTML inclut un script pour gérer les mises à jour dynamiques si vous utilisez des variables dans les labels, placeholders ou options des champs.
*   Deux boutons "Je veux mon prompt" sont inclus dans la page HTML générée. Cliquer sur l'un d'eux copiera le contenu résolu du champ "Prompt Principal" (comme défini dans votre builder) en fonction des saisies de l'utilisateur dans le formulaire HTML.
*   **Le code HTML complet est copié dans votre presse-papiers.**
*   Un nouvel onglet s'ouvrira dans votre navigateur, affichant un aperçu de ce formulaire HTML interactif.

![](Mode%20d'emploi-15.png)

---

## 6. Sauvegarder et Charger votre Configuration

Vous pouvez sauvegarder l'ensemble de votre travail (tous les éléments du canvas, leurs configurations et l'ordre) et le recharger plus tard.

*   **Sauvegarder** :
    1.  Cliquez sur l'icône 💾 **Sauvegarder la Configuration**.
    2.  Votre navigateur téléchargera un fichier `.technopedia` (par exemple, `config-constructeur-AAAA-MM-JJTHH-MM-SS.technopedia`). Conservez ce fichier.

*   **Charger** :
    1.  Cliquez sur l'icône 📤 **Charger la Configuration**.
    2.  Une boîte de dialogue de sélection de fichier s'ouvrira.
    3.  Sélectionnez un fichier `.technopedia` que vous aviez précédemment sauvegardé.
    4.  Le contenu de la Zone de Travail sera remplacé par la configuration chargée.

---

## 7. Diffuser sur Technopedia

Après avoir dupliqué le template Prompt sur le WordPress, il vous reste à personnaliser la balise HTML en collant le code présent dans votre presse-papier.

![](Mode%20d'emploi-17.png)


Et BIM : 
![](Mode%20d'emploi-18.png)


✨ Bon prompting ! ✨
