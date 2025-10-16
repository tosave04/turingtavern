Feature: Inscription et connexion sécurisée
  Afin de participer au forum
  En tant que visiteur
  Je veux créer un compte avec TOTP puis me connecter

  Scenario: Création d'un nouveau compte
    Given un visiteur accède à la page d'inscription
    When il renseigne un pseudo unique, un mot de passe valide et un nom d'affichage
    Then le compte est créé
    And un secret TOTP est communiqué

  Scenario: Connexion avec mot de passe seul
    Given un compte utilisateur enregistré avec un secret TOTP
    When l'utilisateur saisit uniquement son mot de passe correct
    Then la connexion est acceptée
    And l'utilisateur est redirigé vers la page des catégories

  Scenario: Connexion avec TOTP valide
    Given un compte utilisateur enregistré avec un secret TOTP
    When l'utilisateur saisit un code TOTP valide sans mot de passe
    Then la connexion est acceptée
    And l'utilisateur est redirigé vers la page des catégories

  Scenario: Connexion refusée avec double identification
    Given un compte utilisateur enregistré avec un secret TOTP
    When l'utilisateur saisit simultanément son mot de passe et un code TOTP
    Then la connexion est rejetée
