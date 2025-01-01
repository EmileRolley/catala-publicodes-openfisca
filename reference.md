# Impôt fictif sur le revenu

Reprise de l'exemple fictif du [tutoriel de
Catala](https://catala-lang.org/fr/examples/tutoriel) qui définit un impôt sur
le revenu. La version du programme Catala est disponible dans le fichier
[`tutoriel_fr.catala_fr`](./catala/tutoriel_fr.catala_fr).

Cet impôt sur le revenu est définit à travers différents articles de loi,
chacun d’eux étant introduit par un en-tête. Le premier commence ici :

## Article 1

L’impôt sur le revenu pour une personne est défini comme un pourcentage fixe
des revenus de la personne pour une année.

## Article 2

Le pourcentage fixe mentionné à l’article 1 est égal à 20%.

## Article 3

Si l’individu a à sa charge deux ou plus enfants, alors
le pourcentage fixe mentionné à l’article 1 vaut 15 %.

### Article 3 bis

Seul les enfants mineurs sont élligibles pour l’application de l’article 3.

## Article 4

Le montant de l’impôt pour le calcul à deux tranches est égal au montant
de l’impôt de chaque tranche, multiplié par le taux de chaque tranche.

## Article 5

Pour les individus dont le revenu est supérieur à 100 000€, l’impôt sur
le revenu de l’article 1 est de 40% du revenu au-delà de 100 000€.
En dessous de 100 000€, l’impôt sur le revenu est de 20% du revenu.

## Article 6

Les personnes ayant moins de 10 000€ de revenus sont exemptés de l’impôt
sur le revenu prévu à l’article 1.

Et voilà ! Nous avons défini un calcul d’impôt à deux tranches en annotant
tout simplement un texte législatif par des bouts de code Catala.
Cependant, les lecteurs attentifs ont vu quelque chose de curieux dans les
articles 5 et 6. Que se passe-t-il si le revenu d’une personne est inférieur
à 10 000€ ? Tout de suite, les deux définitions de l’article 5 et 6
pour l’impôt sur le revenu s’appliquent, et ils sont en conflit.

La loi ne le précise pas; nos articles sont clairement mal rédigés.
Mais Catala vous aide à trouver ce genre d’erreur par de simples tests ou
même la vérification formelle. Commençons par les tests.

### Article 6 bis

Des personnes avec 7 enfants ou plus sont exonérées de l’impôt sur le revenu
mentionné à l’article 1.

## Article 7 - (Base amende)

Le système de justice inflige des amendes aux individus quand ils commettent une
infraction. Les amendes sont déterminées en fonction du montant des impôts payés
par le particulier. Plus l’individu paie d’impôts, plus l’amende est élevée.
Toutefois la détermination du montant de l’impôt à payer par un particulier,
dans ce contexte, comprend des frais d’imposition fixes de 500€ pour les
particuliers gagnant moins de 10 000€.

## Article 8

Fiscalement parlant, la valeur du bâtiment exploité à des fins caritatives peut
être déduite du patrimoine d’une personne, qui est alors plafonné à 2 500 000€.
