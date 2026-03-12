### Cahier des charges fonctionnel  
**Application d’inscription à la colonie de vacances CSS 2026**

---

### 1. Contexte et objectifs

- **Contexte**
  - La Caisse de Sécurité Sociale (CSS) organise une colonie de vacances pour les enfants des agents en 2026.
  - Actuellement, les inscriptions sont complexes à gérer manuellement (risque d’erreurs, difficulté de suivi, gestion des listes d’attente, etc.).
  - Les données des agents (parents) existent déjà dans une base interne de la CSS, identifiés par un **matricule**.

- **Objectif général**
  - Mettre en place une **application web** permettant :
    - Aux **parents** d’inscrire leurs enfants à la colonie.
    - Aux **gestionnaires** de traiter et valider/refuser les demandes.
    - À l’**administrateur** de superviser l’ensemble des inscriptions et de gérer les utilisateurs.
  - Intégrer la logique des **listes (titulaire / suppléants)** et un **workflow de validation** clair.

- **Technologies retenues** (à titre informatif)
  - **Backend** : Java **Spring Boot** (projet `demo` déjà créé).
  - **Frontend** : **React**.
  - **Base de données** : **PostgreSQL**.

---

### 2. Périmètre fonctionnel

- **Inclus dans le périmètre**
  - Gestion des comptes utilisateurs (Parents, Gestionnaires, Admins).
  - Authentification (mot de passe et code de validation par email).
  - Formulaire d’inscription des enfants à la colonie 2026.
  - Gestion des statuts de demandes (brouillon, en attente, validée, refusée).
  - Gestion du statut **Titulaire** pour les enfants.
  - Constitution de la **liste principale** et des **listes d’attente**.
  - Interface de traitement des demandes pour les gestionnaires.
  - Interface de supervision et de gestion des utilisateurs pour l’administrateur.

- **Hors périmètre (pour l’instant)**
  - Gestion de paiements en ligne.
  - Gestion détaillée de la logistique de la colonie (transport, chambres, activités, etc.).
  - Gestion multi-campagnes (autres années que 2026) – peut être envisagée comme évolution.

---

### 3. Rôles et profils utilisateurs

- **Rôle Parent**
  - Crée un compte (ou reçoit un compte, selon l’organisation).
  - Se connecte à l’application.
  - Inscrit un ou plusieurs enfants à la colonie.
  - Gère ses brouillons.
  - Envoie ses demandes en validation.
  - Consulte le statut de ses demandes (en attente, validée, refusée avec motif).
  - Peut modifier/supprimer ses demandes tant qu’elles ne sont pas en validation ou après rejet.

- **Rôle Gestionnaire**
  - Accède à un espace dédié.
  - Visualise les **demandes en attente** envoyées par les parents.
  - Valide ou refuse les demandes avec saisie d’un **motif de refus**.
  - Visualise l’historique des demandes (validées, refusées).
  - Consulte les informations des parents et de leurs enfants (mais **pas** les informations de connexion).

- **Rôle Administrateur**
  - A un accès global à toutes les demandes (en attente, validées, refusées).
  - Dispose d’une interface avec **trois onglets** pour les demandes :
    - Demandes en attente.
    - Demandes validées.
    - Demandes refusées.
  - Gère les utilisateurs :
    - Création des comptes **gestionnaires** (et éventuellement certains comptes parents).
    - Activation/désactivation de comptes.
  - Peut superviser, consulter tous les profils et historiques.

---

### 4. Authentification et gestion des comptes

#### 4.1. Inscription parent

- Le parent accède à un écran d’**inscription**.
- Il saisit au minimum :
  - Son **email**.
  - Son **matricule CSS**.
- L’application :
  - Vérifie la validité du **matricule** dans la base interne de la CSS (ou via un service).
  - Envoie un **code de validation** par email.
- Le parent saisit ce **code** dans l’interface.
- Si le code est correct et non expiré :
  - Le compte parent est **activé**.
  - Il peut ensuite se connecter.

#### 4.2. Connexion

- Sur la page de connexion, l’utilisateur (Parent / Gestionnaire / Admin) peut choisir entre :

- **Connexion par mot de passe**
  - Saisie : email + mot de passe.
  - Vérification côté backend.
  - En cas de succès, ouverture de session (token, etc.).

- **Connexion par code de validation (OTP)**
  - Saisie : adresse email.
  - L’application envoie un **code temporaire** par email.
  - L’utilisateur saisit ce code.
  - Si le code est valide :
    - Connexion sans mot de passe.

#### 4.3. Gestion des comptes gestionnaires et admins

- **Création par l’administrateur**
  - L’admin crée un compte **gestionnaire** (ou admin) en saisissant :
    - Email.
    - Nom/prénom (facultatif mais recommandé).
    - Rôle (Gestionnaire, Admin).
  - Le système envoie un **email de création de compte** :
    - Contenant un lien ou un code pour permettre au gestionnaire de définir son **mot de passe** à la première connexion.

---

### 5. Gestion des inscriptions des enfants

#### 5.1. Chargement des données parent

- Sur la page d’inscription, le parent saisit son **matricule**.
- L’application interroge la base CSS :
  - Récupère les informations du parent (nom, prénom, structure, etc.).
  - Affiche ces données en lecture seule ou partiellement modifiables selon les règles métier.

#### 5.2. Saisie d’un enfant

Pour chaque enfant, le parent saisit :

- **Informations de base**
  - Nom.
  - Prénom.
  - Date de naissance.
  - Lien de parenté (ex. : enfant direct, autre).
- **Champ "Titulaire"**
  - Un **checkbox** ou bouton indiquant si l’enfant est **titulaire**.
  - Ce champ est booléen (vrai/faux).

#### 5.3. Contrôle des conditions d’âge

- Des **bornes d’âge** sont définies pour la colonie 2026 (ex : minimum et maximum).
- Lors de la saisie ou de l’enregistrement :
  - L’application vérifie si la **date de naissance** respecte ces bornes.
  - Si l’enfant n’est pas éligible :
    - Un message informe le parent que **l’inscription de cet enfant est rejetée** pour cause d’âge.
    - Le **bouton de validation/envoi** de la demande pour cet enfant est désactivé ou la demande est marquée comme non admissible.

---

### 6. Règles de titularisation et listes d’attente

#### 6.1. Un seul titulaire par parent

- Pour un même **parent**, sur la campagne 2026 :
  - Il ne peut y avoir **qu’un seul enfant titulaire**.
- **Règle initiale** :
  - Par défaut, le **premier enfant saisi** est considéré comme **titulaire** (ou la case est pré-cochée).
- Lors de l’ajout d’un deuxième enfant ou plus :
  - Si le parent essaie de **cocher "Titulaire"** pour un autre enfant alors qu’il y a déjà un titulaire :
    - L’application affiche un **message d’avertissement** indiquant qu’un enfant titulaire existe déjà.
    - Le parent a deux options selon le comportement retenu :
      - Soit renoncer à cocher "Titulaire" pour ce deuxième enfant.
      - Soit **remplacer le titulaire** :
        - Le nouvel enfant devient **titulaire**.
        - L’ancien titulaire perd ce statut et devient **suppléant** (liste d’attente).

#### 6.2. Construction des listes

- **Liste principale**
  - Contient les **enfants titulaires** dont la demande a été **validée** par un gestionnaire.
- **Liste d’attente n°1**
  - Contient les **autres enfants du même parent** (non titulaires) avec un lien de parenté direct (par exemple "enfant").
- **Liste d’attente n°2**
  - Contient les enfants pour lesquels le **lien de parenté est "autre"** (non enfant direct).
- **Utilisation des listes**
  - Pour la sélection finale des bénéficiaires, l’organisation fera appel :
    - D’abord à la **liste principale**,
    - Puis à la **liste d’attente n°1**,
    - Puis à la **liste d’attente n°2**.

---

### 7. Cycle de vie d’une demande

Une **demande** est l’inscription d’un **enfant** à la colonie 2026 par un parent.

#### 7.1. Statuts possibles

- **BROUILLON**
  - Le parent a saisi des informations et cliqué sur **Enregistrer**, mais n’a pas encore envoyé en validation.
- **EN ATTENTE**
  - Le parent a cliqué sur **“Envoyer en validation”**.
  - La demande est visible par le **gestionnaire**.
- **VALIDÉE**
  - Le gestionnaire a examiné la demande et l’a **acceptée**.
- **REFUSÉE**
  - Le gestionnaire a **refusé** la demande en renseignant un **motif de refus**.

#### 7.2. Actions du parent

- Tant que la demande est en **BROUILLON** :
  - Le parent peut :
    - **Modifier** les informations.
    - **Supprimer** la demande.
    - Cliquer sur **“Envoyer en validation”**.
  - Le gestionnaire **ne voit pas** encore la demande.
- Quand la demande passe en **EN ATTENTE** :
  - Le parent ne peut plus :
    - Modifier.
    - Supprimer.
  - Il voit la demande en lecture seule.
- Quand la demande est **VALIDÉE** :
  - La demande devient définitive.
  - Aucune modification n’est possible par le parent.
- Quand la demande est **REFUSÉE** :
  - Le parent voit le **motif du refus**.
  - L’application lui redonne la possibilité de :
    - **Modifier** les informations (corrections).
    - **Envoyer à nouveau** en validation.
    - Ou **supprimer** la demande.

#### 7.3. Actions du gestionnaire

- Dans l’onglet des **demandes en attente** :
  - Le gestionnaire voit la liste filtrée.
  - Pour chaque demande, il peut :
    - **Valider** la demande → statut passe à **VALIDÉE**.
    - **Refuser** la demande :
      - Doit saisir un **motif de refus** obligatoire.
      - Statut passe à **REFUSÉE**.
- Il peut consulter l’historique des demandes (**validées/refusées**) en lecture seule.

#### 7.4. Actions de l’administrateur

- Dans son interface (3 onglets) :
  - **Demandes en attente** : vue globale de toutes les demandes à traiter (en lecture seule ou avec possibilité de supervision).
  - **Demandes validées**.
  - **Demandes refusées**.
- L’administrateur peut consulter les détails de chaque demande et des utilisateurs associés.

---

### 8. Interfaces principales

#### 8.1. Page d’accueil / Connexion

- Formulaire de **connexion** :
  - Email + mot de passe.
  - Ou Email + bouton “Recevoir un code” + champ de saisie du code.
- Lien vers **Inscription parent**.

#### 8.2. Inscription parent

- Formulaire :
  - Email.
  - Matricule CSS.
- Message indiquant l’envoi d’un code.
- Écran de saisie du code de validation.

#### 8.3. Espace parent

- **Tableau de bord**
  - Liste des enfants/demandes avec colonnes :
    - Nom de l’enfant.
    - Date de naissance.
    - Titulaire (oui/non).
    - Statut (brouillon, en attente, validée, refusée).
  - Actions selon le statut :
    - BROUILLON : Modifier, Supprimer, Envoyer en validation.
    - EN ATTENTE : Lecture seule.
    - VALIDÉE : Lecture seule.
    - REFUSÉE : Voir motif, Modifier et renvoyer, ou Supprimer.
- **Formulaire nouvel enfant**
  - Champs enfant.
  - Checkbox **Titulaire**.
  - Messages d’erreurs (âge non conforme, titulaire déjà existant, etc.).

#### 8.4. Espace gestionnaire

- **Onglet “Demandes en attente”**
  - Tableau des demandes en attente.
  - Boutons **Valider** / **Refuser** (avec champ motif de refus).
- **Onglet “Demandes validées”**
  - Consultation uniquement.
- **Onglet “Demandes refusées”**
  - Consultation avec affichage du motif.

#### 8.5. Espace administrateur

- **Onglets demandes**
  - En attente / Validées / Refusées (vue globale).
- **Gestion des utilisateurs**
  - Liste des utilisateurs (parents, gestionnaires, admins).
  - Filtre par rôle.
  - Création d’un gestionnaire :
    - Saisie des infos.
    - Envoi automatique de mail pour définir un mot de passe.
  - Activation/désactivation de comptes.

---

### 9. Exigences non fonctionnelles (minimum)

- **Sécurité**
  - Gestion des rôles et permissions (Parent, Gestionnaire, Admin).
  - Protection des données personnelles (mot de passe hashé, codes OTP temporaires).
  - Séparation claire des droits d’accès selon les profils.

- **Performance**
  - Application utilisable de manière fluide pour un nombre raisonnable d’utilisateurs (agents de la CSS) pendant la période d’inscription.

- **Ergonomie**
  - Interfaces simples et claires pour des utilisateurs non techniques.
  - Messages d’erreurs explicites (âge non conforme, titulaire déjà défini, etc.).

- **Traçabilité**
  - Historique des actions importantes (validation, refus, changement de titulaire, etc.) – optionnel mais recommandé.

